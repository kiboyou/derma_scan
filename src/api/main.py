"""
Module main (FastAPI)
---------------------
Point d'entrée de l'API. Lance le serveur et définit la configuration générale.
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .endpoints import router

app = FastAPI(title="Deep Learning API", version="0.1.0")

# Autorise le frontend local (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root():
    """Endpoint racine pour vérifier l'état."""
    return {"status": "ok"}

