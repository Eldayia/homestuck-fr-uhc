# Checklist de release

Cette checklist doit être exécutée pour toute release. Les sections MODE B et MODE A sont mutuellement exclusives.

Commandes de préparation MODE B :

```bash
npm ci
npm run release:build
npm run release:test
npm run release:check
```

`release:build` construit deux archives et exige des hashes identiques. `release:test` installe l'archive dans un dossier neuf. `release:check` reste bloqué tant que la licence, la validation UHC manuelle et l'approbation de publication ne sont pas enregistrées dans `data/metadata/release-readiness.json`.

## Vérifications communes

- [ ] La version et les notes de release sont prêtes.
- [ ] `npm ci` fonctionne depuis un checkout propre.
- [ ] `npm run verify` réussit.
- [ ] Le build est reproductible avec les mêmes entrées.
- [ ] `git status` est propre.
- [ ] `README.md`, `NOTICE`, `CREDITS.md` et `THIRD_PARTY.md` sont à jour.
- [ ] La licence du code du dépôt est choisie et présente.
- [ ] Les licences des dépendances ont été inventoriées.
- [ ] Les crédits UHC et le lien vers l'amont sont présents.
- [ ] Aucun Asset Pack UHC n'est inclus.
- [ ] Aucun asset Homestuck original n'est inclus.
- [ ] Aucun secret, cookie, identifiant de session ou donnée personnelle n'est inclus.
- [ ] Les versions UHC annoncées ont été réellement testées.

## MODE B — outils uniquement

- [ ] `data/metadata/distribution-policy.json` est en mode `tools-only`.
- [ ] `contentDistributionAllowed` vaut `false`.
- [ ] Aucun snapshot MSPFA réel n'est suivi par Git.
- [ ] Aucun texte, titre, log ou commande traduit n'est inclus.
- [ ] Aucun asset traduit n'est inclus.
- [ ] Aucun patch ou diff réversible du contenu n'est inclus.
- [ ] Les fixtures sont manifestement artificielles.
- [ ] L'archive publiée contient uniquement les outils autorisés.
- [ ] La procédure de génération locale est documentée.

## MODE A — contenu autorisé

- [ ] La preuve d'autorisation est archivée et référencée.
- [ ] La personne ou l'entité donnant l'autorisation est habilitée à le faire.
- [ ] L'autorisation couvre explicitement `translation-text`.
- [ ] Chaque asset inclus est couvert par `translated-assets` ou une preuve séparée.
- [ ] Les contributions tierces non couvertes sont exclues.
- [ ] Les adaptations techniques sont autorisées.
- [ ] GitHub et GitHub Releases sont dans le périmètre autorisé.
- [ ] Les futures mises à jour sont couvertes ou revues séparément.
- [ ] Les crédits exigés sont visibles dans le mod et la release.
- [ ] `decision.reference` et `decision.decidedAt` sont renseignés.
- [ ] Une revue humaine compare le package final au périmètre de la preuve.

## Validation finale

- [ ] Le package a été inspecté fichier par fichier.
- [ ] Les sommes de contrôle ont été générées.
- [ ] L'installation depuis l'archive finale a été testée.
- [ ] La publication a été explicitement approuvée par le responsable du dépôt.
