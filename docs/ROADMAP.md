# Feuille de route du projet

> Dernière mise à jour : 20 août 2026<br>
> Branche de référence : `main`<br>
> État actuel : socle technique validé, aucune donnée française intégrée

Cette feuille de route transforme le plan général en étapes vérifiables. Les phases n'ont pas toutes la même taille : l'avancement est donc mesuré par critères de sortie, pas par un pourcentage trompeur.

## Légende

- ✅ terminé et vérifié ;
- 🟡 partiellement réalisé ;
- ⬜ à faire ;
- ⛔ bloqué par une décision ou une autorisation externe ;
- 🔁 activité récurrente après la première release.

## Vue d'ensemble

| Phase | Objet | État | Jalon concerné |
|---:|---|:---:|---|
| 0 | Investigation initiale | ✅ | M0 — recherche |
| 1 | Socle et vertical slice artificiel | ✅ | M1 — preuve technique |
| 2 | Cadre juridique et gouvernance | 🟡 | M2 — MVP juridiquement sûr |
| 3 | Adaptateur MSPFA et import local | ⬜ | M2 — MVP juridiquement sûr |
| 4 | Snapshots et mises à jour incrémentales | ⬜ | M2 — MVP juridiquement sûr |
| 5 | Mapping MSPFA ↔ Homestuck ↔ UHC | ⬜ | M3 — alpha locale |
| 6 | Parser et normalisation du contenu réel | ⬜ | M3 — alpha locale |
| 7 | Intégration et compatibilité UHC | ⬜ | M3 — alpha locale |
| 8 | Workflow CLI complet | ⬜ | M3 — alpha locale |
| 9 | État, rapports et reproductibilité | ⬜ | M4 — bêta |
| 10 | Pages spéciales et assets traduits | ⬜ | M4 — bêta |
| 11 | Qualité, sécurité et CI | ⬜ | M4 — bêta |
| 12 | Documentation et contributions | ⬜ | M4 — bêta |
| 13 | Alpha, bêta et validation utilisateur | ⬜ | M4 — bêta |
| 14 | Première release MODE B | ⬜ | M5 — release publique |
| 15 | Release MODE A avec contenu | ⛔ | M6 — optionnel |
| 16 | Maintenance à long terme | 🔁 | après M5 |

## Jalons

### M0 — Recherche initiale ✅

Les contraintes techniques, les exemples de mods, la structure MSPFA, le mapping et les risques juridiques sont documentés.

### M1 — Preuve technique artificielle ✅

Le pipeline local traite dix fixtures artificielles, bloque les mappings ambigus et les packages non autorisés, puis génère un mod UHC déterministe.

### M2 — MVP juridiquement sûr ⬜

L'outil sait obtenir ou importer un snapshot réel localement, détecter les changements et conserver un état, sans publier le contenu récupéré.

### M3 — Alpha locale utilisable ⬜

Un utilisateur autorisé peut générer localement une traduction textuelle partielle, l'activer dans UHC et continuer en anglais après la dernière page française.

### M4 — Bêta testable ⬜

Le workflow est documenté, reproductible, testé automatiquement et validé sur les versions UHC annoncées. Les cas spéciaux non supportés sont signalés proprement.

### M5 — Première release publique MODE B ⬜

GitHub distribue les outils, les mappings autorisés et la documentation, mais aucun texte ni asset traduit.

### M6 — Release MODE A ⛔ optionnelle

Un mod prêt à installer contenant la traduction ne pourra être publié qu'après autorisation explicite, documentée et vérifiée pour le texte et chaque catégorie d'assets.

---

## Phase 0 — Investigation initiale ✅

- [x] Étudier le système de mods UHC 2.8.1.
- [x] Identifier le format des pages et les hooks utiles.
- [x] Examiner plusieurs mods et gabarits de traduction.
- [x] Inspecter la structure observable de l'aventure MSPFA française.
- [x] Vérifier la méthode JSON utilisée par MSPFA et l'outil UHC.
- [x] Démontrer que le numéro MSPFA ne correspond pas toujours à l'ordinal Homestuck.
- [x] Examiner la licence UHC et son exigence d'attribution.
- [x] Rechercher une licence ou autorisation de la traduction française.
- [x] Choisir le MODE B comme comportement par défaut.
- [x] Produire [`RESEARCH.md`](./RESEARCH.md).

**Critère de sortie :** les onze sujets de l'étape 57 sont documentés et l'architecture recommandée est définie. **Atteint.**

## Phase 1 — Socle et vertical slice artificiel ✅

- [x] Initialiser Node.js, TypeScript et le lockfile npm.
- [x] Activer le typage strict.
- [x] Définir `mspfaPageNumber`, `homestuckOrdinal` et `uhcMspaId`.
- [x] Définir le format canonique minimal.
- [x] Créer `LocalJsonSource`.
- [x] Créer un parser BBCode à liste blanche.
- [x] Échapper le HTML source et bloquer le contenu actif.
- [x] Valider la formule d'identifiant UHC.
- [x] Refuser les mappings proposés, rejetés ou ambigus.
- [x] Lier les overrides au hash normalisé.
- [x] Bloquer un override lorsque la source change.
- [x] Générer uniquement `title` et `content` dans le mod UHC.
- [x] Préserver le fallback anglais.
- [x] Bloquer la commande `package` avec la politique par défaut.
- [x] Tester dix pages entièrement artificielles.
- [x] Vérifier le typage, les tests, le build et la reproductibilité.
- [x] Documenter l'architecture initiale dans [`ARCHITECTURE.md`](./ARCHITECTURE.md).

**Critère de sortie :** le flux source locale → canonique → mapping → override → validation → mod fonctionne sans contenu protégé. **Atteint.**

## Phase 2 — Cadre juridique et gouvernance 🟡

### 2.1 Documents juridiques du dépôt

- [x] Créer `docs/LEGAL_RESEARCH.md` avec les faits, dates et sources.
- [x] Créer `THIRD_PARTY.md` en séparant code, traduction, Homestuck et UHC.
- [x] Créer `NOTICE` avec les attributions obligatoires.
- [x] Créer `CREDITS.md` avec les crédits publics actuellement observables.
- [ ] Choisir avec le propriétaire du dépôt la licence du code original.
- [ ] Remplacer `UNLICENSED` seulement après cette décision.
- [x] Vérifier qu'aucune licence de code n'est présentée comme licence du contenu.

### 2.2 Autorisation de la traduction

- [x] Identifier les pseudonymes et rôles publiquement affichés.
- [ ] Confirmer que les responsables identifiés peuvent autoriser chaque contribution.
- [x] Préparer une demande d'autorisation claire.
- [ ] Demander séparément les droits concernant le texte et les images.
- [ ] Documenter la réponse sans publier de données personnelles inutiles.
- [x] Lister les contributions de tiers mentionnées dans les crédits MSPFA.
- [ ] Déterminer si les permissions reçues couvrent les mises à jour futures.
- [x] Maintenir `contentDistributionAllowed: false` sans preuve suffisante.

### 2.3 Verrou de release

- [x] Définir un schéma versionné pour la décision de distribution.
- [x] Exiger une référence, une date et un périmètre cohérents.
- [x] Ajouter une checklist de release juridique versionnée.
- [x] Tester que le code refuse un package sans décision complète.
- [ ] Automatiser la checklist et le contrôle du package dans la CI.

**Critère de sortie :** le dépôt peut évoluer et publier ses outils sans ambiguïté juridique. L'absence d'autorisation ne bloque pas le MODE B, mais bloque toujours le MODE A.

## Phase 3 — Adaptateur MSPFA et import local ⬜

### 3.1 Contrat de source

- [ ] Stabiliser `TranslationSource` et le schéma du snapshot brut.
- [ ] Distinguer métadonnées d'aventure et tableau de pages.
- [ ] Conserver les champs source nécessaires à la provenance.
- [ ] Refuser explicitement le JavaScript et le CSS personnalisés.
- [ ] Versionner le format de snapshot local.

### 3.2 Import local

- [ ] Accepter un export JSON MSPFA local.
- [ ] Ajouter `hsfr import <fichier>`.
- [ ] Valider le schéma avant toute transformation.
- [ ] Produire des erreurs mentionnant précisément la page et le champ.
- [ ] Tester un snapshot synthétique reproduisant les clés compactes MSPFA.

### 3.3 Accès réseau facultatif

- [ ] Implémenter l'appel POST `do=story&s=<id>` dans `adapters/mspfa/`.
- [ ] Ajouter un User-Agent explicite avec URL du projet.
- [ ] Ajouter timeout, retries limités et erreurs compréhensibles.
- [ ] Ajouter cache local et intervalle minimal configurable.
- [ ] Ne jamais contourner une protection anti-bot.
- [ ] Permettre de désactiver complètement le réseau.
- [ ] Documenter le caractère non documenté et non versionné de l'endpoint.
- [ ] Garder les snapshots contenant du texte hors Git.

**Critère de sortie :** un snapshot réel peut être obtenu ou fourni localement, puis validé, sans dépendance du cœur à MSPFA.

## Phase 4 — Snapshots et mises à jour incrémentales ⬜

- [ ] Définir `data/metadata/source-state.json` sans texte traduit.
- [ ] Calculer un hash brut et un hash normalisé par page.
- [ ] Conserver la date source lorsqu'elle existe.
- [ ] Détecter `unchanged`, `updated`, `new` et `missing`.
- [ ] Détecter une réorganisation du tableau MSPFA.
- [ ] Ne pas considérer la position seule comme identité stable.
- [ ] Ajouter `hsfr update --dry-run`.
- [ ] Ajouter `hsfr update` avec écriture atomique.
- [ ] Ne modifier l'état qu'après validation complète.
- [ ] Conserver le dernier état utilisable en cas d'échec.
- [ ] Tester deux snapshots successifs artificiels.
- [ ] Tester insertion, suppression, modification et réapparition d'une page.

**Critère de sortie :** une mise à jour indique exactement ce qui a changé et ne détruit jamais l'état précédent sur erreur.

## Phase 5 — Mapping MSPFA ↔ Homestuck ↔ UHC ⬜

### 5.1 Format persistant

- [ ] Finaliser le schéma `data/mapping/pages.json`.
- [ ] Conserver statut, confiance, preuves, hash et date de vérification.
- [ ] Ajouter une version de schéma et une migration contrôlée.
- [ ] Interdire les doublons côté MSPFA et côté UHC.

### 5.2 Génération de candidats

- [ ] Extraire les identifiants depuis les chemins d'assets connus.
- [ ] Utiliser les ancres déjà vérifiées.
- [ ] Analyser le graphe précédent/suivant.
- [ ] Mesurer la monotonie locale sans l'imposer aveuglément.
- [ ] Comparer titre, structure et métadonnées disponibles localement.
- [ ] Détecter les pages ajoutées, bonus, retours et sauts.
- [ ] Conserver toutes les preuves ayant conduit à un candidat.

### 5.3 Revue humaine

- [ ] Ajouter `hsfr mapping status`.
- [ ] Ajouter `hsfr mapping review` ou un fichier de revue équivalent.
- [ ] Afficher les candidats sans inclure le texte protégé dans les rapports publics.
- [ ] Exiger une validation humaine pour les cas ambigus.
- [ ] Bloquer la génération de toute page sans mapping vérifié.
- [ ] Vérifier manuellement un échantillon d'environ vingt pages de différentes époques.

**Critère de sortie :** chaque page générée possède une correspondance vérifiée, explicable et persistante.

## Phase 6 — Parser et normalisation du contenu réel ⬜

- [ ] Inventorier le BBCode réellement utilisé sans publier le corpus.
- [ ] Étendre la liste blanche uniquement aux formes nécessaires.
- [ ] Supporter narration et commandes.
- [ ] Supporter Pesterlogs, Dialoglogs et Spritelogs.
- [ ] Préserver quirks, capitalisation, ponctuation, couleurs et symboles.
- [ ] Distinguer texte absent et chaîne volontairement vide.
- [ ] Gérer plusieurs blocs de texte sans perte.
- [ ] Normaliser uniquement les différences techniques MSPFA/UHC.
- [ ] Produire un HTML déterministe.
- [ ] Refuser scripts, événements, iframes et protocoles dangereux.
- [ ] Classifier images, Flash et interactions nécessitant un traitement spécial.
- [ ] Tester les structures avec des fixtures artificielles minimales.
- [ ] Vérifier les hashes après changements purement cosmétiques.

**Critère de sortie :** les pages textuelles classiques et les logs sont fidèlement convertis, tandis que tout contenu non sûr ou non supporté est signalé.

## Phase 7 — Intégration et compatibilité UHC ⬜

- [ ] Comparer `edit(archive)` et `editPage(page)` sur un corpus important.
- [ ] Choisir le hook principal selon les mesures et versions testées.
- [ ] Charger les données avec l'API de fichiers du mod UHC.
- [ ] Remplacer seulement les champs traduits présents.
- [ ] Ne jamais remplacer l'objet page complet.
- [ ] Tester le fallback anglais sur les pages absentes.
- [ ] Tester pages Flash/HTML5 sans modifier leur média.
- [ ] Tester les logs repliables.
- [ ] Évaluer séparément la traduction des libellés via `vueHooks`.
- [ ] Ajouter les métadonnées et crédits visibles du mod.
- [ ] Ajouter des réglages minimaux seulement s'ils sont stables.
- [ ] Créer `compatibility.json`.
- [ ] Tester manuellement UHC 2.8.1.
- [ ] Déterminer la version minimale uniquement après tests.
- [ ] Tester l'ordre avec un second mod synthétique.

**Critère de sortie :** le mod local s'active et se désactive proprement dans UHC, avec fallback anglais et sans casser les pages spéciales.

## Phase 8 — Workflow CLI complet ⬜

- [ ] Stabiliser `hsfr import`.
- [ ] Implémenter `hsfr update`.
- [ ] Implémenter `hsfr status`.
- [ ] Implémenter `hsfr diff`.
- [ ] Compléter `hsfr validate`.
- [ ] Compléter `hsfr build`.
- [ ] Implémenter `hsfr package` derrière le verrou juridique.
- [ ] Ajouter `--dry-run` aux opérations qui écrivent.
- [ ] Ajouter `--verbose` sans exposer le contenu dans les logs publics.
- [ ] Retourner des codes de sortie stables.
- [ ] Fournir une aide et des exemples pour chaque commande.

**Critère de sortie :** un utilisateur peut suivre tout le workflow local sans modifier manuellement des fichiers générés.

## Phase 9 — État, rapports et reproductibilité ⬜

- [ ] Générer `reports/update-YYYY-MM-DD.md` sans texte traduit.
- [ ] Générer `reports/special-pages.md`.
- [ ] Afficher nouvelles, modifiées, manquantes et inchangées.
- [ ] Signaler les overrides touchés par un changement amont.
- [ ] Calculer couverture, pages mappées, validées et en revue.
- [ ] Ne jamais coder en dur la progression MSPFA.
- [ ] Créer `translation-lock.json`.
- [ ] Ajouter `hsfr build --locked`.
- [ ] Garantir des sorties identiques avec les mêmes entrées.
- [ ] Séparer version logicielle, `modVersion` UHC et état de traduction.

**Critère de sortie :** chaque build est retraçable et reproductible, et chaque update possède un rapport exploitable.

## Phase 10 — Pages spéciales et assets traduits ⬜

- [ ] Inventorier les pages classées image, Flash, HTML5 ou interactives.
- [ ] Distinguer texte extérieur et texte intégré au média.
- [ ] Ne jamais tenter de modifier automatiquement un binaire.
- [ ] Définir un manifest d'assets avec source, hash et statut juridique.
- [ ] Utiliser en priorité les assets déjà présents chez l'utilisateur.
- [ ] Garder les assets traduits hors Git sans autorisation.
- [ ] Étudier les patches locaux seulement s'ils ne reconstruisent pas illicitement une œuvre.
- [ ] Traiter les assets autorisés dans une filière séparée.
- [ ] Laisser les cas non supportés lisibles et signalés.

**Critère de sortie :** chaque page spéciale est soit supportée, soit explicitement classée, sans inclusion accidentelle d'assets protégés.

## Phase 11 — Qualité, sécurité et CI ⬜

- [ ] Ajouter lint et formatage reproductibles.
- [ ] Ajouter couverture de tests avec seuil raisonnable.
- [ ] Tester entrées invalides, volumineuses et hostiles.
- [ ] Tester chemins, encodage Unicode et fins de ligne Windows/Linux.
- [ ] Tester absence de réseau et cache corrompu.
- [ ] Ajouter tests de non-régression du mapping.
- [ ] Ajouter tests de snapshot du mod généré.
- [ ] Créer `.github/workflows/test.yml`.
- [ ] Créer `.github/workflows/build.yml` pour les outils uniquement.
- [ ] Créer `.github/workflows/release.yml` avec verrou juridique.
- [ ] Ne pas créer de scraping périodique MSPFA avant validation.
- [ ] Vérifier automatiquement l'absence de corpus et d'assets interdits.
- [ ] Auditer les dépendances et limiter leur nombre.

**Critère de sortie :** toute PR vérifie automatiquement typage, tests, sécurité de base, reproductibilité et absence de contenu interdit.

## Phase 12 — Documentation et contributions ⬜

- [ ] Compléter le README avec installation et limitations.
- [ ] Créer `docs/TRANSLATION_SOURCE.md`.
- [ ] Créer `docs/UPDATE_WORKFLOW.md`.
- [ ] Créer `CONTRIBUTING.md`.
- [ ] Créer la checklist de release.
- [ ] Expliquer comment corriger un mapping.
- [ ] Expliquer comment créer un override technique.
- [ ] Rediriger les corrections linguistiques vers le projet de traduction.
- [ ] Documenter le fallback anglais.
- [ ] Documenter la politique de confidentialité des snapshots locaux.
- [ ] Ajouter modèles d'issues pour mapping, compatibilité et droits.
- [ ] Ajouter un code de conduite si la communauté s'ouvre aux contributions.

**Critère de sortie :** une personne extérieure peut installer, tester et contribuer sans dépendre d'explications privées.

## Phase 13 — Alpha, bêta et validation utilisateur ⬜

### Alpha locale

- [ ] Générer un mod à partir d'une source locale autorisée.
- [ ] Tester une vingtaine de pages représentatives.
- [ ] Vérifier commandes, narration, trois types de logs et quirks.
- [ ] Vérifier une page non traduite et le retour à l'anglais.
- [ ] Corriger les problèmes techniques via overrides documentés.

### Bêta privée

- [ ] Préparer un protocole de test sans échanger illicitement le corpus.
- [ ] Tester Windows, Linux et macOS si possible.
- [ ] Tester installation neuve et mise à jour d'un mod existant.
- [ ] Tester UHC sur toutes les versions déclarées compatibles.
- [ ] Recueillir les erreurs de mapping et de rendu.
- [ ] Stabiliser le schéma des données avant la première release.

**Critère de sortie :** aucun défaut bloquant connu sur le workflow MODE B et les plateformes annoncées.

## Phase 14 — Première release publique MODE B ⬜

- [ ] Figer la version logicielle selon SemVer.
- [ ] Vérifier licence du code, NOTICE, crédits et tiers.
- [ ] Vérifier l'absence de texte et d'assets protégés.
- [ ] Vérifier que les caches et sorties locales sont ignorés.
- [ ] Construire les outils depuis un checkout propre.
- [ ] Exécuter la checklist de release.
- [ ] Publier uniquement les outils autorisés.
- [ ] Fournir les sommes de contrôle.
- [ ] Publier les notes de version et limitations.
- [ ] Tester l'installation depuis l'archive publiée.

**Critère de sortie :** une release publique permet de générer localement le mod sans redistribuer la traduction.

## Phase 15 — Release MODE A avec contenu ⛔ optionnelle

Cette phase n'est pas nécessaire à la réussite du MODE B.

- [ ] Obtenir une autorisation explicite pour le texte.
- [ ] Obtenir les autorisations nécessaires pour chaque groupe d'assets.
- [ ] Faire vérifier la portée de ces autorisations.
- [ ] Enregistrer une décision humaine référencée dans la politique.
- [ ] Déterminer les attributions visibles exigées.
- [ ] Séparer les éléments non autorisés du package.
- [ ] Activer le job CI de contenu seulement dans un environnement contrôlé.
- [ ] Produire un mod prêt à installer.
- [ ] Vérifier le package final fichier par fichier.
- [ ] Publier la licence ou permission applicable au contenu sans la confondre avec celle du code.

**Critère de sortie :** chaque élément distribué possède une base d'autorisation documentée. Sans cela, cette phase reste bloquée indéfiniment.

## Phase 16 — Maintenance à long terme 🔁

- [ ] Surveiller les releases UHC sans promettre une compatibilité non testée.
- [ ] Lancer les mises à jour de traduction sous forme de PR revues humainement.
- [ ] Mettre à jour mappings et overrides sans réécrire silencieusement l'historique.
- [ ] Réévaluer les permissions lorsque les responsables ou sources changent.
- [ ] Maintenir les dépendances et corriger les alertes de sécurité.
- [ ] Conserver la compatibilité des formats ou fournir des migrations.
- [ ] Archiver les décisions importantes dans les documents du dépôt.
- [ ] Publier des notes de migration lors des changements incompatibles.

**Critère permanent :** intégrer une nouvelle série de pages doit demander principalement une revue des différences et des mappings, pas une reconstruction manuelle du projet.

---

## Prochaines actions concrètes

Ordre proposé pour les prochains changements :

1. créer les documents juridiques de la phase 2 et choisir la licence du code ;
2. définir le format de snapshot MSPFA local, avec fixtures synthétiques ;
3. implémenter `hsfr import` sans réseau ;
4. implémenter l'adaptateur réseau MSPFA avec cache hors Git ;
5. comparer deux snapshots et produire le premier rapport `dry-run` ;
6. commencer le moteur de candidats de mapping avec les identifiants d'assets ;
7. tester localement un petit échantillon réel sans le committer.

## Règle de mise à jour de cette feuille de route

Toute PR qui termine une tâche doit cocher sa case dans ce fichier. Une phase ne passe à ✅ que lorsque son critère de sortie est démontré par des tests, une documentation ou une validation manuelle explicitement indiquée.
