# Workflow CLI

L'aide générale est disponible avec `hsfr help` et l'aide d'une commande avec `hsfr help <commande>` ou `hsfr <commande> --help`.

## Parcours local MODE B

### Installation recommandée

```powershell
hsfr install --asset-pack "C:\chemin\vers\Asset_Pack" --adventure 45546
```

`install` vérifie l’Asset Pack, récupère l’aventure, construit l’index UHC, accepte seulement les mappings exacts sans conflit, valide le contenu, crée le verrou et le mod, puis installe et vérifie les quatre fichiers sous `mods/homestuck-fr`. Les pages sans mapping sûr restent en anglais.

Options utiles :

- `--dry-run true` exécute toutes les vérifications sans écrire le cache ni le mod ;
- `--offline true` réutilise le cache brut d’une récupération précédente ;
- `--overrides fichier.json` applique explicitement un fichier d’overrides ; sans cette option, aucun override n’est utilisé.

### Parcours avancé décomposé

```bash
# 1. Importer ou récupérer prudemment la source
hsfr import --source export-mspfa.json --out .cache/imports/fr.json

# 2. Comparer avec le dernier état sans écrire
hsfr diff --source .cache/imports/fr.json

# 3. Enregistrer l'état et le rapport
hsfr update --source .cache/imports/fr.json

# 4. Afficher couverture, mappings et pages spéciales
hsfr status --source .cache/imports/fr.json --mapping data/mapping/pages.json
hsfr special-report --source .cache/imports/fr.json --mapping data/mapping/pages.json

# 5. Préparer puis revoir les mappings
hsfr mapping-propose --source .cache/imports/fr.json
hsfr mapping-review --source .cache/imports/fr.json --sample-size 20

# 6. Valider sans produire de mod
hsfr validate --source .cache/imports/fr.json --mapping data/mapping/pages.json

# 7. Verrouiller puis construire le mod local
hsfr lock --source .cache/imports/fr.json --mapping data/mapping/pages.json
hsfr build --source .cache/imports/fr.json --mapping data/mapping/pages.json --locked true
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
