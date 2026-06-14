from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.analysis import router as analysis_router
from app.config import settings, ENSEMBLE_MODELS
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="DeepGuard AI Service",
    description="3-model ensemble deepfake detection via HuggingFace Inference API + ELA",
    version="2.0.0",
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
    return {"status": "ok", "models": ENSEMBLE_MODELS}
