"""
One-time script: downloads and caches all ensemble models locally.
Run this once (and again whenever ENSEMBLE_MODELS changes) before starting the server.
"""
import os
import sys

# Must set HF_HOME before importing transformers — same rule as main.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings, ENSEMBLE_MODELS

if settings.models_dir:
    os.environ["HF_HOME"] = os.path.abspath(settings.models_dir)
else:
    print("MODELS_DIR is not set in .env — nothing to warm. Set it first.")
    sys.exit(1)

from transformers import AutoModelForImageClassification, AutoImageProcessor

for model_id in ENSEMBLE_MODELS:
    print(f"Downloading/caching {model_id} ...")
    AutoModelForImageClassification.from_pretrained(model_id)
    AutoImageProcessor.from_pretrained(model_id)
    print(f"  done.")

print("\nAll models cached in:", os.environ["HF_HOME"])