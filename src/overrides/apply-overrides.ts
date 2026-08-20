import { OverrideConflictError } from "../domain/errors.js"
import type { CanonicalTranslationPage, PageOverride } from "../domain/types.js"

export function applyOverrides(
  pages: CanonicalTranslationPage[],
  overrides: PageOverride[],
): CanonicalTranslationPage[] {
  const byUhc = new Map(overrides.map((override) => [override.uhcMspaId, override]))

  return pages.map((page) => {
    const uhcMspaId = page.mapping?.uhcMspaId
    if (uhcMspaId === undefined) return page

    const override = byUhc.get(uhcMspaId)
    if (override === undefined) return page
    if (override.appliesToNormalizedHash !== page.source.normalizedHash) {
      throw new OverrideConflictError(
        `La page ${uhcMspaId} a changé en amont alors qu'elle possède l'override « ${override.reason} »`,
      )
    }

    return {
      ...page,
      translation: { ...page.translation, ...override.changes },
    }
  })
}
