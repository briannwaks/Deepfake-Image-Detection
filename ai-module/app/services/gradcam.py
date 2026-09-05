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

# Target model for Grad-CAM (face-focused, most visual for deepfakes)
_GRADCAM_MODEL = "dima806/deepfake_vs_real_image_detection"


def _reshape_transform(tensor):
    """Reshape ViT sequence output to spatial grid for Grad-CAM."""
    result = tensor[:, 1:, :].reshape(tensor.size(0), 14, 14, tensor.size(2))
    return result.transpose(2, 3).transpose(1, 2)


def _gradcam(image: Image.Image) -> str:
    try:
        import torch
        from pytorch_grad_cam import GradCAMPlusPlus
        from pytorch_grad_cam.utils.image import show_cam_on_image
        from app.models.efficientnet import _load_model

        model, processor = _load_model(_GRADCAM_MODEL)

        # Wrap model so it returns raw logits — GradCAM can't handle HF ModelOutput
        class LogitsWrapper(torch.nn.Module):
            def __init__(self, m): super().__init__(); self.m = m
            def forward(self, x): return self.m(x).logits

        wrapped = LogitsWrapper(model)
        target_layer = model.vit.layers[-1].layernorm_before

        img_224 = image.convert("RGB").resize((224, 224))
        inputs = processor(images=img_224, return_tensors="pt")

        # Find fake class index
        id2label = model.config.id2label
        fake_idx = next(
            (i for i, l in id2label.items() if l.lower() in ("fake", "artificial")),
            1,
        )

        cam = GradCAMPlusPlus(
            model=wrapped,
            target_layers=[target_layer],
            reshape_transform=_reshape_transform,
        )
        grayscale_cam = cam(input_tensor=inputs["pixel_values"], targets=None)

        img_array = np.array(img_224, dtype=np.float32) / 255.0
        overlay = show_cam_on_image(img_array, grayscale_cam[0], use_rgb=True)
        return image_to_base64_png(np.array(overlay))

    except Exception as exc:
        logger.warning("Grad-CAM failed, falling back to ELA: %s", exc)
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


def generate(image: Image.Image) -> str:
    return _gradcam(image) if _USE_LOCAL else _ela(image)
