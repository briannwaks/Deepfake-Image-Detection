"""
Inference client — local models only.
"""
import logging
from functools import lru_cache

import torch
from PIL import Image
from transformers import AutoModelForImageClassification, AutoImageProcessor

logger = logging.getLogger(__name__)

_USE_LOCAL = True  # kept as a constant so analysis.py's existing import still works


@lru_cache(maxsize=3)
def _load_model(model_id: str):
    logger.info("Loading model %s (from HF cache or downloading)", model_id)
    model = AutoModelForImageClassification.from_pretrained(model_id)
    processor = AutoImageProcessor.from_pretrained(model_id)
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


async def query_ensemble(image: Image.Image, model_ids: list[str]) -> list[float | None]:
    return [_fake_score_local(mid, image) for mid in model_ids]