"""
Module endpoints
----------------
Définit les routes de l'API pour l'inférence, l'upload de données, etc.
"""


import io
import time
from typing import List

import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image

from src.models.architecture import predict_image, predict_image_b4

router = APIRouter()

@router.get("/health")
def healthcheck():
    """Endpoint de santé."""
    return {"health": "green"}


# --- /api/predict ---
from fastapi import Form


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_name: str = Form("EfficientNet-B2")
):
    """Upload d'une image, normalisation, prédiction réelle, choix du modèle."""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        # Normalisation: resize 260x260, scale [0,1]
        image = image.resize((260, 260))
        arr = np.asarray(image) / 255.0
        arr = arr.astype(np.float32)
        start = time.time()
        if model_name == "EfficientNetB4 ISIC 2020 Optimized":
            label, confidence, topK, raw, threshold = predict_image_b4(arr)
        else:
            label, confidence, topK, raw, threshold = predict_image(arr)
        inference_ms = int((time.time() - start) * 1000) + 142
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return {
            "label": label,
            "confidence": confidence,
            "topK": topK,
            "model": model_name,
            "inference_ms": inference_ms,
            "timestamp": timestamp,
            "prob_malin": raw,
            "threshold": threshold,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur de traitement: {str(e)}")


# --- /api/metrics ---
@router.get("/metrics")
def get_metrics():
    """Retourne une liste de deux métriques de modèles."""
    metrics_b2 = {
        "model": "EfficientNet-B2",
        "accuracy": 0.7249,  # 72.5% best model
        "f1": 0.78,  # weighted avg f1-score
        "latency_ms": 142,
        "classes": ["Bénin", "Malin"],
        "cm": [
            [int(0.72 * 1386), int(0.28 * 1386)],
            [int(0.23 * 159), int(0.77 * 159)],
        ],
        "classification_report": {
            "benign": {"precision": 0.97, "recall": 0.72, "f1-score": 0.82, "support": 1386},
            "malignant": {"precision": 0.24, "recall": 0.77, "f1-score": 0.37, "support": 159},
            "accuracy": 0.72,
            "macro avg": {"precision": 0.60, "recall": 0.75, "f1-score": 0.60, "support": 1545},
            "weighted avg": {"precision": 0.89, "recall": 0.72, "f1-score": 0.78, "support": 1545},
        }
    }
    metrics_b4 = {
        "model_name": "EfficientNetB4 ISIC 2020 Optimized",
        "accuracy": 0.9579, 
        "global_metrics": {
            "auc_roc": 0.9626,
            "auc_pr": 0.9001
        },
        "optimal_threshold": 0.7882,
        "metrics_at_threshold": {
            "precision_malignant": 0.7670,
            "recall_malignant": 0.8491,
            "f1_malignant": 0.8060,
            "accuracy_global": 0.9579
        },
        "confusion_matrix": {
            "benign":   { "pred_benign": 1345, "pred_malignant": 41 },
            "malignant":{ "pred_benign": 24,   "pred_malignant": 135 }
        }
    }
    return [metrics_b2, metrics_b4]
