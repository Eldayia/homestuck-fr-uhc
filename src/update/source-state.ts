import { access } from "node:fs/promises"

import { InputValidationError } from "../domain/errors.js"
import { sha256, stableStringify } from "../domain/hash.js"
import type {
  SourceDiff,
  SourceState,
  SourceStatePage,
  TranslationSourceSnapshot,
} from "../domain/types.js"
import { assertArray, assertRecord, readJsonFile } from "../io/json.js"

export function createSourceState(
  snapshot: TranslationSourceSnapshot,
  generatedAt: string,
): SourceState {
  const pages = snapshot.pages.map((page): SourceStatePage => {
    const state: SourceStatePage = {
      pageNumber: page.pageNumber,
      rawHash: sha256(stableStringify(page)),
      normalizedHash: sha256(stableStringify({
        title: normalizeLineEndings(page.title),
        body: normalizeLineEndings(page.body),
        logLabel: page.logLabel ?? null,
        nextPageNumbers: page.nextPageNumbers,
        classifications: page.classifications,
      })),
    }
    if (page.modifiedAt !== undefined) state.modifiedAt = page.modifiedAt
    return state
  }).sort((left, right) => left.pageNumber - right.pageNumber)

  const state: SourceState = {
    schemaVersion: 1,
    provider: snapshot.provider,
    adventureId: snapshot.adventureId,
    generatedAt,
    pages,
  }
  if (snapshot.sourceRevision !== undefined) state.sourceRevision = snapshot.sourceRevision
  return state
}

export function diffSourceStates(previous: SourceState | undefined, next: SourceState): SourceDiff {
  if (previous !== undefined && (
    previous.provider !== next.provider
    || previous.adventureId !== next.adventureId
  )) {
    throw new InputValidationError("L'état précédent concerne une autre source de traduction")
  }

  const oldPages = new Map((previous?.pages ?? []).map((page) => [page.pageNumber, page]))
  const newPages = new Map(next.pages.map((page) => [page.pageNumber, page]))
  const diff: SourceDiff = {
    unchanged: [],
    metadataOnly: [],
    updated: [],
    new: [],
    missing: [],
    movedCandidates: [],
  }

  for (const page of next.pages) {
    const old = oldPages.get(page.pageNumber)
    if (old === undefined) diff.new.push(page.pageNumber)
    else if (old.rawHash === page.rawHash) diff.unchanged.push(page.pageNumber)
    else if (old.normalizedHash === page.normalizedHash) diff.metadataOnly.push(page.pageNumber)
    else diff.updated.push(page.pageNumber)
  }
  for (const page of previous?.pages ?? []) {
    if (!newPages.has(page.pageNumber)) diff.missing.push(page.pageNumber)
  }

  const missingByHash = new Map<string, number[]>()
  for (const pageNumber of diff.missing) {
    const page = oldPages.get(pageNumber)
    if (page === undefined) continue
    const candidates = missingByHash.get(page.normalizedHash) ?? []
    candidates.push(pageNumber)
    missingByHash.set(page.normalizedHash, candidates)
  }
  for (const pageNumber of diff.new) {
    const page = newPages.get(pageNumber)
    if (page === undefined) continue
    for (const from of missingByHash.get(page.normalizedHash) ?? []) {
      diff.movedCandidates.push({ from, to: pageNumber, normalizedHash: page.normalizedHash })
    }
  }
  return diff
}

export async function readSourceStateIfExists(path: string): Promise<SourceState | undefined> {
  try {
    await access(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined
    throw new InputValidationError(`Impossible d'accéder à l'état source: ${error instanceof Error ? error.message : String(error)}`)
  }
  const raw = await readJsonFile(path)
  assertRecord(raw, "sourceState")
  if (raw.schemaVersion !== 1) throw new InputValidationError("sourceState.schemaVersion doit valoir 1")
  if (
    typeof raw.provider !== "string"
    || typeof raw.adventureId !== "string"
    || typeof raw.generatedAt !== "string"
    || Number.isNaN(Date.parse(raw.generatedAt))
  ) {
    throw new InputValidationError("sourceState contient des métadonnées invalides")
  }
  if (raw.sourceRevision !== undefined && typeof raw.sourceRevision !== "string") {
    throw new InputValidationError("sourceState.sourceRevision doit être une chaîne")
  }
  assertArray(raw.pages, "sourceState.pages")
  const seen = new Set<number>()
  const pages = raw.pages.map((value, index): SourceStatePage => {
    assertRecord(value, `sourceState.pages[${index}]`)
    if (
      !Number.isInteger(value.pageNumber)
      || (value.pageNumber as number) < 1
      || typeof value.rawHash !== "string"
      || !/^sha256:[0-9a-f]{64}$/.test(value.rawHash)
      || typeof value.normalizedHash !== "string"
      || !/^sha256:[0-9a-f]{64}$/.test(value.normalizedHash)
    ) {
      throw new InputValidationError(`sourceState.pages[${index}] est invalide`)
    }
    if (seen.has(value.pageNumber as number)) {
      throw new InputValidationError(`Numéro dupliqué dans sourceState: ${value.pageNumber as number}`)
    }
    seen.add(value.pageNumber as number)
    if (value.modifiedAt !== undefined && (
      typeof value.modifiedAt !== "string"
      || Number.isNaN(Date.parse(value.modifiedAt))
    )) {
      throw new InputValidationError(`sourceState.pages[${index}].modifiedAt est invalide`)
    }
    const page: SourceStatePage = {
      pageNumber: value.pageNumber as number,
      rawHash: value.rawHash,
      normalizedHash: value.normalizedHash,
    }
    if (typeof value.modifiedAt === "string") page.modifiedAt = value.modifiedAt
    return page
  })
  const state: SourceState = {
    schemaVersion: 1,
    provider: raw.provider,
    adventureId: raw.adventureId,
    generatedAt: raw.generatedAt,
    pages,
  }
  if (typeof raw.sourceRevision === "string") state.sourceRevision = raw.sourceRevision
  return state
}

function normalizeLineEndings(value: string | undefined): string | null {
  return value === undefined ? null : value.replace(/\r\n?/g, "\n")
}
