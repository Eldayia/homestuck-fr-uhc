# Recherche juridique et politique de contenu

> Dernière vérification : 20 août 2026<br>
> Statut : MODE B — outils uniquement<br>
> `contentDistributionAllowed`: `false`

Ce document consigne les faits trouvés et les décisions prudentes du projet. Il ne constitue pas un avis juridique.

## Conclusion actuelle

Le dépôt peut développer et distribuer son code et ses outils une fois leur propre licence choisie. Il ne peut pas distribuer actuellement :

- le texte de la traduction française ;
- les commandes, logs ou autres extraits traduits ;
- les images traduites ;
- les assets Homestuck ou l'Asset Pack UHC ;
- un patch, cache ou diff permettant de reconstruire ces éléments.

Aucune licence ni autorisation publique explicite couvrant la redistribution de la traduction française n'a été trouvée. L'accès public au texte sur MSPFA est distinct du droit de le republier.

## Registres des composants

### Code original de ce dépôt

| Champ | Valeur |
|---|---|
| Source | Ce dépôt |
| Auteur juridique | À renseigner par le propriétaire du dépôt |
| Licence | GNU GPL version 3 ou ultérieure (`GPL-3.0-or-later`) |
| Code UHC copié | Aucun identifié à ce stade |
| Conséquence | Le code original peut être redistribué selon `LICENSE`; aucun droit n'est accordé sur la traduction ou les assets |

GitHub rappelle qu'un dépôt sans licence n'accorde pas normalement le droit de reproduire, distribuer ou créer des dérivés, au-delà des fonctions de consultation et de fork prévues par GitHub : <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository>.

### The Unofficial Homestuck Collection

| Champ | Valeur |
|---|---|
| Projet | The Unofficial Homestuck Collection |
| Source | <https://github.com/GiovanH/unofficial-homestuck-collection> |
| Révision étudiée | `91911836a53743e9cf075e5a91c96ebcaf22e039` / version 2.8.1 |
| Licence annoncée | GNU GPL version 3 ou ultérieure |
| Condition additionnelle annoncée | Préservation des attributions et crédits ; interdiction de déformer l'origine ou la paternité |
| Usage dans ce dépôt | Étude de compatibilité et utilisation de l'API publique des mods |
| Code copié | Aucun identifié à ce stade |

Le README UHC sépare son code de la majorité du contenu protégé de l'Asset Pack et crédite Bambosh, GiovanH et les contributeurs. Ce projet conserve cette séparation et ces crédits. Références :

- <https://github.com/GiovanH/unofficial-homestuck-collection#legal>
- <https://github.com/GiovanH/unofficial-homestuck-collection/blob/91911836a53743e9cf075e5a91c96ebcaf22e039/LICENSE>

### Homestuck et les assets

| Champ | Valeur |
|---|---|
| Œuvre | Homestuck et œuvres associées |
| Régime retenu | Contenu propriétaire ; aucune licence de redistribution supposée |
| Usage prévu | Référence d'interopérabilité avec une installation locale de l'utilisateur |
| Inclusion dans Git | Interdite |
| Inclusion dans les tests | Uniquement fixtures artificielles |

Le projet ne formule pas d'affirmation précise sur la titularité juridique actuelle sans source fiable. Il applique seulement la règle opérationnelle la plus prudente : ne pas redistribuer l'œuvre ou ses assets.

### Traduction française

| Champ | Valeur |
|---|---|
| Projet public | Homestuck en Français |
| Source | <https://mspfa.com/?s=45546&p=1> |
| Référence secondaire | <https://homestuck.net/official/translations/> |
| Plateforme | MSPFA |
| Identifiant d'aventure | `45546` |
| Pseudonymes principaux observés | `karmicPurple`, `biologicalAlien` |
| Licence publique trouvée | Aucune |
| Autorisation de redistribution trouvée | Aucune |
| Décision | Ne pas publier le texte ni les assets |

La description publique crédite `karmicPurple` pour la traduction et `biologicalAlien` pour la relecture. Elle mentionne aussi Yuka, LucidaHuxlux, l'équipe Homestuck en Español, ParalyticTactoe, l'équipe Stoubs, Haeldral et Theriday. Les rôles et droits précis de chaque contribution doivent être confirmés avant toute redistribution.

La présence de plusieurs sources pour des images ou traductions antérieures implique que l'accord d'une seule personne pourrait ne pas suffire pour tous les éléments.

### MSPFA

| Champ | Valeur |
|---|---|
| Service | MS Paint Fan Adventures |
| Conditions | <https://mspfa.com/terms/> |
| Méthode d'accès observée | Endpoint JSON public utilisé par le client du site |
| Licence accordée au lecteur | Aucune licence générale de republication trouvée |
| Stabilité | Le service se réserve la possibilité d'altérer ou retirer du contenu |

Les conditions rendent les utilisateurs responsables de leurs publications et ne transforment pas les œuvres publiées en contenu libre. L'endpoint JSON est donc une méthode technique d'accès, pas une autorisation juridique.

## Autorisation de la traduction

### Registre actuel

```text
status: not-authorized
reference: null
decidedAt: null
scope: []
```

### Preuves acceptables avant changement de mode

Une preuve devrait être conservée sous une forme durable et vérifiable, par exemple :

- licence publique attachée au projet de traduction ;
- déclaration publique non ambiguë des responsables habilités ;
- autorisation écrite conservée par le responsable de ce dépôt ;
- accord séparé ou exclusion documentée pour les contributions de tiers.

La preuve doit préciser :

1. le texte et/ou les assets couverts ;
2. le droit de copier et redistribuer ;
3. le droit d'effectuer les adaptations techniques nécessaires ;
4. la distribution sur GitHub et dans des releases ;
5. les crédits obligatoires ;
6. le traitement des futures mises à jour ;
7. les éventuelles restrictions ou possibilités de retrait.

Une simple absence d'opposition, un lien public ou une réponse vague ne suffit pas.

## Conditions de passage au MODE A

Le fichier `data/metadata/distribution-policy.json`, décrit par [`schemas/distribution-policy.schema.json`](../schemas/distribution-policy.schema.json), ne peut passer en mode `content` que si :

- `decision.status` vaut `authorized` ;
- `decision.reference` pointe vers une preuve vérifiable ;
- `decision.decidedAt` contient une date ISO valide ;
- `decision.scope` contient au minimum `translation-text` ;
- les assets sont exclus, sauf si `translated-assets` est également autorisé ;
- la checklist de release a été entièrement exécutée ;
- une revue humaine confirme la cohérence entre preuve et package.

Le code teste ces conditions, mais ne peut pas déterminer seul si une personne avait juridiquement le pouvoir d'accorder les droits.

## Historique des décisions

| Date | Décision | Motif |
|---|---|---|
| 2026-08-20 | MODE B uniquement | Aucune licence ou autorisation explicite trouvée pour la traduction |
| 2026-08-20 | Assets exclus | Droits multiples possibles et aucun périmètre d'autorisation établi |
| 2026-08-20 | Code du dépôt sous `GPL-3.0-or-later` | Choix explicite du propriétaire ; contenu et assets exclus du périmètre |

## Sources consultées

- UHC, dépôt et mentions légales : <https://github.com/GiovanH/unofficial-homestuck-collection>
- UHC, licence à la révision étudiée : <https://github.com/GiovanH/unofficial-homestuck-collection/blob/91911836a53743e9cf075e5a91c96ebcaf22e039/LICENSE>
- MSPFA, conditions de service : <https://mspfa.com/terms/>
- MSPFA, aventure française : <https://mspfa.com/?s=45546&p=1>
- Homestuck.net, index des traductions : <https://homestuck.net/official/translations/>
- GitHub, principes de licence des dépôts : <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository>
