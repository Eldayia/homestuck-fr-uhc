import { InputValidationError } from "../domain/errors.js"
import type { CanonicalTranslationPage } from "../domain/types.js"

const ACTIVE_HTML = /<\s*(script|style|iframe|object|embed|svg|math)\b|\bon[a-z]+\s*=|javascript\s*:/i

export function validatePages(pages: CanonicalTranslationPage[]): void {
  const seenUhc = new Set<string>()

  for (const page of pages) {
    if (page.mapping === undefined) {
      throw new InputValidationError(`Page ${page.id.mspfaPageNumber} sans mapping`)
    }
    if (seenUhc.has(page.mapping.uhcMspaId)) {
      throw new InputValidationError(`Page UHC générée deux fois: ${page.mapping.uhcMspaId}`)
    }
    seenUhc.add(page.mapping.uhcMspaId)

    if (page.translation.title === undefined && page.translation.content === undefined) {
      throw new InputValidationError(`Page ${page.mapping.uhcMspaId} sans traduction exploitable`)
    }

    for (const [field, value] of Object.entries(page.translation)) {
      if (ACTIVE_HTML.test(value)) {
        throw new InputValidationError(`HTML actif dans ${page.mapping.uhcMspaId}.${field}`)
      }
    }
  }
}
