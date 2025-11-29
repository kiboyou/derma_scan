"""
Module main (FastAPI)
---------------------
Point d'entrée de l'API. Lance le serveur et définit la configuration générale.
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .endpoints import router
from src.models.architecture import load_model_b4

app = FastAPI(title="Deep Learning API", version="0.1.0")

# Autorise le frontend local (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------
# CHARGEMENT DES MODÈLES AU DÉMARRAGE
# ------------------------------------
@app.on_event("startup")
def startup_event():
    print("🔵 Chargement EfficientNet-B4...")
    model_b4 = load_model_b4()
    # print(">>> MODEL INPUT SHAPE =", model_b4.input_shape)
    # model_b4.summary(line_length=200)
    print("🟢 EfficientNet-B4 chargé.")
    
    # -------- WARMUP ----------
    import numpy as np
    print("🔥 Warmup des modèles (prédictions factices)...")

    # Le modèle utilise 260x260
    dummy = np.zeros((1, 260, 260, 3), dtype=np.float32)

    model_b4.predict(dummy)

    print("🚀 Warmup terminé : les prédictions seront instantanées.")


app.include_router(router, prefix="/api")


@app.get("/")
def root():
    """Endpoint racine pour vérifier l'état."""
    return {"status": "ok"}

