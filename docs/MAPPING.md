# Mapping MSPFA ↔ Homestuck ↔ UHC

## Identifiants

Le projet distingue obligatoirement :

- `mspfaPageNumber` : position de la page dans l'aventure MSPFA ;
- `homestuckOrdinal` : ordinal Homestuck compris entre 1 et 8130 ;
- `uhcMspaId` : identifiant interne UHC à six chiffres, calculé par `ordinal + 1900`.

Une égalité entre les deux premiers numéros ne doit jamais être supposée.

## Fichier persistant

Les correspondances vérifiées sont conservées dans [`data/mapping/pages.json`](../data/mapping/pages.json). Le format version 1 est décrit par [`schemas/page-mapping.schema.json`](../schemas/page-mapping.schema.json).

Chaque entrée contient statut, confiance, preuves et, lorsque disponibles, hash source et date de vérification. Le lecteur accepte encore l'ancien format tableau comme migration depuis la version initiale non numérotée ; toute nouvelle écriture doit utiliser le document version 1.

## Générer des propositions

Construire d'abord, depuis le `mspa.json` déjà présent chez l'utilisateur, un index local sans texte :

```bash
npm run hsfr -- uhc-index \
  --source chemin/vers/UHC/asset-pack/archive/data/mspa.json \
  --out .cache/uhc/reference.json
```

L'index contient uniquement les identifiants, hashes de titres, nombres de médias et indicateurs structurels. Il ne contient ni titre en clair, ni contenu de page, ni asset. Le fichier source et l'index restent sous `.cache/`, hors Git.

```bash
npm run hsfr -- mapping-propose \
  --source .cache/imports/homestuck-fr.json \
  --mapping data/mapping/pages.json \
  --reference .cache/uhc/reference.json \
  --out .cache/mapping/proposals.json
```

Le fichier de propositions ne contient pas le texte traduit. Pour chaque page, il indique :

- `mapped` : une correspondance déjà vérifiée existe ;
- `candidate` : un seul ordinal est proposé ;
- `conflict` : plusieurs ordinaux restent possibles ;
- `stale` : le hash d'une correspondance vérifiée ne correspond plus à la page source ;
- `unresolved` : aucun signal exploitable.

Aucun de ces calculs ne crée automatiquement une entrée `verified`.

## Signaux actuels

### Identifiants d'assets

Le moteur reconnaît uniquement les nombres à cinq chiffres placés dans des chemins connus, notamment `storyfiles/hs2/` et `/panels/`. Un nombre présent dans le texte ordinaire est ignoré. Un ID hors de la plage 1–8130 est ignoré.

Même une preuve d'asset classée `exact` reste une proposition tant qu'une personne ne l'a pas revue.

### Navigation

Si une page vérifiée pointe directement vers une page source, l'ordinal suivant est proposé. Le raisonnement inverse est appliqué lorsqu'une page pointe vers une ancre vérifiée.

### Séquence locale

Le moteur projette la distance depuis l'ancre vérifiée précédente et suivante. Lorsque les deux projections concordent, leurs preuves se combinent. Une projection seule reste ambiguë.

Cette continuité n'est jamais imposée : une insertion ou page bonus peut produire un second candidat et donc un conflit.

### Référence UHC locale

Pour chaque candidat déjà découvert, le moteur peut comparer sans texte redistribué :

- la présence du même identifiant dans les chemins de médias ;
- le hash normalisé du titre lorsque le titre est inchangé entre les deux sources ;
- la structure d'un log et le nombre de médias.

Ces signaux renforcent une proposition mais ne la passent jamais automatiquement à `verified`. L'index est lié par `sourceHash` au `story` UHC local dont il provient.

### Obsolescence

Lorsqu'un mapping vérifié possède `sourceHash`, le moteur le compare au hash brut de la page courante. Une différence produit `stale`, exige une nouvelle revue humaine, empêche ce mapping de servir d'ancre aux projections voisines et bloque aussi `validate` et `build`. Les anciens mappings sans `sourceHash` restent lisibles, mais doivent progressivement être revérifiés.

## Revue humaine

Afficher l'état courant :

```bash
npm run hsfr -- mapping-status --mapping data/mapping/pages.json
```

Pour valider une proposition :

1. examiner toutes ses preuves et les pages voisines localement ;
2. confirmer l'ordinal Homestuck dans une source UHC locale autorisée ;
3. ajouter ou modifier l'entrée dans `data/mapping/pages.json` ;
4. placer `status` à `verified` ;
5. conserver une preuve `manual`, le hash source et `lastVerified` ;
6. relancer `mapping-status`, `validate` et les tests.

Un conflit ne doit jamais être résolu au plus proche sans vérification. Une correction de mapping est distincte d'une correction de traduction.

## Limites actuelles

- Un titre traduit ne peut généralement pas être rapproché par égalité de hash ; les médias et la structure restent alors les signaux locaux utiles.
- Aucun échantillon réel n'est versionné dans les tests.
- Les séquences spéciales et retours complexes doivent être examinés manuellement.
