# scripts/check_architectures.py
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings, ENSEMBLE_MODELS
if settings.models_dir:
    os.environ["HF_HOME"] = os.path.abspath(settings.models_dir)

from transformers import AutoModelForImageClassification

for model_id in ENSEMBLE_MODELS:
    model = AutoModelForImageClassification.from_pretrained(model_id)
    print(f"\n{model_id}")
    print(f"  model_type: {model.config.model_type}")
    print(f"  class: {type(model).__name__}")