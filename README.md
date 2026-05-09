# DeepGuard — Deepfake Image Detection

A Progressive Web App for detecting AI-generated and manipulated images using deep learning.

**Team:** Brian Nwakanma & Mohammed Abdul Basit — Final Year Project

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 5 (PWA) |
| Backend | Node.js + Express |
| AI Module | Python + FastAPI + TensorFlow/Keras (EfficientNetB4 / Xception) |

## Features

- Real / Fake classification with confidence score
- Grad-CAM heatmap showing regions the model focused on
- Forensic report with artifact breakdown

## Project Structure

```
├── frontend/      React + Vite PWA
├── backend/       Node/Express API gateway
├── ai-module/     FastAPI inference service
└── docs/          Project documentation
```

## Getting Started

```bash
# Frontend
cd frontend && npm install && npm run dev        # http://localhost:5173

# Backend
cd backend && npm install && cp .env.example .env && npm run dev   # http://localhost:3000

# AI Module
cd ai-module && python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt && cp .env.example .env
uvicorn main:app --reload --port 8000             # http://localhost:8000
```

Place trained model weights at `ai-module/models/weights.h5` and set `MODEL_WEIGHTS_PATH` in `ai-module/.env`.
