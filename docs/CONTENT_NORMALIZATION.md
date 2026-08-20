# Normalisation du contenu

Ce document décrit les transformations actuellement démontrées par des fixtures artificielles. Il ne constitue pas encore un inventaire du BBCode réellement présent dans toute la traduction MSPFA.

## Principes

- Le texte externe est toujours considéré comme non fiable.
- La casse, la ponctuation, les symboles et les espaces intentionnels sont préservés.
- Les fins de ligne Windows et Unix produisent le même HTML et le même hash normalisé.
- Un champ absent reste absent ; une chaîne vide reste une modification volontaire vers une chaîne vide.
- Une forme inconnue ou ambiguë est refusée au lieu d'être réinterprétée silencieusement.

## BBCode accepté

La liste blanche actuelle comprend :

- `[b]`, `[i]`, `[u]` et `[s]` ;
- `[color=#RGB]` et `[color=#RRGGBB]` ;
- `[spoiler]` sans paramètre ;
- `[br]`, `[br/]` et les sauts de ligne ;
- `[url=https://…]` et `[url=http://…]`.

Le HTML fourni par la source est échappé. Les scripts, styles actifs, iframes, objets, contenus embarqués, gestionnaires `on…`, protocoles de script et BBCode inconnu sont refusés.

## Logs MSPFA vers UHC

MSPFA peut représenter un log par un wrapper tel que :

```text
[spoiler=PESTERLOG]contenu[/spoiler]
```

Le normaliseur retire uniquement les wrappers explicites `PESTERLOG`, `DIALOGLOG` et `SPRITELOG`, vérifie leur cohérence avec `logLabel`, convertit leur contenu par la liste blanche puis ajoute le préfixe attendu par UHC :

```text
|PESTERLOG|contenu converti
```

Plusieurs blocs consécutifs portant le même label sont conservés dans leur ordre et séparés par un saut de ligne. Un bloc incomplet, un mélange de labels ou du texte non blanc placé hors des blocs provoque une erreur explicite.

## Champs absents et chaînes vides

Les deux cas ont des effets différents :

- propriété absente : le mod ne modifie pas le champ UHC et laisse le fallback anglais ;
- propriété présente avec `""` : le mod remplace volontairement ce champ par une chaîne vide.

Cette distinction est conservée dans les hashes et dans `translation.json`.

## Pages spéciales

L'import MSPFA classe séparément :

- les images et chemins d'images connus ;
- les contenus Flash ou `.swf` ;
- les iframes et BBCode interactifs connus.

Cette classification n'autorise pas leur conversion automatique. Le contenu actif reste refusé par le parser, et les médias devront suivre la filière séparée des pages spéciales et des assets.

## Limite avant contenu réel

La liste blanche ne sera étendue qu'après un inventaire local du corpus réel ne publiant ni extraits, ni titres, ni assets. Toute nouvelle forme devra recevoir une fixture artificielle minimale, un comportement déterministe et un test de sécurité avant d'être acceptée.
