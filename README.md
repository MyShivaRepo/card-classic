# Card Classic

Application web de gestion de contacts, hébergée dans un container Docker.

## Fonctionnalités

- **Liste des contacts** : tableau trié par colonne (ordre alphabétique / inversé)
- **Fiche contact** : création et modification d'un contact
- **Export RDF/OWL** : téléchargement de la base au format RDF/OWL XML (ontologie vCard W3C)
- **Export JSON** : téléchargement de la base au format JSON
- **Persistance des données** : la base de données survit aux mises à jour de l'interface

## Structure du projet

```
card-classic/
├── exigences/              # Expression du besoin fonctionnel
│   └── exigences.md
└── app/                    # Code applicatif
    ├── Dockerfile
    ├── docker-compose.yml
    ├── package.json
    ├── server.js           # API REST (Node.js + Express)
    └── public/
        ├── index.html
        ├── style.css
        └── app.js
```

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Backend   | Node.js + Express |
| Base de données | SQLite (better-sqlite3) |
| Frontend  | HTML / CSS / JavaScript vanilla |
| Déploiement | Docker + Docker Compose |

## Installation et démarrage

### Prérequis

- [Docker](https://www.docker.com/) et Docker Compose installés

### Lancer l'application

```bash
cd app
docker compose build
docker compose up -d
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

### Arrêter l'application

```bash
cd app
docker compose down
```

> La base de données est conservée dans le volume Docker `card-classic-data` et n'est pas supprimée lors de l'arrêt.

### Mettre à jour l'interface sans perdre les données

```bash
cd app
docker compose build
docker compose up -d
```

## Utilisation

### Mode liste

- Cliquer sur un **en-tête de colonne** pour trier
- Bouton **Ajouter** (vert) pour créer un nouveau contact
- Bouton **Modifier** (vert) pour éditer un contact existant
- Bouton **Supprimer** (rouge) pour supprimer définitivement un contact
- Bouton **Exporter RDF/OWL** pour télécharger la base au format RDF/OWL XML
- Bouton **Exporter JSON** (bleu) pour télécharger la base au format JSON

### Mode fiche

- Remplir les champs (Nom et Prénom obligatoires)
- Bouton **Valider** (bleu) pour enregistrer
- Bouton **Annuler** pour revenir à la liste sans sauvegarder
