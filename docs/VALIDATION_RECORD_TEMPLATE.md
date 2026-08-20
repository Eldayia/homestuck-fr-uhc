# Enregistrement de validation MODE B

```yaml
schemaVersion: 1
toolVersion: 0.1.0
uhcVersion: 2.8.1
platform: windows|linux|macos
installation: fresh|upgrade
testedAt: YYYY-MM-DD
tester: pseudonyme-ou-identifiant
sourceSnapshotHash: sha256:...
mappingHash: sha256:...
translationLockHash: sha256:...
sampleSize: 20
checks:
  activation: passed|failed
  narrationAndCommands: passed|failed
  pesterlog: passed|failed
  dialoglog: passed|failed
  spritelog: passed|failed
  quirks: passed|failed
  englishFallback: passed|failed
  specialPages: passed|failed
  freshInstall: passed|failed
result: passed|failed
approvedBy: identifiant
```

Ne jamais ajouter de titre, corps, extrait, capture, asset, chemin local ou donnée personnelle. Les hashes servent à relier la validation aux entrées privées sans les publier.
