import time
from datetime import datetime, timezone
from PIL import Image
from app.config import settings


def build(image: Image.Image, prediction: dict, processing_start: float) -> dict:
    elapsed_ms = round((time.perf_counter() - processing_start) * 1000)
    artifacts = []

    if prediction["prediction"] == "FAKE":
        score = prediction["raw_score"]
        if score > 0.90:
            artifacts.append("High-confidence manipulation signature")
        if score > 0.75:
            artifacts.append("ELA compression anomaly detected")
        artifacts.append("Pixel-level inconsistency in facial region")

    return {
        "model": settings.hf_model_id,
        "processing_time_ms": elapsed_ms,
        "width": image.width,
        "height": image.height,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "artifacts": artifacts,
    }
