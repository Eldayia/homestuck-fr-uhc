# Validation Windows — UHC 2.8.1

Date : 20 août 2026

Outil : Homestuck FR UHC `0.1.0`

Application : The Unofficial Homestuck Collection `2.8.1`

Plateforme : Windows

Asset Pack : version `v2`, validateur confirmé comme réussi par le propriétaire du dépôt

## Périmètre

Cette validation porte uniquement sur le workflow technique MODE B. Elle utilise la source locale entièrement artificielle de `tests/fixtures/` ; aucun texte du projet de traduction, aucun Asset Pack et aucun asset Homestuck n'a été publié ou ajouté à Git.

Le mod de test contenait dix patches artificiels couvrant notamment narration, commande, Pesterlog, Dialoglog, Spritelog, chaîne vide/absente, balisage autorisé, quirk, page avec image et page interactive. Les contrôles automatiques couvrent en complément un échantillon déterministe de vingt cas et un runtime synthétique de 8 130 pages.

Une seconde passe réelle a validé la version 2 du mod avec le build local de 5 353 pages et les hooks Vue d’interface française. Cette passe n’a publié ni copié le corpus hors du poste local.

La commande simplifiée `hsfr install --asset-pack <dossier> --adventure 45546 --offline true` a ensuite exécuté les sept étapes sur l’Asset Pack réel : 5 353 pages sur 5 671 ont été installées et vérifiées, tandis que 318 pages sans mapping exact sûr ont été laissées en anglais.

## Résultats observés dans UHC

- le dossier de mod est détecté dans **Settings → Mod Settings** ;
- l'activation par glisser-déposer fonctionne ;
- un redémarrage complet de l'application charge le hook `edit` ;
- la page Homestuck 1 affiche le titre et le corps artificiels générés ;
- le média, la navigation et la structure UHC d'origine restent présents ;
- une page sans patch n'est pas remplacée et reste gérée par UHC ;
- la désactivation par glisser-déposer fonctionne ;

Pour l’interface française :

- la navigation principale affiche COLLECTION HOMESTUCK, AIDE, CARTE, JOURNAL, RECHERCHE, ACTUALITÉS, MUSIQUE, PLUS, RÉGLAGES et CRÉDITS ;
- le titre de fenêtre et le titre d’onglet deviennent Réglages sur /settings ;
- les infobulles et boutons accessibles du navigateur, dont Marque-pages, sont traduits ;
- les réglages dynamiques conservent leur comportement et affichent leurs libellés et descriptions en français ;
- le mode nouveau lecteur, les thèmes, les fonctions expérimentales, les mods et les réglages système exposés au rendu sont traduits ;
- les futurs champs inconnus restent inchangés au lieu d’être supprimés ;
- un redémarrage complet recharge correctement les hooks après remplacement du mod.

Aucun défaut bloquant du générateur ou du `mod.js` n'a été observé.

Le rechargement logiciel seul n'a pas chargé le nouveau module lors de cette première installation. Un redémarrage complet l'a chargé correctement. Le README demande donc explicitement de redémarrer UHC après une première installation ou une mise à jour du mod.

## Nettoyage

Le mod artificiel a été désactivé, UHC a été fermé, puis le seul dossier temporaire `homestuck-fr-validation-0.1.0` a été supprimé du dossier `mods` de l'Asset Pack. La source artificielle et sa sortie reproductible restent disponibles localement dans le dépôt pour refaire le test.

## Conclusion

La compatibilité annoncée pour la première release est limitée à **Windows avec UHC 2.8.1**. Linux, macOS et les versions UHC antérieures ne sont pas certifiés. La validation ne constitue pas une autorisation de redistribuer la traduction : la release reste strictement MODE B, outils uniquement.
