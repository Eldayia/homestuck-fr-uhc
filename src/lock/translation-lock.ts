import { InputValidationError } from "../domain/errors.js"
import { sha256, stableStringify } from "../domain/hash.js"
import type { PageMapping, PageOverride, TranslationSourceSnapshot } from "../domain/types.js"
import { MOD_VERSION, TOOL_VERSION } from "../domain/version.js"
import { assertRecord, readJsonFile } from "../io/json.js"

export interface TranslationLock {
  schemaVersion: 1
  toolVersion: string
  modVersion: number
  source: {
    provider: string
    adventureId: string
    sourceRevision: string | null
    snapshotHash: string
  }
  mappingsHash: string
  overridesHash: string
}

export function createTranslationLock(
  snapshot: TranslationSourceSnapshot,
  mappings: PageMapping[],
  overrides: PageOverride[],
): TranslationLock {
  const orderedMappings = [...mappings].sort((left, right) => left.mspfaPageNumber - right.mspfaPageNumber)
  const orderedOverrides = [...overrides].sort((left, right) => left.uhcMspaId.localeCompare(right.uhcMspaId))
  return {
    schemaVersion: 1,
    toolVersion: TOOL_VERSION,
    modVersion: MOD_VERSION,
    source: {
      provider: snapshot.provider,
      adventureId: snapshot.adventureId,
      sourceRevision: snapshot.sourceRevision ?? null,
      snapshotHash: sha256(stableStringify(snapshot)),
    },
    mappingsHash: sha256(stableStringify(orderedMappings)),
    overridesHash: sha256(stableStringify(orderedOverrides)),
  }
}

export async function readTranslationLock(path: string): Promise<TranslationLock> {
  const value = await readJsonFile(path)
  assertRecord(value, "translationLock")
  assertRecord(value.source, "translationLock.source")
  if (
    value.schemaVersion !== 1
    || typeof value.toolVersion !== "string"
    || !Number.isInteger(value.modVersion)
    || typeof value.source.provider !== "string"
    || typeof value.source.adventureId !== "string"
    || (value.source.sourceRevision !== null && typeof value.source.sourceRevision !== "string")
    || !isHash(value.source.snapshotHash)
    || !isHash(value.mappingsHash)
    || !isHash(value.overridesHash)
  ) {
    throw new InputValidationError("translation-lock.json est invalide")
  }
  return {
    schemaVersion: 1,
    toolVersion: value.toolVersion,
    modVersion: value.modVersion as number,
    source: {
      provider: value.source.provider,
      adventureId: value.source.adventureId,
      sourceRevision: value.source.sourceRevision,
      snapshotHash: value.source.snapshotHash,
    },
    mappingsHash: value.mappingsHash,
    overridesHash: value.overridesHash,
  }
}

export function assertTranslationLock(expected: TranslationLock, actual: TranslationLock): void {
  const fields: Array<[string, unknown, unknown]> = [
    ["toolVersion", expected.toolVersion, actual.toolVersion],
    ["modVersion", expected.modVersion, actual.modVersion],
    ["source.provider", expected.source.provider, actual.source.provider],
    ["source.adventureId", expected.source.adventureId, actual.source.adventureId],
    ["source.sourceRevision", expected.source.sourceRevision, actual.source.sourceRevision],
    ["source.snapshotHash", expected.source.snapshotHash, actual.source.snapshotHash],
    ["mappingsHash", expected.mappingsHash, actual.mappingsHash],
    ["overridesHash", expected.overridesHash, actual.overridesHash],
  ]
  const mismatch = fields.find(([, expectedValue, actualValue]) => expectedValue !== actualValue)
  if (mismatch !== undefined) {
    throw new InputValidationError(`Verrou de traduction incompatible: ${mismatch[0]} a changé`)
  }
}

function isHash(value: unknown): value is string {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/.test(value)
}
