# Protocole alpha et bêta MODE B

Ce protocole valide le fonctionnement sans échanger le corpus. Les testeurs obtiennent eux-mêmes la source et UHC, génèrent le mod localement, puis ne remontent que des identifiants, hashes, statuts et observations techniques.

## Préparation

1. utiliser un checkout propre et `npm ci` ;
2. exécuter `npm run verify` et `npm run test:coverage` ;
3. placer le snapshot sous `.cache/imports/` et l'installation UHC hors du dépôt ;
4. créer l'index UHC et un rapport `mapping-review` de 20 pages ;
5. vérifier manuellement les mappings avant de construire ;
6. créer `translation-lock.json`, puis utiliser `build --locked true`.

Le rapport de revue doit couvrir autant que possible narration, commandes, Pesterlog, Dialoglog, Spritelog, image, Flash, interaction, quirks, page non traduite et limites du corpus.

## Alpha locale

Pour chacune des 20 pages, consigner uniquement : numéro source, ID UHC, classification, hash, succès/échec et code court du défaut. Vérifier :

- activation et désactivation du mod ;
- titre et corps quand ils existent ;
- conservation de la casse, ponctuation et espaces intentionnels ;
- préfixes des trois types de logs ;
- médias et navigation inchangés ;
- page sans patch entièrement anglaise ;
- avertissement non bloquant pour un ID absent ;
- conflit d'override bloqué avant le build.

## Bêta privée

Répéter sur Windows, Linux et macOS lorsque des testeurs sont disponibles, avec :

- installation neuve de l'archive outils ;
- mise à jour depuis la version précédente ;
- UHC 2.8.1, puis toute autre version avant de l'annoncer ;
- génération locale depuis les mêmes entrées verrouillées ;
- comparaison des checksums de sortie ;
- ouverture d'issues via les modèles sans capture ni contenu.

## Enregistrement

Copier [`docs/VALIDATION_RECORD_TEMPLATE.md`](VALIDATION_RECORD_TEMPLATE.md), remplir les résultats sans texte et faire approuver le document par le responsable. Une plateforme ou version n'est annoncée compatible que si son résultat est `passed`.

L'état public courant est résumé dans [`docs/VALIDATION_STATUS.md`](VALIDATION_STATUS.md). Les tests synthétiques ne remplacent jamais cette validation réelle.
