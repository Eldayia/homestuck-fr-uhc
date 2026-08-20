import assert from "node:assert/strict"
import test from "node:test"

import { InputValidationError } from "../src/domain/errors.js"
import type {
  MappingProposal,
  MappingProposalDocument,
  PageClassification,
  TranslationSourceSnapshot,
} from "../src/domain/types.js"
import { createMappingReviewReport } from "../src/mapper/review-report.js"

const classifications: PageClassification[] = [
  "TEXT_TRANSLATABLE",
  "LOG_TRANSLATABLE",
  "IMAGE_TRANSLATION_REQUIRED",
  "FLASH_TRANSLATION_REQUIRED",
  "INTERACTIVE_TRANSLATION_REQUIRED",
  "UNSUPPORTED",
]
const statuses: MappingProposal["status"][] = ["mapped", "candidate", "conflict", "stale", "unresolved"]

const snapshot: TranslationSourceSnapshot = {
  schemaVersion: 1,
  provider: "fixture-review",
  adventureId: "sample-artificiel",
  metadata: { title: "SECRET MÉTADONNÉE" },
  pages: Array.from({ length: 30 }, (_, index) => ({
    pageNumber: index + 1,
    title: `SECRET TITRE ${index + 1}`,
    body: `SECRET CORPS ${index + 1}`,
    nextPageNumbers: index === 29 ? [] : [index + 2],
    classifications: [classifications[index % classifications.length] as PageClassification],
  })),
}

const proposals: MappingProposalDocument = {
  schemaVersion: 1,
  provider: snapshot.provider,
  adventureId: snapshot.adventureId,
  proposals: snapshot.pages.map((page, index) => proposal(page.pageNumber, statuses[index % statuses.length] as MappingProposal["status"])),
}

test("sélectionne vingt pages représentatives sans exposer leur texte", () => {
  const review = createMappingReviewReport(snapshot, proposals, 20)
  const selectedStatuses = new Set(review.entries.map((entry) => entry.proposal.status))
  const selectedClassifications = new Set(review.entries.flatMap((entry) => entry.page.classifications))

  assert.equal(review.entries.length, 20)
  assert.deepEqual([...selectedStatuses].sort(), [...statuses].sort())
  assert.deepEqual([...selectedClassifications].sort(), [...classifications].sort())
  assert.equal(review.entries.at(-1)?.page.pageNumber, 30)
  assert.doesNotMatch(review.markdown, /SECRET/)
  assert.doesNotMatch(review.markdown, /title|body/i)
  assert.match(review.markdown, /sha256:[0-9a-f]{64}/)
  assert.match(review.markdown, /Source revue.*UHC revue.*Décision/)
})

test("refuse une taille invalide et des propositions d'une autre source", () => {
  assert.throws(() => createMappingReviewReport(snapshot, proposals, 0), InputValidationError)
  assert.throws(() => createMappingReviewReport(snapshot, { ...proposals, adventureId: "autre" }, 20), InputValidationError)
})

function proposal(pageNumber: number, status: MappingProposal["status"]): MappingProposal {
  const homestuckOrdinal = pageNumber
  const candidate = {
    homestuckOrdinal,
    uhcMspaId: String(homestuckOrdinal + 1900).padStart(6, "0"),
    confidence: "high" as const,
    evidence: [{ type: "fixture" as const, value: "signal technique artificiel" }],
  }
  if (status === "mapped") {
    return {
      mspfaPageNumber: pageNumber,
      status,
      existing: {
        mspfaPageNumber: pageNumber,
        homestuckOrdinal,
        uhcMspaId: candidate.uhcMspaId,
        status: "verified",
        confidence: "exact",
        evidence: candidate.evidence,
      },
      candidates: [],
    }
  }
  if (status === "unresolved") return { mspfaPageNumber: pageNumber, status, candidates: [] }
  const candidates = status === "conflict"
    ? [candidate, { ...candidate, homestuckOrdinal: homestuckOrdinal + 100, uhcMspaId: String(homestuckOrdinal + 2000).padStart(6, "0") }]
    : [candidate]
  return { mspfaPageNumber: pageNumber, status, candidates }
}
