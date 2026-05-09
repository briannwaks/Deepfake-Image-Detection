import time
from datetime import datetime, timezone
from PIL import Image
from app.config import settings


def build(image: Image.Image, prediction: dict, processing_start: float) -> dict:
    elapsed_ms = round((time.perf_counter() - processing_start) * 1000)
    artifacts = []

    if prediction["prediction"] == "FAKE":
        score = prediction["raw_score"]
        if score > 0.9:
            artifacts.append("High-frequency GAN fingerprint")
        if score > 0.75:
            artifacts.append("Blending boundary anomaly")
        artifacts.append("Facial symmetry inconsistency")

    return {
        "model": settings.model_name,
        "processing_time_ms": elapsed_ms,
        "width": image.width,
        "height": image.height,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "artifacts": artifacts,
    }
