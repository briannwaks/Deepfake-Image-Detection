"""
Inference client — uses local models when MODELS_DIR is set, otherwise HF API.
"""
import asyncio
import io
import logging
import os
from functools import lru_cache

import httpx
from PIL import Image
from app.config import settings

logger = logging.getLogger(__name__)

_USE_LOCAL = bool(settings.models_dir)

# ── Local model helpers (only imported when MODELS_DIR is set) ────────────────

if _USE_LOCAL:
    import torch
    from transformers import AutoModelForImageClassification, AutoFeatureExtractor

    @lru_cache(maxsize=3)
    def _load_model(model_id: str):
        path = os.path.join(settings.models_dir, model_id.replace("/", "_"))
        logger.info("Loading model from %s", path)
        model = AutoModelForImageClassification.from_pretrained(path)
        processor = AutoFeatureExtractor.from_pretrained(path)
        model.eval()
        return model, processor

    def _fake_score_local(model_id: str, image: Image.Image) -> float | None:
        try:
            model, processor = _load_model(model_id)
            inputs = processor(images=image.convert("RGB"), return_tensors="pt")
            with torch.no_grad():
                logits = model(**inputs).logits
            probs = torch.nn.functional.softmax(logits, dim=-1)[0]
            id2label = model.config.id2label
            for idx, label in id2label.items():
                if label.lower() in ("fake", "artificial", "deepfake"):
                    return probs[idx].item()
            return probs[1].item()
        except Exception as exc:
            logger.warning("Local inference failed for %s: %s", model_id, exc)
            return None


# ── HF API helpers (used when MODELS_DIR is not set) ─────────────────────────

_TIMEOUT = 45.0
_RETRY_WAIT_CAP = 30


def _image_bytes(image: Image.Image) -> bytes:
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def _extract_fake_score(results: list[dict]) -> float | None:
    scores: dict[str, float] = {r["label"].upper().strip(): r["score"] for r in results}
    return (
        scores.get("FAKE")
        or scores.get("ARTIFICIAL")
        or scores.get("DEEPFAKE")
        or scores.get("LABEL_1")
        or scores.get("1")
    )


async def _query_one(client: httpx.AsyncClient, model_id: str, image_bytes: bytes) -> float | None:
    url = f"{settings.hf_api_base}/{model_id}"
    headers = {"Authorization": f"Bearer {settings.hf_api_token}", "Content-Type": "image/jpeg"}
    try:
        response = await client.post(url, headers=headers, content=image_bytes)
        if response.status_code == 503:
            wait = min(int(response.json().get("estimated_time", 20)), _RETRY_WAIT_CAP)
            logger.info("%s loading, retrying in %ds…", model_id, wait)
            await asyncio.sleep(wait)
            response = await client.post(url, headers=headers, content=image_bytes)
        response.raise_for_status()
        return _extract_fake_score(response.json())
    except Exception as exc:
        logger.warning("Model %s failed: %s", model_id, exc)
        return None


# ── Public interface ──────────────────────────────────────────────────────────

async def query_ensemble(image: Image.Image, model_ids: list[str]) -> list[float | None]:
    if _USE_LOCAL:
        return [_fake_score_local(mid, image) for mid in model_ids]

    img_bytes = _image_bytes(image)
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        return await asyncio.gather(*[_query_one(client, mid, img_bytes) for mid in model_ids])
