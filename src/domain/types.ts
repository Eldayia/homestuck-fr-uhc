export type PageClassification =
  | "TEXT_TRANSLATABLE"
  | "LOG_TRANSLATABLE"
  | "IMAGE_TRANSLATION_REQUIRED"
  | "FLASH_TRANSLATION_REQUIRED"
  | "INTERACTIVE_TRANSLATION_REQUIRED"
  | "UNSUPPORTED"

export interface SourcePage {
  pageNumber: number
  title?: string
  body?: string
  modifiedAt?: string
  nextPageNumbers: number[]
  classifications: PageClassification[]
  logLabel?: "PESTERLOG" | "DIALOGLOG" | "SPRITELOG"
}

export interface TranslationSourceSnapshot {
  schemaVersion: 1
  provider: string
  adventureId: string
  sourceRevision?: string
  metadata: {
    title?: string
  }
  pages: SourcePage[]
}

export interface TranslationSource {
  load(): Promise<TranslationSourceSnapshot>
}

export interface MappingEvidence {
  type: "asset-id" | "manual" | "navigation" | "sequence" | "structure" | "title" | "uhc-reference" | "fixture"
  value: string
}

export interface PageMapping {
  mspfaPageNumber: number
  homestuckOrdinal: number
  uhcMspaId: string
  status: "proposed" | "verified" | "rejected"
  confidence: "exact" | "high" | "ambiguous"
  evidence: MappingEvidence[]
  sourceHash?: string
  lastVerified?: string
}

export interface MappingDocument {
  schemaVersion: 1
  pages: PageMapping[]
}

export interface MappingCandidate {
  homestuckOrdinal: number
  uhcMspaId: string
  confidence: "exact" | "high" | "ambiguous"
  evidence: MappingEvidence[]
}

export interface MappingProposal {
  mspfaPageNumber: number
  status: "mapped" | "candidate" | "conflict" | "stale" | "unresolved"
  existing?: PageMapping
  candidates: MappingCandidate[]
}

export interface UhcReferencePage {
  homestuckOrdinal: number
  uhcMspaId: string
  titleHash?: string
  mediaAssetOrdinals: number[]
  mediaCount: number
  hasContent: boolean
  isLog: boolean
}

export interface UhcReferenceDocument {
  schemaVersion: 1
  sourceHash: string
  pages: UhcReferencePage[]
}

export interface MappingProposalDocument {
  schemaVersion: 1
  provider: string
  adventureId: string
  sourceRevision?: string
  proposals: MappingProposal[]
}

export interface CanonicalTranslationPage {
  id: {
    provider: string
    adventureId: string
    mspfaPageNumber: number
  }
  source: {
    modifiedAt?: string
    rawHash: string
    normalizedHash: string
  }
  translation: {
    title?: string
    content?: string
  }
  navigation: {
    nextSourcePages: number[]
  }
  classifications: PageClassification[]
  mapping?: PageMapping
}

export interface TranslationChanges {
  title?: string
  content?: string
}

export interface PageOverride {
  uhcMspaId: string
  reason: string
  appliesToNormalizedHash: string
  changes: TranslationChanges
}

export type ContentScope = "translation-text" | "translated-assets"

export interface DistributionPolicy {
  schemaVersion: 1
  mode: "tools-only" | "content"
  contentDistributionAllowed: boolean
  decision: {
    status: "not-authorized" | "authorized"
    reference: string | null
    decidedAt: string | null
    scope: ContentScope[]
  }
}

export interface GeneratedTranslation {
  [uhcMspaId: string]: TranslationChanges
}

export interface PipelineInput {
  source: TranslationSource
  mappings: PageMapping[]
  overrides: PageOverride[]
}

export interface PipelineResult {
  pages: CanonicalTranslationPage[]
  translation: GeneratedTranslation
}

export interface SourceStatePage {
  pageNumber: number
  rawHash: string
  normalizedHash: string
  modifiedAt?: string
}

export interface SourceState {
  schemaVersion: 1
  provider: string
  adventureId: string
  sourceRevision?: string
  generatedAt: string
  pages: SourceStatePage[]
}

export interface SourceDiff {
  unchanged: number[]
  metadataOnly: number[]
  updated: number[]
  new: number[]
  missing: number[]
  movedCandidates: Array<{
    from: number
    to: number
    normalizedHash: string
  }>
}
