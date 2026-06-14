from PIL import Image
from app.models.efficientnet import query
from app.config import settings


async def predict(image: Image.Image) -> dict:
    results = await query(image)

    # Normalise label variants: "Fake"/"Real", "FAKE"/"REAL", "LABEL_1"/"LABEL_0"
    scores: dict[str, float] = {}
    for item in results:
        label = item["label"].upper().strip()
        scores[label] = item["score"]

    fake_score = (
        scores.get("FAKE")
        or scores.get("LABEL_1")
        or scores.get("1")
        or 0.0
    )
    real_score = (
        scores.get("REAL")
        or scores.get("LABEL_0")
        or scores.get("0")
        or 0.0
    )

    is_fake = fake_score >= settings.confidence_threshold
    confidence = fake_score if is_fake else real_score

    return {
        "prediction": "FAKE" if is_fake else "REAL",
        "confidence": round(confidence, 4),
        "raw_score": round(fake_score, 4),
    }
