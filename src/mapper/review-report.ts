import { InputValidationError } from "../domain/errors.js"
import type {
  MappingProposal,
  MappingProposalDocument,
  PageClassification,
  SourcePage,
  TranslationSourceSnapshot,
} from "../domain/types.js"
import { sourcePageHash } from "./page-mapper.js"

export interface MappingReviewEntry {
  page: SourcePage
  proposal: MappingProposal
  sourceHash: string
}

export interface MappingReviewResult {
  entries: MappingReviewEntry[]
  markdown: string
}

const STATUS_PRIORITY: MappingProposal["status"][] = ["stale", "conflict", "unresolved", "candidate", "mapped"]
const CLASSIFICATION_PRIORITY: PageClassification[] = [
  "LOG_TRANSLATABLE",
  "TEXT_TRANSLATABLE",
  "IMAGE_TRANSLATION_REQUIRED",
  "FLASH_TRANSLATION_REQUIRED",
  "INTERACTIVE_TRANSLATION_REQUIRED",
  "UNSUPPORTED",
]

export function createMappingReviewReport(
  snapshot: TranslationSourceSnapshot,
  proposals: MappingProposalDocument,
  sampleSize: number,
): MappingReviewResult {
  if (!Number.isSafeInteger(sampleSize) || sampleSize < 1) {
    throw new InputValidationError("La taille de l'échantillon de mapping doit être un entier positif")
  }
  if (snapshot.provider !== proposals.provider || snapshot.adventureId !== proposals.adventureId) {
    throw new InputValidationError("Les propositions de mapping concernent une autre source")
  }

  const proposalByPage = new Map(proposals.proposals.map((proposal) => [proposal.mspfaPageNumber, proposal]))
  const available = snapshot.pages
    .map((page) => {
      const proposal = proposalByPage.get(page.pageNumber)
      if (proposal === undefined) throw new InputValidationError(`Proposition absente pour la page source ${page.pageNumber}`)
      return { page, proposal, sourceHash: sourcePageHash(page) }
    })
    .sort((left, right) => left.page.pageNumber - right.page.pageNumber)

  const selected = selectRepresentativeEntries(available, Math.min(sampleSize, available.length))
  return { entries: selected, markdown: renderReview(snapshot, selected, sampleSize) }
}

function selectRepresentativeEntries(entries: MappingReviewEntry[], limit: number): MappingReviewEntry[] {
  const selected = new Map<number, MappingReviewEntry>()
  const add = (entry: MappingReviewEntry | undefined) => {
    if (entry !== undefined && selected.size < limit) selected.set(entry.page.pageNumber, entry)
  }

  for (const status of STATUS_PRIORITY) add(entries.find((entry) => entry.proposal.status === status))
  for (const classification of CLASSIFICATION_PRIORITY) {
    add(entries.find((entry) => entry.page.classifications.includes(classification) && !selected.has(entry.page.pageNumber)))
  }

  const remainingSlots = limit - selected.size
  if (remainingSlots > 0) {
    for (let index = 0; index < remainingSlots && selected.size < limit; index += 1) {
      const target = remainingSlots === 1
        ? Math.round((entries.length - 1) / 2)
        : Math.round(index * (entries.length - 1) / (remainingSlots - 1))
      add(nearestUnselected(entries, target, selected))
    }
  }
  for (const entry of entries) add(entry)
  return [...selected.values()].sort((left, right) => left.page.pageNumber - right.page.pageNumber)
}

function nearestUnselected(
  entries: MappingReviewEntry[],
  target: number,
  selected: Map<number, MappingReviewEntry>,
): MappingReviewEntry | undefined {
  for (let distance = 0; distance < entries.length; distance += 1) {
    for (const index of distance === 0 ? [target] : [target - distance, target + distance]) {
      const entry = entries[index]
      if (entry !== undefined && !selected.has(entry.page.pageNumber)) return entry
    }
  }
  return undefined
}

function renderReview(
  snapshot: TranslationSourceSnapshot,
  entries: MappingReviewEntry[],
  requestedSize: number,
): string {
  const lines = [
    "# Revue locale des mappings",
    "",
    "> Ce rapport ne contient ni titre, ni corps de page, ni asset. Il doit rester local tant que sa revue n'est pas terminée.",
    "",
    `- Source : \`${inlineCode(snapshot.provider)}\` / \`${inlineCode(snapshot.adventureId)}\``,
    `- Échantillon : ${entries.length} page(s) sur ${snapshot.pages.length}${requestedSize > snapshot.pages.length ? ` (${requestedSize} demandées)` : ""}`,
    `- Généré : ${new Date().toISOString()}`,
    "",
    "## Échantillon",
    "",
    "| Source | Hash source | Type(s) | Statut | Candidat(s) UHC | Signaux | Source revue | UHC revue | Décision |",
    "| ---: | --- | --- | --- | --- | --- | :---: | :---: | --- |",
  ]

  for (const entry of entries) {
    const candidates = entry.proposal.existing?.status === "verified" && entry.proposal.status === "mapped"
      ? `${entry.proposal.existing.uhcMspaId} (${entry.proposal.existing.confidence})`
      : entry.proposal.candidates.map((candidate) => `${candidate.uhcMspaId} (${candidate.confidence})`).join(", ") || "—"
    const signals = [...new Set(entry.proposal.candidates.flatMap((candidate) => candidate.evidence.map((evidence) => evidence.type)))]
    if (entry.proposal.status === "mapped" && entry.proposal.existing !== undefined) {
      signals.push(...entry.proposal.existing.evidence.map((evidence) => evidence.type))
    }
    lines.push([
      `| ${entry.page.pageNumber}`,
      `\`${entry.sourceHash}\``,
      escapeCell(entry.page.classifications.join(", ") || "—"),
      entry.proposal.status,
      escapeCell(candidates),
      escapeCell([...new Set(signals)].join(", ") || "—"),
      "☐",
      "☐",
      "à revoir |",
    ].join(" | "))
  }

  lines.push(
    "",
    "## Procédure humaine",
    "",
    "1. Ouvrir la page source locale et la page UHC candidate sans copier leur contenu dans ce rapport.",
    "2. Vérifier la commande, les médias, le type de page et les liens précédent/suivant.",
    "3. Noter uniquement la décision technique : confirmé, rejeté ou ambigu.",
    "4. Pour une confirmation, reporter le hash source ci-dessus dans `data/mapping/pages.json`, ajouter une preuve `manual` et dater `lastVerified`.",
    "5. Relancer `mapping-propose`, `mapping-status` et `validate` après chaque lot.",
    "",
  )
  return lines.join("\n")
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ")
}

function inlineCode(value: string): string {
  return value.replace(/`/g, "\\`").replace(/[\r\n]+/g, " ")
}
