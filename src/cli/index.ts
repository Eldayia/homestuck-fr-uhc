#!/usr/bin/env node

import { resolve } from "node:path"

import { LocalJsonSource } from "../../adapters/local-json/index.js"
import { MspfaNetworkSource } from "../../adapters/mspfa/network-source.js"
import { MspfaSnapshotSource } from "../../adapters/mspfa/snapshot-source.js"
import { HsfrError, InputValidationError } from "../domain/errors.js"
import { writeUhcMod } from "../generator/uhc-mod.js"
import { readDistributionPolicy, readMappings, readOverrides } from "../io/config.js"
import { writeStableJsonFile, writeTextFileAtomically } from "../io/write-json.js"
import { runPipeline } from "../pipeline/build-pipeline.js"
import { assertContentDistributionAllowed } from "../policy/distribution.js"
import { runUpdate } from "../update/update-workflow.js"
import { proposeMappings, validateMappingSet } from "../mapper/propose-mappings.js"
import { buildUhcReference, readUhcReference } from "../mapper/uhc-reference.js"
import { createMappingReviewReport } from "../mapper/review-report.js"
import { createProjectStatus, renderProjectStatus } from "../status/project-status.js"
import { exitCodeForError } from "./exit-codes.js"

interface CliOptions {
  source: string
  mapping: string
  overrides: string
  out: string
  policy: string
  cache: string
  offline: boolean
  timeoutMs: number
  retries: number
  minimumIntervalMs: number
  state: string
  report: string
  reference?: string
  sampleSize: number
  dryRun: boolean
  verbose: boolean
  adventure?: string
}

async function main(argv: string[]): Promise<void> {
  const [command, ...optionArguments] = argv
  if (command === undefined || command === "--help") {
    printHelp()
    return
  }
  if (command === "help") {
    printHelp(optionArguments[0])
    return
  }
  if (optionArguments.includes("--help")) {
    printHelp(command)
    return
  }

  const options = parseOptions(command, optionArguments)
  if (options.verbose) console.error(`[DETAIL] commande=${command}; contenu des pages masqué`)

  if (command === "import") {
    const snapshot = await new MspfaSnapshotSource(options.source, options.adventure).load()
    if (!options.dryRun) await writeStableJsonFile(options.out, snapshot)
    console.log(`[OK] Snapshot MSPFA ${snapshot.adventureId}: ${snapshot.pages.length} pages validées${writeSuffix(options)}`)
    return
  }

  if (command === "fetch") {
    if (options.adventure === undefined) {
      throw new InputValidationError("La commande fetch exige --adventure <id>")
    }
    const snapshot = await new MspfaNetworkSource({
      adventureId: options.adventure,
      cacheDirectory: options.cache,
      offline: options.offline,
      timeoutMs: options.timeoutMs,
      retries: options.retries,
      minimumIntervalMs: options.minimumIntervalMs,
      writeCache: !options.dryRun,
    }).load()
    if (!options.dryRun) await writeStableJsonFile(options.out, snapshot)
    const mode = options.offline ? "cache hors ligne" : "MSPFA"
    console.log(`[OK] Snapshot ${snapshot.adventureId}: ${snapshot.pages.length} pages chargées depuis ${mode}${writeSuffix(options)}`)
    return
  }

  if (command === "update" || command === "diff") {
    if (!optionArguments.includes("--source")) {
      throw new InputValidationError(`La commande ${command} exige --source <snapshot.json>`)
    }
    const result = await runUpdate({
      source: new LocalJsonSource(options.source),
      statePath: options.state,
      reportPath: options.report,
      dryRun: command === "diff" || options.dryRun,
    })
    if (command === "diff" || options.dryRun) console.log(result.report)
    else console.log(`[OK] État mis à jour: ${result.diff.new.length} nouvelles, ${result.diff.updated.length} modifiées, ${result.diff.missing.length} absentes`)
    return
  }

  if (command === "uhc-index") {
    if (!optionArguments.includes("--source")) {
      throw new InputValidationError("La commande uhc-index exige --source <mspa.json>")
    }
    const reference = await buildUhcReference(options.source)
    if (!options.dryRun) await writeStableJsonFile(options.out, reference)
    console.log(`[OK] Index UHC sans texte: ${reference.pages.length} pages analysées${writeSuffix(options)}`)
    return
  }

  if (command === "mapping-propose") {
    if (!optionArguments.includes("--source")) {
      throw new InputValidationError("La commande mapping-propose exige --source <snapshot.json>")
    }
    const [snapshot, mappings, reference] = await Promise.all([
      new LocalJsonSource(options.source).load(),
      readMappings(options.mapping),
      options.reference === undefined ? Promise.resolve(undefined) : readUhcReference(options.reference),
    ])
    const proposals = proposeMappings(snapshot, mappings, reference)
    if (!options.dryRun) await writeStableJsonFile(options.out, proposals)
    const conflicts = proposals.proposals.filter((proposal) => proposal.status === "conflict").length
    const unresolved = proposals.proposals.filter((proposal) => proposal.status === "unresolved").length
    const stale = proposals.proposals.filter((proposal) => proposal.status === "stale").length
    console.log(`[OK] ${proposals.proposals.length} pages analysées: ${conflicts} conflits, ${stale} obsolètes, ${unresolved} sans candidat${writeSuffix(options)}`)
    return
  }

  if (command === "mapping-review") {
    if (!optionArguments.includes("--source")) {
      throw new InputValidationError("La commande mapping-review exige --source <snapshot.json>")
    }
    const [snapshot, mappings, reference] = await Promise.all([
      new LocalJsonSource(options.source).load(),
      readMappings(options.mapping),
      options.reference === undefined ? Promise.resolve(undefined) : readUhcReference(options.reference),
    ])
    const proposals = proposeMappings(snapshot, mappings, reference)
    const review = createMappingReviewReport(snapshot, proposals, options.sampleSize)
    if (!options.dryRun) await writeTextFileAtomically(options.out, review.markdown)
    console.log(`[OK] Rapport de revue sans texte: ${review.entries.length} pages sélectionnées${writeSuffix(options)}`)
    return
  }

  if (command === "status") {
    if (!optionArguments.includes("--source")) {
      throw new InputValidationError("La commande status exige --source <snapshot.json>")
    }
    const [snapshot, mappings, overrides, reference] = await Promise.all([
      new LocalJsonSource(options.source).load(),
      readMappings(options.mapping),
      readOverrides(options.overrides),
      options.reference === undefined ? Promise.resolve(undefined) : readUhcReference(options.reference),
    ])
    console.log(renderProjectStatus(createProjectStatus(snapshot, mappings, overrides.length, reference)))
    return
  }

  if (command === "mapping-status") {
    const mappings = await readMappings(options.mapping)
    validateMappingSet(mappings)
    const count = (status: "verified" | "proposed" | "rejected") => mappings.filter((mapping) => mapping.status === status).length
    console.log(`Mappings: ${mappings.length}\nVerified: ${count("verified")}\nProposed: ${count("proposed")}\nRejected: ${count("rejected")}`)
    return
  }

  if (command === "package") {
    const policy = await readDistributionPolicy(options.policy)
    assertContentDistributionAllowed(policy)
    throw new InputValidationError("Le packageur autorisé n'est pas encore implémenté")
  }

  if (command !== "build" && command !== "validate") {
    throw new InputValidationError(`Commande inconnue: ${command}`)
  }

  const [mappings, overrides] = await Promise.all([
    readMappings(options.mapping),
    readOverrides(options.overrides),
  ])
  const result = await runPipeline({
    source: new LocalJsonSource(options.source),
    mappings,
    overrides,
  })

  if (command === "build") {
    if (!options.dryRun) await writeUhcMod(options.out, result.translation)
    console.log(options.dryRun
      ? `[OK] ${result.pages.length} pages générables${writeSuffix(options)}`
      : `[OK] ${result.pages.length} pages générées ; sortie: ${options.out}`)
  } else {
    console.log(`[OK] ${result.pages.length} pages validées`)
  }
}

function parseOptions(command: string, arguments_: string[]): CliOptions {
  const values = new Map<string, string>()
  const allowed = new Set([
    "source",
    "mapping",
    "overrides",
    "out",
    "policy",
    "adventure",
    "cache",
    "offline",
    "timeout-ms",
    "retries",
    "minimum-interval-ms",
    "state",
    "report",
    "reference",
    "sample-size",
    "dry-run",
    "verbose",
  ])
  for (let index = 0; index < arguments_.length; index += 2) {
    const key = arguments_[index]
    const value = arguments_[index + 1]
    if (key === undefined || !key.startsWith("--") || value === undefined) {
      throw new InputValidationError(`Option invalide près de ${key ?? "la fin de commande"}`)
    }
    const name = key.slice(2)
    if (!allowed.has(name)) {
      throw new InputValidationError(`Option inconnue: --${name}`)
    }
    values.set(name, value)
  }

  if (command === "import" && !values.has("source")) {
    throw new InputValidationError("La commande import exige --source <export-mspfa.json>")
  }

  const options: CliOptions = {
    source: resolve(values.get("source") ?? "tests/fixtures/source.json"),
    mapping: resolve(values.get("mapping") ?? "tests/fixtures/mapping.json"),
    overrides: resolve(values.get("overrides") ?? "tests/fixtures/overrides.json"),
    out: resolve(values.get("out") ?? (
      command === "import" || command === "fetch"
        ? ".cache/imports/mspfa-snapshot.json"
        : command === "uhc-index"
          ? ".cache/uhc/reference.json"
          : command === "mapping-propose"
            ? ".cache/mapping/proposals.json"
            : command === "mapping-review"
              ? ".cache/mapping/review.md"
              : "generated/homestuck-fr"
    )),
    policy: resolve(values.get("policy") ?? "data/metadata/distribution-policy.json"),
    cache: resolve(values.get("cache") ?? ".cache/mspfa"),
    offline: parseBooleanOption(values.get("offline") ?? "false", "offline"),
    timeoutMs: parseIntegerOption(values.get("timeout-ms") ?? "30000", "timeout-ms", 1),
    retries: parseIntegerOption(values.get("retries") ?? "2", "retries", 0),
    minimumIntervalMs: parseIntegerOption(values.get("minimum-interval-ms") ?? "60000", "minimum-interval-ms", 0),
    state: resolve(values.get("state") ?? "data/metadata/source-state.json"),
    report: resolve(values.get("report") ?? `reports/update-${new Date().toISOString().slice(0, 10)}.md`),
    sampleSize: parseIntegerOption(values.get("sample-size") ?? "20", "sample-size", 1),
    dryRun: parseBooleanOption(values.get("dry-run") ?? "false", "dry-run"),
    verbose: parseBooleanOption(values.get("verbose") ?? "false", "verbose"),
  }
  const adventure = values.get("adventure")
  if (adventure !== undefined) options.adventure = adventure
  const reference = values.get("reference")
  if (reference !== undefined) options.reference = resolve(reference)
  return options
}

function printHelp(command?: string): void {
  if (command !== undefined) {
    const help = COMMAND_HELP[command]
    if (help === undefined) throw new InputValidationError(`Commande inconnue pour l'aide: ${command}`)
    console.log(help)
    return
  }
  console.log(`Usage:
  hsfr help <commande>
  hsfr import   --source export-mspfa.json [--adventure id] [--out snapshot.json]
  hsfr fetch    --adventure id [--cache dossier] [--offline true|false] [--out snapshot.json]
  hsfr update   --source snapshot.json [--state fichier] [--report fichier] [--dry-run true|false]
  hsfr diff     --source snapshot.json [--state fichier]
  hsfr status   --source snapshot.json [--mapping pages.json] [--overrides overrides.json] [--reference reference.json]
  hsfr uhc-index --source mspa.json [--out reference.json]
  hsfr mapping-propose --source snapshot.json [--mapping pages.json] [--reference reference.json] [--out propositions.json]
  hsfr mapping-review  --source snapshot.json [--mapping pages.json] [--reference reference.json] [--sample-size 20] [--out revue.md]
  hsfr mapping-status  [--mapping pages.json]
  hsfr validate [--source fichier] [--mapping fichier] [--overrides fichier]
  hsfr build    [--source fichier] [--mapping fichier] [--overrides fichier] [--out dossier]
  hsfr package  [--policy fichier]

Options communes d'écriture: --dry-run true|false, --verbose true|false.
Utiliser "hsfr help <commande>" pour un exemple. La source par défaut contient uniquement des fixtures artificielles.`)
}

const COMMAND_HELP: Record<string, string> = {
  import: `hsfr import --source export-mspfa.json [--adventure id] [--out snapshot.json] [--dry-run true]
Exemple: hsfr import --source export.json --adventure 45546 --out .cache/imports/fr.json`,
  fetch: `hsfr fetch --adventure id [--cache dossier] [--offline true|false] [--out snapshot.json] [--dry-run true]
Exemple: hsfr fetch --adventure 45546 --offline true --out .cache/imports/fr.json`,
  update: `hsfr update --source snapshot.json [--state fichier] [--report fichier] [--dry-run true]
Exemple: hsfr update --source .cache/imports/fr.json --state data/metadata/source-state.json`,
  diff: `hsfr diff --source snapshot.json [--state fichier]
Exemple: hsfr diff --source .cache/imports/fr.json --state data/metadata/source-state.json`,
  status: `hsfr status --source snapshot.json [--mapping pages.json] [--overrides overrides.json] [--reference reference.json]
Exemple: hsfr status --source .cache/imports/fr.json --mapping data/mapping/pages.json`,
  "uhc-index": `hsfr uhc-index --source mspa.json [--out reference.json] [--dry-run true]
Exemple: hsfr uhc-index --source archive/data/mspa.json --out .cache/uhc/reference.json`,
  "mapping-propose": `hsfr mapping-propose --source snapshot.json [--mapping pages.json] [--reference reference.json] [--out propositions.json] [--dry-run true]
Exemple: hsfr mapping-propose --source .cache/imports/fr.json --mapping data/mapping/pages.json`,
  "mapping-review": `hsfr mapping-review --source snapshot.json [--mapping pages.json] [--reference reference.json] [--sample-size 20] [--out revue.md] [--dry-run true]
Exemple: hsfr mapping-review --source .cache/imports/fr.json --sample-size 20`,
  "mapping-status": `hsfr mapping-status [--mapping pages.json]
Exemple: hsfr mapping-status --mapping data/mapping/pages.json`,
  validate: `hsfr validate --source snapshot.json --mapping pages.json --overrides overrides.json
Exemple: hsfr validate --source .cache/imports/fr.json --mapping data/mapping/pages.json`,
  build: `hsfr build --source snapshot.json --mapping pages.json --overrides overrides.json [--out dossier] [--dry-run true]
Exemple: hsfr build --source .cache/imports/fr.json --out generated/homestuck-fr`,
  package: `hsfr package [--policy fichier]
Exemple: hsfr package --policy data/metadata/distribution-policy.json`,
}

function writeSuffix(options: CliOptions): string {
  return options.dryRun ? " (dry-run ; aucune écriture)" : ` ; sortie: ${options.out}`
}

function parseIntegerOption(value: string, label: string, minimum: number): number {
  if (!/^\d+$/.test(value)) throw new InputValidationError(`--${label} doit être un entier`)
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    throw new InputValidationError(`--${label} doit être supérieur ou égal à ${minimum}`)
  }
  return parsed
}

function parseBooleanOption(value: string, label: string): boolean {
  if (value === "true") return true
  if (value === "false") return false
  throw new InputValidationError(`--${label} doit valoir true ou false`)
}

main(process.argv.slice(2)).catch((error: unknown) => {
  if (error instanceof HsfrError) {
    console.error(`[${error.code}] ${error.message}`)
    process.exitCode = exitCodeForError(error)
    return
  }
  console.error(error)
  process.exitCode = 1
})
