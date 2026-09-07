FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir torch==2.14.0 torchvision==0.29.0 --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Cache directory for HF models — matches MODELS_DIR below
ENV HF_HOME=/app/models

# Pre-download all ensemble models during build, so no network call happens at runtime
RUN python -c "\
from transformers import AutoModelForImageClassification, AutoImageProcessor; \
models = ['dima806/deepfake_vs_real_image_detection', 'Organika/sdxl-detector', 'Wvolf/ViT_Deepfake_Detection']; \
[AutoModelForImageClassification.from_pretrained(m) for m in models]; \
[AutoImageProcessor.from_pretrained(m) for m in models]"

COPY . .

ENV MODELS_DIR=/app/models
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]