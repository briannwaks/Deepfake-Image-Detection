"""
HuggingFace Inference API client.
Sends image bytes to the hosted Wvolf/ViT_Deepfake_Detection model
and returns the raw classification scores.
"""
import io
import logging
import httpx
from PIL import Image
from app.config import settings

logger = logging.getLogger(__name__)

_TIMEOUT = 40.0
_RETRY_AFTER_DEFAULT = 20


async def query(image: Image.Image) -> list[dict]:
    """
    POST image to the HF Inference API.
    Handles the model-loading cold-start by waiting and retrying once.
    Returns list like [{"label": "Fake", "score": 0.97}, {"label": "Real", "score": 0.03}]
    """
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="JPEG", quality=95)
    image_bytes = buf.getvalue()

    url = f"{settings.hf_api_base}/{settings.hf_model_id}"
    headers = {
        "Authorization": f"Bearer {settings.hf_api_token}",
        "Content-Type": "image/jpeg",
    }

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.post(url, headers=headers, content=image_bytes)

        # Model cold-start — HF returns 503 with an estimated_time field
        if response.status_code == 503:
            body = response.json()
            wait = int(body.get("estimated_time", _RETRY_AFTER_DEFAULT))
            logger.info("Model loading on HF, retrying in %ds…", wait)
            import asyncio
            await asyncio.sleep(min(wait, 30))
            response = await client.post(url, headers=headers, content=image_bytes)

        response.raise_for_status()
        return response.json()
