<div align="center">

# Homestuck FR pour UHC

### Le générateur et installateur local de la traduction française

[![UHC](https://img.shields.io/badge/UHC-2.8.1-4c6ef5?style=for-the-badge)](https://github.com/GiovanH/unofficial-homestuck-collection)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Licence](https://img.shields.io/badge/Licence-GPL--3.0--or--later-2b6cb0?style=for-the-badge)](./LICENSE)
[![MODE B](https://img.shields.io/badge/MODE_B-outils_locaux-f59f00?style=for-the-badge)](./docs/RELEASE_CHECKLIST.md#mode-b--outils-uniquement)

**Téléchargez, vérifiez, construisez et installez le mod français avec une seule commande.**

</div>

> [!IMPORTANT]
> Tout est généré **localement** à partir de l’aventure MSPFA et de votre propre Asset Pack. Le dépôt et le ZIP public ne redistribuent ni la traduction, ni Homestuck, ni les assets UHC.

> [!NOTE]
> Projet communautaire non officiel, sans affiliation avec Homestuck, MSPFA ou The Unofficial Homestuck Collection.

## Démarrage express

| Étape | Action |
|:---:|---|
| **1** | Installer UHC 2.8.1, son Asset Pack et Node.js 22+ |
| **2** | Télécharger le ZIP MODE B ou cloner ce dépôt |
| **3** | Fermer UHC et lancer la commande ci-dessous |

```powershell
npm run hsfr -- install --asset-pack "C:\chemin\vers\Asset_Pack" --adventure 45546
```

Avec le ZIP extrait, utiliser simplement :

```powershell
.\hsfr.cmd install --asset-pack "C:\chemin\vers\Asset_Pack" --adventure 45546
```

La suite détaillée se trouve dans [Installation simplifiée en une commande](#4-installation-simplifiée-en-une-commande).

## État du projet

| Élément | État actuel |
|---|---|
| Outils MODE B | ✅ [Release publique `v0.1.0`](https://github.com/Eldayia/homestuck-fr-uhc/releases/tag/v0.1.0) |
| UHC ciblé | ✅ `2.8.1`, validé sous Windows |
| Interface française | ✅ Navigation, onglets, boutons et Réglages |
| Traduction incluse dans Git ou le ZIP | ❌ Jamais |
| Assets Homestuck/UHC inclus | ❌ Jamais |
| Pages sans mapping sûr | ↩️ Conservées en anglais |

Le dépôt contient uniquement du code, de la documentation, des configurations vides et des fixtures manifestement artificielles. La politique reste :

```text
CONTENT_DISTRIBUTION_ALLOWED=false
```

<details>
<summary><strong>Sommaire</strong></summary>

<br>

1. [Comprendre le fonctionnement](#1-comprendre-le-fonctionnement)
2. [Installer UHC et son Asset Pack](#2-installer-uhc-et-son-asset-pack)
3. [Installer les outils Homestuck FR](#3-installer-les-outils-homestuck-fr)
4. [Installation simplifiée en une commande](#4-installation-simplifiée-en-une-commande)
5. [Activer et vérifier le mod dans UHC](#5-activer-et-vérifier-le-mod-dans-uhc)
6. [Mettre le mod à jour](#6-mettre-le-mod-à-jour)
7. [Méthode avancée et commandes séparées](#7-méthode-avancée-et-commandes-séparées)
8. [Résoudre les problèmes courants](#8-résoudre-les-problèmes-courants)

</details>

---

## 1. Comprendre le fonctionnement

Le projet suit ce parcours :

```text
Commande hsfr install
        ↓
Téléchargement et validation MSPFA
        ↓
Index UHC + mappings exacts sans conflit
        ↓
Validation + verrou reproductible + build
        ↓
Installation vérifiée dans Asset Pack/mods/homestuck-fr
```

Le dépôt fournit la machine, pas le carburant : chaque utilisateur obtient localement la traduction et utilise son propre Asset Pack UHC. Aucun snapshot réel, `translation.json`, image, Flash ou archive de contenu ne doit être committé ou partagé.

### Dossiers importants

| Dossier | Usage | Peut être publié ? |
|---|---|---|
| `src/`, `adapters/` | code des outils | oui |
| `data/mapping/` | mappings techniques sans texte | après revue |
| `.cache/` | sources, index et rapports locaux | non |
| `generated/` | mod français généré | non sans autorisation |
| `.release/` | archive MODE B des outils | oui après validation |

---

## 2. Installer UHC et son Asset Pack

1. Installer une version officielle de **The Unofficial Homestuck Collection**. Le projet cible actuellement UHC `2.8.1`.
2. Obtenir séparément l'Asset Pack compatible. Il n'est pas fourni ici.
3. Décompresser l'Asset Pack dans un dossier stable.
4. Au premier démarrage d'UHC, cliquer sur **Locate Assets**.
5. Sélectionner le dossier racine de l'Asset Pack, celui qui contient tous ses sous-dossiers.
6. Lancer **Validate asset pack** et attendre la fin du contrôle.
7. Terminer l'assistant de démarrage.

UHC et ses releases sont disponibles sur le [dépôt officiel](https://github.com/GiovanH/unofficial-homestuck-collection). L'Asset Pack reste séparé du code UHC et de ce projet.

---

## 3. Installer les outils Homestuck FR

### Prérequis

- Node.js 22 ou plus récent ;
- npm, fourni avec Node.js ;
- Git uniquement pour l'installation depuis le dépôt ;
- assez d'espace pour les données locales et le mod généré.

Vérifier Node.js :

```bash
node --version
npm --version
```

### Option A — depuis le dépôt

```bash
git clone https://github.com/Eldayia/homestuck-fr-uhc.git
cd homestuck-fr-uhc
npm ci
npm run verify
```

Afficher l'aide :

```bash
npm run hsfr -- --help
```

### Option B — depuis le ZIP MODE B

Télécharger puis extraire `homestuck-fr-uhc-X.Y.Z.zip`. Les fichiers utiles se trouvent directement à la racine du dossier extrait : il n’y a ni `.tgz`, ni archive tar, ni dossier `package/` intermédiaire.

```powershell
.\hsfr.cmd --help
```

Comparer auparavant le SHA-256 de l'archive avec `SHA256SUMS` fourni dans la release.

> Dans les exemples suivants, remplacer `npm run hsfr --` par `.\hsfr.cmd` sous Windows ou `./hsfr` sous Linux/macOS si vous utilisez le ZIP.

---

## 4. Installation simplifiée en une commande

> [!TIP]
> **C’est la méthode recommandée.** Une seule commande télécharge, vérifie, construit et installe le mod complet.

Fermer complètement UHC, puis indiquer :

- le chemin du dossier racine de l’Asset Pack ;
- le numéro de l’aventure MSPFA à utiliser — `45546` pour Homestuck en français.

Depuis le dépôt :

```powershell
npm run hsfr -- install --asset-pack "C:\Users\VotreNom\Documents\Homestuck\Asset_Pack" --adventure 45546
```

Depuis le ZIP MODE B extrait :

```powershell
.\hsfr.cmd install --asset-pack "C:\Users\VotreNom\Documents\Homestuck\Asset_Pack" --adventure 45546
```

### Ce que la commande automatise

| Étape | Opération | Garantie |
|:---:|---|---|
| **1** | Vérification de l’Asset Pack | `archive/data/mspa.json` doit être présent et lisible |
| **2** | Récupération MSPFA | réponse limitée, validée et mise en cache |
| **3** | Indexation UHC | aucun texte anglais n’est recopié dans l’index |
| **4** | Mapping | seuls les candidats exacts sans conflit sont acceptés |
| **5** | Validation | balises actives, contenu dangereux et overrides invalides sont bloqués |
| **6** | Verrou et build | sortie reproductible avec interface française intégrée |
| **7** | Installation | quatre fichiers copiés atomiquement puis comparés au build |

> [!WARNING]
> Les pages ambiguës ou impossibles à relier sûrement restent en anglais. La commande affiche clairement le nombre de pages installées et laissées en fallback.

### Vérifier sans rien écrire

```powershell
npm run hsfr -- install --asset-pack "C:\chemin\vers\Asset_Pack" --adventure 45546 --dry-run true
```

### Réutiliser le cache sans contacter MSPFA

Après une première récupération réussie :

```powershell
npm run hsfr -- install --asset-pack "C:\chemin\vers\Asset_Pack" --adventure 45546 --offline true
```

Les snapshots, mappings, index et verrous intermédiaires restent privés sous `.cache/mspfa/install/45546/`. Ils ne doivent pas être publiés.

---

## 5. Activer et vérifier le mod dans UHC

1. Relancer UHC après la fin de la commande.
2. Ouvrir **SETTINGS**, puis **Mod Settings** lors de la première activation.
3. Glisser **Homestuck FR** dans la liste des mods actifs.
4. Fermer puis relancer complètement UHC une seconde fois pour charger les hooks d’interface.
5. Vérifier que la navigation affiche notamment **AIDE**, **CARTE** et **RÉGLAGES**.
6. Ouvrir une page traduite, puis une page laissée sans mapping : cette dernière doit rester gérée en anglais par UHC.

Le chemin installé est toujours :

```text
<Asset Pack>/mods/homestuck-fr/mod.js
```

Le dernier mod appliqué gagne lorsque deux mods modifient le même texte. Placer Homestuck FR après un autre mod textuel si la traduction française doit être prioritaire.

---

## 6. Mettre le mod à jour

Fermer UHC et relancer exactement la même commande `install`. Le cache, les mappings, le verrou, le build et les quatre fichiers installés sont recalculés et vérifiés automatiquement :

```powershell
npm run hsfr -- install --asset-pack "C:\chemin\vers\Asset_Pack" --adventure 45546
```

Les autres fichiers éventuellement présents dans `mods/homestuck-fr/` sont préservés. Redémarrer complètement UHC après chaque mise à jour.

---

## 7. Méthode avancée et commandes séparées

> [!NOTE]
> Cette partie documente l’ancien parcours manuel. Elle reste utile pour développer le générateur, examiner les conflits ou choisir chaque fichier intermédiaire. Pour une installation normale, utilisez la section 4.

### 7.1 Obtenir la traduction localement

Le snapshot contient le texte français : il doit rester sous `.cache/`, hors Git et hors des pièces jointes GitHub.

### Méthode recommandée — importer un export local

```bash
npm run hsfr -- import \
  --source chemin/vers/export-mspfa.json \
  --adventure 45546 \
  --out .cache/imports/homestuck-fr.json
```

### Méthode facultative — récupération directe

```bash
npm run hsfr -- fetch \
  --adventure 45546 \
  --cache .cache/mspfa \
  --out .cache/imports/homestuck-fr.json
```

Cette commande contacte MSPFA uniquement à la demande, limite la fréquence des requêtes et valide la réponse avant de remplacer le cache.

Pour relire le cache sans réseau :

```bash
npm run hsfr -- fetch \
  --adventure 45546 \
  --cache .cache/mspfa \
  --offline true \
  --out .cache/imports/homestuck-fr.json
```

---

### 7.2 Indexer les pages UHC

Repérer dans l'Asset Pack local le fichier `archive/data/mspa.json`, puis créer un index sans texte en clair :

```bash
npm run hsfr -- uhc-index \
  --source chemin/vers/Asset_Pack/archive/data/mspa.json \
  --out .cache/uhc/reference.json
```

L'index conserve seulement des identifiants, hashes et informations structurelles. Il ne copie ni titre, ni corps de page, ni média.

---

### 7.3 Préparer et vérifier les mappings

Un mapping relie trois identifiants différents :

- le numéro de page dans l'aventure MSPFA ;
- l'ordinal Homestuck ;
- l'identifiant interne UHC à six chiffres.

### Générer les propositions

```bash
npm run hsfr -- mapping-propose \
  --source .cache/imports/homestuck-fr.json \
  --mapping data/mapping/pages.json \
  --reference .cache/uhc/reference.json \
  --out .cache/mapping/proposals.json
```

### Préparer un échantillon de 20 pages

```bash
npm run hsfr -- mapping-review \
  --source .cache/imports/homestuck-fr.json \
  --mapping data/mapping/pages.json \
  --reference .cache/uhc/reference.json \
  --sample-size 20 \
  --out .cache/mapping/review.md
```

### Valider humainement

Chaque proposition doit être comparée dans UHC avant de passer à `verified`. Ajouter ensuite dans `data/mapping/pages.json` l'ordinal, l'ID UHC, le hash source, la date et une preuve `manual` sans recopier le texte.

```bash
npm run hsfr -- mapping-status --mapping data/mapping/pages.json
```

### Accepter localement les preuves exactes sans conflit

Pour construire un mod local sans publier de mapping réel, cette commande accepte uniquement les candidats `exact` dont l'identifiant UHC n'est revendiqué par aucune autre page :

```bash
npm run hsfr -- mapping-accept-exact \
  --source .cache/imports/homestuck-fr.json \
  --reference .cache/uhc/reference.json \
  --mapping data/mapping/pages.json \
  --out .cache/mapping/verified.json
```

Les pages ambiguës, en conflit ou sans candidat ne sont pas incluses dans le mod et restent donc en anglais dans UHC. Les commandes suivantes utilisent ce fichier local. Une revue humaine reste nécessaire avant de publier un mapping persistant dans `data/mapping/pages.json`.

Ne jamais accepter automatiquement le candidat « le plus proche ». La commande ci-dessus n'accepte ni projection de séquence ambiguë ni conflit. Le guide complet se trouve dans [`docs/MAPPING.md`](./docs/MAPPING.md).

---

### 7.4 Contrôler l'état du projet

### Couverture et conflits

```bash
npm run hsfr -- status \
  --source .cache/imports/homestuck-fr.json \
  --mapping .cache/mapping/verified.json \
  --overrides data/overrides/pages.json \
  --reference .cache/uhc/reference.json
```

### Pages image, Flash et interactives

```bash
npm run hsfr -- special-report \
  --source .cache/imports/homestuck-fr.json \
  --mapping .cache/mapping/verified.json \
  --assets data/assets/manifest.json \
  --out .cache/special-pages.md
```

### Overrides techniques facultatifs

Les overrides réels restent dans `.cache/overrides/`. Ils doivent être liés au hash exact de la page et ne servent jamais à corriger la langue. Voir [`docs/OVERRIDES.md`](./docs/OVERRIDES.md).

---

### 7.5 Verrouiller et générer le mod

### 1. Valider les entrées

```bash
npm run hsfr -- validate \
  --source .cache/imports/homestuck-fr.json \
  --mapping .cache/mapping/verified.json \
  --overrides data/overrides/pages.json
```

La commande refuse les mappings ambigus ou obsolètes et les overrides incompatibles.

### 2. Créer le verrou

```bash
npm run hsfr -- lock \
  --source .cache/imports/homestuck-fr.json \
  --mapping .cache/mapping/verified.json \
  --overrides data/overrides/pages.json \
  --out .cache/translation-lock.json
```

### 3. Construire sous verrou

```bash
npm run hsfr -- build \
  --source .cache/imports/homestuck-fr.json \
  --mapping .cache/mapping/verified.json \
  --overrides data/overrides/pages.json \
  --locked true \
  --lock .cache/translation-lock.json \
  --out generated/homestuck-fr
```

Le dossier obtenu contient normalement :

```text
generated/homestuck-fr/
├── mod.js
├── translation.json
├── compatibility.json
└── CREDITS.txt
```

`translation.json` contient la traduction locale : ne pas le publier, le committer ou l'envoyer dans une issue.

Le fichier `mod.js` généré contient aussi la traduction d’interface compatible avec UHC 2.8.1 : navigation, titres d’onglets, infobulles des boutons, commandes des dialogues et options dynamiques de la page Réglages. Les menus natifs de Windows/Electron qui ne sont pas exposés aux mods restent en anglais.

---

### 7.6 Installer manuellement le mod dans UHC

1. Fermer UHC après avoir terminé la génération.
2. Ouvrir le dossier racine de l'Asset Pack configuré dans UHC.
3. Créer le sous-dossier `mods/` s'il n'existe pas.
4. Copier le dossier complet `generated/homestuck-fr/` dans `mods/`. Le chemin final doit être :

   ```text
   <Asset Pack>/mods/homestuck-fr/mod.js
   ```

   Ne copier ni `.cache/` ni le reste du projet.
5. Relancer UHC.
6. Ouvrir **SETTINGS**, puis la section **Mod Settings**.
7. Activer **Homestuck FR** et appliquer l'ordre des mods souhaité.
8. Effectuer un redémarrage complet de l'application après l'ajout ou le remplacement des fichiers du mod.
9. Vérifier que la navigation affiche notamment **AIDE**, **CARTE** et **RÉGLAGES**.
10. Tester d'abord une page mappée, puis une page non mappée : la seconde doit conserver le contenu anglais d’UHC.

Le dernier mod appliqué gagne lorsque deux mods modifient le même titre ou contenu. Placer Homestuck FR après un autre mod de texte si la traduction française doit être prioritaire.

Cette structure suit le [guide officiel de modding UHC 2.8.1](https://github.com/GiovanH/unofficial-homestuck-collection/blob/91911836a53743e9cf075e5a91c96ebcaf22e039/MODDING.md#installing-mods).

> Ce parcours a été validé dans UHC 2.8.1 sous Windows avec un mod composé exclusivement de fixtures artificielles. Linux et macOS ne sont pas certifiés pour l'exécution dans UHC. Consulter le [rapport de validation détaillé](./docs/VALIDATION_WINDOWS_UHC_2.8.1.md) et [`docs/VALIDATION_STATUS.md`](./docs/VALIDATION_STATUS.md).

---

### 7.7 Inspecter une mise à jour de la traduction

1. importer ou récupérer un nouveau snapshot ;
2. prévisualiser les différences ;
3. revoir les mappings et overrides signalés ;
4. recréer le verrou ;
5. reconstruire puis remplacer l'ancien dossier de mod.

Prévisualisation sans écriture :

```bash
npm run hsfr -- diff \
  --source .cache/imports/homestuck-fr.json \
  --state data/metadata/source-state.json
```

Enregistrement atomique de l'état et du rapport :

```bash
npm run hsfr -- update \
  --source .cache/imports/homestuck-fr.json \
  --state data/metadata/source-state.json \
  --report reports/update-AAAA-MM-JJ.md
```

Le workflow détaillé est documenté dans [`docs/UPDATE_WORKFLOW.md`](./docs/UPDATE_WORKFLOW.md).

---

## 8. Résoudre les problèmes courants

| Symptôme | Vérification |
|---|---|
| `--source` manquant | fournir explicitement le snapshot sous `.cache/imports/` |
| cache hors ligne absent ou corrompu | relancer une récupération autorisée sans `--offline` |
| mapping `stale` | revoir la page et mettre à jour son hash, sans auto-validation |
| override en conflit | recréer ou retirer l'override après revue technique |
| verrou incompatible | relancer `lock` seulement après avoir accepté les changements d'entrée |
| page toujours anglaise | vérifier que son mapping est `verified` et que son ID existe dans UHC |
| média non traduit | comportement attendu : aucun binaire n'est modifié automatiquement |
| build réussi mais `0 pages générées` | utiliser le mapping vérifié local `.cache/mapping/verified.json`, pas le gabarit vide `data/mapping/pages.json` |
| UHC ne charge pas le mod | vérifier le dossier, `mod.js`, l'activation et l'ordre des mods |
| l’interface reste en anglais après une mise à jour | fermer complètement UHC puis le relancer ; les hooks d’interface exigent un redémarrage complet |

Avant de signaler un bug :

```bash
npm run verify
npm run hsfr -- status --source .cache/imports/homestuck-fr.json
```

Utiliser ensuite les modèles d'issues. Ne joindre ni texte, ni capture de page, ni snapshot, ni asset, ni chemin local.

---

## Documentation avancée

| Sujet | Document |
|---|---|
| Architecture | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| Commandes CLI | [`docs/CLI.md`](./docs/CLI.md) |
| Source et cache | [`docs/TRANSLATION_SOURCE.md`](./docs/TRANSLATION_SOURCE.md) |
| Mapping | [`docs/MAPPING.md`](./docs/MAPPING.md) |
| Overrides | [`docs/OVERRIDES.md`](./docs/OVERRIDES.md) |
| Compatibilité UHC | [`docs/UHC_COMPATIBILITY.md`](./docs/UHC_COMPATIBILITY.md) |
| Reproductibilité | [`docs/REPRODUCIBILITY.md`](./docs/REPRODUCIBILITY.md) |
| Confidentialité | [`docs/PRIVACY.md`](./docs/PRIVACY.md) |
| Protocole de test | [`docs/TEST_PROTOCOL.md`](./docs/TEST_PROTOCOL.md) |
| Qualité et CI | [`docs/QUALITY.md`](./docs/QUALITY.md) |
| Droits et distribution | [`docs/LEGAL_RESEARCH.md`](./docs/LEGAL_RESEARCH.md) |
| Feuille de route | [`docs/ROADMAP.md`](./docs/ROADMAP.md) |

## Contribuer

Lire [`CONTRIBUTING.md`](./CONTRIBUTING.md) et le [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). Les corrections linguistiques doivent être proposées au projet de traduction source, pas ajoutées à ce dépôt.

## Licence

Le code original de ce dépôt est distribué sous **GNU GPL version 3 ou ultérieure** (`GPL-3.0-or-later`) ; consulter [`LICENSE`](./LICENSE). Cette licence ne couvre ni la traduction française, ni Homestuck, ni les assets UHC. La décision et son périmètre sont consignés dans [`docs/LICENSING_DECISION.md`](./docs/LICENSING_DECISION.md).
