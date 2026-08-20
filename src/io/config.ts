import type {
  ContentScope,
  DistributionPolicy,
  MappingEvidence,
  PageMapping,
  PageOverride,
  TranslationChanges,
} from "../domain/types.js"
import { InputValidationError } from "../domain/errors.js"
import {
  assertArray,
  assertRecord,
  readJsonFile,
  requiredInteger,
  requiredString,
} from "./json.js"

export async function readMappings(path: string): Promise<PageMapping[]> {
  const value = await readJsonFile(path)
  const rawPages = migrateMappingPages(value)
  return rawPages.map((entry, index) => parseMapping(entry, index))
}

function migrateMappingPages(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  assertRecord(value, "mapping")
  if (value.schemaVersion !== 1) {
    throw new InputValidationError("mapping.schemaVersion doit valoir 1")
  }
  assertArray(value.pages, "mapping.pages")
  return value.pages
}

export async function readOverrides(path: string): Promise<PageOverride[]> {
  const value = await readJsonFile(path)
  assertArray(value, "overrides")
  const overrides = value.map((entry, index) => parseOverride(entry, index))
  const seen = new Set<string>()
  for (const override of overrides) {
    if (seen.has(override.uhcMspaId)) {
      throw new InputValidationError(`Override UHC dupliqué: ${override.uhcMspaId}`)
    }
    seen.add(override.uhcMspaId)
  }
  return overrides
}

export async function readDistributionPolicy(path: string): Promise<DistributionPolicy> {
  const value = await readJsonFile(path)
  assertRecord(value, "distributionPolicy")
  if (value.schemaVersion !== 1) {
    throw new InputValidationError("distributionPolicy.schemaVersion doit valoir 1")
  }
  if (value.mode !== "tools-only" && value.mode !== "content") {
    throw new InputValidationError("distributionPolicy.mode est invalide")
  }
  if (typeof value.contentDistributionAllowed !== "boolean") {
    throw new InputValidationError("distributionPolicy.contentDistributionAllowed doit être un booléen")
  }
  assertRecord(value.decision, "distributionPolicy.decision")
  if (value.decision.status !== "not-authorized" && value.decision.status !== "authorized") {
    throw new InputValidationError("distributionPolicy.decision.status est invalide")
  }
  if (value.decision.reference !== null && typeof value.decision.reference !== "string") {
    throw new InputValidationError("distributionPolicy.decision.reference doit être une chaîne ou null")
  }
  if (value.decision.decidedAt !== null && typeof value.decision.decidedAt !== "string") {
    throw new InputValidationError("distributionPolicy.decision.decidedAt doit être une chaîne ou null")
  }
  assertArray(value.decision.scope, "distributionPolicy.decision.scope")
  const scope = value.decision.scope.map((entry) => {
    if (entry !== "translation-text" && entry !== "translated-assets") {
      throw new InputValidationError(`Périmètre de distribution inconnu: ${String(entry)}`)
    }
    return entry as ContentScope
  })

  const authorized = value.decision.status === "authorized"
  if (value.contentDistributionAllowed !== authorized) {
    throw new InputValidationError(
      "La permission de contenu doit être cohérente avec distributionPolicy.decision.status",
    )
  }
  if ((value.mode === "content") !== authorized) {
    throw new InputValidationError(
      "Le mode content n'est valide qu'avec une décision autorisée, et réciproquement",
    )
  }

  return {
    schemaVersion: 1,
    mode: value.mode,
    contentDistributionAllowed: value.contentDistributionAllowed,
    decision: {
      status: value.decision.status,
      reference: value.decision.reference,
      decidedAt: value.decision.decidedAt,
      scope,
    },
  }
}

function parseMapping(value: unknown, index: number): PageMapping {
  const label = `mapping[${index}]`
  assertRecord(value, label)
  const rawEvidence = value.evidence
  assertArray(rawEvidence, `${label}.evidence`)
  if (rawEvidence.length === 0) {
    throw new InputValidationError(`${label}.evidence ne doit pas être vide`)
  }

  const status = requiredString(value, "status", label)
  if (status !== "proposed" && status !== "verified" && status !== "rejected") {
    throw new InputValidationError(`${label}.status est invalide`)
  }
  const confidence = requiredString(value, "confidence", label)
  if (confidence !== "exact" && confidence !== "high" && confidence !== "ambiguous") {
    throw new InputValidationError(`${label}.confidence est invalide`)
  }

  const mapping: PageMapping = {
    mspfaPageNumber: requiredInteger(value, "mspfaPageNumber", label),
    homestuckOrdinal: requiredInteger(value, "homestuckOrdinal", label),
    uhcMspaId: requiredString(value, "uhcMspaId", label),
    status,
    confidence,
    evidence: rawEvidence.map((evidence, evidenceIndex) => parseEvidence(evidence, `${label}.evidence[${evidenceIndex}]`)),
  }
  if (value.sourceHash !== undefined) {
    if (typeof value.sourceHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(value.sourceHash)) {
      throw new InputValidationError(`${label}.sourceHash est invalide`)
    }
    mapping.sourceHash = value.sourceHash
  }
  if (value.lastVerified !== undefined) {
    if (typeof value.lastVerified !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.lastVerified)) {
      throw new InputValidationError(`${label}.lastVerified est invalide`)
    }
    mapping.lastVerified = value.lastVerified
  }
  return mapping
}

function parseEvidence(value: unknown, label: string): MappingEvidence {
  assertRecord(value, label)
  const type = requiredString(value, "type", label)
  if (type !== "asset-id" && type !== "manual" && type !== "navigation" && type !== "sequence" && type !== "structure" && type !== "title" && type !== "uhc-reference" && type !== "fixture") {
    throw new InputValidationError(`${label}.type est invalide`)
  }
  return { type, value: requiredString(value, "value", label) }
}

function parseOverride(value: unknown, index: number): PageOverride {
  const label = `overrides[${index}]`
  assertRecord(value, label)
  assertRecord(value.changes, `${label}.changes`)

  const changes: TranslationChanges = {}
  if (value.changes.title !== undefined && typeof value.changes.title !== "string") {
    throw new InputValidationError(`${label}.changes.title doit être une chaîne`)
  }
  if (value.changes.content !== undefined && typeof value.changes.content !== "string") {
    throw new InputValidationError(`${label}.changes.content doit être une chaîne`)
  }
  if (typeof value.changes.title === "string") changes.title = value.changes.title
  if (typeof value.changes.content === "string") changes.content = value.changes.content
  if (changes.title === undefined && changes.content === undefined) {
    throw new InputValidationError(`${label}.changes ne contient aucune modification`)
  }

  return {
    uhcMspaId: requiredString(value, "uhcMspaId", label),
    reason: requiredString(value, "reason", label),
    appliesToNormalizedHash: requiredString(value, "appliesToNormalizedHash", label),
    changes,
  }
}
