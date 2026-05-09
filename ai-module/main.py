from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.analysis import router as analysis_router
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="DeepGuard AI Service",
    description="Deepfake detection via EfficientNet/Xception + Grad-CAM",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)


@app.get("/health")
def health():
    return {"status": "ok", "model": settings.model_name}
