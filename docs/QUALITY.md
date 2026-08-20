# Qualité, sécurité et CI

## Vérifications locales

```bash
npm run check:repository
npm run lint
npm test
npm run test:coverage
npm run build
```

`npm run verify` regroupe le contrôle du dépôt, le typage strict, les tests et le build. La couverture impose actuellement au minimum 85 % des lignes, 70 % des branches et 90 % des fonctions avec le moteur natif de Node.js.

## CI

- `test.yml` exécute `verify` sur Windows, Linux et macOS, la couverture et `npm audit` sur Linux.
- `build.yml` construit et publie comme artifact uniquement les outils, métadonnées et documents autorisés.
- `release.yml` construit toujours une candidate outils. Sur un tag, il exige en plus le registre d'approbation, puis publie exclusivement l'archive MODE B, son manifest et ses sommes de contrôle.

Aucun workflow périodique ne contacte MSPFA.

## Contrôle anti-corpus

Le script de dépôt examine tous les fichiers suivis ou prêts à être ajoutés. Il refuse notamment :

- les snapshots ou exports MSPFA textuels hors `tests/fixtures/` ;
- tout `translation.json` ;
- les archives et formats usuels d'images, audio, vidéo, Flash ou exécutables ;
- les fichiers issus de `.cache/`, `dist/`, `coverage/` et `generated/` ;
- les fichiers supérieurs à 1 Mo et les JSON invalides.

Les fixtures artificielles restent explicitement autorisées et sont couvertes par des tests de non-divulgation.
