import type { SourceDiff, SourceState, TranslationSource } from "../domain/types.js"
import { writeStableJsonFile, writeTextFileAtomically } from "../io/write-json.js"
import { createSourceState, diffSourceStates, readSourceStateIfExists } from "./source-state.js"

export interface UpdateOptions {
  source: TranslationSource
  statePath: string
  reportPath: string
  dryRun: boolean
  now?: () => Date
}

export interface UpdateResult {
  state: SourceState
  diff: SourceDiff
  report: string
}

export async function runUpdate(options: UpdateOptions): Promise<UpdateResult> {
  const snapshot = await options.source.load()
  const now = options.now?.() ?? new Date()
  const state = createSourceState(snapshot, now.toISOString())
  const previous = await readSourceStateIfExists(options.statePath)
  const diff = diffSourceStates(previous, state)
  const report = renderUpdateReport(state, diff, options.dryRun)

  if (!options.dryRun) {
    await writeTextFileAtomically(options.reportPath, report)
    await writeStableJsonFile(options.statePath, state)
  }
  return { state, diff, report }
}

export function renderUpdateReport(state: SourceState, diff: SourceDiff, dryRun: boolean): string {
  const list = (values: number[]) => values.length === 0 ? "_Aucune._" : values.map((value) => `- Source ${value}`).join("\n")
  const moves = diff.movedCandidates.length === 0
    ? "_Aucun._"
    : diff.movedCandidates.map((move) => `- Source ${move.from} → ${move.to} (revue requise)`).join("\n")

  return `# Translation update${dryRun ? " — dry-run" : ""}

Source: ${state.provider}/${state.adventureId}

Pages scanned: ${state.pages.length}

- Unchanged: ${diff.unchanged.length}
- Metadata only: ${diff.metadataOnly.length}
- Updated: ${diff.updated.length}
- New: ${diff.new.length}
- Missing: ${diff.missing.length}
- Possible moves: ${diff.movedCandidates.length}

## New pages

${list(diff.new)}

## Updated pages

${list(diff.updated)}

## Metadata-only changes

${list(diff.metadataOnly)}

## Missing pages

${list(diff.missing)}

## Possible moves

${moves}
`
}
