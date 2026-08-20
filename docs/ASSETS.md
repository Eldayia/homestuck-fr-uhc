# Pages spéciales et assets

## Règle actuelle

Le projet ne transforme aucun binaire. Une page image, Flash, HTML5 ou interactive peut recevoir uniquement ses champs textuels externes vérifiés ; les médias UHC existants restent inchangés.

```bash
hsfr special-report \
  --source .cache/imports/fr.json \
  --mapping data/mapping/pages.json \
  --assets data/assets/manifest.json \
  --out reports/special-pages.md
```

Le rapport contient seulement numéros source/UHC, hashes, classifications, présence éventuelle de texte extérieur et statuts techniques du manifest. Il ne contient ni titre, ni corps, ni chemin local, ni asset.

## Manifest

[`data/assets/manifest.json`](../data/assets/manifest.json) est vide par défaut et conforme à [`schemas/asset-manifest.schema.json`](../schemas/asset-manifest.schema.json). Une entrée contient :

- un identifiant technique public au projet ;
- l'ID UHC de la page ;
- le type image, Flash, HTML5 ou interactif ;
- une origine `uhc-local` ou `translation-local` ;
- un hash de la source locale ;
- un statut `local-only`, `authorized` ou `blocked` ;
- une référence obligatoire uniquement pour `authorized`.

Aucun chemin local n'est stocké. Le statut `authorized` ne déclenche encore aucune copie : la filière d'assets autorisés reste à concevoir et à faire revoir juridiquement.

## Protection du dépôt

Le contrôle `npm run check:repository` refuse les principaux formats binaires et archives, les caches, les sorties `translation.json`, les exports MSPFA et les snapshots textuels hors des fixtures artificielles. Les assets locaux restent donc hors Git même en cas d'erreur de manipulation.
