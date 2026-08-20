# Architecture initiale

Ce document décrit le vertical slice initial. Il ne remplace pas les décisions détaillées de [`RESEARCH.md`](./RESEARCH.md).

## Invariants

- Le cœur ne dépend ni du JSON compact de MSPFA ni des détails d'une version UHC.
- Une page possède trois identifiants distincts : numéro de source, ordinal Homestuck et ID MSPA interne UHC.
- Seul un mapping `verified` et non ambigu peut produire une entrée de mod.
- Le contenu externe est traité comme non fiable et n'exécute jamais de JavaScript.
- Un override est lié au hash normalisé de sa source ; un changement amont provoque un conflit bloquant.
- Le mod généré ne remplace que `title` et `content`. Une page absente du JSON français reste anglaise.
- La création d'une archive contenant la traduction reste bloquée sans décision humaine référencée.

## Dépendances entre couches

```text
adapters/mspfa ──► snapshot v1 ──► adapters/local-json
                                      │
                                      ▼
domain → parser → normalizer → mapper → overrides → validator → generator
                                                           ▲
                                                           │
                                                          CLI
```

Les dépendances pointent vers le domaine et vers l'étape suivante du pipeline. L'adaptateur MSPFA futur devra produire le même `TranslationSourceSnapshot` que l'adaptateur JSON local.

## Sortie UHC

Le générateur produit :

```text
generated/<nom>/
├── mod.js
└── translation.json
```

`translation.json` est indexé par `uhcMspaId`. `mod.js` charge ce fichier avec l'API du mod UHC et applique uniquement les propriétés explicitement présentes.

## Portée actuelle

Le parser accepte un sous-ensemble volontairement restreint du BBCode : emphase, soulignement, barré, couleur hexadécimale, spoiler, saut de ligne et URL HTTP(S). Le HTML source est échappé. Les balises actives, protocoles de script et BBCode inconnu sont bloqués.

Les fixtures du pipeline couvrent dix formes artificielles. Une fixture supplémentaire reproduit la structure compacte MSPFA sans reprendre de contenu réel. L'adaptateur MSPFA local convertit cette structure vers un snapshot versionné, élimine le JavaScript et le CSS personnalisés, puis écrit uniquement dans un emplacement choisi par l'utilisateur — `.cache/` par défaut.

L'accès réseau, la normalisation exhaustive du BBCode réel et les mises à jour différentielles restent hors de la portée actuelle.
