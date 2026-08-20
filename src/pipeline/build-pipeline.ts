import type { PipelineInput, PipelineResult } from "../domain/types.js"
import { createTranslation } from "../generator/uhc-mod.js"
import { assertMappingSourceHashes, attachMappings } from "../mapper/page-mapper.js"
import { normalizePage } from "../normalizer/normalize-page.js"
import { applyOverrides } from "../overrides/apply-overrides.js"
import { validatePages } from "../validator/validate-pages.js"

export async function runPipeline(input: PipelineInput): Promise<PipelineResult> {
  const snapshot = await input.source.load()
  assertMappingSourceHashes(snapshot.pages, input.mappings)
  const normalized = snapshot.pages.map((page) => normalizePage(snapshot.provider, snapshot.adventureId, page))
  const mapped = attachMappings(normalized, input.mappings)
  const overridden = applyOverrides(mapped, input.overrides)
  validatePages(overridden)

  return {
    pages: overridden,
    translation: createTranslation(overridden),
  }
}
