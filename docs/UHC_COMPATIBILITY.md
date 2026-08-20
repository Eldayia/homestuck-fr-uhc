# Intégration et compatibilité UHC

## Hook retenu

Le générateur utilise actuellement `computed(api)` pour lire `translation.json` une seule fois, puis le hook `edit(archive)` pour appliquer les champs traduits au chargement.

Une comparaison fonctionnelle artificielle couvre 8 130 pages avec deux stratégies :

- `edit(archive)` parcourt une fois les patches disponibles ;
- une simulation `editPage(page)` applique le même patch lors de l'accès à chaque page.

Les résultats sont identiques sur ce corpus synthétique. `edit` reste retenu parce qu'il utilise le contrat le plus simple, charge le JSON une seule fois et ne dépend pas du hook paresseux plus récent. Ce choix devra être confirmé dans l'application UHC réelle avant de déclarer une version minimale.

## Garanties automatiques

Le test du `mod.js` réellement généré vérifie que :

- `api.readJson("./translation.json")` est utilisé ;
- seules les propriétés `title` et `content` explicitement présentes sont modifiées ;
- l'objet page n'est jamais remplacé ;
- les médias, la navigation et les métadonnées inconnues sont conservés ;
- une page sans patch reste entièrement anglaise ;
- les préfixes Pesterlog, Dialoglog et Spritelog atteignent UHC sans être supprimés ;
- une page UHC inexistante produit un avertissement sans interrompre les autres patches ;
- un corpus artificiel de 8 130 pages reste fonctionnel ;
- avec deux mods modifiant le même champ, le dernier appliqué gagne.

Le dernier point signifie que l'ordre des mods doit être documenté : Homestuck FR ne peut pas fusionner automatiquement deux traductions concurrentes du même champ.

## Pages spéciales

Les pages Flash et HTML5 peuvent recevoir leur texte extérieur, mais leurs champs `media` et leurs autres propriétés restent inchangés. Le générateur ne modifie, ne copie et ne reconstruit aucun binaire.

## Choix de compatibilité prudents

- Aucun `vueHook` n'est utilisé : traduire les libellés d'interface des logs augmenterait la fragilité pour un bénéfice non essentiel au texte lisible.
- Aucun réglage de mod n'est ajouté tant qu'un besoin stable n'est pas démontré.
- `modVersion` est un entier propre au mod et ne dépend pas de la version SemVer de l'outil.
- `CREDITS.txt` accompagne le mod et les métadonnées visibles renvoient vers ce fichier.
- `minAppVersion` n'est pas déclaré tant que plusieurs versions réelles n'ont pas été testées.

## `compatibility.json`

Chaque build écrit un fichier versionné conforme à [`schemas/compatibility.schema.json`](../schemas/compatibility.schema.json). Dans l'état actuel :

- `targetAppVersion` vaut `2.8.1` ;
- `testedAppVersions` reste vide ;
- `minimumAppVersion` reste `null` ;
- `manualValidationRequired` reste `true`.

Ces valeurs empêchent de présenter les tests synthétiques comme une certification de compatibilité avec l'application réelle.

## Validation encore requise

Il reste à installer le mod local dans UHC 2.8.1, vérifier activation/désactivation, affichage et repli des trois types de logs, pages Flash/HTML5, puis répéter les essais sur les versions supplémentaires que le projet souhaite annoncer.
