import { InputValidationError } from "../domain/errors.js"
import { sha256, stableStringify } from "../domain/hash.js"
import type { UhcReferenceDocument, UhcReferencePage } from "../domain/types.js"
import { assertArray, assertRecord, readJsonFile, requiredInteger, requiredString } from "../io/json.js"
import { extractHomestuckAssetOrdinalsFromText } from "./asset-identifiers.js"

const FIRST_HOMESTUCK_MSPA_ID = 1901
const LAST_HOMESTUCK_MSPA_ID = 10030

export async function buildUhcReference(path: string): Promise<UhcReferenceDocument> {
  const raw = await readJsonFile(path)
  assertRecord(raw, "archive UHC")
  assertRecord(raw.story, "archive UHC.story")

  const pages: UhcReferencePage[] = []
  for (const [uhcMspaId, value] of Object.entries(raw.story)) {
    if (!/^\d{6}$/.test(uhcMspaId)) continue
    const numericId = Number(uhcMspaId)
    if (numericId < FIRST_HOMESTUCK_MSPA_ID || numericId > LAST_HOMESTUCK_MSPA_ID) continue
    assertRecord(value, `archive UHC.story.${uhcMspaId}`)
    pages.push(toReferencePage(uhcMspaId, value))
  }

  pages.sort((left, right) => left.homestuckOrdinal - right.homestuckOrdinal)
  if (pages.length === 0) {
    throw new InputValidationError("archive UHC.story ne contient aucune page Homestuck reconnue")
  }
  return {
    schemaVersion: 1,
    sourceHash: sha256(stableStringify(raw.story)),
    pages,
  }
}

export async function readUhcReference(path: string): Promise<UhcReferenceDocument> {
  const raw = await readJsonFile(path)
  assertRecord(raw, "uhcReference")
  if (raw.schemaVersion !== 1) throw new InputValidationError("uhcReference.schemaVersion doit valoir 1")
  if (typeof raw.sourceHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(raw.sourceHash)) {
    throw new InputValidationError("uhcReference.sourceHash est invalide")
  }
  assertArray(raw.pages, "uhcReference.pages")

  const seenOrdinals = new Set<number>()
  const pages = raw.pages.map((entry, index) => parseReferencePage(entry, index, seenOrdinals))
  return { schemaVersion: 1, sourceHash: raw.sourceHash, pages }
}

export function hashComparableTitle(title: string): string {
  return sha256(title.replace(/\r\n?/g, "\n").trim().replace(/\s+/g, " ").toLocaleLowerCase("fr"))
}

function toReferencePage(uhcMspaId: string, value: Record<string, unknown>): UhcReferencePage {
  const title = optionalString(value.title, `archive UHC.story.${uhcMspaId}.title`)
  const content = optionalString(value.content, `archive UHC.story.${uhcMspaId}.content`) ?? ""
  const media = value.media === undefined ? [] : parseMedia(value.media, `archive UHC.story.${uhcMspaId}.media`)
  const mediaAssetOrdinals = extractHomestuckAssetOrdinalsFromText(media.join("\n"))
  const page: UhcReferencePage = {
    homestuckOrdinal: Number(uhcMspaId) - 1900,
    uhcMspaId,
    mediaAssetOrdinals,
    mediaCount: media.length,
    hasContent: content.trim().length > 0,
    isLog: /^\s*\|(?:PESTERLOG|DIALOGLOG|SPRITELOG)\|/i.test(content),
  }
  if (title !== undefined) page.titleHash = hashComparableTitle(title)
  return page
}

function parseReferencePage(value: unknown, index: number, seenOrdinals: Set<number>): UhcReferencePage {
  const label = `uhcReference.pages[${index}]`
  assertRecord(value, label)
  const homestuckOrdinal = requiredInteger(value, "homestuckOrdinal", label)
  const uhcMspaId = requiredString(value, "uhcMspaId", label)
  if (homestuckOrdinal < 1 || homestuckOrdinal > 8130) throw new InputValidationError(`${label}.homestuckOrdinal est hors plage`)
  if (uhcMspaId !== String(homestuckOrdinal + 1900).padStart(6, "0")) throw new InputValidationError(`${label}.uhcMspaId est incohérent`)
  if (seenOrdinals.has(homestuckOrdinal)) throw new InputValidationError(`Ordinal UHC dupliqué: ${homestuckOrdinal}`)
  seenOrdinals.add(homestuckOrdinal)
  assertArray(value.mediaAssetOrdinals, `${label}.mediaAssetOrdinals`)
  const mediaAssetOrdinals = value.mediaAssetOrdinals.map((entry) => {
    if (!Number.isInteger(entry) || (entry as number) < 1 || (entry as number) > 8130) {
      throw new InputValidationError(`${label}.mediaAssetOrdinals contient une valeur invalide`)
    }
    return entry as number
  })
  const mediaCount = requiredInteger(value, "mediaCount", label)
  if (mediaCount < 0) throw new InputValidationError(`${label}.mediaCount est invalide`)
  if (typeof value.hasContent !== "boolean" || typeof value.isLog !== "boolean") {
    throw new InputValidationError(`${label} contient une structure invalide`)
  }
  const page: UhcReferencePage = { homestuckOrdinal, uhcMspaId, mediaAssetOrdinals, mediaCount, hasContent: value.hasContent, isLog: value.isLog }
  if (value.titleHash !== undefined) {
    if (typeof value.titleHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(value.titleHash)) {
      throw new InputValidationError(`${label}.titleHash est invalide`)
    }
    page.titleHash = value.titleHash
  }
  return page
}

function optionalString(value: unknown, label: string): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== "string") throw new InputValidationError(`${label} doit être une chaîne`)
  return value
}

function parseMedia(value: unknown, label: string): string[] {
  assertArray(value, label)
  return value.map((entry, index) => {
    if (typeof entry !== "string") throw new InputValidationError(`${label}[${index}] doit être une chaîne`)
    return entry
  })
}
