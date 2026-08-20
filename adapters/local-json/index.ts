import type {
  PageClassification,
  SourcePage,
  TranslationSource,
  TranslationSourceSnapshot,
} from "../../src/domain/types.js"
import { InputValidationError } from "../../src/domain/errors.js"
import {
  assertArray,
  assertRecord,
  readJsonFile,
  requiredInteger,
  requiredString,
} from "../../src/io/json.js"

const CLASSIFICATIONS = new Set<PageClassification>([
  "TEXT_TRANSLATABLE",
  "LOG_TRANSLATABLE",
  "IMAGE_TRANSLATION_REQUIRED",
  "FLASH_TRANSLATION_REQUIRED",
  "INTERACTIVE_TRANSLATION_REQUIRED",
  "UNSUPPORTED",
])

const LOG_LABELS = new Set(["PESTERLOG", "DIALOGLOG", "SPRITELOG"] as const)

export class LocalJsonSource implements TranslationSource {
  constructor(private readonly path: string) {}

  async load(): Promise<TranslationSourceSnapshot> {
    const value = await readJsonFile(this.path)
    assertRecord(value, "source")

    const provider = requiredString(value, "provider", "source")
    const adventureId = requiredString(value, "adventureId", "source")
    const rawPages = value.pages
    assertArray(rawPages, "source.pages")

    const pages = rawPages.map((page, index) => parsePage(page, index))
    const seen = new Set<number>()
    for (const page of pages) {
      if (seen.has(page.pageNumber)) {
        throw new InputValidationError(`Numéro de page source dupliqué: ${page.pageNumber}`)
      }
      seen.add(page.pageNumber)
    }

    const snapshot: TranslationSourceSnapshot = { provider, adventureId, pages }
    if (typeof value.sourceRevision === "string") {
      snapshot.sourceRevision = value.sourceRevision
    }
    return snapshot
  }
}

function parsePage(value: unknown, index: number): SourcePage {
  const label = `source.pages[${index}]`
  assertRecord(value, label)

  const pageNumber = requiredInteger(value, "pageNumber", label)
  if (pageNumber < 1) {
    throw new InputValidationError(`${label}.pageNumber doit être positif`)
  }

  const rawNext = value.nextPageNumbers ?? []
  assertArray(rawNext, `${label}.nextPageNumbers`)
  if (!rawNext.every((pageNumber) => Number.isInteger(pageNumber) && (pageNumber as number) > 0)) {
    throw new InputValidationError(`${label}.nextPageNumbers ne doit contenir que des entiers positifs`)
  }

  const rawClassifications = value.classifications ?? ["TEXT_TRANSLATABLE"]
  assertArray(rawClassifications, `${label}.classifications`)
  const classifications = rawClassifications.map((classification) => {
    if (typeof classification !== "string" || !CLASSIFICATIONS.has(classification as PageClassification)) {
      throw new InputValidationError(`${label}: classification inconnue ${String(classification)}`)
    }
    return classification as PageClassification
  })

  const page: SourcePage = {
    pageNumber,
    nextPageNumbers: rawNext as number[],
    classifications,
  }

  if (value.title !== undefined && typeof value.title !== "string") {
    throw new InputValidationError(`${label}.title doit être une chaîne`)
  }
  if (value.body !== undefined && typeof value.body !== "string") {
    throw new InputValidationError(`${label}.body doit être une chaîne`)
  }
  if (value.modifiedAt !== undefined && typeof value.modifiedAt !== "string") {
    throw new InputValidationError(`${label}.modifiedAt doit être une chaîne`)
  }
  if (typeof value.title === "string") page.title = value.title
  if (typeof value.body === "string") page.body = value.body
  if (typeof value.modifiedAt === "string") page.modifiedAt = value.modifiedAt
  if (value.logLabel !== undefined) {
    if (typeof value.logLabel !== "string" || !LOG_LABELS.has(value.logLabel as never)) {
      throw new InputValidationError(`${label}.logLabel est invalide`)
    }
    page.logLabel = value.logLabel as NonNullable<SourcePage["logLabel"]>
  }

  return page
}
