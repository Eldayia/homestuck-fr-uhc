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
| 2.8.1 | Windows | neuve | non exécutée |
| 2.8.1 | Linux | neuve | non exécutée |
| 2.8.1 | macOS | neuve | non exécutée |

Une tentative locale Windows a confirmé que l'application UHC et son validateur démarrent. Le contrôle de l'Asset Pack a toutefois signalé une racine incorrecte ou des fichiers attendus absents ; aucun mod n'a donc été chargé et aucun résultat `passed` n'est enregistré.

Aucune version minimale ou plateforme compatible n'est annoncée. La phase 13 reste bloquée jusqu'à la validation complète de l'Asset Pack, la revue humaine de mappings et un enregistrement `passed` dans l'application réelle.
