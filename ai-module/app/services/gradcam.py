"""
Heatmap generation — Attention Rollout for ViT models (local models),
ELA fallback when running on HuggingFace API.

Attention Rollout is the standard explainability method for Vision Transformers.
It propagates attention weights across all layers to show which image regions
the model focused on when making its decision.
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

_GRADCAM_MODEL = "dima806/deepfake_vs_real_image_detection"


def _attention_rollout(image: Image.Image) -> str:
    try:
        import torch
        from app.models.efficientnet import _load_model

        model, processor = _load_model(_GRADCAM_MODEL)
        img_224 = image.convert("RGB").resize((224, 224))
        inputs = processor(images=img_224, return_tensors="pt")

        with torch.no_grad():
            outputs = model(
                pixel_values=inputs["pixel_values"],
                output_attentions=True,
            )

        # Attention rollout: propagate attention across all transformer layers
        attentions = outputs.attentions  # tuple of [1, heads, seq, seq]
        result = torch.eye(attentions[0].size(-1))
        for attn in attentions:
            attn_avg = attn.squeeze(0).mean(dim=0)      # average over heads
            attn_avg = attn_avg + torch.eye(attn_avg.size(-1))  # residual
            attn_avg = attn_avg / attn_avg.sum(dim=-1, keepdim=True)
            result = attn_avg @ result

        # CLS token attention to the 14×14 patch grid
        mask = result[0, 1:].reshape(14, 14).numpy()
        mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-8)

        # Upsample and apply JET colormap overlay
        mask_up = cv2.resize(mask, (224, 224))
        heatmap = cv2.applyColorMap(np.uint8(255 * mask_up), cv2.COLORMAP_JET)
        heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

        img_array = np.array(img_224, dtype=np.float32) / 255.0
        overlay = np.clip(0.5 * heatmap + 0.5 * img_array, 0, 1)

        return image_to_base64_png((overlay * 255).astype(np.uint8))

    except Exception as exc:
        logger.warning("Attention rollout failed, falling back to ELA: %s", exc)
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
    return _attention_rollout(image) if _USE_LOCAL else _ela(image)
