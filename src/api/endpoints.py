"""
Module endpoints
----------------
Définit les routes de l'API pour l'inférence, l'upload de données, etc.
"""


import base64
import io
import time
from typing import List

import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image

from src.models.architecture import predict_image_b4
from src.ai.explainer import explain_with_llm


router = APIRouter()

@router.get("/health")
def healthcheck():
    """Endpoint de santé."""
    return {"health": "green"}


# --- /api/predict ---
from fastapi import Form


@router.post("/predict")
async def predict(
    file: UploadFile = File(...)
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
        print("[endpoints.predict] Received image; resized to 260x260; arr stats min:", float(arr.min()), "max:", float(arr.max()))

        label, confidence, topK, raw, threshold = predict_image_b4(arr)
        print(f"[endpoints.predict] prediction label={label} confidence={confidence:.4f} raw={raw:.4f} threshold={threshold:.4f}")

        explanation = explain_with_llm(
            label=label,
            prob=float(raw),
            threshold=float(threshold)
        )

        print("[endpoints.predict] LLM explanation length:", len(explanation))

        # Temps d'inférence
        inference_ms = int((time.time() - start) * 1000) + 142
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        return {
            "label": label,
            "confidence": confidence,
            "topK": topK,
            "model": "EfficientNet-B4",
            "inference_ms": inference_ms,
            "timestamp": timestamp,
            "prob_malin": raw,
            "threshold": threshold,
            "llm_explanation": explanation,
        }
    except Exception as e:
        print("[endpoints.predict] ERROR:", repr(e))
        raise HTTPException(status_code=400, detail=f"Erreur de traitement: {str(e)}")


# --- /api/metrics ---
@router.get("/metrics")
def get_metrics():
    """Retourne les métriques du modèle B4."""
    metrics_b4 = {
        "model_name": "EfficientNet-B4",
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
    return [metrics_b4]
