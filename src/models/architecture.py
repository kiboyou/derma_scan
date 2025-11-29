"""
Module architecture
-------------------
Définition des architectures (ex: PyTorch nn.Module ou TensorFlow Keras Model).
"""

import os

import base64
from io import BytesIO
from PIL import Image
import cv2
# import keras_cv
import numpy as np
# from tensorflow import keras
import tensorflow as tf

# from src.models.warmup_cosine import WarmUpCosine

# EfficientNetB4
_MODEL_PATH_B4 = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../models/best_model_optimized_ft_B4.keras'))
_model_b4 = None

def load_model_b4():
    global _model_b4
    if _model_b4 is None:
        print("[architecture] Loading EfficientNetB4 model from", _MODEL_PATH_B4)
        _model_b4 = tf.keras.models.load_model(
            _MODEL_PATH_B4, 
            compile=False,
            # custom_objects={
            #     "FocalLoss": keras_cv.losses.FocalLoss,
            #     "WarmUpCosine": WarmUpCosine
            # }
        )
        print("[architecture] EfficientNetB4 loaded")
    return _model_b4

 

def predict_image_b4(arr: np.ndarray):
    """
    Prend une image normalisée (np.ndarray, shape (260,260,3), dtype float32, valeurs [0,1])
    Retourne le label, la confiance, le topK pour EfficientNetB4.
    """
    print("[predict_image_b4] Start prediction; input shape:", arr.shape, "dtype:", arr.dtype, "min:", float(arr.min()), "max:", float(arr.max()))
    model = load_model_b4()
    THRESHOLD = 0.7882
    # Le modèle retourne des logits (pas des probabilités)
    x = np.expand_dims(arr, axis=0)
    print("[predict_image_b4] Expanded batch shape:", x.shape)
    preds = model.predict(x)
    print("[predict_image_b4] Raw preds:", preds)
    logits = float(preds[0][0])
    prob = 1.0 / (1.0 + np.exp(-logits))
    print(f"[predict_image_b4] logits={logits:.4f} prob={prob:.4f} threshold={THRESHOLD:.4f}")
    label = "Malin" if prob >= THRESHOLD else "Bénin"
    topK = [
        {"label": "Malin", "prob": prob},
        {"label": "Bénin", "prob": 1.0 - prob},
    ]
    confidence = prob if label == "Malin" else 1.0 - prob
    return label, confidence, topK, prob, THRESHOLD
