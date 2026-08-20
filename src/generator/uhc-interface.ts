const DYNAMIC_SETTING_TRANSLATIONS = {
  showAddressBar: {
    label: "Barre d’adresse",
    desc: "Affiche la barre d’accès rapide en haut de la fenêtre, comme dans un navigateur classique. Si elle est masquée, utilisez le bouton correspondant dans la barre d’onglets ou Ctrl+L (⌘+L sous macOS).",
  },
  switchToNewTabs: {
    label: "Basculer automatiquement vers les nouveaux onglets",
    desc: "Lorsqu’un lien est ouvert dans un nouvel onglet, cet onglet devient automatiquement actif.",
  },
  forceScrollBar: {
    label: "Toujours afficher la barre de défilement",
    desc: "L’ouverture d’un dialogue peut faire apparaître la barre de défilement et décaler la page. Cette option la garde visible en permanence.",
  },
  pixelScaling: {
    label: "Mise à l’échelle pixellisée des images",
    desc: "Utilise un redimensionnement au plus proche voisin sur les pages Homestuck et MSPA afin de préserver les contours nets des images.",
  },
  urlTooltip: {
    label: "Infobulle d’URL",
    desc: "Affiche en bas à gauche la destination d’un lien lorsque vous le survolez, comme dans un navigateur classique.",
  },
  arrowNav: {
    label: "Navigation avec les touches fléchées",
    desc: "Permet de passer à la page précédente ou suivante avec les flèches gauche et droite, et d’ouvrir les dialogues avec la barre d’espace.",
  },
  openLogs: {
    label: "Ouvrir automatiquement les dialogues",
    desc: "Les dialogues textuels repliables sont ouverts dès l’affichage de chaque page.",
  },
  hqAudio: {
    label: "Audio Flash en haute qualité",
    desc: "Remplace l’audio compressé des animations Flash par les versions Bandcamp en haute qualité. Désactivez cette option en cas de problème de performances.",
  },
  credits: {
    label: "Crédits audio intégrés",
    desc: "Ajoute sous les pages musicales le titre du morceau, ses artistes et un lien vers sa fiche dans la base musicale.",
  },
  bandcampEmbed: {
    label: "Lecteur Bandcamp en ligne",
    desc: "Autorise la base musicale à utiliser le lecteur en ligne de Bandcamp. Désactivez cette option si vous ne voulez pas que la Collection se connecte à Internet.",
  },
  jsFlashes: {
    label: "Effets Flash améliorés",
    desc: "Améliore certains effets d’animations Flash avec JavaScript. En cas de problème sur une page Flash, essayez de désactiver cette option.",
  },
  devMode: {
    label: "Mode développeur",
    desc: "Ajoute « Inspecter l’élément » au menu contextuel et davantage d’informations de journalisation pour le développement et le dépannage. Les performances peuvent légèrement diminuer.",
  },
  hideFullscreenHeader: {
    label: "Masquer l’en-tête en plein écran",
    desc: "Masque la barre de titre, la barre d’adresse et les onglets en mode plein écran (F11).",
  },
  smoothScrolling: {
    label: "Défilement fluide",
    desc: "Contrôle le lissage du défilement. <strong>Nécessite un redémarrage de l’application et peut être sans effet sur certaines plateformes.</strong>",
  },
  enableHardwareAcceleration: {
    label: "Accélération matérielle",
    desc: "L’application la désactive par défaut. L’activer peut améliorer les performances sur certains systèmes. <strong>Le changement prend effet après redémarrage.</strong>",
  },
  useSystemWindowDecorations: {
    label: "Utiliser les décorations de fenêtre du système",
    desc: "Utilise les bordures et boutons de fenêtre natifs du système à la place de la barre de titre Electron. <strong>Redémarre l’application.</strong>",
  },
  allowSysUpdateNotifs: {
    label: "Notifications de mise à jour",
    desc: "Vérifie au démarrage si une nouvelle version de l’application est disponible et vous en avertit.",
  },
  useTabbedBrowsing: {
    label: "Navigation par onglets",
    desc: "Réactive la barre d’onglets dans la version web et mémorise les onglets dans les réglages.",
  },
  reducedMotion: {
    label: "Réduire les animations",
    desc: "Tente de limiter les mouvements automatiques : contrôle manuel des GIF animés et clic explicite avant la lecture des animations Flash.",
  },
  ruffleFallback: {
    label: "Utiliser Ruffle si Flash échoue",
    desc: "Si le lecteur Flash intégré ne fonctionne pas, utilise l’émulateur <a href='https://ruffle.rs/'>Ruffle</a> à sa place.",
  },
  retcon1: { label: "Les bras de John" },
  retcon2: { label: "La première quête Zap de John" },
  retcon3: { label: "John interrompt Dave et Jade" },
  retcon4: { label: "Les taches d’huile" },
  retcon5: { label: "La deuxième quête Zap de John" },
  retcon6: { label: "Les pages de mot de passe de Terezi" },
  bolin: {
    label: "Homestuck — musique de Bill Bolin",
    desc: "Plusieurs animations Flash de la première année d’Homestuck utilisaient des musiques de <a href=\"/music/artist/bill-bolin\" target=\"_blank\">Bill Bolin</a>. Après son départ de l’équipe, il a demandé leur retrait et les animations concernées ont reçu de nouvelles bandes-son.",
  },
  soluslunes: {
    label: "Homestuck — musique de SolusLunes",
    desc: "Restaure une <a href='/mspa/003620'>animation Flash</a> utilisant une musique de SolusLunes (Jared Micks). Cette option remplace aussi une animation de Bill Bolin, même si sa restauration est activée.",
  },
  unpeachy: {
    label: "Homestuck — CAUCASIAN!",
    desc: "Restaure la version originale d’une plaisanterie sur la couleur de peau des enfants Trickster pendant l’Acte 6 Acte 5, atténuée peu après sa publication.",
  },
  notitty: {
    label: "Homestuck — nudité",
    desc: "Dans quelques cases d’Homestuck, un sein humain est visible. L’activation de cette option <b>censure</b> ces passages.",
  },
  pxsTavros: {
    label: "Paradox Space — Tavros Banana",
    desc: "Restaure la version non masquée d’une scène explicite d’horreur corporelle dans Summerteen Romance, censurée par la suite avec des dialogues supplémentaires.",
  },
  cursedHistory: {
    label: "Skaianet Systems — CURSED_HISTORY",
    desc: "Restaure d’anciennes notes de construction d’univers publiées dans le code source du site Skaianet Systems en 2019, puis rapidement retirées en raison de leur contenu.",
  },
} as const

const STATIC_UI_TRANSLATIONS = {
  "New Reader Mode": "Mode nouveau lecteur",
  "New reader mode": "Mode nouveau lecteur",
  "set to": "réglé sur",
  "Adjust": "Ajuster",
  "Enter a": "Saisissez un numéro de page sur",
  "page number between 1 and 8129.": "compris entre 1 et 8129.",
  "Switch off new reader mode": "Désactiver le mode nouveau lecteur",
  "Use MSPA page numbers": "Utiliser les numéros de page MSPA",
  "Use the original 6-digit index.php page IDs used on mspaintadventures.com and the TopatoCo paperbacks instead of the new numbering Viz introduced.": "Utilise les identifiants index.php originaux à six chiffres de mspaintadventures.com et des livres TopatoCo, au lieu de la nouvelle numérotation introduite par Viz.",
  "Reading Experience": "Expérience de lecture",
  "Replay (Recommended)": "Au fil de la parution (recommandé)",
  "Read as if you were reading it live.": "Lit l’œuvre comme lors de sa publication initiale.",
  "All pages will be presented how they were as of the time of your most recent page. (with some minor exceptions; see": "Chaque page est présentée dans l’état correspondant à la page la plus récente que vous avez atteinte (à quelques exceptions près ; voir le",
  "controversial content": "contenu controversé",
  "Archival": "Archives",
  "Read as an archival reader.": "Lit l’œuvre comme une archive complète.",
  "Stories will be presented approximately as they were at the time they were finished (or abandoned).": "Les histoires sont présentées approximativement telles qu’elles étaient lorsqu’elles ont été terminées (ou abandonnées).",
  "Settings": "Réglages",
  "Unlock notifications": "Notifications de déblocage",
  "Enables a notification that lets you know when you unlock new content elsewhere in the collection.": "Affiche une notification lorsque vous débloquez du nouveau contenu ailleurs dans la Collection.",
  "Show minor notifications": "Afficher les notifications mineures",
  "Also show notifications for minor updates like news announcements.": "Affiche aussi les notifications des mises à jour mineures, comme les annonces d’actualité.",
  "Browser Settings": "Réglages du navigateur",
  "Application Theme": "Thème de l’application",
  "Never style UI": "Toujours conserver l’interface standard",
  "Always keep the standard grey window decorations (title bar, tabs, etc.)": "Conserve toujours les décorations grises standard de la fenêtre (barre de titre, onglets, etc.).",
  "Dark Mode": "Mode sombre",
  "Use the \"Dark\" page theme, if you don't like your grays light.": "Utilise le thème de page sombre si vous préférez des gris moins clairs.",
  "Page Theme Override": "Forcer le thème des pages",
  "UI Theme Override": "Forcer le thème de l’interface",
  "Enhancements": "Améliorations",
  "Text Override": "Personnalisation du texte",
  "Adjusts how the text looks on Homestuck pages, as well as the other MS Paint Adventures. A few pages will assume you're using the default look (14px Courier New Bold), so they might end up looking a little strange.": "Modifie l’apparence du texte dans Homestuck et les autres MS Paint Adventures. Quelques pages supposent l’utilisation du style par défaut (Courier New gras, 14 px) et peuvent donc sembler inhabituelles.",
  "If you want to zoom the entire application, try ctrl -/+ (or ⌘ -/+)!": "Pour zoomer toute l’application, utilisez Ctrl -/+ (ou ⌘ -/+).",
  "Font family:": "Police :",
  "Font size:": "Taille de police :",
  "Line height:": "Hauteur de ligne :",
  "Bold Font": "Texte en gras",
  "Add spacing between chat lines": "Espacer les lignes de dialogue",
  "High contrast text colors": "Couleurs de texte à fort contraste",
  "Experimental Features": "Fonctionnalités expérimentales",
  "These are features you may find useful, but aren't guaranteed to work perfectly in all cases, and may come with performance tradeoffs.": "Ces fonctions peuvent être utiles, mais leur fonctionnement parfait n’est pas garanti et elles peuvent réduire les performances.",
  "Controversial Content": "Contenu controversé",
  "The Unofficial Homestuck Collection allows you to restore some material that was included in the original publication, but was since officially replaced by MSPA for various reasons. These options allow you to view those pages before they were edited.": "La Collection Homestuck non officielle permet de restaurer du contenu présent lors de la publication originale, puis remplacé officiellement par MSPA pour diverses raisons. Ces options permettent de consulter les pages avant leur modification.",
  "Enable controversial content": "Activer le contenu controversé",
  "New Reader mode is currently enabled, so if checked, this option restores": "Le mode nouveau lecteur est actif : cette option restaure donc",
  "all": "tout",
  "this material without including spoilers or content warnings. More granular settings are available when New Reader mode is disabled, so you may wish to finish Homestuck before you come back and view this content selectively.": "ce contenu sans spoilers ni avertissements détaillés. Des réglages plus précis sont disponibles lorsque le mode nouveau lecteur est désactivé ; vous pouvez terminer Homestuck avant de revenir consulter ce contenu au cas par cas.",
  "These changes only affected a few pages and some side content. The page numbers are listed here, without spoilers, and the side content is only shown if it is unlocked.": "Ces changements ne concernent que quelques pages et du contenu annexe. Les numéros sont listés ici sans spoilers, et le contenu annexe n’apparaît que s’il est débloqué.",
  "Show Affected Page Numbers": "Afficher les numéros de pages concernés",
  "Side content": "Contenu annexe",
  "Mod Settings": "Réglages des mods",
  "Content, patches, and localization. Add mods to your local": "Contenu, correctifs et traductions. Ajoutez des mods à votre",
  "mods directory": "dossier de mods",
  ". You can get mods from anywhere, but a good place to start is the": ". Vous pouvez obtenir des mods où vous le souhaitez, mais vous pouvez commencer par la page",
  "github page. For a detailed explanation of how mods work and how you can build your mods, take a look at the": "sur GitHub. Pour une explication détaillée du fonctionnement et de la création des mods, consultez le",
  "modding readme": "guide de modding",
  "Mods are software just like the collection, and a malicious mod could be malware. Use normal caution and only run trusted code.": "Les mods sont des logiciels au même titre que la Collection : un mod malveillant peut contenir un programme dangereux. Restez prudent et n’exécutez que du code fiable.",
  "If you've added mods to your mods directory with the application open, you can": "Si vous avez ajouté des mods pendant que l’application était ouverte, vous pouvez",
  "Inactive": "Inactifs",
  "Active": "Actifs",
  "refresh mod list": "actualiser la liste des mods",
  "Reload Application": "Recharger l’application",
  "Drag mods from the pool on the left to the list on the right to enable them. Higher mods take priority on conflicts.": "Glissez les mods de la liste de gauche vers celle de droite pour les activer. En cas de conflit, les mods placés plus haut sont prioritaires.",
  "Some of your changes require a quick reload before they can take effect. When you're ready, click here:": "Certains changements nécessitent un rechargement avant de prendre effet. Lorsque vous êtes prêt, cliquez ici :",
  "System Settings": "Réglages système",
  "Application version:": "Version de l’application :",
  "Asset pack version:": "Version du pack de ressources :",
  "Expected asset pack version:": "Version attendue du pack de ressources :",
  "Asset pack directory:": "Dossier du pack de ressources :",
  "Log File (for troubleshooting)": "Fichier journal (pour le dépannage)",
  "Asset Pack Validator": "Validateur du pack de ressources",
  "Asset Pack Location:": "Emplacement du pack de ressources :",
  "Pick new location": "Choisir un nouvel emplacement",
  "Factory reset": "Rétablir les réglages d’usine",
  "Game data": "Données de jeu",
  "New tab": "Nouvel onglet",
  "Jump bar": "Barre d’accès rapide",
  "Bookmarks": "Marque-pages",
  "Drag and drop!": "Glissez-déposez !",
  "0 matches": "0 résultat",
  "matches": "résultats",
  "of": "sur",
} as const

const TAB_TITLE_TRANSLATIONS = {
  "The Unofficial Homestuck Collection": "La Collection Homestuck non officielle",
  "Homestuck Collection": "Collection Homestuck",
  "Settings": "Réglages",
  "Help": "Aide",
  "Map": "Carte",
  "Log": "Journal",
  "Search": "Recherche",
  "News": "Actualités",
  "Music": "Musique",
  "More": "Plus",
  "Credits": "Crédits",
} as const

const NAVIGATION_TRANSLATIONS = {
  "/": "COLLECTION HOMESTUCK",
  "/help": "AIDE",
  "/map": "CARTE",
  "/log": "JOURNAL",
  "/search": "RECHERCHE",
  "/news": "ACTUALITÉS",
  "/music": "MUSIQUE",
  "/evenmore": "PLUS",
  "/settings": "RÉGLAGES",
  "/credits": "CRÉDITS",
  toggleJumpBox: "ACCÈS RAPIDE",
  toggleBookmarks: "SAUVEGARDER/CHARGER",
} as const

const ROUTE_TITLE_TRANSLATIONS = {
  settings: "Réglages",
  help: "Aide",
  map: "Carte",
  log: "Journal",
  search: "Recherche",
  news: "Actualités",
  music: "Musique",
  evenmore: "Plus",
  credits: "Crédits",
} as const

export const UHC_INTERFACE_RUNTIME = `const HSFR_DYNAMIC_SETTINGS = ${JSON.stringify(DYNAMIC_SETTING_TRANSLATIONS, null, 2)}
const HSFR_STATIC_UI = ${JSON.stringify(STATIC_UI_TRANSLATIONS, null, 2)}
const HSFR_TAB_TITLES = ${JSON.stringify(TAB_TITLE_TRANSLATIONS, null, 2)}
const HSFR_NAVIGATION = ${JSON.stringify(NAVIGATION_TRANSLATIONS, null, 2)}
const HSFR_ROUTE_TITLES = ${JSON.stringify(ROUTE_TITLE_TRANSLATIONS, null, 2)}

function hsfrTranslateSettingList(list) {
  if (!Array.isArray(list)) return list
  return list.map(function (item) {
    if (!item || typeof item !== "object") return item
    const patch = HSFR_DYNAMIC_SETTINGS[item.model]
    return patch ? Object.assign({}, item, patch) : item
  })
}

function hsfrTranslateChoices(list) {
  if (!Array.isArray(list)) return list
  const choices = {
    default: "Automatique",
    dark: "Sombre",
    trickster: "Mode Trickster",
    "": "Par défaut"
  }
  return list.map(function (item) {
    if (!item || typeof item !== "object" || !Object.prototype.hasOwnProperty.call(choices, item.value)) return item
    return Object.assign({}, item, { text: choices[item.value] })
  })
}

function hsfrTranslateText(value) {
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  if (Object.prototype.hasOwnProperty.call(HSFR_STATIC_UI, trimmed)) {
    return value.replace(trimmed, HSFR_STATIC_UI[trimmed])
  }
  return value
    .replace(/Homestuck Act (\\d+)/g, "Homestuck — Acte $1")
    .replace(/^(\\s*)e\\.g\\./, "$1ex.")
}

function hsfrTranslateTree(root) {
  if (!root) return
  const elements = [root]
  if (typeof root.querySelectorAll === "function") elements.push.apply(elements, Array.from(root.querySelectorAll("*")))
  elements.forEach(function (element) {
    if (!element) return
    if (element.childNodes) Array.from(element.childNodes).forEach(function (node) {
      if (node && node.nodeType === 3) node.nodeValue = hsfrTranslateText(node.nodeValue)
    })
    if (typeof element.getAttribute !== "function" || typeof element.setAttribute !== "function") return
    ;["title", "aria-label", "placeholder"].forEach(function (attribute) {
      const original = element.getAttribute(attribute)
      if (!original) return
      let translated = hsfrTranslateText(original)
      translated = translated
        .replace(/^Change current page from /, "Passer de la page actuelle ")
        .replace(/\(Middle click to disable newreader\)/, "(Clic du milieu pour désactiver le mode nouveau lecteur)")
      if (translated !== original) element.setAttribute(attribute, translated)
    })
  })
}

function hsfrSetTitle(root, selector, title) {
  if (!root || typeof root.querySelectorAll !== "function") return
  Array.from(root.querySelectorAll(selector)).forEach(function (element) {
    if (element && typeof element.setAttribute === "function") element.setAttribute("title", title)
  })
}

function hsfrTranslateChrome(name, root) {
  hsfrTranslateTree(root)
  if (name === "tabBar") {
    hsfrSetTitle(root, ".closeTabButton", "Fermer l’onglet")
    hsfrSetTitle(root, ".newTabButton", "Nouvel onglet")
    hsfrSetTitle(root, ".jumpBoxButton", "Barre d’accès rapide")
    hsfrSetTitle(root, ".bookmarksButton", "Marque-pages")
  } else if (name === "titleBar") {
    hsfrSetTitle(root, "#minButton", "Réduire")
    hsfrSetTitle(root, "#maxButton", "Agrandir ou restaurer")
    hsfrSetTitle(root, "#closeButton", "Fermer")
  } else if (name === "bookmarks") {
    hsfrSetTitle(root, ".newSave", "Nouvelle sauvegarde")
    hsfrSetTitle(root, ".close", "Fermer")
  } else if (name === "findBox") {
    hsfrSetTitle(root, ".close", "Fermer")
  }
}

function hsfrChromeHook(name) {
  return {
    matchName: name,
    mounted: function () { hsfrTranslateChrome(name, this.$el) },
    updated: function () { hsfrTranslateChrome(name, this.$el) }
  }
}

const HSFR_VUE_HOOKS = [
  {
    matchName: "navBanner",
    data: {
      labels: function ($super) {
        if (!$super || typeof $super !== "object") return $super
        const result = {}
        Object.keys($super).forEach(function (theme) {
          result[theme] = Object.assign({}, $super[theme], HSFR_NAVIGATION)
        })
        return result
      }
    }
  },
  {
    matchName: "pageText",
    computed: {
      logButtonText: function ($super) {
        const original = $super()
        const match = /^(Show|Hide)\\s+(.+)$/.exec(original)
        if (!match) return original
        return (match[1] === "Show" ? "Afficher " : "Masquer ") + "le " + match[2]
      }
    }
  },
  {
    matchName: "settings",
    data: {
      settingListBoolean: hsfrTranslateSettingList,
      enhancementListBoolean: hsfrTranslateSettingList,
      settingListSystem: hsfrTranslateSettingList,
      settingListExperimental: hsfrTranslateSettingList,
      retconList: hsfrTranslateSettingList,
      controversialList: hsfrTranslateSettingList,
      themes: hsfrTranslateChoices,
      fonts: hsfrTranslateChoices,
      enableAllControversialConfirmMsg: function () {
        return "Cette option restaure le contenu controversé retiré sans avertissements détaillés, afin d’éviter les spoilers.\\n\\nVoulez-vous vraiment l’activer maintenant ?"
      }
    },
    mounted: function () { hsfrTranslateChrome("settings", this.$el) },
    updated: function () { hsfrTranslateChrome("settings", this.$el) }
  },
  {
    matchName: "TabFrame",
    methods: {
      setTitle: function ($super) {
        $super()
        const tab = this.tab
        if (!tab || typeof tab.title !== "string") return
        const route = typeof tab.url === "string" ? tab.url.split(/[/?#]/).filter(Boolean)[0] : undefined
        const translated = HSFR_TAB_TITLES[tab.title] || HSFR_ROUTE_TITLES[route]
        if (translated && translated !== tab.title) this.$localData.root.TABS_SET_TITLE(tab.key, translated)
      }
    }
  },
  hsfrChromeHook("tabBar"),
  hsfrChromeHook("titleBar"),
  hsfrChromeHook("addressBar"),
  hsfrChromeHook("bookmarks"),
  hsfrChromeHook("findBox")
]
`
