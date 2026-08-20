# Reproductibilité et verrou de traduction

## Créer le verrou

```bash
hsfr lock \
  --source .cache/imports/fr.json \
  --mapping data/mapping/pages.json \
  --overrides chemin/vers/overrides.json \
  --out translation-lock.json
```

Le verrou ne contient aucun texte. Il enregistre :

- la version SemVer de l'outil ;
- le `modVersion` UHC, géré séparément ;
- le fournisseur, l'aventure et la révision source ;
- un hash canonique du snapshot ;
- les hashes canoniques des mappings et overrides triés.

L'ordre des entrées de mapping ou d'override ne modifie donc pas le verrou lorsqu'il ne modifie pas le résultat.

## Construire sous verrou

```bash
hsfr build \
  --source .cache/imports/fr.json \
  --mapping data/mapping/pages.json \
  --overrides chemin/vers/overrides.json \
  --locked true \
  --lock translation-lock.json
```

Le build est refusé avant toute écriture si la version de l'outil, le `modVersion`, la source, les mappings ou les overrides ont changé. Le schéma est décrit par [`schemas/translation-lock.schema.json`](../schemas/translation-lock.schema.json).

Deux builds utilisant les mêmes entrées produisent des `translation.json`, `mod.js`, `compatibility.json` et `CREDITS.txt` identiques. Les dates de génération ne sont jamais placées dans ces sorties.

## Rapports

- `hsfr diff` compare le snapshot au dernier état sans écrire.
- `hsfr update` écrit atomiquement l'état et `reports/update-YYYY-MM-DD.md`.
- `hsfr status` calcule couverture, file de revue et overrides devenus incompatibles.
- `hsfr special-report` inventorie les pages spéciales sans texte ou chemin local.
