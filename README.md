# DermaScan: Plateforme Big Data & Deep Learning pour la Détection Précoce du Cancer de la Peau

## Introduction
DermaScan est une plateforme conçue pour la détection précoce du cancer de la peau à partir d'images dermatologiques. Ce projet utilise des technologies Big Data et Deep Learning pour construire un pipeline capable d'ingérer, de stocker et de traiter de grandes quantités d'images dermatologiques afin de les classer automatiquement.

## Objectifs
- **Pipeline d'ingestion** : Construire un système pour acquérir et stocker efficacement des images dermatologiques.
- **Modèle de classification** : Entraîner un modèle de Deep Learning (CNN) pour différencier les lésions malignes (mélanome) des lésions bénignes.
- **Infrastructure Big Data** : Utiliser des outils adaptés pour gérer le volume et l'hétérogénéité des données.
- **Résultat exploitable** : Fournir un modèle fonctionnel et une démonstration de son fonctionnement.

## Données
- **Source** : Jeu de données public ISIC (International Skin Imaging Collaboration).
- **Format** : Images (JPEG, PNG).
- **Taille** : Plusieurs milliers d'images.

## Outils et Technologies
- **Ingestion et stockage** : Apache Kafka, HDFS ou S3.
- **Traitement et modélisation** :
  - Framework : TensorFlow.
  - Langage : Python.
  - Librairies : Pandas, NumPy, Scikit-learn, OpenCV.
- **Infrastructure** : Docker et Docker Compose.

## Livrables
- Pipeline d'ingestion fonctionnel.
- Notebooks d'analyse documentant les étapes de prétraitement, d'exploration des données et d'entraînement du modèle.
- Modèle entraîné.
- Script de démonstration pour l'inférence.

## Architecture
1. **Source de données** : Jeu de données ISIC.
2. **Ingestion** : Script pour charger les images vers un système de stockage distribué.
3. **Stockage** : HDFS ou S3 pour les images et métadonnées.
4. **Traitement** : Scripts Python pour le prétraitement (redimensionnement, normalisation).
5. **Modélisation** : Entraînement d'un CNN avec TensorFlow.
6. **Inférence** : Script pour classifier de nouvelles images.

## Critères de Succès
- Pipeline d'ingestion capable de traiter un grand nombre d'images sans erreur.
- Modèle atteignant une précision d'au moins 80% sur le jeu de test.
- Documentation claire permettant la reproduction des étapes.
- Respect du budget de 21 heures de développement.

## Structure du Projet
```
DermaScan/
├── docker/
├── frontend/
├── mlruns/
├── notebooks/
├── src/
├── tests/
├── README.md
├── requirements.txt
```

---

## Installation
1. Clonez le dépôt :
   ```bash
   git clone <url-du-repo>
   ```
2. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```
3. Lancez les services Docker :
   ```bash
   docker-compose up
   ```

## Utilisation
- **Notebooks** : Consultez le dossier `notebooks/` pour les étapes d'analyse et d'entraînement.
- **API** : Démarrez l'API pour effectuer des prédictions.
- **Frontend** : Accédez à l'interface utilisateur pour charger et classifier des images.