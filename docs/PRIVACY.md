# Confidentialité des données locales

Les snapshots, caches, exports, rapports de revue locaux et mods générés peuvent contenir du texte protégé, des métadonnées publiques ou des chemins propres à la machine. Ils restent sous le contrôle de l'utilisateur.

Le projet ne téléverse automatiquement aucun de ces fichiers. Seule la commande `fetch`, déclenchée explicitement, contacte MSPFA. Les autres opérations fonctionnent sur disque ; le mode `--offline true` interdit le réseau.

## Emplacements recommandés

- `.cache/imports/` : snapshots ;
- `.cache/mspfa/` : réponses brutes ;
- `.cache/uhc/` : index structurels ;
- `.cache/mapping/` : revues ;
- `.cache/overrides/` : overrides privés ;
- `generated/` : mods locaux.

Ces emplacements sont ignorés par Git. Avant une issue ou une pull request, utiliser `npm run check:repository` et vérifier manuellement les fichiers joints. Ne jamais joindre un snapshot réel, un cache brut, `translation.json`, une capture de texte, un cookie ou un chemin utilisateur.

Pour supprimer les données locales, fermer les outils qui les utilisent puis retirer manuellement les dossiers concernés. Aucun effacement automatique n'est effectué par le projet.
