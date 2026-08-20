# Workflow CLI

L'aide générale est disponible avec `hsfr help` et l'aide d'une commande avec `hsfr help <commande>` ou `hsfr <commande> --help`.

## Parcours local MODE B

```bash
# 1. Importer ou récupérer prudemment la source
hsfr import --source export-mspfa.json --out .cache/imports/fr.json

# 2. Comparer avec le dernier état sans écrire
hsfr diff --source .cache/imports/fr.json

# 3. Enregistrer l'état et le rapport
hsfr update --source .cache/imports/fr.json

# 4. Afficher couverture, mappings et pages spéciales
hsfr status --source .cache/imports/fr.json --mapping data/mapping/pages.json

# 5. Préparer puis revoir les mappings
hsfr mapping-propose --source .cache/imports/fr.json
hsfr mapping-review --source .cache/imports/fr.json --sample-size 20

# 6. Valider sans produire de mod
hsfr validate --source .cache/imports/fr.json --mapping data/mapping/pages.json

# 7. Construire le mod local
hsfr build --source .cache/imports/fr.json --mapping data/mapping/pages.json
```

`status`, `diff` et les rapports n'affichent jamais les titres ou corps de pages.

## Dry-run

Les commandes qui écrivent acceptent `--dry-run true`. Elles valident et calculent leur résultat sans créer leur sortie locale. Pour `fetch`, le réseau peut être contacté, mais le cache brut, ses métadonnées, l'état de fréquence et le snapshot de sortie ne sont pas écrits.

## Mode verbose

`--verbose true` affiche uniquement le nom de l'opération et des informations techniques non textuelles. Il n'affiche jamais le contenu des pages. Les erreurs mentionnent le champ ou le numéro technique nécessaire au diagnostic.

## Codes de sortie

| Code | Signification |
| ---: | --- |
| 0 | succès |
| 1 | erreur interne inattendue |
| 2 | entrée ou option invalide |
| 3 | contenu actif ou dangereux |
| 4 | mapping invalide, absent ou obsolète |
| 5 | override incompatible avec le hash source |
| 6 | distribution de contenu bloquée par la politique juridique |
| 7 | source ou réseau inaccessible |

Ces codes sont stables pour la version majeure actuelle de l'outil.

## Packaging

`hsfr package` reste placé derrière la politique de distribution. Avec la politique MODE B actuelle, la commande termine avec le code 6 avant de créer une archive contenant du contenu. Le packageur de contenu autorisé n'est volontairement pas considéré comme terminé tant qu'une décision juridique complète n'existe pas.
