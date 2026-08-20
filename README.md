# Homestuck FR for The Unofficial Homestuck Collection

Projet communautaire non officiel destiné à produire localement un mod français pour The Unofficial Homestuck Collection (UHC).

Ce projet n'est affilié ni à Homestuck, ni à MSPFA, ni à The Unofficial Homestuck Collection.

## État

Le dépôt est au stade du premier vertical slice. Il contient uniquement des outils et des fixtures artificielles. Il ne contient aucune traduction française ni aucun asset Homestuck.

La redistribution du contenu traduit n'étant pas autorisée à ce jour, la politique par défaut est :

```text
CONTENT_DISTRIBUTION_ALLOWED=false
```

Consulter [la recherche initiale](./docs/RESEARCH.md) pour les décisions techniques et juridiques.

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

## Licence

Aucune licence de code n'a encore été choisie : `package.json` porte donc la valeur `UNLICENSED`. Aucun code provenant d'UHC ou d'un autre mod n'est copié dans ce dépôt.
