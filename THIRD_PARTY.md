# Composants et contenus tiers

Ce registre distingue les logiciels, la traduction et les œuvres. Une licence logicielle ne s'applique pas automatiquement à un contenu culturel.

| Projet ou composant | Usage dans ce dépôt | Licence ou permission observée | Redistribution par ce dépôt |
|---|---|---|---|
| The Unofficial Homestuck Collection | Compatibilité avec l'API des mods et format des pages | GPL-3.0-or-later avec exigence de préservation des attributions annoncée par l'amont | Aucun code ou Asset Pack UHC inclus actuellement |
| Homestuck | Cible de correspondance des pages | Œuvre propriétaire ; aucune permission supposée | Aucun texte original ni asset inclus |
| Homestuck en Français | Source potentielle générée localement | Aucune licence ou autorisation de redistribution trouvée | Aucun texte ou asset inclus |
| MSPFA | Plateforme et endpoint source | Conditions de service ; aucune licence générale de republication trouvée | Aucun code MSPFA inclus |
| TypeScript | Compilation et vérification de types en développement | Apache-2.0 | Dépendance de développement uniquement |
| tsx | Exécution TypeScript en développement et tests | MIT | Dépendance de développement uniquement |
| `@types/node` | Types Node.js en développement | MIT | Dépendance de développement uniquement |
| esbuild et dépendances npm transitives | Dépendances transitives de l'outillage | Voir `package-lock.json` et les manifests npm | Non intégrés au mod généré |

## Références

- UHC : <https://github.com/GiovanH/unofficial-homestuck-collection>
- Traduction française : <https://mspfa.com/?s=45546&p=1>
- MSPFA : <https://mspfa.com/terms/>
- TypeScript : <https://github.com/microsoft/TypeScript>
- tsx : <https://github.com/privatenumber/tsx>
- DefinitelyTyped : <https://github.com/DefinitelyTyped/DefinitelyTyped>

Les versions npm exactes sont verrouillées dans `package-lock.json`. Un inventaire automatisé des licences devra être exécuté avant chaque release publique.
