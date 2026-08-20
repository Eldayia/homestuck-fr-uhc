# État des validations

Dernière mise à jour : 20 août 2026.

## Automatique

- pipeline synthétique de 10 pages : réussi ;
- sélection déterministe d'un échantillon artificiel de 20 pages : réussie ;
- runtime synthétique de 8 130 pages : réussi ;
- fallback anglais et trois préfixes de logs : réussis sur fixtures ;
- build reproductible, Unicode, CRLF, cache corrompu et absence réseau : réussis ;
- CI définie pour Windows, Linux et macOS.

## Données locales observées sans publication

- snapshot MSPFA 45546 : 5 671 pages ;
- index UHC local : disponible ;
- mappings réels vérifiés dans Git : 0 ;
- propositions techniques : 5 361 candidats, 310 non résolues ;
- rapport local de 20 pages : générable sans texte.

## Validation réelle

| UHC | Plateforme | Installation | Résultat |
|---|---|---|---|
| 2.8.1 | Windows | neuve, mod artificiel | réussi le 20 août 2026 |
| 2.8.1 | Linux | — | non annoncée |
| 2.8.1 | macOS | — | non annoncée |

Le mod artificiel a été détecté, activé, chargé après redémarrage complet, affiché sur la page Homestuck 1, puis désactivé et supprimé. Le titre et le corps artificiels étaient visibles tandis que le média et la navigation UHC restaient intacts. Voir [`VALIDATION_WINDOWS_UHC_2.8.1.md`](VALIDATION_WINDOWS_UHC_2.8.1.md).

La compatibilité annoncée est volontairement limitée à Windows et UHC 2.8.1. Les tests Linux/macOS de la CI certifient les outils Node.js, pas l'intégration dans l'application UHC.
