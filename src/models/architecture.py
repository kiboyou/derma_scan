"""
Module architecture
-------------------
Définition des architectures (ex: PyTorch nn.Module ou TensorFlow Keras Model).
"""

import os

import keras_cv
import numpy as np
from tensorflow import keras

from src.models.warmup_cosine import WarmUpCosine

# EfficientNetB2
_MODEL_PATH_B2 = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../models/best_model_effb2_ft.keras'))
_model_b2 = None

def load_model():
	global _model_b2
	if _model_b2 is None:
		_model_b2 = keras.models.load_model(
			_MODEL_PATH_B2,
			custom_objects={"FocalLoss": keras_cv.losses.FocalLoss}
		)
	return _model_b2

# EfficientNetB4
_MODEL_PATH_B4 = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../models/best_model_optimized_ft_B4.keras'))
_model_b4 = None

def load_model_b4():
	global _model_b4
	if _model_b4 is None:
		_model_b4 = keras.models.load_model(
			_MODEL_PATH_B4,
			custom_objects={
				"FocalLoss": keras_cv.losses.FocalLoss,
				"WarmUpCosine": WarmUpCosine
			}
		)
	return _model_b4

def predict_image(arr: np.ndarray):
	"""
	Prend une image normalisée (np.ndarray, shape (224,224,3), dtype float32, valeurs [0,1])
	Retourne le label, la confiance, le topK.
	"""
	model = load_model()
	# Ajoute batch dim
	x = np.expand_dims(arr, axis=0)
	preds = model.predict(x)
	print(f"[DEBUG] preds.shape: {preds.shape}, preds: {preds}")
	threshold = 0.5  # seuil personnalisable
	if preds.shape[-1] == 2:
		prob_malin = float(preds[0][1])
		prob_benin = float(preds[0][0])
		topK = [
			{"label": "Malin", "prob": prob_malin},
			{"label": "Bénin", "prob": prob_benin},
		]
		label = "Malin" if prob_malin > prob_benin else "Bénin"
		confidence = max(prob_malin, prob_benin)
		raw = prob_malin
	elif preds.shape[-1] == 1:
		prob_malin = float(preds[0][0])
		prob_benin = 1.0 - prob_malin
		topK = [
			{"label": "Malin", "prob": prob_malin},
			{"label": "Bénin", "prob": prob_benin},
		]
		label = "Malin" if prob_malin > threshold else "Bénin"
		confidence = max(prob_malin, prob_benin)
		raw = prob_malin
	else:
		topK = []
		label = "Inconnu"
		confidence = 0.0
		raw = None
	return label, confidence, topK, raw, threshold

def predict_image_b4(arr: np.ndarray):
	"""
	Prend une image normalisée (np.ndarray, shape (260,260,3), dtype float32, valeurs [0,1])
	Retourne le label, la confiance, le topK pour EfficientNetB4.
	"""
	model = load_model_b4()
	THRESHOLD = 0.7882
	# Le modèle retourne des logits (pas des probabilités)
	logits = float(model.predict(np.expand_dims(arr, axis=0))[0][0])
	prob = 1.0 / (1.0 + np.exp(-logits))
	label = "Malin" if prob >= THRESHOLD else "Bénin"
	topK = [
		{"label": "Malin", "prob": prob},
		{"label": "Bénin", "prob": 1.0 - prob},
	]
	confidence = prob if label == "Malin" else 1.0 - prob
	return label, confidence, topK, prob, THRESHOLD
