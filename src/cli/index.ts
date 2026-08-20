#!/usr/bin/env node

import { resolve } from "node:path"

import { LocalJsonSource } from "../../adapters/local-json/index.js"
import { MspfaNetworkSource } from "../../adapters/mspfa/network-source.js"
import { MspfaSnapshotSource } from "../../adapters/mspfa/snapshot-source.js"
import { HsfrError, InputValidationError } from "../domain/errors.js"
import { writeUhcMod } from "../generator/uhc-mod.js"
import { readDistributionPolicy, readMappings, readOverrides } from "../io/config.js"
import { writeStableJsonFile } from "../io/write-json.js"
import { runPipeline } from "../pipeline/build-pipeline.js"
import { assertContentDistributionAllowed } from "../policy/distribution.js"
import { runUpdate } from "../update/update-workflow.js"
import { proposeMappings, validateMappingSet } from "../mapper/propose-mappings.js"

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
  dryRun: boolean
  adventure?: string
}

async function main(argv: string[]): Promise<void> {
  const [command, ...optionArguments] = argv
  if (command === undefined || command === "help" || command === "--help") {
    printHelp()
    return
  }

  const options = parseOptions(command, optionArguments)

  if (command === "import") {
    const snapshot = await new MspfaSnapshotSource(options.source, options.adventure).load()
    await writeStableJsonFile(options.out, snapshot)
    console.log(`[OK] Snapshot MSPFA ${snapshot.adventureId}: ${snapshot.pages.length} pages importées dans ${options.out}`)
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
    }).load()
    await writeStableJsonFile(options.out, snapshot)
    const mode = options.offline ? "cache hors ligne" : "MSPFA"
    console.log(`[OK] Snapshot ${snapshot.adventureId}: ${snapshot.pages.length} pages chargées depuis ${mode} dans ${options.out}`)
    return
  }

  if (command === "update") {
    if (!optionArguments.includes("--source")) {
      throw new InputValidationError("La commande update exige --source <snapshot.json>")
    }
    const result = await runUpdate({
      source: new LocalJsonSource(options.source),
      statePath: options.state,
      reportPath: options.report,
      dryRun: options.dryRun,
    })
    if (options.dryRun) console.log(result.report)
    else console.log(`[OK] État mis à jour: ${result.diff.new.length} nouvelles, ${result.diff.updated.length} modifiées, ${result.diff.missing.length} absentes`)
    return
  }

  if (command === "mapping-propose") {
    if (!optionArguments.includes("--source")) {
      throw new InputValidationError("La commande mapping-propose exige --source <snapshot.json>")
    }
    const [snapshot, mappings] = await Promise.all([
      new LocalJsonSource(options.source).load(),
      readMappings(options.mapping),
    ])
    const proposals = proposeMappings(snapshot, mappings)
    await writeStableJsonFile(options.out, proposals)
    const conflicts = proposals.proposals.filter((proposal) => proposal.status === "conflict").length
    const unresolved = proposals.proposals.filter((proposal) => proposal.status === "unresolved").length
    console.log(`[OK] ${proposals.proposals.length} pages analysées: ${conflicts} conflits, ${unresolved} sans candidat`)
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
    await writeUhcMod(options.out, result.translation)
    console.log(`[OK] ${result.pages.length} pages générées dans ${options.out}`)
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
    "dry-run",
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
    out: resolve(values.get("out") ?? ((command === "import" || command === "fetch") ? ".cache/imports/mspfa-snapshot.json" : "generated/homestuck-fr")),
    policy: resolve(values.get("policy") ?? "data/metadata/distribution-policy.json"),
    cache: resolve(values.get("cache") ?? ".cache/mspfa"),
    offline: parseBooleanOption(values.get("offline") ?? "false", "offline"),
    timeoutMs: parseIntegerOption(values.get("timeout-ms") ?? "30000", "timeout-ms", 1),
    retries: parseIntegerOption(values.get("retries") ?? "2", "retries", 0),
    minimumIntervalMs: parseIntegerOption(values.get("minimum-interval-ms") ?? "60000", "minimum-interval-ms", 0),
    state: resolve(values.get("state") ?? "data/metadata/source-state.json"),
    report: resolve(values.get("report") ?? `reports/update-${new Date().toISOString().slice(0, 10)}.md`),
    dryRun: parseBooleanOption(values.get("dry-run") ?? "false", "dry-run"),
  }
  const adventure = values.get("adventure")
  if (adventure !== undefined) options.adventure = adventure
  return options
}

function printHelp(): void {
  console.log(`Usage:
  hsfr import   --source export-mspfa.json [--adventure id] [--out snapshot.json]
  hsfr fetch    --adventure id [--cache dossier] [--offline true|false] [--out snapshot.json]
  hsfr update   --source snapshot.json [--state fichier] [--report fichier] [--dry-run true|false]
  hsfr mapping-propose --source snapshot.json [--mapping pages.json] [--out propositions.json]
  hsfr mapping-status  [--mapping pages.json]
  hsfr validate [--source fichier] [--mapping fichier] [--overrides fichier]
  hsfr build    [--source fichier] [--mapping fichier] [--overrides fichier] [--out dossier]
  hsfr package  [--policy fichier]

La source par défaut contient uniquement des fixtures artificielles.`)
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
    process.exitCode = 1
    return
  }
  console.error(error)
  process.exitCode = 1
})
