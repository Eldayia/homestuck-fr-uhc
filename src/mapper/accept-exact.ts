import type { MappingProposalDocument, PageMapping, TranslationSourceSnapshot } from "../domain/types.js"
import { sourcePageHash } from "./page-mapper.js"

export function acceptConflictFreeExactMappings(
  snapshot: TranslationSourceSnapshot,
  proposals: MappingProposalDocument,
): PageMapping[] {
  const targetCounts = new Map<string, number>()
  for (const proposal of proposals.proposals) {
    for (const candidate of proposal.candidates) {
      if (candidate.confidence === "exact") {
        targetCounts.set(candidate.uhcMspaId, (targetCounts.get(candidate.uhcMspaId) ?? 0) + 1)
      }
    }
  }

  const pages = new Map(snapshot.pages.map((page) => [page.pageNumber, page]))
  return proposals.proposals.flatMap((proposal): PageMapping[] => {
    const exact = proposal.candidates.filter((candidate) => candidate.confidence === "exact")
    if (exact.length !== 1) return []
    const candidate = exact[0]
    const page = pages.get(proposal.mspfaPageNumber)
    if (candidate === undefined || page === undefined || targetCounts.get(candidate.uhcMspaId) !== 1) return []
    return [{
      mspfaPageNumber: proposal.mspfaPageNumber,
      homestuckOrdinal: candidate.homestuckOrdinal,
      uhcMspaId: candidate.uhcMspaId,
      status: "verified",
      confidence: "exact",
      sourceHash: sourcePageHash(page),
      evidence: [
        ...candidate.evidence,
        { type: "manual", value: "acceptation explicite du candidat exact sans conflit" },
      ],
    }]
  })
}
