# Contribuer

Merci de contribuer aux outils Homestuck FR UHC. Le dépôt fonctionne en MODE B : les contributions portent sur le code, les mappings techniques et la documentation, jamais sur une copie de la traduction ou des assets.

## Avant de commencer

1. installer Node.js 22 ;
2. forker puis cloner le dépôt ;
3. exécuter `npm ci` puis `npm run verify` ;
4. lire [`docs/PRIVACY.md`](docs/PRIVACY.md) avant d'utiliser un snapshot réel.

Les corrections linguistiques doivent être proposées directement au projet de traduction sur MSPFA. Elles ne doivent pas être placées dans une issue, un commit, une capture ou une fixture de ce dépôt.

## Contributions acceptées

- correction ou test du pipeline ;
- mapping MSPFA ↔ UHC vérifié sans texte ;
- compatibilité avec une version UHC réellement testée ;
- documentation et accessibilité ;
- recherche de droits accompagnée d'une source vérifiable.

Sont refusés : texte traduit, captures contenant ce texte, exports MSPFA, caches, assets, archives UHC et patches permettant de les reconstruire.

## Workflow

Créez une branche courte, ajoutez des tests proportionnés au changement, puis exécutez :

```bash
npm run verify
npm run test:coverage
npm audit --audit-level=high
```

La pull request doit expliquer le comportement modifié, les tests effectués et toute incidence juridique ou de compatibilité. Les modèles d'issues indiquent les informations techniques sûres à partager.

## Mapping et overrides

- Pour corriger un mapping : suivre [`docs/MAPPING.md`](docs/MAPPING.md#corriger-un-mapping).
- Pour un override strictement technique : suivre [`docs/OVERRIDES.md`](docs/OVERRIDES.md).
- Ne jamais utiliser un override pour réécrire ou « améliorer » la traduction.

Toute validation réelle reste humaine. Un signal automatique, même exact, ne passe jamais seul un mapping à `verified`.

## Comportement attendu

En participant, vous acceptez le [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Ne publiez aucune donnée personnelle, clé, cookie ou chemin local. Pour un signalement de sécurité sensible, n'ouvrez pas d'issue publique ; utilisez le canal privé indiqué par GitHub Security Advisories si celui-ci est activé.
