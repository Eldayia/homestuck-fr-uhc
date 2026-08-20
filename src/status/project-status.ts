import type {
  MappingProposal,
  PageClassification,
  PageMapping,
  TranslationSourceSnapshot,
  UhcReferenceDocument,
} from "../domain/types.js"
import { proposeMappings } from "../mapper/propose-mappings.js"

export interface ProjectStatus {
  provider: string
  adventureId: string
  sourcePages: number
  mappings: Record<PageMapping["status"], number>
  proposals: Record<MappingProposal["status"], number>
  classifications: Record<PageClassification, number>
  overrides: number
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
  overrides: number,
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
  return {
    provider: snapshot.provider,
    adventureId: snapshot.adventureId,
    sourcePages: snapshot.pages.length,
    mappings: mappingCounts,
    proposals: proposalCounts,
    classifications: classificationCounts,
    overrides,
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
