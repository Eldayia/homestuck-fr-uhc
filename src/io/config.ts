import type {
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
  assertArray(value, "mapping")
  return value.map((entry, index) => parseMapping(entry, index))
}

export async function readOverrides(path: string): Promise<PageOverride[]> {
  const value = await readJsonFile(path)
  assertArray(value, "overrides")
  return value.map((entry, index) => parseOverride(entry, index))
}

export async function readDistributionPolicy(path: string): Promise<DistributionPolicy> {
  const value = await readJsonFile(path)
  assertRecord(value, "distributionPolicy")
  if (typeof value.contentDistributionAllowed !== "boolean") {
    throw new InputValidationError("distributionPolicy.contentDistributionAllowed doit être un booléen")
  }
  if (value.decisionReference !== null && typeof value.decisionReference !== "string") {
    throw new InputValidationError("distributionPolicy.decisionReference doit être une chaîne ou null")
  }
  return {
    contentDistributionAllowed: value.contentDistributionAllowed,
    decisionReference: value.decisionReference,
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
  if (typeof value.lastVerified === "string") mapping.lastVerified = value.lastVerified
  return mapping
}

function parseEvidence(value: unknown, label: string): MappingEvidence {
  assertRecord(value, label)
  const type = requiredString(value, "type", label)
  if (type !== "asset-id" && type !== "manual" && type !== "navigation" && type !== "title" && type !== "fixture") {
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
