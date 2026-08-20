# Homestuck FR UHC Tools 0.2.0

Cette version simplifie entièrement la création et l’installation du mod français pour UHC.

## Inclus

- nouvelle commande `hsfr install` : récupération MSPFA, validation, mapping, verrou, build et copie dans l’Asset Pack en une opération ;
- traduction de la navigation, des titres d’onglets, des boutons et des options dynamiques des réglages UHC ;
- installation atomique et vérifiée dans `Asset_Pack/mods/homestuck-fr` ;
- modes `--dry-run` et `--offline` pour contrôler ou répéter une installation ;
- archive ZIP directement extractible, sans `.tgz`, tar ou dossier `package/` intermédiaire ;
- lanceurs prêts à l’emploi `hsfr.cmd` sous Windows et `hsfr` sous Linux/macOS ;
- README français réorganisé autour d’un démarrage express ;
- validation réelle sous UHC 2.8.1 et couverture par 54 tests automatisés.

## Non inclus

Cette archive ne contient ni traduction française, ni snapshot, ni mapping réel validé, ni mod généré, ni asset Homestuck/UHC. L'utilisateur doit fournir localement les sources qu'il est autorisé à utiliser.

## Limites

- l'installation et l'exécution sont validées uniquement sous Windows avec UHC 2.8.1 ; Linux et macOS ne sont pas certifiés dans UHC ;
- les pages sans patch restent en anglais ;
- les médias intégrant du texte ne sont pas transformés ;
- le code des outils est publié sous GPL-3.0-or-later, sans placer la traduction ou les assets sous cette licence.
