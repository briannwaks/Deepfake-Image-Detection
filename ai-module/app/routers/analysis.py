import time
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services import detector, gradcam, report
from app.models.efficientnet import _USE_LOCAL
from app.utils.image_processing import load_image_from_bytes
from app.config import settings, ENSEMBLE_MODELS

router = APIRouter()

MODE_MODELS = {
    "ensemble":      ENSEMBLE_MODELS,
    "ai-art":        ["Organika/sdxl-detector"],
    "face-deepfake": ["dima806/deepfake_vs_real_image_detection"],
    "full-scan":     ["Wvolf/ViT_Deepfake_Detection"],
}


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    mode: str = Form("ensemble"),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    data = await file.read()
    if len(data) > settings.max_image_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds size limit")

    target_models = MODE_MODELS.get(mode, ENSEMBLE_MODELS)

    start = time.perf_counter()
    image = load_image_from_bytes(data)

    pred = await detector.predict(image, models=target_models)
    forensic = report.build(image, pred, start)

    if _USE_LOCAL:
        heatmap_uri, ela_uri = gradcam.generate_both(image)
    else:
        heatmap_uri = gradcam.generate(image)
        ela_uri = None

    return {
        **pred,
        "heatmap_url": heatmap_uri,
        "ela_url": ela_uri,
        "report": forensic,
        "mode": mode,
    }
