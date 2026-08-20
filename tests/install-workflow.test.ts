import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

import type { TranslationSourceSnapshot } from "../src/domain/types.js"
import { InputValidationError } from "../src/domain/errors.js"
import { runInstallWorkflow } from "../src/install/install-workflow.js"

const snapshot: TranslationSourceSnapshot = {
  schemaVersion: 1,
  provider: "fixture-install",
  adventureId: "12345",
  sourceRevision: "fixture-install-v1",
  metadata: { title: "Aventure d’installation artificielle" },
  pages: [
    {
      pageNumber: 1,
      title: "Commande artificielle identique",
      body: "Texte français artificiel /storyfiles/hs2/00001.gif",
      nextPageNumbers: [2],
      classifications: ["TEXT_TRANSLATABLE"],
    },
    {
      pageNumber: 2,
      title: "Conversation artificielle",
      body: "AA : Dialogue artificiel /storyfiles/hs2/00002.gif",
      logLabel: "PESTERLOG",
      nextPageNumbers: [],
      classifications: ["LOG_TRANSLATABLE"],
    },
  ],
}

test("prépare, valide et installe le mod complet avec une seule opération", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-install-"))
  const assetPack = join(directory, "Asset Pack")
  const cache = join(directory, "cache")
  const overrides = join(directory, "overrides.json")
  try {
    await prepareAssetPack(assetPack)
    await writeFile(overrides, "[]\n", "utf8")
    const existingExtra = join(assetPack, "mods", "homestuck-fr", "notes-locales.txt")
    await mkdir(join(assetPack, "mods", "homestuck-fr"), { recursive: true })
    await writeFile(existingExtra, "à préserver\n", "utf8")
    const progress: string[] = []

    const result = await runInstallWorkflow({
      assetPackDirectory: assetPack,
      adventureId: "12345",
      cacheDirectory: cache,
      overridesPath: overrides,
      source: { load: async () => snapshot },
      onProgress: (step, total, message) => progress.push(`${step}/${total} ${message}`),
    })

    assert.equal(result.sourcePages, 2)
    assert.equal(result.installedPages, 2)
    assert.equal(result.skippedPages, 0)
    assert.equal(progress.length, 7)
    assert.match(progress[0] ?? "", /^1\/7 /)
    assert.match(progress[6] ?? "", /^7\/7 /)

    const target = join(assetPack, "mods", "homestuck-fr")
    const translation = JSON.parse(await readFile(join(target, "translation.json"), "utf8")) as Record<string, unknown>
    const mod = await readFile(join(target, "mod.js"), "utf8")
    assert.deepEqual(Object.keys(translation).sort(), ["001901", "001902"])
    assert.match(mod, /vueHooks: HSFR_VUE_HOOKS/)
    assert.match(mod, /modVersion: 2/)
    assert.equal(await readFile(existingExtra, "utf8"), "à préserver\n")

    for (const filename of ["snapshot.json", "uhc-reference.json", "verified-mapping.json", "translation-lock.json"]) {
      assert.ok((await readFile(join(result.workspaceDirectory, filename))).length > 0)
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("le dry-run vérifie tout sans créer le dossier mods", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-install-dry-"))
  const assetPack = join(directory, "Asset Pack")
  const overrides = join(directory, "overrides.json")
  try {
    await prepareAssetPack(assetPack)
    await writeFile(overrides, "[]\n", "utf8")
    const result = await runInstallWorkflow({
      assetPackDirectory: assetPack,
      adventureId: "12345",
      cacheDirectory: join(directory, "cache"),
      overridesPath: overrides,
      source: { load: async () => snapshot },
      dryRun: true,
    })

    assert.equal(result.dryRun, true)
    await assert.rejects(() => readFile(join(assetPack, "mods", "homestuck-fr", "mod.js")))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("refuse un dossier qui n’est pas un Asset Pack UHC", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-install-invalid-"))
  const overrides = join(directory, "overrides.json")
  try {
    await writeFile(overrides, "[]\n", "utf8")
    await assert.rejects(() => runInstallWorkflow({
      assetPackDirectory: directory,
      adventureId: "12345",
      cacheDirectory: join(directory, "cache"),
      overridesPath: overrides,
      source: { load: async () => snapshot },
    }), InputValidationError)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

async function prepareAssetPack(assetPack: string): Promise<void> {
  const dataDirectory = join(assetPack, "archive", "data")
  await mkdir(dataDirectory, { recursive: true })
  const fixture = await readFile(join("tests", "fixtures", "uhc-mspa.json"), "utf8")
  await writeFile(join(dataDirectory, "mspa.json"), fixture, "utf8")
}
