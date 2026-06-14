import time
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services import detector, gradcam, report
from app.utils.image_processing import load_image_from_bytes
from app.config import settings

router = APIRouter()


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    data = await file.read()
    if len(data) > settings.max_image_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds size limit")

    start = time.perf_counter()
    image = load_image_from_bytes(data)

    pred = await detector.predict(image)
    heatmap_uri = gradcam.generate(image)
    forensic = report.build(image, pred, start)

    return {
        **pred,
        "heatmap_url": heatmap_uri,
        "report": forensic,
    }
