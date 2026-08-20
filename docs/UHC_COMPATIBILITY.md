# Intégration et compatibilité UHC

## Hook retenu

Le générateur utilise actuellement `computed(api)` pour lire `translation.json` une seule fois, puis le hook `edit(archive)` pour appliquer les champs traduits au chargement.

Une comparaison fonctionnelle artificielle couvre 8 130 pages avec deux stratégies :

- `edit(archive)` parcourt une fois les patches disponibles ;
- une simulation `editPage(page)` applique le même patch lors de l'accès à chaque page.

Les résultats sont identiques sur ce corpus synthétique. `edit` reste retenu parce qu'il utilise le contrat le plus simple, charge le JSON une seule fois et ne dépend pas du hook paresseux plus récent. Ce choix a ensuite été confirmé dans UHC 2.8.1 sous Windows.

## Fallback anglais

Le générateur ne crée un patch que pour une page mappée et validée. Une page sans patch n'est jamais touchée : UHC conserve donc son titre, son contenu, ses médias et sa navigation en anglais. Si un ID patché est absent de l'archive locale, le mod émet un avertissement puis poursuit sans créer ni remplacer la page.

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

## Interface française

À partir de `modVersion: 2`, le mod utilise des `vueHooks` ciblés pour traduire les éléments d’interface exposés de façon exploitable par UHC 2.8.1 :

- la navigation principale (`AIDE`, `CARTE`, `JOURNAL`, `RECHERCHE`, `MUSIQUE`, `RÉGLAGES`, etc.) ;
- les titres d’onglets des pages système, après leur calcul normal par UHC ;
- les infobulles des boutons d’onglets, de fenêtre, de marque-pages et de recherche ;
- le bouton d’ouverture et de fermeture des Pesterlogs, Dialoglogs, Spritelogs et Authorlogs ;
- les libellés et descriptions des listes dynamiques de Réglages, identifiés par leur clé interne ;
- les choix de thème et de police qui possèdent un équivalent français ;
- les principaux titres et boutons statiques de la page Réglages.

Les hooks de données renvoient de nouveaux objets et préservent toutes les propriétés inconnues. Une future option UHC non reconnue reste donc affichée avec son texte anglais au lieu d’être supprimée. La traduction DOM est limitée à des textes ou attributs anglais exacts et reste idempotente.

UHC considère les `vueHooks` comme une API avancée susceptible d’évoluer. Ils sont donc strictement ciblés sur les noms de composants et le contrat de la version 2.8.1. Un redémarrage complet est requis après installation ou remplacement du mod.

## Choix de compatibilité prudents

- Les `vueHooks` ne remplacent ni le routeur, ni les composants, ni leurs modèles ; ils étendent seulement les données, résultats calculés et libellés rendus connus.
- Les menus natifs Electron, dialogues système et textes qui ne sont pas exposés au processus de rendu restent en anglais.
- Une version UHC autre que 2.8.1 doit être requalifiée avant d’être annoncée compatible avec l’interface française.
- Aucun réglage de mod n'est ajouté tant qu'un besoin stable n'est pas démontré.
- `modVersion` est un entier propre au mod et ne dépend pas de la version SemVer de l'outil.
- `CREDITS.txt` accompagne le mod et les métadonnées visibles renvoient vers ce fichier.
- `minAppVersion` vaut `2.8.1`, seule version réelle certifiée pour cette release.

## `compatibility.json`

Chaque build écrit un fichier versionné conforme à [`schemas/compatibility.schema.json`](../schemas/compatibility.schema.json). Dans l'état actuel :

- `targetAppVersion` vaut `2.8.1` ;
- `testedAppVersions` contient `2.8.1` ;
- `minimumAppVersion` vaut `2.8.1` ;
- `manualValidationRequired` vaut `false` pour ce couple Windows/UHC.
- `usesVueHooks` vaut `true` depuis l’ajout de la traduction d’interface.

Ces valeurs n'annoncent aucune compatibilité avec une version UHC antérieure ni avec Linux ou macOS.

## Validation encore requise

La validation réelle Windows est consignée dans [`VALIDATION_WINDOWS_UHC_2.8.1.md`](VALIDATION_WINDOWS_UHC_2.8.1.md). Les trois types de logs, les pages spéciales et le fallback sont couverts par le runtime synthétique ; leur revue visuelle exhaustive dans UHC reste un axe de maintenance, pas une promesse de la release MODE B.
