# Frontend - DermaScan

## Introduction
Ce dossier contient le code source de l'interface utilisateur de la plateforme DermaScan. L'interface permet aux utilisateurs de charger des images dermatologiques et de visualiser les résultats de classification.

## Technologies Utilisées
- **Framework** : Next.js
- **Langage** : TypeScript
- **Styles** : CSS Modules
- **Gestion des dépendances** : npm

## Structure du Dossier
```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
├── next.config.ts
├── package.json
├── tsconfig.json
```

## Installation
1. Accédez au dossier `frontend/` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```

## Lancement du Serveur de Développement
1. Démarrez le serveur :
   ```bash
   npm run dev
   ```
2. Ouvrez votre navigateur et accédez à :
   ```
   http://localhost:3000
   ```

## Scripts Disponibles
- **`npm run dev`** : Démarre le serveur de développement.
- **`npm run build`** : Génère une version de production.
- **`npm start`** : Démarre le serveur en mode production.

## Contribution
1. Forkez le dépôt.
2. Créez une branche pour votre fonctionnalité :
   ```bash
   git checkout -b feature/nom-fonctionnalite
   ```
3. Faites vos modifications et soumettez une pull request.
