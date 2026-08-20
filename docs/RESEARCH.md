# Recherche initiale — Homestuck FR pour UHC

> État : investigation de l'étape 57  
> Date de consultation : 20 août 2026  
> Cible UHC étudiée : `v2.8.1` (`91911836a53743e9cf075e5a91c96ebcaf22e039`)  
> Source française étudiée : MSPFA `s=45546`

## Résumé exécutable

Le projet est techniquement réalisable sous la forme prévue : un outil indépendant génère un dossier de mod UHC, sans forker UHC et sans modifier son Asset Pack.

Les décisions sûres à ce stade sont les suivantes :

- le mode de distribution initial doit être **MODE B / outils uniquement** ;
- aucune traduction française ni image traduite ne doit entrer dans Git ou dans une release tant qu'une licence ou une autorisation explicite de redistribution n'a pas été obtenue ;
- l'accès de données le plus propre actuellement observable est le point d'entrée JSON public utilisé par le site MSPFA lui-même, mais il n'est ni documenté ni versionné comme API stable ;
- une source JSON locale doit donc être supportée dès le MVP ;
- le numéro de page MSPFA n'est pas le numéro de page Homestuck ;
- le mapping doit relier trois identifiants non ambigus : `mspfaPageNumber`, `homestuckOrdinal` et `uhcMspaId` ;
- seules les propriétés traduites (`title` et `content`) doivent être surchargées dans UHC ; les médias, liens de navigation, drapeaux et métadonnées UHC doivent rester intacts par défaut ;
- le JavaScript et le CSS personnalisés de l'aventure MSPFA ne doivent jamais être exécutés ni recopiés ;
- les assets traduits doivent suivre une filière juridique et technique séparée du texte ;
- UHC 2.8.1 n'a pas introduit de changement matériel du chargeur de mods par rapport à 2.8.0 ; la documentation de modding reste toutefois explicitement qualifiée de brouillon, donc les tests doivent faire autorité.

Ce document ne contient aucun texte traduit de l'aventure et aucun asset Homestuck.

## Analyse du plan fourni

### Points solides

Le plan pose les bonnes frontières : séparation code/contenu, adaptateur de source remplaçable, format canonique, mapping persistant, overrides après normalisation, fallback anglais, builds reproductibles et verrou juridique avant publication. L'ordre de priorité donné au droit, au mapping et à la fidélité est adapté au risque réel du projet.

### Ajustements nécessaires avant de coder

1. **Identifiants.** `homestuckPage` et `uhcPage` sont trop ambigus. Utiliser partout :
   - `mspfaPageNumber` : position/numéro public dans l'aventure MSPFA ;
   - `homestuckOrdinal` : numéro Viz de Homestuck, de 1 à 8130 dans UHC ;
   - `uhcMspaId` : clé à six chiffres de `archive.mspa.story`, par exemple `001901`.
2. **Révisions MSPFA.** La réponse courante livre tout le tableau de pages. Le traitement et la génération peuvent être incrémentaux par hash, mais la récupération réseau reste un snapshot complet tant qu'aucune API différentielle n'existe.
3. **Stabilité des pages source.** MSPFA expose les pages comme un tableau ; une insertion ou une suppression peut décaler les positions. Le mapping historique ne doit donc pas faire de la position sa seule identité.
4. **Format canonique.** Conserver séparément la provenance, la représentation source brute mise en cache localement, la représentation normalisée et la classification. Ne pas forcer narration, logs et pages spéciales dans quatre chaînes toujours présentes.
5. **Versionnement.** Le projet peut suivre SemVer, mais l'API UHC documente `modVersion` comme un nombre JavaScript strictement croissant. Générer ce nombre séparément de `package.json#version`.
6. **Compatibilité.** `editPage` convient à une surcharge paresseuse, mais n'existe que dans les versions récentes. Le MVP doit comparer une implémentation `edit` simple et une implémentation `editPage`, puis fixer réellement `minimum` dans `compatibility.json`.
7. **Automatisation juridique.** Une variable d'environnement seule ne constitue pas une autorisation. Une release avec contenu doit exiger une décision humaine versionnée, référencée par un document de preuve, et rester impossible par défaut en CI.
8. **Sanitation.** Le parseur MSPFA doit fonctionner par liste blanche. Les champs de JavaScript/CSS personnalisé et les balises actives doivent être refusés, pas seulement ignorés au rendu.
9. **Couverture.** Ni le nombre annoncé dans la description MSPFA ni l'ancien nombre affiché par Homestuck.net ne doivent servir de dénominateur ou de limite codée en dur. La couverture se calcule à partir des mappings validés vers les 8130 pages reconnues par la version UHC testée.

## 1. Fonctionnement actuel du système de mods UHC

### Installation et activation

UHC recherche les mods dans `{asset folder}/mods` :

- fichier seul : `mods/mon-mod.js` ;
- dossier : `mods/mon-mod/mod.js` ;
- archive ZIP : extraite automatiquement au démarrage si elle contient directement l'une de ces deux structures.

Les mods installés sont activables dans `/settings`, section **Mod Settings**. Un changement de fichier peut demander un redémarrage complet ; les changements Vue/CSS demandent au moins un rechargement logiciel.

Référence : [MODDING.md à la révision étudiée](https://github.com/GiovanH/unofficial-homestuck-collection/blob/91911836a53743e9cf075e5a91c96ebcaf22e039/MODDING.md).

### Métadonnées

Le module exporte notamment :

```js
module.exports = {
  title: "Homestuck FR",
  summary: "Traduction française communautaire pour UHC",
  description: "…",
  author: "…",
  modVersion: 1,
  minAppVersion: "…"
}
```

`title`, `summary`, `description`, `author` et `modVersion` sont documentés comme obligatoires. `modVersion` est numérique. `minAppVersion`, lorsqu'il est présent, est comparé comme une version SemVer par le chargeur.

### Hooks utiles

- `computed(api)` et `asyncComputed(api)` chargent les JSON/YAML du dossier du mod avec les fonctions fournies par UHC.
- `edit(archive)` modifie l'archive entière au chargement.
- `editPage(page)` ajoute un post-traitement paresseux lors de l'ouverture d'une page.
- `trees`, `routes` et `treeroute` redirigent des assets locaux.
- `settings`, `footnotes`, `styles`, `themes` et `vueHooks` étendent l'interface, avec un coût de compatibilité supérieur.

Les mods sont appliqués dans un ordre qui peut provoquer des écrasements entre mods. Le générateur doit modifier le minimum de champs et documenter les conflits d'ordre.

### Pages ordinaires, logs et pages spéciales

Le texte visible vient principalement de `archive.mspa.story[id].content`, et la commande/titre de `title`. UHC interprète certains contenus préfixés par une forme comme `|PESTERLOG|` comme des logs repliables. La traduction du libellé d'interface du bouton peut demander un `vueHook`, mais celui-ci est plus fragile et doit rester hors MVP si le contenu est déjà lisible.

Les pages Flash/HTML5 gardent leurs médias et leur logique UHC. Le mod de traduction ne doit remplacer que le texte externe vérifié. Les textes intégrés à une image, un Flash ou un jeu sont des cas spéciaux, à classifier et à traiter plus tard.

### État de 2.8.x

La comparaison locale des tags 2.8.0 et 2.8.1 ne montre aucun changement de `src/mods.js`. La 2.8.1, publiée le 21 avril 2026, est une version corrective ; ses changements visibles concernent notamment les pages d'artistes et l'outil d'import MSPFA, pas le contrat principal des mods. `editPage` avait été ajouté auparavant.

UHC est annoncé en mode maintenance. Cela réduit la probabilité d'une refonte prochaine, sans constituer une garantie de compatibilité. La documentation prévient elle-même qu'elle peut différer de l'implémentation ; `src/mods.js` et des tests réels restent la référence.

Sources : [dépôt UHC](https://github.com/GiovanH/unofficial-homestuck-collection), [release 2.8.1](https://github.com/GiovanH/unofficial-homestuck-collection/releases/tag/v2.8.1), [`src/mods.js`](https://github.com/GiovanH/unofficial-homestuck-collection/blob/91911836a53743e9cf075e5a91c96ebcaf22e039/src/mods.js).

## 2. Structure exacte d'un mod de traduction

La structure minimale recommandée est :

```text
homestuck-fr/
├── mod.js
├── data/
│   └── translation.json
├── metadata/
│   ├── credits.json
│   └── build.json
└── assets/                 # absent tant que les droits ne sont pas validés
```

Le JSON généré doit être indexé par `uhcMspaId` :

```json
{
  "001901": {
    "title": "…",
    "content": "…"
  }
}
```

Au chargement, le mod vérifie que la clé existe puis remplace uniquement les propriétés présentes dans la traduction. Le fallback est ainsi natif : aucune entrée française signifie aucune mutation de la page anglaise.

```js
for (const [id, patch] of Object.entries(translation)) {
  const page = archive.mspa.story[id]
  if (!page) continue
  if (Object.hasOwn(patch, "title")) page.title = patch.title
  if (Object.hasOwn(patch, "content")) page.content = patch.content
}
```

Il ne faut pas remplacer l'objet page complet. Cela risquerait d'effacer `media`, `next`, `previous`, `timestamp`, `flag`, `theme` ou d'autres champs introduits par UHC.

Les assets traduits, s'ils deviennent distribuables, seront ajoutés dans `assets/` et montés avec `trees`. Ils ne doivent jamais embarquer l'Asset Pack UHC ni les originaux Homestuck.

## 3. Exemples de mods de traduction existants

| Référence | Structure observée | Enseignement | Limite juridique/technique |
|---|---|---|---|
| Gabarit `uhsc-mod-repo/translationTemplate` | `mod.js` + JSON indexé par ID UHC à six chiffres | confirme le remplacement de `archive.mspa.story[id].content` | vieux gabarit, dépôt sans licence visible ; à consulter, pas à copier comme dépendance |
| Homestuck PT-BR | dossier `Homestuck PT-BR/`, `mod.js`, `translation2.json`, `Assets/` | fusion de `title`/`content`, chargement par `computed(api)`, redirection d'assets, hook de bouton de log | beaucoup d'assets ; aucune licence claire trouvée dans le dépôt consulté |
| Nihonstuck (japonais) | `mod.js`, plusieurs JSON par actes, `Assets/`, scripts de traitement | montre le découpage de gros corpus, les footnotes et les hooks | pipeline complexe ; assets et contenu sous droits distincts malgré une licence de code affichée |
| Espagnol latino-américain | mod complet distribué par archive, signalé comme couvrant 8130 pages | confirme que la surcharge JSON est viable à grande échelle | archive plutôt que source auditable ; droits et reproductibilité à vérifier |
| MSPA To Go Translator (hongrois) | `Data/*.json`, `Assets/`, `mod.js` compatible avec une structure UHC | documentation publique claire du format `{title, content}` indexé par ID à six chiffres | cible principale différente : extension MSPA To Go, pas UHC lui-même |

Les exemples convergent sur un format simple : JSON indexé par la clé UHC, puis mutation de `title` et `content`. Aucun ne fournit à lui seul une architecture d'import incrémental et juridiquement sûre à reprendre telle quelle.

Sources : [gabarit GiovanH](https://github.com/GiovanH/uhsc-mod-repo/tree/master/translationTemplate), [Homestuck PT-BR](https://github.com/AdokCaulifla/HomestuckPTBR), [Nihonstuck](https://github.com/rayros25/Nihonstuck), [catalogue de traductions Homestuck.net](https://homestuck.net/official/translations/), [MSPA To Go Translator](https://github.com/roberd82/mspa-to-go-translator-extension).

## 4. Format de données utilisé par UHC

UHC charge l'Asset Pack depuis `archive/data/`, notamment `mspa.json`, `social.json`, `news.json`, `music.json`, `comics.json`, `extras.json` et `tweaks.json`. Le mod agit sur l'objet déjà chargé et ne doit pas lire ni redistribuer ces fichiers.

Une page Homestuck observée dans le code UHC possède principalement :

- `pageId` / clé de collection ;
- `title` : commande/titre affiché ;
- `content` : HTML du texte ou du log ;
- `media` : liste des médias ;
- `next` et parfois `previous` : navigation ;
- `timestamp`, `flag`, `theme` et champs spécialisés.

Pour Homestuck, UHC convertit l'ordinal Viz `n` en identifiant MSPA interne par :

```text
uhcMspaId = pad6(n + 1900)
```

La plage reconnue par le code étudié est 1–8130. Exemple : ordinal 1 → `001901`.

Source : [`src/background.js`](https://github.com/GiovanH/unofficial-homestuck-collection/blob/91911836a53743e9cf075e5a91c96ebcaf22e039/src/background.js), [`src/resources.js`](https://github.com/GiovanH/unofficial-homestuck-collection/blob/91911836a53743e9cf075e5a91c96ebcaf22e039/src/resources.js).

## 5. Structure observable de la traduction française MSPFA

L'aventure active est **Homestuck en Français**, identifiant `45546`.

Snapshot observé le 20 août 2026 :

- 5671 entrées dans le tableau `p` ;
- création indiquée le 24 mars 2022 ;
- dernière modification indiquée le 16 juillet 2026 ;
- deux comptes éditeurs résolus publiquement : `karmicPurple` et `biologicalAlien` ;
- la description crédite aussi plusieurs personnes et équipes pour traduction, relecture et matériels empruntés ;
- la description annonce un autre total de progression que le tableau réel : elle ne doit pas être traitée comme donnée canonique.

La réponse JSON utilise des clés compactes. Pour chaque page, les champs observés sont :

- `d` : horodatage en millisecondes ;
- `c` : commande/titre, avec balisage MSPFA ;
- `b` : corps, avec BBCode et parfois HTML ;
- `n` : numéros de pages suivantes ;
- `k` : option de navigation clavier sur certaines pages.

Le corpus contient notamment des images, spoilers, URLs, vidéos, iframes, objets/Flash et quelques éléments audio. Les champs globaux de l'aventure incluent du CSS et du JavaScript personnalisés : ils sont hors périmètre et doivent être rejetés par l'adaptateur.

Les pages n'ont actuellement pas plus d'un lien suivant, mais il existe des sauts, pages ajoutées et séquences spéciales. Cette observation ponctuelle ne doit pas réduire le modèle canonique à une navigation linéaire.

Source : [aventure MSPFA 45546](https://mspfa.com/?s=45546&p=1), [index Homestuck.net](https://homestuck.net/official/translations/).

## 6. Méthode officielle, API ou export MSPFA disponible

### Ce qui existe

Le site MSPFA utilise un POST formulaire vers `https://mspfa.com/` :

```text
do=story&s=45546
```

La réponse est un JSON de l'aventure entière. L'option `noPages=true` est utilisée par le client du site pour obtenir seulement les métadonnées. Le script `tools/mspfa/mspfa.py` d'UHC utilise également `do=story` pour importer une fanventure.

L'éditeur MSPFA propose un export JSON brut aux comptes autorisés à éditer l'aventure. Il ne s'agit pas d'un export public accessible à tout lecteur. Des userscripts tiers ajoutent d'autres fonctions d'export, mais ne constituent pas une API officielle.

### Qualification et limites

Le point d'entrée JSON est **public et utilisé par le client officiel**, mais aucune documentation, garantie de stabilité, politique de quota ou version d'API n'a été trouvée. Il faut donc le qualifier d'**endpoint interne public non documenté**, pas d'API officiellement supportée.

Conséquences :

- adaptateur isolé et remplaçable ;
- timeout, cache, reprise et User-Agent explicite ;
- fréquence faible, aucune tentative de contourner une protection ;
- sauvegarde du snapshot brut hors Git ;
- import local JSON de première classe ;
- aucune CI périodique avant validation des permissions et des modalités d'accès.

Les [conditions MSPFA](https://mspfa.com/terms/) rendent chaque auteur responsable de ce qu'il publie et autorisent la plateforme à altérer ou retirer du contenu. Elles n'accordent pas de licence générale de republication aux lecteurs.

## 7. Correspondance possible MSPFA ↔ pages Homestuck

### Constat

L'index MSPFA et l'ordinal Homestuck divergent. Exemples observés dans les références d'assets :

| Page MSPFA | Ordinal Homestuck observé | Remarque |
|---:|---:|---|
| 1 | 1 | alignement initial |
| 677 | 667 | décalage déjà présent |
| 2398 | 2398 | ancre locale |
| 2399 | — | page ajoutée `Lancer_sprite` |
| 2400 | 2399 | décalage après insertion |
| 3037 | 3036 | ancre locale |
| 3038 | — | page ajoutée |
| 3039 | 3037 | reprise après insertion |
| 5671 | 5668 | dernière correspondance observable du snapshot |

Le lien suivant de la dernière entrée pointe vers une page MSPFA encore absente, ce qui matérialise l'avancement courant sans en faire une limite permanente.

### Algorithme recommandé

Le mapper propose une correspondance en combinant :

1. identifiants numériques extraits de chemins d'assets Homestuck connus ;
2. ancres déjà vérifiées ;
3. graphe précédent/suivant et monotonie locale ;
4. commande/titre et structure de page ;
5. comparaison à une table de métadonnées UHC fournie localement par l'utilisateur, sans la versionner ;
6. liste explicite des insertions, retours, pages bonus et exceptions.

Chaque proposition conserve ses preuves :

```json
{
  "mspfaPageNumber": 2400,
  "homestuckOrdinal": 2399,
  "uhcMspaId": "004299",
  "status": "verified",
  "confidence": "exact",
  "evidence": [
    { "type": "asset-id", "value": "02399" },
    { "type": "previous-anchor", "mspfaPageNumber": 2398 }
  ],
  "sourceHash": "sha256:…",
  "lastVerified": "2026-08-20"
}
```

Une ambiguïté bloque la génération de la page concernée et demande une revue humaine. Elle ne doit jamais produire une correspondance silencieuse « au plus proche ».

## 8. Licence UHC

Le dépôt UHC contient la GPL version 3 et déclare `GPL-3.0*` dans `package.json`. Son README précise, en invoquant la section 7, une exigence additionnelle : toutes les attributions et tous les crédits doivent être conservés ; les modifications ne doivent pas supprimer l'attribution ni déformer l'origine ou la paternité du matériel.

Pour ce projet :

- ne pas copier de code UHC si une simple utilisation de son API suffit ;
- si du code UHC est adapté, conserver la GPL applicable, les notices, l'historique de modification et l'exigence d'attribution ;
- lier le dépôt original et créditer Bambosh, GiovanH et les contributeurs comme l'amont le demande ;
- ne pas appliquer automatiquement cette licence au texte français ni aux assets Homestuck.

Source : [LICENSE UHC](https://github.com/GiovanH/unofficial-homestuck-collection/blob/91911836a53743e9cf075e5a91c96ebcaf22e039/LICENSE), [section licence du README](https://github.com/GiovanH/unofficial-homestuck-collection#license).

## 9. Licence ou autorisation de la traduction française

### Résultat de la recherche

Aucune licence ni autorisation explicite de redistribution n'a été trouvée dans :

- la page publique de l'aventure ;
- sa description et ses crédits ;
- l'index Homestuck.net ;
- les conditions générales MSPFA.

La page identifie la traduction et la relecture par pseudonymes, et crédite plusieurs sources pour des images ou traductions antérieures. Ces crédits sont utiles pour la provenance, mais ne constituent pas une licence.

### Décision

```text
CONTENT_DISTRIBUTION_ALLOWED=false
```

Jusqu'à preuve contraire :

- aucun titre, corps, log ou commande traduits dans Git ;
- aucune image traduite dans Git ou dans une release ;
- aucun diff, patch réversible ou cache source publié ;
- seules les fixtures artificielles sont autorisées ;
- le mod complet est produit localement par l'utilisateur à partir d'une source qu'il est autorisé à utiliser.

Une autorisation future devra préciser au minimum : périmètre textuel, assets, droit de modification technique, redistribution du mod, dépôts publics, releases, attribution exigée et possibilité de republier les mises à jour.

## 10. Risques juridiques identifiés

> Cette analyse est une précaution de conception, pas un avis juridique.

| Risque | Niveau | Mesure imposée |
|---|---|---|
| Republication sans licence de la traduction | bloquant | MODE B par défaut ; aucun contenu dans Git/release |
| Droits distincts sur les images traduites empruntées à plusieurs équipes | bloquant | inventaire asset par asset et autorisations séparées |
| Inclusion d'assets Homestuck ou de l'Asset Pack UHC | bloquant | ne jamais les copier ; utiliser l'installation locale |
| Confusion entre licence du code et licence du contenu | élevé | `LICENSE`, `NOTICE`, `THIRD_PARTY.md` et manifest de droits séparés |
| Attribution UHC incomplète | élevé | crédits amont conservés et vérifiés en release |
| Endpoint public interprété comme permission de republier | élevé | séparer permission d'accès et droit de redistribution |
| Exécution de JavaScript/HTML actif MSPFA | sécurité élevée | liste blanche stricte, aucune exécution distante |
| Automatisation excessive de MSPFA | moyen/élevé | cache, faible fréquence, source locale, pas de scraping planifié sans accord |
| Mapping erroné attribuant un texte à la mauvaise page | intégrité élevée | preuves persistantes, seuil de confiance et revue humaine |
| Licence inconnue des exemples de mods | moyen | ne pas recopier leur code ou contenu ; ne retenir que les motifs d'architecture |

## 11. Architecture finale recommandée

### Flux

```text
MSPFA snapshot ou export local
            │
            ▼
    Source adapter (non fiable)
            │  validation + cache hors Git
            ▼
      SourcePage immuable
            │
            ▼
  Parseur BBCode/HTML sur liste blanche
            │
            ▼
   CanonicalTranslationPage
            │
            ├──► classificateur de pages spéciales
            │
            ▼
 Mapper explicite + preuves + revue humaine
            │
            ▼
       Overrides techniques
            │
            ▼
          Validateur
            │
            ▼
 Générateur UHC (`title`/`content` seulement)
            │
            ▼
 mod local ou package autorisé par la politique de droits
```

### Modules

```text
src/
├── domain/          # types canoniques, identifiants, erreurs
├── importer/        # orchestration snapshots et états
├── parser/          # BBCode/HTML sans scripts
├── normalizer/      # transformations techniques minimales
├── mapper/          # propositions, preuves, conflits
├── overrides/       # application et détection de conflits
├── validator/       # invariants et politique de sécurité
├── generator/       # données et dossier de mod UHC
└── cli/
adapters/
├── mspfa/
└── local-json/
data/
├── mapping/pages.json
├── overrides/
└── metadata/        # état et politique ; jamais le corpus sans droits
generated/           # ignoré par Git par défaut
```

### Modèle canonique minimal

```ts
interface CanonicalTranslationPage {
  id: {
    provider: "mspfa" | "local-json"
    adventureId: string
    mspfaPageNumber: number
  }
  source: {
    url?: string
    retrievedAt: string
    modifiedAt?: string
    rawHash: string
    normalizedHash: string
  }
  translation: {
    title?: string
    content?: string
  }
  navigation: {
    nextSourcePages: number[]
  }
  classification: string[]
  mapping?: {
    homestuckOrdinal: number
    uhcMspaId: string
    status: "proposed" | "verified" | "rejected"
    evidence: MappingEvidence[]
  }
  diagnostics: Diagnostic[]
}
```

Le hash normalisé porte uniquement sur les données traduites pertinentes après normalisation technique déterministe. Le hash brut sert à détecter toute évolution de la source. Les deux sont utiles : le premier évite les rebuilds cosmétiques, le second préserve l'audit.

### Stratégie de compatibilité UHC

- générer une couche d'adaptation `uhc-2.x` plutôt que disperser les détails UHC ;
- tester d'abord 2.8.1, puis la plus ancienne version candidate avant de déclarer un minimum ;
- conserver un fallback `edit` simple ; évaluer `editPage` pour les gros corpus ;
- ne pas dépendre de `vueHooks` dans le MVP ;
- tester que les pages non mappées restent byte-for-byte non modifiées dans l'objet de fixture ;
- tester les conflits avec un second mod synthétique.

## Proposition d'implémentation après investigation

L'étape suivante ne doit toujours pas importer le corpus complet. Le premier incrément recommandé est un **vertical slice de dix fixtures artificielles** :

1. initialiser TypeScript/Node, formatage, tests et CLI minimale ;
2. définir les trois identifiants et le schéma canonique ;
3. implémenter `LocalJsonSource` avant le réseau ;
4. implémenter le parseur sûr sur des fixtures artificielles couvrant narration, log, page vide, HTML et page spéciale ;
5. créer un petit mapping versionné avec preuves ;
6. appliquer un override et tester le conflit après changement source ;
7. générer `mod.js` + `translation.json` sans contenu protégé ;
8. tester l'installation sur UHC 2.8.1 avec des données factices ;
9. ajouter ensuite `MSPFASource` derrière le même contrat, avec cache local ignoré par Git ;
10. garder `package` bloqué tant que la politique de droits n'autorise pas explicitement le contenu.

Critères de sortie de ce premier incrément : build reproductible, aucune donnée protégée, fallback anglais démontré, mapping ambigu bloquant, sanitation bloquante, override non écrasé et package « contenu » impossible par défaut.

## Questions restant ouvertes

- Les responsables actuels de la traduction souhaitent-ils autoriser une redistribution dans un mod UHC ? Selon quels termes ?
- Les équipes dont des images ou traductions ont été reprises ont-elles accordé des droits transférables à ce projet ?
- Un export source maintenu, plus stable que l'endpoint interne MSPFA, peut-il être fourni par les éditeurs ?
- Quel minimum UHC réel accepte le mod généré après tests : 2.7.x, 2.8.x ou autre ?
- Faut-il traduire les libellés d'interface des logs via `vueHooks`, au prix d'une compatibilité plus fragile ?

## Sources principales

- [The Unofficial Homestuck Collection](https://github.com/GiovanH/unofficial-homestuck-collection)
- [Documentation de modding UHC](https://github.com/GiovanH/unofficial-homestuck-collection/blob/91911836a53743e9cf075e5a91c96ebcaf22e039/MODDING.md)
- [Release UHC 2.8.1](https://github.com/GiovanH/unofficial-homestuck-collection/releases/tag/v2.8.1)
- [Homestuck en Français sur MSPFA](https://mspfa.com/?s=45546&p=1)
- [Conditions de service MSPFA](https://mspfa.com/terms/)
- [Index communautaire des traductions](https://homestuck.net/official/translations/)
- [Guide de traduction MSPFA](https://homestuck.net/official/translations/translating-guide-mspfa.html)
- [Gabarits de mods GiovanH](https://github.com/GiovanH/uhsc-mod-repo)
- [Homestuck PT-BR](https://github.com/AdokCaulifla/HomestuckPTBR)
- [Nihonstuck](https://github.com/rayros25/Nihonstuck)
- [MSPA To Go Translator](https://github.com/roberd82/mspa-to-go-translator-extension)

