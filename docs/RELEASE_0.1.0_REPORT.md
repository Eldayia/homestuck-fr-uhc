# Rapport de publication — v0.1.0

> Ce document décrit l’artefact historique publié le 20 août 2026. Le pipeline de release actuel produit désormais un ZIP directement extractible ; il ne modifie pas rétroactivement l’archive v0.1.0 déjà publiée.

Date : 20 août 2026

Release : [Homestuck FR UHC Tools v0.1.0](https://github.com/Eldayia/homestuck-fr-uhc/releases/tag/v0.1.0)

## Périmètre publié

La release contient uniquement les outils MODE B, leur documentation, les schémas, les configurations vides et les fixtures artificielles nécessaires. Elle ne contient ni traduction française réelle, ni snapshot MSPFA réel, ni mapping réel, ni Asset Pack, ni asset Homestuck/UHC.

Le code original est publié sous `GPL-3.0-or-later`. Cette licence ne s'étend pas à Homestuck, à la traduction française ou aux assets UHC.

## Contrôles exécutés

- checkout Git propre avant construction ;
- `npm ci` réussi avec le verrou publié ;
- audit du dépôt : 115 fichiers contrôlés, aucun corpus, cache, archive ou binaire interdit ;
- typage TypeScript et build réussis ;
- 43 tests automatiques réussis ;
- couverture : 93,52 % des lignes, 78,01 % des branches et 97,75 % des fonctions ;
- archive construite deux fois avec une empreinte identique ;
- installation neuve et commande CLI testées depuis l'archive ;
- garde-fous de licence, validation UHC et publication approuvés ;
- CI réussie sous Windows, Ubuntu et macOS pour les outils Node.js ;
- intégration réelle validée séparément sous Windows avec UHC 2.8.1.

La validation UHC détaillée se trouve dans [`VALIDATION_WINDOWS_UHC_2.8.1.md`](VALIDATION_WINDOWS_UHC_2.8.1.md).

## Archive publiée

```text
homestuck-fr-uhc-0.1.0.tgz
SHA-256 : 2693ae6097ea308c251f2624f44ca4941741f00779e118da99aa746071b36b08
Fichiers : 137
```

La release joint également `SHA256SUMS` et `release-manifest.json`. GitHub a confirmé la même empreinte SHA-256 pour l'archive téléversée.

## Résultat

La phase 14 est terminée : une personne peut télécharger les outils publics, préparer localement sa source autorisée, générer son mod et l'installer dans UHC en suivant le README, sans que le dépôt redistribue la traduction.
