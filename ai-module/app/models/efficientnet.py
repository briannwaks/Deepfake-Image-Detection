"""
HuggingFace Inference API client — queries multiple models in parallel.
"""
import asyncio
import io
import logging
import httpx
from PIL import Image
from app.config import settings

logger = logging.getLogger(__name__)

_TIMEOUT = 45.0
_RETRY_WAIT_CAP = 30


def _image_bytes(image: Image.Image) -> bytes:
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def _extract_fake_score(results: list[dict]) -> float | None:
    """
    Normalise label variants across all three models:
      dima806  → "Fake" / "Real"
      prithiv  → "Deepfake" / "Real"  (or LABEL_0/LABEL_1)
      Wvolf    → "Fake" / "Real"
    Returns the fake probability, or None if parsing fails.
    """
    scores: dict[str, float] = {
        r["label"].upper().strip(): r["score"] for r in results
    }
    return (
        scores.get("FAKE")
        or scores.get("DEEPFAKE")
        or scores.get("LABEL_1")
        or scores.get("1")
    )


async def _query_one(
    client: httpx.AsyncClient,
    model_id: str,
    image_bytes: bytes,
) -> float | None:
    """Query a single model; returns its fake score or None on failure."""
    url = f"{settings.hf_api_base}/{model_id}"
    headers = {
        "Authorization": f"Bearer {settings.hf_api_token}",
        "Content-Type": "image/jpeg",
    }
    try:
        response = await client.post(url, headers=headers, content=image_bytes)

        if response.status_code == 503:
            wait = min(
                int(response.json().get("estimated_time", 20)),
                _RETRY_WAIT_CAP,
            )
            logger.info("%s loading, retrying in %ds…", model_id, wait)
            await asyncio.sleep(wait)
            response = await client.post(url, headers=headers, content=image_bytes)

        response.raise_for_status()
        return _extract_fake_score(response.json())

    except Exception as exc:
        logger.warning("Model %s failed: %s", model_id, exc)
        return None


async def query_ensemble(image: Image.Image, model_ids: list[str]) -> list[float | None]:
    """
    Query all models in parallel and return their individual fake scores.
    Failed models return None — the caller decides how to handle gaps.
    """
    img_bytes = _image_bytes(image)
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        return await asyncio.gather(
            *[_query_one(client, mid, img_bytes) for mid in model_ids]
        )
