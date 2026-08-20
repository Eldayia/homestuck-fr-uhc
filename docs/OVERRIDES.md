# Overrides techniques

Un override corrige un problème d'intégration local après normalisation. Il ne sert jamais à corriger la langue : une correction linguistique doit être envoyée au projet de traduction.

## Format

Le fichier est un tableau JSON local. Chaque entrée contient :

```json
{
  "uhcMspaId": "001901",
  "reason": "Description technique sans citation du texte",
  "appliesToNormalizedHash": "sha256:…",
  "changes": {
    "title": "valeur locale",
    "content": "valeur locale"
  }
}
```

Le hash lie l'override à une version exacte de la page normalisée. Si la source change, `status`, `validate` et `build` signalent ou bloquent l'override au lieu de l'appliquer silencieusement. Deux overrides visant le même ID UHC sont refusés.

## Procédure

1. conserver le fichier sous `.cache/overrides/` ;
2. identifier le défaut technique dans UHC sans copier le texte dans une issue ;
3. relever le `normalizedHash` localement ;
4. décrire la raison sans extrait protégé ;
5. lancer `hsfr validate`, puis un build verrouillé ;
6. vérifier manuellement la page et son fallback anglais.

Un override contenant du texte réel reste une donnée de traduction privée. Il ne doit jamais être committé. Le dépôt ne contient qu'un fichier vide par défaut et des fixtures artificielles.
