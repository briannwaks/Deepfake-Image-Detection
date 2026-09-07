"""
Heatmap generation — Grad-CAM when local models are loaded, ELA otherwise.
"""
import io
import logging
import numpy as np
import cv2
from PIL import Image, ImageChops, ImageEnhance

from app.utils.image_processing import image_to_base64_png
from app.config import settings
from app.models.efficientnet import _USE_LOCAL

logger = logging.getLogger(__name__)


def _vit_reshape_transform(tensor):
    """Reshape ViT sequence output (with CLS token) to a spatial grid."""
    seq_len = tensor.size(1) - 1  # exclude CLS token
    grid = int(seq_len ** 0.5)
    result = tensor[:, 1:, :].reshape(tensor.size(0), grid, grid, tensor.size(2))
    return result.transpose(2, 3).transpose(1, 2)


def _swin_reshape_transform(tensor):
    """Reshape Swin sequence output (no CLS token) to a spatial grid."""
    seq_len = tensor.size(1)
    grid = int(seq_len ** 0.5)
    result = tensor.reshape(tensor.size(0), grid, grid, tensor.size(2))
    return result.transpose(2, 3).transpose(1, 2)


def _gradcam(image: Image.Image, model_id: str) -> str:
    try:
        import torch
        from pytorch_grad_cam import GradCAMPlusPlus
        from pytorch_grad_cam.utils.image import show_cam_on_image
        from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
        from app.models.efficientnet import _load_model

        model, processor = _load_model(model_id)
        model_type = model.config.model_type

        class LogitsWrapper(torch.nn.Module):
            def __init__(self, m): super().__init__(); self.m = m
            def forward(self, x): return self.m(x).logits

        wrapped = LogitsWrapper(model)

        if model_type == "vit":
            target_layer = model.vit.layers[-1].layernorm_before
            reshape_transform = _vit_reshape_transform
        elif model_type == "swin":
            target_layer = model.swin.encoder.layers[-1].blocks[-1].layernorm_before
            reshape_transform = _swin_reshape_transform
        else:
            raise ValueError(f"Grad-CAM not implemented for model_type={model_type!r}")

        inputs = processor(images=image.convert("RGB"), return_tensors="pt")
        _, _, h, w = inputs["pixel_values"].shape
        img_resized = image.convert("RGB").resize((w, h))

        id2label = model.config.id2label
        fake_idx = next(
            (i for i, l in id2label.items() if l.lower() in ("fake", "artificial")),
            1,
        )

        cam = GradCAMPlusPlus(
            model=wrapped,
            target_layers=[target_layer],
            reshape_transform=reshape_transform,
        )
        grayscale_cam = cam(
            input_tensor=inputs["pixel_values"],
            targets=[ClassifierOutputTarget(fake_idx)],
        )

        img_array = np.array(img_resized, dtype=np.float32) / 255.0
        overlay = show_cam_on_image(img_array, grayscale_cam[0], use_rgb=True)
        return image_to_base64_png(overlay.astype(np.float32) / 255.0)  # ← normalize back to [0,1] before encoding

    except Exception as exc:
        logger.warning("Grad-CAM failed for %s, falling back to ELA: %s", model_id, exc)
        return _ela(image)


def _ela(image: Image.Image) -> str:
    img = image.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=settings.ela_quality)
    buf.seek(0)
    recompressed = Image.open(buf).convert("RGB")

    ela = ImageChops.difference(img, recompressed)
    max_diff = max(ex[1] for ex in ela.getextrema()) or 1
    ela = ImageEnhance.Brightness(ela).enhance(255.0 / max_diff)

    gray = cv2.cvtColor(np.array(ela), cv2.COLOR_RGB2GRAY)
    heatmap = cv2.applyColorMap(gray, cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

    original = np.array(img, dtype=np.float32) / 255.0
    overlay = 0.55 * heatmap_rgb + 0.45 * original
    return image_to_base64_png(overlay)


def generate(image: Image.Image, model_ids: list[str]) -> str:
    """model_ids: the model(s) actually used for this request's prediction.
    Grad-CAM (when local) runs against the first/primary model in the list."""
    return _gradcam(image, model_ids[0]) if _USE_LOCAL else _ela(image)


def generate_both(image: Image.Image, model_ids: list[str]) -> tuple[str, str]:
    """Returns (gradcam_url, ela_url) when local models are loaded."""
    return _gradcam(image, model_ids[0]), _ela(image)