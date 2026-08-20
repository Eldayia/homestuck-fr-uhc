import { MappingError } from "../domain/errors.js"
import { sha256, stableStringify } from "../domain/hash.js"
import type { CanonicalTranslationPage, PageMapping, SourcePage } from "../domain/types.js"

export function sourcePageHash(page: SourcePage): string {
  return sha256(stableStringify(page))
}

export function assertMappingSourceHashes(pages: SourcePage[], mappings: PageMapping[]): void {
  const pageByNumber = new Map(pages.map((page) => [page.pageNumber, page]))
  for (const mapping of mappings) {
    const page = pageByNumber.get(mapping.mspfaPageNumber)
    if (page !== undefined && mapping.sourceHash !== undefined && mapping.sourceHash !== sourcePageHash(page)) {
      throw new MappingError(`Mapping obsolète pour la page source ${mapping.mspfaPageNumber}: nouvelle revue requise`)
    }
  }
}

export function expectedUhcMspaId(homestuckOrdinal: number): string {
  if (!Number.isInteger(homestuckOrdinal) || homestuckOrdinal < 1 || homestuckOrdinal > 8130) {
    throw new MappingError(`Ordinal Homestuck hors plage: ${homestuckOrdinal}`)
  }
  return String(homestuckOrdinal + 1900).padStart(6, "0")
}

export function attachMappings(
  pages: CanonicalTranslationPage[],
  mappings: PageMapping[],
): CanonicalTranslationPage[] {
  const bySource = new Map<number, PageMapping>()
  const byUhc = new Map<string, PageMapping>()

  for (const mapping of mappings) {
    if (bySource.has(mapping.mspfaPageNumber)) {
      throw new MappingError(`Mapping source dupliqué: ${mapping.mspfaPageNumber}`)
    }
    if (mapping.status === "rejected") {
      bySource.set(mapping.mspfaPageNumber, mapping)
      continue
    }
    if (byUhc.has(mapping.uhcMspaId)) {
      throw new MappingError(`Mapping UHC dupliqué: ${mapping.uhcMspaId}`)
    }
    const expected = expectedUhcMspaId(mapping.homestuckOrdinal)
    if (mapping.uhcMspaId !== expected) {
      throw new MappingError(
        `ID UHC incohérent pour HS ${mapping.homestuckOrdinal}: ${mapping.uhcMspaId}, attendu ${expected}`,
      )
    }
    bySource.set(mapping.mspfaPageNumber, mapping)
    byUhc.set(mapping.uhcMspaId, mapping)
  }

  return pages.flatMap((page) => {
    const mapping = bySource.get(page.id.mspfaPageNumber)
    if (mapping === undefined || mapping.status === "rejected") return []
    if (mapping.status !== "verified" || mapping.confidence === "ambiguous") {
      throw new MappingError(`Mapping non vérifié pour la page source ${page.id.mspfaPageNumber}`)
    }
    return [{ ...page, mapping }]
  })
}
