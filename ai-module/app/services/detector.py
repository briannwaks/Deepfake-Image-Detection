import numpy as np
from app.models.efficientnet import get_model
from app.utils.image_processing import preprocess
from app.config import settings
from PIL import Image


def predict(image: Image.Image) -> dict:
    """Run inference and return prediction, confidence, and raw score."""
    model = get_model()
    tensor = preprocess(image, settings.input_size)
    raw_score: float = float(model.predict(tensor, verbose=0)[0][0])

    is_fake = raw_score >= settings.confidence_threshold
    confidence = raw_score if is_fake else (1.0 - raw_score)

    return {
        "prediction": "FAKE" if is_fake else "REAL",
        "confidence": round(confidence, 4),
        "raw_score": round(raw_score, 4),
    }
