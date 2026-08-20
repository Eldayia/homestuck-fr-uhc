import { mkdir, readFile, stat } from "node:fs/promises"
import { join, resolve } from "node:path"

import { MspfaNetworkSource } from "../../adapters/mspfa/network-source.js"
import type { TranslationSource } from "../domain/types.js"
import { InputValidationError, MappingError } from "../domain/errors.js"
import { writeUhcMod } from "../generator/uhc-mod.js"
import { readOverrides } from "../io/config.js"
import { writeStableJsonFile, writeTextFileAtomically } from "../io/write-json.js"
import { assertTranslationLock, createTranslationLock, readTranslationLock } from "../lock/translation-lock.js"
import { acceptConflictFreeExactMappings } from "../mapper/accept-exact.js"
import { proposeMappings } from "../mapper/propose-mappings.js"
import { buildUhcReference } from "../mapper/uhc-reference.js"
import { runPipeline } from "../pipeline/build-pipeline.js"

const GENERATED_MOD_FILES = ["mod.js", "translation.json", "compatibility.json", "CREDITS.txt"] as const

export interface InstallWorkflowOptions {
  assetPackDirectory: string
  adventureId: string
  cacheDirectory: string
  overridesPath?: string
  offline?: boolean
  timeoutMs?: number
  retries?: number
  minimumIntervalMs?: number
  dryRun?: boolean
  source?: TranslationSource
  onProgress?: (step: number, total: number, message: string) => void
}

export interface InstallWorkflowResult {
  adventureId: string
  sourcePages: number
  installedPages: number
  skippedPages: number
  targetDirectory: string
  workspaceDirectory: string
  dryRun: boolean
}

export async function runInstallWorkflow(options: InstallWorkflowOptions): Promise<InstallWorkflowResult> {
  if (!/^\d+$/.test(options.adventureId)) {
    throw new InputValidationError("--adventure doit être un identifiant MSPFA numérique")
  }

  const totalSteps = 7
  const progress = (step: number, message: string) => options.onProgress?.(step, totalSteps, message)
  const assetPackDirectory = resolve(options.assetPackDirectory)
  const uhcArchivePath = join(assetPackDirectory, "archive", "data", "mspa.json")
  const workspaceDirectory = join(resolve(options.cacheDirectory), "install", options.adventureId)
  const snapshotPath = join(workspaceDirectory, "snapshot.json")
  const referencePath = join(workspaceDirectory, "uhc-reference.json")
  const mappingPath = join(workspaceDirectory, "verified-mapping.json")
  const lockPath = join(workspaceDirectory, "translation-lock.json")
  const buildDirectory = join(workspaceDirectory, "homestuck-fr")
  const targetDirectory = join(assetPackDirectory, "mods", "homestuck-fr")

  progress(1, "Vérification de l’Asset Pack UHC")
  await assertDirectory(assetPackDirectory, "Le chemin --asset-pack")
  await assertFile(uhcArchivePath, "Archive UHC introuvable (archive/data/mspa.json)")

  progress(2, options.offline === true ? "Lecture du cache MSPFA hors ligne" : "Téléchargement et validation de l’aventure MSPFA")
  const source = options.source ?? new MspfaNetworkSource({
    adventureId: options.adventureId,
    cacheDirectory: resolve(options.cacheDirectory),
    offline: options.offline ?? false,
    timeoutMs: options.timeoutMs ?? 30_000,
    retries: options.retries ?? 2,
    minimumIntervalMs: options.minimumIntervalMs ?? 60_000,
    writeCache: options.dryRun !== true,
  })
  const snapshot = await source.load()
  if (snapshot.adventureId !== options.adventureId) {
    throw new InputValidationError(`L’aventure téléchargée (${snapshot.adventureId}) ne correspond pas à --adventure ${options.adventureId}`)
  }
  if (options.dryRun !== true) await writeStableJsonFile(snapshotPath, snapshot)

  progress(3, "Indexation structurelle des pages Homestuck de l’Asset Pack")
  const reference = await buildUhcReference(uhcArchivePath)
  if (options.dryRun !== true) await writeStableJsonFile(referencePath, reference)

  progress(4, "Création et vérification des mappings exacts sans conflit")
  const proposals = proposeMappings(snapshot, [], reference)
  const mappings = acceptConflictFreeExactMappings(snapshot, proposals)
  if (mappings.length === 0) {
    throw new MappingError("Aucun mapping exact sans conflit n’a pu être établi entre cette aventure et Homestuck dans UHC")
  }
  if (options.dryRun !== true) {
    await writeStableJsonFile(mappingPath, { schemaVersion: 1, pages: mappings })
  }

  progress(5, "Validation du contenu, des balises et des overrides")
  const overrides = options.overridesPath === undefined ? [] : await readOverrides(options.overridesPath)
  const result = await runPipeline({
    source: { load: async () => snapshot },
    mappings,
    overrides,
  })

  progress(6, "Création du verrou reproductible et du dossier de mod")
  const lock = createTranslationLock(snapshot, mappings, overrides)
  if (options.dryRun !== true) {
    await writeStableJsonFile(lockPath, lock)
    assertTranslationLock(await readTranslationLock(lockPath), createTranslationLock(snapshot, mappings, overrides))
    await writeUhcMod(buildDirectory, result.translation)
    await assertGeneratedMod(buildDirectory, result.pages.length)
  }

  progress(7, options.dryRun === true ? "Simulation de l’installation" : "Installation et vérification dans Asset Pack/mods")
  if (options.dryRun !== true) {
    await installGeneratedMod(buildDirectory, targetDirectory)
    await assertInstalledFilesMatch(buildDirectory, targetDirectory)
  }

  return {
    adventureId: options.adventureId,
    sourcePages: snapshot.pages.length,
    installedPages: result.pages.length,
    skippedPages: snapshot.pages.length - result.pages.length,
    targetDirectory,
    workspaceDirectory,
    dryRun: options.dryRun === true,
  }
}

async function installGeneratedMod(sourceDirectory: string, targetDirectory: string): Promise<void> {
  await mkdir(targetDirectory, { recursive: true })
  for (const filename of GENERATED_MOD_FILES) {
    const content = await readFile(join(sourceDirectory, filename), "utf8")
    await writeTextFileAtomically(join(targetDirectory, filename), content)
  }
}

async function assertGeneratedMod(directory: string, expectedPages: number): Promise<void> {
  for (const filename of GENERATED_MOD_FILES) await assertFile(join(directory, filename), `Fichier de mod généré absent: ${filename}`)
  const translation = JSON.parse(await readFile(join(directory, "translation.json"), "utf8")) as unknown
  if (translation === null || typeof translation !== "object" || Array.isArray(translation)) {
    throw new InputValidationError("translation.json généré est invalide")
  }
  if (Object.keys(translation).length !== expectedPages) {
    throw new InputValidationError(`translation.json contient ${Object.keys(translation).length} pages au lieu de ${expectedPages}`)
  }
}

async function assertInstalledFilesMatch(sourceDirectory: string, targetDirectory: string): Promise<void> {
  for (const filename of GENERATED_MOD_FILES) {
    const [source, installed] = await Promise.all([
      readFile(join(sourceDirectory, filename)),
      readFile(join(targetDirectory, filename)),
    ])
    if (!source.equals(installed)) throw new InputValidationError(`La copie installée de ${filename} diffère du build vérifié`)
  }
}

async function assertDirectory(path: string, label: string): Promise<void> {
  try {
    if (!(await stat(path)).isDirectory()) throw new Error("pas un dossier")
  } catch {
    throw new InputValidationError(`${label} n’est pas un dossier accessible: ${path}`)
  }
}

async function assertFile(path: string, message: string): Promise<void> {
  try {
    if (!(await stat(path)).isFile()) throw new Error("pas un fichier")
  } catch {
    throw new InputValidationError(`${message}: ${path}`)
  }
}
