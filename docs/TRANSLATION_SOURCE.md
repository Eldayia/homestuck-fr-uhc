# Source de traduction

## Source suivie

La source française étudiée est l'aventure MSPFA `45546` :

<https://mspfa.com/?s=45546&p=1>

Le contenu n'est pas versionné dans ce dépôt. L'utilisateur doit fournir un export local qu'il est autorisé à utiliser. L'accès réseau facultatif sera ajouté ultérieurement derrière le même contrat.

## Import local

Un export JSON brut MSPFA peut être converti en snapshot interne :

```bash
npm run hsfr -- import \
  --source chemin/vers/export-mspfa.json \
  --adventure 45546 \
  --out .cache/imports/homestuck-fr.json
```

Le dossier `.cache/` est ignoré par Git. Un autre emplacement contenant un snapshot réel doit également rester privé.

## Format MSPFA observé

L'adaptateur reconnaît notamment :

| Clé | Interprétation |
|---|---|
| `i` | identifiant de l'aventure |
| `n` | titre de l'aventure |
| `p` | tableau des pages |
| `p[].c` | commande ou titre de page |
| `p[].b` | corps BBCode/HTML |
| `p[].n` | pages suivantes |
| `p[].d` | horodatage en millisecondes |

La position dans `p` devient `mspfaPageNumber`, en commençant à 1. Cette position n'est jamais transformée directement en ordinal Homestuck.

## Données volontairement éliminées

L'adaptateur ne propage pas :

- le JavaScript personnalisé de l'aventure ;
- le CSS personnalisé ;
- les champs de présentation sans utilité pour le mapping ou le texte ;
- les identifiants d'éditeur ou autres métadonnées personnelles inutiles.

Ces données ne sont ni exécutées, ni écrites dans le snapshot interne.

## Snapshot interne version 1

Le format est décrit par [`schemas/translation-snapshot.schema.json`](../schemas/translation-snapshot.schema.json).

Le snapshot contient :

- `schemaVersion: 1` ;
- le fournisseur et l'identifiant d'aventure ;
- une révision SHA-256 du titre et du tableau de pages ;
- les métadonnées publiques minimales ;
- les pages avec titre, corps, navigation, date et classifications.

Le snapshot est une donnée intermédiaire locale. S'il contient la traduction, il reste soumis aux mêmes restrictions que la source et ne doit pas être publié.

## Limites actuelles

- L'adaptateur réseau n'est pas encore implémenté.
- Le snapshot est complet ; MSPFA ne fournit pas de flux différentiel documenté.
- La détection des logs est limitée aux marqueurs explicites Pesterlog, Dialoglog et Spritelog.
- Le parser de contenu réel sera étendu en phase 6 ; l'import ne garantit pas encore qu'une page puisse être générée pour UHC.
- Les pages spéciales sont classées mais ne sont pas encore converties.
