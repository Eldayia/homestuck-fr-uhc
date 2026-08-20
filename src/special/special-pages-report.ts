import type { AssetManifest, PageMapping, SourcePage, TranslationSourceSnapshot } from "../domain/types.js"
import { sourcePageHash } from "../mapper/page-mapper.js"

const SPECIAL_CLASSIFICATIONS = new Set([
  "IMAGE_TRANSLATION_REQUIRED",
  "FLASH_TRANSLATION_REQUIRED",
  "INTERACTIVE_TRANSLATION_REQUIRED",
  "UNSUPPORTED",
])

export function renderSpecialPagesReport(
  snapshot: TranslationSourceSnapshot,
  mappings: PageMapping[],
  manifest: AssetManifest,
): string {
  const mappingBySource = new Map(mappings
    .filter((mapping) => mapping.status !== "rejected")
    .map((mapping) => [mapping.mspfaPageNumber, mapping]))
  const assetsByUhc = new Map<string, string[]>()
  for (const asset of manifest.assets) {
    const values = assetsByUhc.get(asset.uhcMspaId) ?? []
    values.push(`${asset.assetId}:${asset.status}`)
    assetsByUhc.set(asset.uhcMspaId, values)
  }
  const pages = snapshot.pages.filter(isSpecialPage).sort((left, right) => left.pageNumber - right.pageNumber)
  const lines = [
    "# Pages spéciales",
    "",
    "> Rapport sans titre, corps de page, chemin local ou contenu binaire.",
    "",
    `Source: ${safe(snapshot.provider)}/${safe(snapshot.adventureId)}`,
    "",
    `Pages spéciales: ${pages.length} sur ${snapshot.pages.length}`,
    "",
    "| Source | UHC | Hash source | Classification(s) | Texte extérieur | Assets manifestés | Traitement |",
    "| ---: | --- | --- | --- | --- | --- | --- |",
  ]
  for (const page of pages) {
    const mapping = mappingBySource.get(page.pageNumber)
    const uhcId = mapping?.uhcMspaId ?? "—"
    const assets = mapping === undefined ? [] : assetsByUhc.get(mapping.uhcMspaId) ?? []
    const treatment = page.classifications.includes("UNSUPPORTED") ? "non supporté" : "texte seulement; média inchangé"
    lines.push(`| ${page.pageNumber} | ${uhcId} | \`${sourcePageHash(page)}\` | ${page.classifications.join(", ")} | ${hasExternalText(page) ? "présent" : "absent"} | ${assets.join(", ") || "—"} | ${treatment} |`)
  }
  lines.push("", "Les assets absents du manifest restent non gérés. Aucun binaire n'est lu, copié ou modifié par ce rapport.", "")
  return lines.join("\n")
}

function isSpecialPage(page: SourcePage): boolean {
  return page.classifications.some((classification) => SPECIAL_CLASSIFICATIONS.has(classification))
}

function hasExternalText(page: SourcePage): boolean {
  return page.title !== undefined || page.body !== undefined
}

function safe(value: string): string {
  return value.replace(/[\r\n|]/g, "_")
}
