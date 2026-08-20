import { UnsafeContentError } from "../domain/errors.js"

const DANGEROUS_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/<\s*\/?\s*(script|style|iframe|object|embed|svg|math)\b/i, "balise active"],
  [/\bon[a-z]+\s*=/i, "gestionnaire d'événement HTML"],
  [/\b(?:javascript|vbscript)\s*:/i, "protocole de script"],
  [/\bdata\s*:\s*text\/html/i, "document HTML embarqué"],
  [/\[(?:script|style|iframe|object|embed)(?:=|\])/i, "BBCode actif"],
]

export function parseSafeBbcode(input: string): string {
  for (const [pattern, reason] of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      throw new UnsafeContentError(`Contenu refusé (${reason})`)
    }
  }

  let output = escapeHtml(input.replace(/\r\n?/g, "\n"))
  output = output.replace(/\[br\s*\/?\]/gi, "<br>")
  output = output.replace(/\n/g, "<br>")
  output = replacePairedTag(output, "b", "strong")
  output = replacePairedTag(output, "i", "em")
  output = replacePairedTag(output, "u", "u")
  output = replacePairedTag(output, "s", "s")
  output = output.replace(
    /\[color=(#[0-9a-f]{3}(?:[0-9a-f]{3})?)\]([\s\S]*?)\[\/color\]/gi,
    '<span style="color: $1">$2</span>',
  )
  output = output.replace(
    /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi,
    "<details><summary>Spoiler</summary>$1</details>",
  )
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

  const unsupportedTag = output.match(/\[\/?[a-z][^\]]*\]/i)
  if (unsupportedTag) {
    throw new UnsafeContentError(`BBCode non pris en charge: ${unsupportedTag[0]}`)
  }

  return output
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
