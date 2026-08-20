# Source de traduction

## Source suivie

La source française étudiée est l'aventure MSPFA `45546` :

<https://mspfa.com/?s=45546&p=1>

Le contenu n'est pas versionné dans ce dépôt. L'utilisateur peut fournir un export local qu'il est autorisé à utiliser ou activer explicitement l'accès réseau facultatif. Les deux méthodes produisent le même snapshot interne.

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

## Accès réseau facultatif

```bash
npm run hsfr -- fetch \
  --adventure 45546 \
  --cache .cache/mspfa \
  --out .cache/imports/homestuck-fr.json
```

La commande effectue un POST formulaire vers `https://mspfa.com/` avec `do=story` et l'identifiant `s`. Ce point d'entrée est utilisé par le site et l'outil MSPFA d'UHC, mais il n'est ni documenté ni versionné comme API publique stable.

Protections par défaut :

- User-Agent identifiant le projet ;
- timeout de 30 secondes ;
- deux nouvelles tentatives au maximum, uniquement pour erreur réseau, HTTP 429 ou HTTP 5xx ;
- délai exponentiel entre tentatives ;
- intervalle minimal persistant de 60 secondes entre deux requêtes ;
- réponse limitée à 32 Mio ;
- refus des redirections ;
- validation complète avant remplacement du cache utilisable.

Options avancées :

```text
--timeout-ms 30000
--retries 2
--minimum-interval-ms 60000
```

Il ne faut pas diminuer l'intervalle pour surveiller agressivement MSPFA. Une seule réponse contient déjà toutes les pages.

### Mode hors ligne

```bash
npm run hsfr -- fetch \
  --adventure 45546 \
  --cache .cache/mspfa \
  --offline true
```

Ce mode interdit tout appel réseau et échoue clairement si le cache est absent ou invalide.

### Contenu du cache

`<id>.raw.json` conserve la réponse brute pour permettre une nouvelle conversion et un audit local. Il peut donc contenir le texte, le CSS et le JavaScript de l'aventure. Ces champs ne sont jamais exécutés, mais le fichier reste non fiable et protégé : il ne doit être ni ouvert comme programme, ni committé, ni publié.

Le snapshot interne écrit dans `.cache/imports/` élimine le JavaScript et le CSS personnalisés. Il contient néanmoins le texte traduit et reste lui aussi privé sans autorisation de redistribution.

## Données éliminées du snapshot interne

L'adaptateur ne propage pas :

- le JavaScript personnalisé de l'aventure ;
- le CSS personnalisé ;
- les champs de présentation sans utilité pour le mapping ou le texte ;
- les identifiants d'éditeur ou autres métadonnées personnelles inutiles.

Ces données ne sont ni exécutées, ni écrites dans le snapshot interne. Elles peuvent seulement subsister dans le cache brut privé décrit ci-dessus.

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

- Le snapshot est complet ; MSPFA ne fournit pas de flux différentiel documenté.
- La détection des logs est limitée aux marqueurs explicites Pesterlog, Dialoglog et Spritelog.
- La liste blanche et les logs explicites sont couverts par des fixtures artificielles ; l'inventaire du corpus réel reste nécessaire avant d'affirmer une compatibilité complète.
- Les pages spéciales sont classées mais ne sont pas encore converties.
