import { MappingError } from "../domain/errors.js"
import type {
  MappingCandidate,
  MappingEvidence,
  MappingProposal,
  MappingProposalDocument,
  PageMapping,
  SourcePage,
  TranslationSourceSnapshot,
  UhcReferenceDocument,
  UhcReferencePage,
} from "../domain/types.js"
import { extractHomestuckAssetOrdinalsFromText } from "./asset-identifiers.js"
import { expectedUhcMspaId, sourcePageHash } from "./page-mapper.js"
import { hashComparableTitle } from "./uhc-reference.js"

export { extractHomestuckAssetOrdinalsFromText } from "./asset-identifiers.js"

export function proposeMappings(
  snapshot: TranslationSourceSnapshot,
  mappings: PageMapping[],
  reference?: UhcReferenceDocument,
): MappingProposalDocument {
  const bySource = validateMappingSet(mappings)
  const pageByNumber = new Map(snapshot.pages.map((page) => [page.pageNumber, page]))
  const verified = mappings
    .filter((mapping) => mapping.status === "verified" && !isMappingStale(mapping, pageByNumber.get(mapping.mspfaPageNumber)))
    .sort((left, right) => left.mspfaPageNumber - right.mspfaPageNumber)
  const referenceByOrdinal = new Map(reference?.pages.map((page) => [page.homestuckOrdinal, page]) ?? [])

  const proposals = snapshot.pages
    .map((page) => proposePage(page, bySource.get(page.pageNumber), verified, pageByNumber, referenceByOrdinal))
    .sort((left, right) => left.mspfaPageNumber - right.mspfaPageNumber)

  const document: MappingProposalDocument = {
    schemaVersion: 1,
    provider: snapshot.provider,
    adventureId: snapshot.adventureId,
    proposals,
  }
  if (snapshot.sourceRevision !== undefined) document.sourceRevision = snapshot.sourceRevision
  return document
}

export function extractHomestuckAssetOrdinals(page: SourcePage): number[] {
  const content = `${page.title ?? ""}\n${page.body ?? ""}`
  return extractHomestuckAssetOrdinalsFromText(content)
}

function proposePage(
  page: SourcePage,
  existing: PageMapping | undefined,
  verified: PageMapping[],
  pageByNumber: Map<number, SourcePage>,
  referenceByOrdinal: Map<number, UhcReferencePage>,
): MappingProposal {
  if (existing?.status === "verified") {
    if (isMappingStale(existing, page)) {
      return {
        mspfaPageNumber: page.pageNumber,
        status: "stale",
        existing,
        candidates: [{
          homestuckOrdinal: existing.homestuckOrdinal,
          uhcMspaId: existing.uhcMspaId,
          confidence: "ambiguous",
          evidence: [
            ...existing.evidence,
            { type: "manual", value: "hash source modifié ; nouvelle revue requise" },
          ],
        }],
      }
    }
    return {
      mspfaPageNumber: page.pageNumber,
      status: "mapped",
      existing,
      candidates: [],
    }
  }

  const evidenceByOrdinal = new Map<number, MappingEvidence[]>()
  const add = (ordinal: number, evidence: MappingEvidence) => {
    if (ordinal < 1 || ordinal > 8130) return
    const list = evidenceByOrdinal.get(ordinal) ?? []
    if (!list.some((item) => item.type === evidence.type && item.value === evidence.value)) list.push(evidence)
    evidenceByOrdinal.set(ordinal, list)
  }

  const sourceAssetOrdinals = extractHomestuckAssetOrdinals(page)
  for (const ordinal of sourceAssetOrdinals) {
    add(ordinal, { type: "asset-id", value: `asset Homestuck ${String(ordinal).padStart(5, "0")}` })
  }

  if (existing?.status === "proposed") {
    for (const evidence of existing.evidence) add(existing.homestuckOrdinal, evidence)
  }

  for (const anchor of verified) {
    const anchorPage = pageByNumber.get(anchor.mspfaPageNumber)
    if (anchorPage?.nextPageNumbers.includes(page.pageNumber)) {
      add(anchor.homestuckOrdinal + 1, {
        type: "navigation",
        value: `source ${anchor.mspfaPageNumber} → ${page.pageNumber}`,
      })
    }
    if (page.nextPageNumbers.includes(anchor.mspfaPageNumber)) {
      add(anchor.homestuckOrdinal - 1, {
        type: "navigation",
        value: `source ${page.pageNumber} → ${anchor.mspfaPageNumber}`,
      })
    }
  }

  const previous = [...verified].reverse().find((mapping) => mapping.mspfaPageNumber < page.pageNumber)
  const next = verified.find((mapping) => mapping.mspfaPageNumber > page.pageNumber)
  if (previous !== undefined) {
    add(previous.homestuckOrdinal + page.pageNumber - previous.mspfaPageNumber, {
      type: "sequence",
      value: `projection depuis l'ancre source ${previous.mspfaPageNumber}`,
    })
  }
  if (next !== undefined) {
    add(next.homestuckOrdinal - (next.mspfaPageNumber - page.pageNumber), {
      type: "sequence",
      value: `projection depuis l'ancre source ${next.mspfaPageNumber}`,
    })
  }

  for (const [ordinal, evidence] of evidenceByOrdinal) {
    enrichWithUhcReference(page, sourceAssetOrdinals, referenceByOrdinal.get(ordinal), evidence)
  }

  const candidates = [...evidenceByOrdinal.entries()]
    .map(([homestuckOrdinal, evidence]): MappingCandidate => ({
      homestuckOrdinal,
      uhcMspaId: expectedUhcMspaId(homestuckOrdinal),
      confidence: evidence.some((item) => item.type === "asset-id")
        ? "exact"
        : evidence.length >= 2 ? "high" : "ambiguous",
      evidence,
    }))
    .sort((left, right) => left.homestuckOrdinal - right.homestuckOrdinal)

  return {
    mspfaPageNumber: page.pageNumber,
    status: candidates.length === 0 ? "unresolved" : candidates.length === 1 ? "candidate" : "conflict",
    candidates,
  }
}

function enrichWithUhcReference(
  page: SourcePage,
  sourceAssetOrdinals: number[],
  reference: UhcReferencePage | undefined,
  evidence: MappingEvidence[],
): void {
  if (reference === undefined) return
  const add = (item: MappingEvidence) => {
    if (!evidence.some((existing) => existing.type === item.type && existing.value === item.value)) evidence.push(item)
  }
  const sharedAssets = sourceAssetOrdinals.filter((ordinal) => reference.mediaAssetOrdinals.includes(ordinal))
  if (sharedAssets.length > 0) {
    add({ type: "uhc-reference", value: `asset confirmé dans la page UHC ${reference.uhcMspaId}` })
  }
  if (page.title !== undefined && reference.titleHash === hashComparableTitle(page.title)) {
    add({ type: "title", value: `hash de titre identique à la page UHC ${reference.uhcMspaId}` })
  }
  const sourceIsLog = page.logLabel !== undefined || page.classifications.includes("LOG_TRANSLATABLE")
  if (sourceIsLog && reference.isLog) {
    add({ type: "structure", value: `structure de log confirmée par la page UHC ${reference.uhcMspaId}` })
  }
  if (sourceAssetOrdinals.length > 0 && sourceAssetOrdinals.length === reference.mediaCount) {
    add({ type: "structure", value: `même nombre de médias que la page UHC ${reference.uhcMspaId}` })
  }
}

function isMappingStale(mapping: PageMapping, page: SourcePage | undefined): boolean {
  return mapping.sourceHash !== undefined && page !== undefined && mapping.sourceHash !== sourcePageHash(page)
}

export function validateMappingSet(mappings: PageMapping[]): Map<number, PageMapping> {
  const bySource = new Map<number, PageMapping>()
  const byUhc = new Map<string, PageMapping>()
  for (const mapping of mappings) {
    if (bySource.has(mapping.mspfaPageNumber)) throw new MappingError(`Mapping source dupliqué: ${mapping.mspfaPageNumber}`)
    if (mapping.status !== "rejected" && byUhc.has(mapping.uhcMspaId)) {
      throw new MappingError(`Mapping UHC dupliqué: ${mapping.uhcMspaId}`)
    }
    if (mapping.uhcMspaId !== expectedUhcMspaId(mapping.homestuckOrdinal)) {
      throw new MappingError(`ID UHC incohérent pour la source ${mapping.mspfaPageNumber}`)
    }
    bySource.set(mapping.mspfaPageNumber, mapping)
    if (mapping.status !== "rejected") byUhc.set(mapping.uhcMspaId, mapping)
  }
  return bySource
}
