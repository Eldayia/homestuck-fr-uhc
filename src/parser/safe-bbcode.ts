import { UnsafeContentError } from "../domain/errors.js"

const DANGEROUS_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/<\s*\/?\s*(script|style|iframe|object|embed|svg|math)\b/i, "balise active"],
  [/\bon[a-z]+\s*=/i, "gestionnaire d'événement HTML"],
  [/\b(?:javascript|vbscript)\s*:/i, "protocole de script"],
  [/\bdata\s*:\s*text\/html/i, "document HTML embarqué"],
  [/\[(?:script|style|iframe|object|embed)(?:=|\])/i, "BBCode actif"],
]

export function parseSafeBbcode(input: string): string {
  // Les iframes MSPFA décrivent des pages interactives déjà fournies par UHC.
  // Ils ne doivent jamais être recopiés dans le mod généré : le hook ne modifie
  // que title/content et laisse les champs média de la page UHC en place.
  const inputWithoutIframes = input.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, "")

  for (const [pattern, reason] of DANGEROUS_PATTERNS) {
    if (pattern.test(inputWithoutIframes)) {
      throw new UnsafeContentError(`Contenu refusé (${reason})`)
    }
  }

  let output = escapeHtml(inputWithoutIframes.replace(/\r\n?/g, "\n"))
  output = output.replace(/\[br\s*\/?\]/gi, "<br>")
  output = output.replace(/\n/g, "<br>")
  output = replacePairedTag(output, "b", "strong")
  output = replacePairedTag(output, "i", "em")
  output = replacePairedTag(output, "u", "u")
  output = replacePairedTag(output, "s", "s")
  output = replaceColorTags(output)
  output = replaceAlignmentTag(output, "center")
  output = replaceAlignmentTag(output, "left")
  output = replaceAlignmentTag(output, "right")
  output = output.replace(/\[size=(\d{1,3})\]([\s\S]*?)\[\/size\]/gi, (_match, size: string, content: string) => {
    const pixels = Number(size)
    return pixels >= 1 && pixels <= 200 ? `<span style="font-size: ${pixels}px">${content}</span>` : content
  })
  output = output.replace(
    /\[font=([\w .,'-]+)\]([\s\S]*?)\[\/font\]/giu,
    '<span style="font-family: $1">$2</span>',
  )
  output = output.replace(
    /\[background=(#[0-9a-f]{3}(?:[0-9a-f]{3})?)\]([\s\S]*?)\[\/background\]/gi,
    '<span style="background-color: $1">$2</span>',
  )
  output = replaceExtendedSpoilers(output)
  output = output.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, "<details><summary>Spoiler</summary>$1</details>")
  output = output.replace(/\[url=(https?:\/\/[^\]\s]+)\]([\s\S]*?)\[\/url\]/gi, (_match, href: string, text: string) => {
    const decodedHref = href.replaceAll("&amp;", "&")
    try {
      const url = new URL(decodedHref)
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocole")
    } catch {
      throw new UnsafeContentError("URL refusée")
    }
    return `<a href="${href}" rel="noopener noreferrer">${text}</a>`
  })
  output = output.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, (_match, href: string) => {
    assertHttpUrl(href)
    return `<a href="${href}" rel="noopener noreferrer">${href}</a>`
  })
  output = output.replace(/\[lien=(https?:\/\/[^\]\s]+)\]([\s\S]*?)\[\/lien\]/gi, (_match, href: string, text: string) => {
    assertHttpUrl(href)
    return `<a href="${href}" rel="noopener noreferrer">${text}</a>`
  })
  // Les médias sont déjà rendus par UHC hors de page.content. Les conserver
  // ici les afficherait une seconde fois sous le média original.
  output = output.replace(/\[img(?:=\d{1,4}(?:x\d{1,4})?)?\][\s\S]*?\[\/img\]/gi, "")

  // Quelques pages amont contiennent des balises connues incomplètes ou mal
  // imbriquées. Une fois toutes les paires valides converties, retirer leurs
  // marqueurs résiduels évite de les afficher sans supprimer le texte humain.
  output = output.replace(/\[\/?color(?:=[^\]]*)?\]/gi, "")
  output = output.replace(/\[url=[^\]]*\]([\s\S]*?)\[\/url\]/gi, "$1")
  output = output.replace(/\[\/?(?:url|lien)(?:=[^\]]*)?\]/gi, "")

  // Les séquences inconnues restent du texte littéral. À ce stade le HTML
  // d'origine est échappé et seules les conversions ci-dessus peuvent créer
  // des balises, donc un pseudo-tag tel que [CG] ne devient jamais exécutable.
  return output
}

function assertHttpUrl(escapedUrl: string): void {
  const decodedUrl = escapedUrl.replaceAll("&amp;", "&")
  try {
    const url = new URL(decodedUrl)
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocole")
  } catch {
    throw new UnsafeContentError("URL refusée")
  }
}

function replaceAlignmentTag(input: string, alignment: "center" | "left" | "right"): string {
  return input.replace(
    new RegExp(`\\[${alignment}\\]([\\s\\S]*?)\\[\\/${alignment}\\]`, "gi"),
    `<div style="text-align: ${alignment}">$1</div>`,
  )
}

function replaceColorTags(input: string): string {
  const pattern = /\[color=(#?[0-9a-f]{6}|#[0-9a-f]{3}|green)\]((?:(?!\[color=)[\s\S])*?)\[\/color\]/gi
  let output = input
  while (pattern.test(output)) {
    pattern.lastIndex = 0
    output = output.replace(pattern, (_match, color: string, content: string) => {
      const normalized = color.toLowerCase() === "green"
        ? "green"
        : color.startsWith("#") ? color : `#${color}`
      return `<span style="color: ${normalized}">${content}</span>`
    })
    pattern.lastIndex = 0
  }
  return output
}

function replaceExtendedSpoilers(input: string): string {
  return input.replace(
    /\[spoiler\s+open=&quot;([^&]*(?:&(?!quot;)[^&]*)*)&quot;\s+close=&quot;([^&]*(?:&(?!quot;)[^&]*)*)&quot;\]([\s\S]*?)\[\/spoiler\]/gi,
    (_match, open: string, close: string, content: string) =>
      `<details><summary>${open}</summary>${content}<div>${close}</div></details>`,
  )
}

function replacePairedTag(input: string, bbcode: string, html: string): string {
  return input.replace(new RegExp(`\\[${bbcode}\\]([\\s\\S]*?)\\[\\/${bbcode}\\]`, "gi"), `<${html}>$1</${html}>`)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
