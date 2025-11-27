
"""
Module architecture
-------------------
Définition des architectures (ex: PyTorch nn.Module ou TensorFlow Keras Model).
"""

import os

import keras_cv
import numpy as np
from tensorflow import keras

_MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../models/best_model_effb2_ft.keras'))
_model = None

def load_model():
	global _model
	if _model is None:
		_model = keras.models.load_model(
			_MODEL_PATH,
			custom_objects={"FocalLoss": keras_cv.losses.FocalLoss}
		)
	return _model

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
	# Softmax 2 classes
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
	# Sigmoid binaire (shape[-1]==1)
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
		# Cas fallback
		topK = []
		label = "Inconnu"
		confidence = 0.0
		raw = None
	return label, confidence, topK, raw, threshold
