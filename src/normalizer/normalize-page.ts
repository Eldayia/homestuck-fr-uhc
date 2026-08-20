import { sha256, stableStringify } from "../domain/hash.js"
import type { CanonicalTranslationPage, SourcePage } from "../domain/types.js"
import { parseSafeBbcode } from "../parser/safe-bbcode.js"

export function normalizePage(
  provider: string,
  adventureId: string,
  page: SourcePage,
): CanonicalTranslationPage {
  const translation: CanonicalTranslationPage["translation"] = {}

  if (page.title !== undefined) {
    translation.title = parseSafeBbcode(page.title).trim()
  }
  if (page.body !== undefined) {
    const body = parseSafeBbcode(page.body).trim()
    translation.content = page.logLabel === undefined ? body : `|${page.logLabel}|${body}`
  }

  const rawRelevantContent = {
    title: page.title ?? null,
    body: page.body ?? null,
    logLabel: page.logLabel ?? null,
    nextPageNumbers: page.nextPageNumbers,
    classifications: page.classifications,
  }
  const normalizedRelevantContent = {
    title: translation.title ?? null,
    content: translation.content ?? null,
  }

  const source: CanonicalTranslationPage["source"] = {
    rawHash: sha256(stableStringify(rawRelevantContent)),
    normalizedHash: sha256(stableStringify(normalizedRelevantContent)),
  }
  if (page.modifiedAt !== undefined) source.modifiedAt = page.modifiedAt

  return {
    id: { provider, adventureId, mspfaPageNumber: page.pageNumber },
    source,
    translation,
    navigation: { nextSourcePages: [...page.nextPageNumbers] },
    classifications: [...page.classifications],
  }
}
