import { MappingError } from "../domain/errors.js"
import type {
  MappingCandidate,
  MappingEvidence,
  MappingProposal,
  MappingProposalDocument,
  PageMapping,
  SourcePage,
  TranslationSourceSnapshot,
} from "../domain/types.js"
import { expectedUhcMspaId } from "./page-mapper.js"

export function proposeMappings(
  snapshot: TranslationSourceSnapshot,
  mappings: PageMapping[],
): MappingProposalDocument {
  const bySource = validateMappingSet(mappings)
  const verified = mappings
    .filter((mapping) => mapping.status === "verified")
    .sort((left, right) => left.mspfaPageNumber - right.mspfaPageNumber)
  const pageByNumber = new Map(snapshot.pages.map((page) => [page.pageNumber, page]))

  const proposals = snapshot.pages
    .map((page) => proposePage(page, bySource.get(page.pageNumber), verified, pageByNumber))
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
  const values = new Set<number>()
  const patterns = [
    /storyfiles\/hs2\/(\d{5})(?=\D|$)/gi,
    /\/panels\/(?:[^/\s"'\[\]]+\/)*(\d{5})(?=\D|$)/gi,
  ]
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const ordinal = Number(match[1])
      if (Number.isInteger(ordinal) && ordinal >= 1 && ordinal <= 8130) values.add(ordinal)
    }
  }
  return [...values].sort((left, right) => left - right)
}

function proposePage(
  page: SourcePage,
  existing: PageMapping | undefined,
  verified: PageMapping[],
  pageByNumber: Map<number, SourcePage>,
): MappingProposal {
  if (existing?.status === "verified") {
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

  for (const ordinal of extractHomestuckAssetOrdinals(page)) {
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
