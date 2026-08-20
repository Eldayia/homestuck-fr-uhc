import type {
  PageClassification,
  SourcePage,
  TranslationSource,
  TranslationSourceSnapshot,
} from "../../src/domain/types.js"
import { InputValidationError } from "../../src/domain/errors.js"
import { sha256, stableStringify } from "../../src/domain/hash.js"
import {
  assertArray,
  assertRecord,
  readJsonFile,
} from "../../src/io/json.js"

export class MspfaSnapshotSource implements TranslationSource {
  constructor(
    private readonly path: string,
    private readonly expectedAdventureId?: string,
  ) {}

  async load(): Promise<TranslationSourceSnapshot> {
    const raw = await readJsonFile(this.path)
    return parseMspfaSnapshot(raw, this.expectedAdventureId)
  }
}

export function parseMspfaSnapshot(
  raw: unknown,
  expectedAdventureId?: string,
): TranslationSourceSnapshot {
  assertRecord(raw, "mspfa")

  const adventureId = parseAdventureId(raw.i, expectedAdventureId)
  if (expectedAdventureId !== undefined && adventureId !== expectedAdventureId) {
    throw new InputValidationError(
      `L'export MSPFA concerne l'aventure ${adventureId}, pas ${expectedAdventureId}`,
    )
  }

  if (typeof raw.n !== "string" || raw.n.length === 0) {
    throw new InputValidationError("mspfa.n doit contenir le titre de l'aventure")
  }
  assertArray(raw.p, "mspfa.p")

  const pages = raw.p.map((page, index) => parseMspfaPage(page, index))
  const snapshot: TranslationSourceSnapshot = {
    schemaVersion: 1,
    provider: "mspfa",
    adventureId,
    sourceRevision: sha256(stableStringify({ title: raw.n, pages: raw.p })),
    metadata: { title: raw.n },
    pages,
  }
  return snapshot
}

function parseAdventureId(rawId: unknown, expectedId: string | undefined): string {
  if (typeof rawId === "string" && /^\d+$/.test(rawId)) return rawId
  if (Number.isInteger(rawId) && (rawId as number) > 0) return String(rawId)
  if (expectedId !== undefined && /^\d+$/.test(expectedId)) return expectedId
  throw new InputValidationError(
    "L'export MSPFA ne contient pas d'identifiant i valide; fournir --adventure",
  )
}

function parseMspfaPage(value: unknown, index: number): SourcePage {
  const pageNumber = index + 1
  const label = `mspfa.p[${index}] (page ${pageNumber})`
  assertRecord(value, label)

  if (typeof value.c !== "string") {
    throw new InputValidationError(`${label}.c doit être une chaîne`)
  }
  if (typeof value.b !== "string") {
    throw new InputValidationError(`${label}.b doit être une chaîne`)
  }
  const rawNext = value.n ?? []
  assertArray(rawNext, `${label}.n`)
  if (!rawNext.every((next) => Number.isInteger(next) && (next as number) > 0)) {
    throw new InputValidationError(`${label}.n ne doit contenir que des numéros positifs`)
  }

  const logLabel = detectLogLabel(value.b)
  const classifications: PageClassification[] = [
    logLabel === undefined ? "TEXT_TRANSLATABLE" : "LOG_TRANSLATABLE",
  ]
  if (/\[img(?:=|\])|\.(?:avif|gif|jpe?g|png|webp)(?:[?\]"'\s]|$)/i.test(value.b)) {
    classifications.push("IMAGE_TRANSLATION_REQUIRED")
  }
  if (/\[(?:flash|object)(?:=|\])|\.swf\b/i.test(value.b)) {
    classifications.push("FLASH_TRANSLATION_REQUIRED")
  }
  if (/<\s*iframe\b|\[(?:iframe|video|youtube)(?:=|\])/i.test(value.b)) {
    classifications.push("INTERACTIVE_TRANSLATION_REQUIRED")
  }

  const page: SourcePage = {
    pageNumber,
    title: value.c,
    body: value.b,
    nextPageNumbers: rawNext as number[],
    classifications,
  }
  if (logLabel !== undefined) page.logLabel = logLabel

  if (value.d !== undefined) {
    if (typeof value.d !== "number" || !Number.isFinite(value.d)) {
      throw new InputValidationError(`${label}.d doit être un horodatage numérique`)
    }
    const date = new Date(value.d)
    if (Number.isNaN(date.getTime())) {
      throw new InputValidationError(`${label}.d est hors plage`)
    }
    page.modifiedAt = date.toISOString()
  }

  return page
}

function detectLogLabel(body: string): NonNullable<SourcePage["logLabel"]> | undefined {
  const match = body.match(/\[spoiler=(PESTERLOG|DIALOGLOG|SPRITELOG)\]/i)
  return match?.[1]?.toUpperCase() as NonNullable<SourcePage["logLabel"]> | undefined
}
