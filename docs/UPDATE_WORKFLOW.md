# Workflow de mise à jour

## 1. Obtenir un snapshot local

Depuis un export :

```bash
npm run hsfr -- import \
  --source export-mspfa.json \
  --adventure 45546 \
  --out .cache/imports/homestuck-fr.json
```

Ou depuis le réseau avec cache :

```bash
npm run hsfr -- fetch \
  --adventure 45546 \
  --out .cache/imports/homestuck-fr.json
```

## 2. Prévisualiser les changements

```bash
npm run hsfr -- update \
  --source .cache/imports/homestuck-fr.json \
  --dry-run true
```

Le dry-run charge et valide complètement le snapshot, calcule le nouvel état et produit le rapport sur la sortie standard. Il ne modifie ni l'état ni le rapport sur disque.

## 3. Enregistrer la mise à jour

```bash
npm run hsfr -- update \
  --source .cache/imports/homestuck-fr.json \
  --state data/metadata/source-state.json \
  --report reports/update-2026-08-20.md
```

Le rapport est écrit avant l'état. Les fichiers sont remplacés atomiquement. Une erreur de validation laisse donc le dernier état source exploitable intact.

## Catégories de différences

| Statut | Signification |
|---|---|
| `unchanged` | Hash brut identique |
| `metadataOnly` | Date ou métadonnée modifiée, contenu pertinent identique |
| `updated` | Titre, corps, log, navigation ou classification modifié |
| `new` | Nouveau numéro de page source |
| `missing` | Numéro présent dans l'état précédent mais absent du nouveau snapshot |

Une page `missing` et une page `new` ayant le même hash normalisé créent un **déplacement possible**. Cela permet de repérer une insertion, une réorganisation ou une réapparition sans affirmer automatiquement que les deux positions représentent la même page.

## Hashes

Chaque page conserve :

- `rawHash` : toutes les données internes de la page, date comprise ;
- `normalizedHash` : contenu pertinent avec fins de ligne normalisées, sans date de récupération.

Le hash normalisé préserve texte, casse, ponctuation et quirks. Il ne corrige pas la traduction.

Le format de l'état est décrit par [`schemas/source-state.schema.json`](../schemas/source-state.schema.json). L'état ne contient aucun texte traduit.

## Sécurité et droits

- Les rapports ne reproduisent jamais le texte.
- Les numéros et hashes peuvent être versionnés.
- Les snapshots et caches restent privés et hors Git.
- Un déplacement possible exige une revue humaine.
- La mise à jour de l'état n'autorise pas la publication du contenu.
