import type {
  MappingProposal,
  PageClassification,
  PageMapping,
  PageOverride,
  TranslationSourceSnapshot,
  UhcReferenceDocument,
} from "../domain/types.js"
import { proposeMappings } from "../mapper/propose-mappings.js"
import { normalizePage } from "../normalizer/normalize-page.js"

export interface ProjectStatus {
  provider: string
  adventureId: string
  sourcePages: number
  mappings: Record<PageMapping["status"], number>
  proposals: Record<MappingProposal["status"], number>
  classifications: Record<PageClassification, number>
  overrides: number
  overrideConflicts: string[]
  verifiedCoveragePercent: number
}

const MAPPING_STATUSES: PageMapping["status"][] = ["verified", "proposed", "rejected"]
const PROPOSAL_STATUSES: MappingProposal["status"][] = ["mapped", "candidate", "conflict", "stale", "unresolved"]
const CLASSIFICATIONS: PageClassification[] = [
  "TEXT_TRANSLATABLE",
  "LOG_TRANSLATABLE",
  "IMAGE_TRANSLATION_REQUIRED",
  "FLASH_TRANSLATION_REQUIRED",
  "INTERACTIVE_TRANSLATION_REQUIRED",
  "UNSUPPORTED",
]

export function createProjectStatus(
  snapshot: TranslationSourceSnapshot,
  mappings: PageMapping[],
  overrides: PageOverride[],
  reference?: UhcReferenceDocument,
): ProjectStatus {
  const proposalDocument = proposeMappings(snapshot, mappings, reference)
  const mappingCounts = Object.fromEntries(MAPPING_STATUSES.map((status) => [status, mappings.filter((mapping) => mapping.status === status).length])) as ProjectStatus["mappings"]
  const proposalCounts = Object.fromEntries(PROPOSAL_STATUSES.map((status) => [status, proposalDocument.proposals.filter((proposal) => proposal.status === status).length])) as ProjectStatus["proposals"]
  const classificationCounts = Object.fromEntries(CLASSIFICATIONS.map((classification) => [
    classification,
    snapshot.pages.filter((page) => page.classifications.includes(classification)).length,
  ])) as ProjectStatus["classifications"]
  const coverage = snapshot.pages.length === 0 ? 0 : proposalCounts.mapped / snapshot.pages.length * 100
  const pageByNumber = new Map(snapshot.pages.map((page) => [page.pageNumber, page]))
  const mappingByUhc = new Map(mappings.map((mapping) => [mapping.uhcMspaId, mapping]))
  const overrideConflicts = overrides.flatMap((override) => {
    const mapping = mappingByUhc.get(override.uhcMspaId)
    const page = mapping === undefined ? undefined : pageByNumber.get(mapping.mspfaPageNumber)
    if (mapping?.status !== "verified" || page === undefined) return [override.uhcMspaId]
    const normalized = normalizePage(snapshot.provider, snapshot.adventureId, page)
    return normalized.source.normalizedHash === override.appliesToNormalizedHash ? [] : [override.uhcMspaId]
  }).sort()
  return {
    provider: snapshot.provider,
    adventureId: snapshot.adventureId,
    sourcePages: snapshot.pages.length,
    mappings: mappingCounts,
    proposals: proposalCounts,
    classifications: classificationCounts,
    overrides: overrides.length,
    overrideConflicts,
    verifiedCoveragePercent: Number(coverage.toFixed(2)),
  }
}

export function renderProjectStatus(status: ProjectStatus): string {
  return [
    `Source: ${status.provider}/${status.adventureId}`,
    `Pages source: ${status.sourcePages}`,
    `Couverture vérifiée actuelle: ${status.verifiedCoveragePercent.toFixed(2)}%`,
    "",
    "Mappings persistants:",
    `- verified: ${status.mappings.verified}`,
    `- proposed: ${status.mappings.proposed}`,
    `- rejected: ${status.mappings.rejected}`,
    `- overrides: ${status.overrides}`,
    `- overrides en conflit: ${status.overrideConflicts.length}${status.overrideConflicts.length === 0 ? "" : ` (${status.overrideConflicts.join(", ")})`}`,
    "",
    "État des pages:",
    `- mapped: ${status.proposals.mapped}`,
    `- candidate: ${status.proposals.candidate}`,
    `- conflict: ${status.proposals.conflict}`,
    `- stale: ${status.proposals.stale}`,
    `- unresolved: ${status.proposals.unresolved}`,
    "",
    "Pages spéciales:",
    `- logs: ${status.classifications.LOG_TRANSLATABLE}`,
    `- images: ${status.classifications.IMAGE_TRANSLATION_REQUIRED}`,
    `- Flash: ${status.classifications.FLASH_TRANSLATION_REQUIRED}`,
    `- interactives: ${status.classifications.INTERACTIVE_TRANSLATION_REQUIRED}`,
    `- unsupported: ${status.classifications.UNSUPPORTED}`,
  ].join("\n")
}
