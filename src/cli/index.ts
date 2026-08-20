#!/usr/bin/env node

import { resolve } from "node:path"

import { LocalJsonSource } from "../../adapters/local-json/index.js"
import { HsfrError, InputValidationError } from "../domain/errors.js"
import { writeUhcMod } from "../generator/uhc-mod.js"
import { readDistributionPolicy, readMappings, readOverrides } from "../io/config.js"
import { runPipeline } from "../pipeline/build-pipeline.js"
import { assertContentDistributionAllowed } from "../policy/distribution.js"

interface CliOptions {
  source: string
  mapping: string
  overrides: string
  out: string
  policy: string
}

async function main(argv: string[]): Promise<void> {
  const [command, ...optionArguments] = argv
  if (command === undefined || command === "help" || command === "--help") {
    printHelp()
    return
  }

  const options = parseOptions(optionArguments)

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

function parseOptions(arguments_: string[]): CliOptions {
  const values = new Map<string, string>()
  for (let index = 0; index < arguments_.length; index += 2) {
    const key = arguments_[index]
    const value = arguments_[index + 1]
    if (key === undefined || !key.startsWith("--") || value === undefined) {
      throw new InputValidationError(`Option invalide près de ${key ?? "la fin de commande"}`)
    }
    values.set(key.slice(2), value)
  }

  return {
    source: resolve(values.get("source") ?? "tests/fixtures/source.json"),
    mapping: resolve(values.get("mapping") ?? "tests/fixtures/mapping.json"),
    overrides: resolve(values.get("overrides") ?? "tests/fixtures/overrides.json"),
    out: resolve(values.get("out") ?? "generated/homestuck-fr"),
    policy: resolve(values.get("policy") ?? "data/metadata/distribution-policy.json"),
  }
}

function printHelp(): void {
  console.log(`Usage:
  hsfr validate [--source fichier] [--mapping fichier] [--overrides fichier]
  hsfr build    [--source fichier] [--mapping fichier] [--overrides fichier] [--out dossier]
  hsfr package  [--policy fichier]

La source par défaut contient uniquement des fixtures artificielles.`)
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
