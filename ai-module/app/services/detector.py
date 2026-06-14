from PIL import Image
from app.models.efficientnet import query_ensemble
from app.config import settings, ENSEMBLE_MODELS


async def predict(image: Image.Image) -> dict:
    raw_scores = await query_ensemble(image, ENSEMBLE_MODELS)

    # Keep only scores that came back successfully
    valid = [s for s in raw_scores if s is not None]

    if not valid:
        raise RuntimeError("All models failed to respond — check your HF token and network.")

    ensemble_fake_score = sum(valid) / len(valid)
    is_fake = ensemble_fake_score >= settings.confidence_threshold

    return {
        "prediction": "FAKE" if is_fake else "REAL",
        "confidence": round(ensemble_fake_score if is_fake else 1 - ensemble_fake_score, 4),
        "raw_score": round(ensemble_fake_score, 4),
        "model_scores": {
            ENSEMBLE_MODELS[i]: round(s, 4) if s is not None else None
            for i, s in enumerate(raw_scores)
        },
    }
