# Homestuck FR for The Unofficial Homestuck Collection

Projet communautaire non officiel destiné à produire localement un mod français pour The Unofficial Homestuck Collection (UHC).

Ce projet n'est affilié ni à Homestuck, ni à MSPFA, ni à The Unofficial Homestuck Collection.

## État

Le dépôt est au stade du premier vertical slice. Il contient uniquement des outils et des fixtures artificielles. Il ne contient aucune traduction française ni aucun asset Homestuck.

La redistribution du contenu traduit n'étant pas autorisée à ce jour, la politique par défaut est :

```text
CONTENT_DISTRIBUTION_ALLOWED=false
```

Consulter :

- [la feuille de route](./docs/ROADMAP.md) pour l'avancement étape par étape ;
- [la recherche initiale](./docs/RESEARCH.md) pour les décisions techniques et juridiques ;
- [l'architecture](./docs/ARCHITECTURE.md) pour les invariants du pipeline actuel ;
- [la recherche juridique](./docs/LEGAL_RESEARCH.md) et [la checklist de release](./docs/RELEASE_CHECKLIST.md) pour les règles de distribution.

## Développement

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
npm run verify
```

Exécuter le vertical slice sur les fixtures artificielles :

```bash
npm run hsfr -- build \
  --source tests/fixtures/source.json \
  --mapping tests/fixtures/mapping.json \
  --overrides tests/fixtures/overrides.json \
  --out generated/demo
```

Le résultat local est ignoré par Git.

Importer un export MSPFA local sans accès réseau :

```bash
npm run hsfr -- import \
  --source chemin/vers/export-mspfa.json \
  --adventure 45546 \
  --out .cache/imports/homestuck-fr.json
```

Un snapshot réel contient la traduction et doit rester hors Git. Voir [la documentation de la source](./docs/TRANSLATION_SOURCE.md).

Récupérer prudemment un snapshot depuis MSPFA :

```bash
npm run hsfr -- fetch \
  --adventure 45546 \
  --cache .cache/mspfa \
  --out .cache/imports/homestuck-fr.json
```

Relire le dernier cache sans aucun accès réseau :

```bash
npm run hsfr -- fetch --adventure 45546 --offline true
```

Prévisualiser une mise à jour sans écrire :

```bash
npm run hsfr -- update \
  --source .cache/imports/homestuck-fr.json \
  --dry-run true
```

Voir [le workflow de mise à jour](./docs/UPDATE_WORKFLOW.md) pour l'état persistant et les rapports.

Générer des candidats de mapping sans les valider automatiquement :

```bash
npm run hsfr -- uhc-index \
  --source chemin/vers/UHC/asset-pack/archive/data/mspa.json \
  --out .cache/uhc/reference.json

npm run hsfr -- mapping-propose \
  --source .cache/imports/homestuck-fr.json \
  --mapping data/mapping/pages.json \
  --reference .cache/uhc/reference.json \
  --out .cache/mapping/proposals.json
```

L'index UHC ne conserve aucun titre ni contenu en clair et reste hors Git.

Voir [la documentation du mapping](./docs/MAPPING.md).

## Licence

Aucune licence de code n'a encore été choisie : `package.json` porte donc la valeur `UNLICENSED`. Aucun code provenant d'UHC ou d'un autre mod n'est copié dans ce dépôt. Les options sont présentées dans [la décision de licence](./docs/LICENSING_DECISION.md).
