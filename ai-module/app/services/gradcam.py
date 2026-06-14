"""
Error Level Analysis (ELA) — a standard digital forensics technique.

Re-saves the image at a reduced JPEG quality and amplifies the pixel-level
difference between the original and re-compressed version.  Regions that
have been digitally manipulated retain less compression error than
untouched areas, making them stand out as brighter zones in the heatmap.
"""
import io
import numpy as np
import cv2
from PIL import Image, ImageChops, ImageEnhance

from app.utils.image_processing import image_to_base64_png
from app.config import settings


def generate(image: Image.Image) -> str:
    img = image.convert("RGB")

    # Re-compress at reduced quality
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=settings.ela_quality)
    buf.seek(0)
    recompressed = Image.open(buf).convert("RGB")

    # Pixel-level difference
    ela = ImageChops.difference(img, recompressed)

    # Amplify so the full 0-255 range is used
    max_diff = max(ex[1] for ex in ela.getextrema()) or 1
    ela = ImageEnhance.Brightness(ela).enhance(255.0 / max_diff)

    # Apply JET colormap for the heatmap overlay
    gray = cv2.cvtColor(np.array(ela), cv2.COLOR_RGB2GRAY)
    heatmap = cv2.applyColorMap(gray, cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

    original = np.array(img, dtype=np.float32) / 255.0
    overlay = 0.55 * heatmap_rgb + 0.45 * original

    return image_to_base64_png(overlay)
