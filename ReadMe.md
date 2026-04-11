# card-classic

Application de gestion de contacts avec export RDF/OWL.

## Stack technique

| Couche     | Technologie              |
|------------|--------------------------|
| Backend    | Python 3.11 + Flask      |
| Base de données | SQLite (volume Docker) |
| Frontend   | React 18 + Vite          |
| Container  | Docker / Docker Compose  |

## Lancer l'application

```bash
# Construire l'image et démarrer le container
docker compose up --build -d

# L'application est accessible sur :
# http://localhost:3000
```

## Commandes utiles

```bash
# Arrêter le container
docker compose down

# Reconstruire l'interface sans perdre la base de données
# (le volume card-classic-data persiste entre les rebuilds)
docker compose up --build -d

# Voir les logs
docker logs card-classic -f

# Accéder au shell du container
docker exec -it card-classic bash
```

## Architecture

```
card-classic/
├── backend/
│   ├── app.py            # API REST Flask + export RDF/OWL
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                      # Composant racine (mode liste/fiche)
│   │   └── components/
│   │       ├── ContactList.jsx          # Mode liste (tableau + tri + CRUD)
│   │       └── ContactForm.jsx          # Mode fiche (ajout / modification)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── Dockerfile             # Build multi-stage (React → Flask)
├── docker-compose.yml     # Image + container nommés "card-classic"
└── ReadMe.md
```

### Persistance de la base de données

La base SQLite est stockée dans `/data/contacts.db` à l'intérieur du container,
monté sur le volume nommé `card-classic-data`.

Modifier et reconstruire l'interface utilisateur (`docker compose up --build`)
**ne supprime pas** ce volume : les contacts sont préservés.

## Export RDF/OWL

Le bouton **Exporter RDF/OWL** télécharge un fichier `contacts.rdf` conforme à
l'ontologie vCard du W3C (`http://www.w3.org/2006/vcard/ns#`).

Chaque contact est représenté par un individu `vcard:Individual` avec :
- `vcard:fn` — nom formatté
- `vcard:family-name` — nom de famille
- `vcard:given-name` — prénom
- `vcard:hasEmail` / `vcard:hasTelephone` — e-mail et téléphone
