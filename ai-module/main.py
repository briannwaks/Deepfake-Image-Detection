#main file
import os
from app.config import settings

if settings.models_dir:
    os.environ["HF_HOME"] = os.path.abspath(settings.models_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.analysis import router as analysis_router
from app.config import settings, ENSEMBLE_MODELS
from app.models.efficientnet import _load_model
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="DeepGuard AI Service",
    description="Deepfake detection via local model inference",
    version="2.0.0",
)

_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)


@app.on_event("startup")
def warm_up_model():
    logging.info("Warming up model at startup...")
    _load_model("Organika/sdxl-detector")  # swap for whichever single mode you're demoing
    logging.info("Model warm-up complete.")


@app.get("/health")
def health():
    return {"status": "ok", "models": ENSEMBLE_MODELS}