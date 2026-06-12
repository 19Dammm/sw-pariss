Remplis `public/data/spots.19e.json` avec tes spots (Paris entier — 19e, limitrophes et autres arrondissements).

Pour régénérer la liste de base depuis les sources documentées :
`node scripts/generate-paris-spots.mjs`

Format attendu pour chaque spot:

```json
{
  "id": "spot-001",
  "name": "Nom du spot",
  "lat": 48.8882,
  "lng": 2.3843,
  "address": "Adresse complète",
  "arrondissement": "19e",
  "equipment": ["Barres de traction", "Barres parallèles"],
  "note": "Optionnel — infos notables (éclairage, affluence, accès…)"
}
```

Le champ `note` est optionnel : s'il est vide ou absent, rien ne s'affiche sur la fiche.
