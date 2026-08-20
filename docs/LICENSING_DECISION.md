# Décision de licence du code

> Statut : décidé le 20 août 2026

Le code écrit jusqu'ici est original et aucun extrait de code UHC ou d'un mod tiers n'a été identifié dans le dépôt. Sur la base de cet état, la licence UHC ne semble pas imposée au code actuel par copie ou dérivation. Cette constatation devra être réévaluée si du code tiers est intégré.

Le propriétaire du dépôt a choisi `GPL-3.0-or-later`. Le texte officiel figure dans [`LICENSE`](../LICENSE) et `package.json` utilise le même identifiant SPDX.

## Options raisonnables

### GPL-3.0-or-later

- garantit que les versions dérivées distribuées restent libres sous la même licence ;
- cohérente avec l'écosystème UHC ;
- simplifie une éventuelle réutilisation future de code GPL compatible ;
- impose davantage d'obligations aux redistributions et dérivés.

### MPL-2.0

- copyleft limité aux fichiers modifiés ;
- permet une intégration plus souple avec d'autres composants ;
- moins homogène avec la licence UHC ;
- demande une explication claire aux contributeurs.

### MIT

- très simple et permissive ;
- facilite la réutilisation des outils ;
- autorise des dérivés propriétaires ;
- n'offre pas la garantie de partage des améliorations.

## Recommandation technique

**GPL-3.0-or-later** est le choix le plus cohérent si l'objectif prioritaire est de préserver durablement un outil communautaire libre autour d'UHC. **MPL-2.0** est une bonne alternative si le propriétaire préfère un copyleft plus limité. MIT convient seulement si la réutilisation permissive, y compris propriétaire, est souhaitée.

Cette décision porte uniquement sur le code original du dépôt. Elle ne peut pas placer la traduction française, Homestuck ou les assets sous la même licence.

## Décision enregistrée

```text
Licence choisie : GPL-3.0-or-later
Décidé par : propriétaire du dépôt
Date : 2026-08-20
Motif : préserver un outil communautaire libre et rester cohérent avec l'écosystème UHC
```

Actions appliquées :

1. texte officiel ajouté dans `LICENSE` ;
2. métadonnées npm mises à jour ;
3. `README.md`, `NOTICE` et `THIRD_PARTY.md` mis à jour ;
4. périmètre limité explicitement au code original ;
5. tests et checklist de release requis avant publication.

Référence générale : <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository>.
