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

```bash
npm run hsfr -- mapping-propose \
  --source .cache/imports/homestuck-fr.json \
  --mapping data/mapping/pages.json \
  --out .cache/mapping/proposals.json
```

Le fichier de propositions ne contient pas le texte traduit. Pour chaque page, il indique :

- `mapped` : une correspondance déjà vérifiée existe ;
- `candidate` : un seul ordinal est proposé ;
- `conflict` : plusieurs ordinaux restent possibles ;
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

- La comparaison avec un index local de titres UHC n'est pas encore implémentée.
- Aucun échantillon réel n'est versionné dans les tests.
- Les séquences spéciales et retours complexes doivent être examinés manuellement.
- Le hash d'une entrée existante n'est pas encore utilisé pour invalider automatiquement une vérification devenue ancienne.
