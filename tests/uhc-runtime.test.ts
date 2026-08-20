import assert from "node:assert/strict"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import vm from "node:vm"

import type { GeneratedTranslation, TranslationChanges } from "../src/domain/types.js"
import { UHC_COMPATIBILITY, writeUhcMod } from "../src/generator/uhc-mod.js"

interface UhcPageFixture {
  title: string
  content: string
  media: string[]
  next: string[]
  kind?: string
}

interface GeneratedMod {
  title: string
  author: string
  modVersion: number
  computed(api: {
    readJson(path: string): GeneratedTranslation
    logger: { warn(message: string): void }
  }): { edit(archive: { mspa: { story: Record<string, UhcPageFixture> } }): void }
}

test("exécute le mod généré sans remplacer les pages ni leurs médias", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-uhc-runtime-"))
  const translation: GeneratedTranslation = {
    "001901": { title: "Commande française artificielle" },
    "001902": { content: "|PESTERLOG|Dialogue français artificiel" },
    "001903": { title: "Page spéciale artificielle", content: "Texte extérieur" },
    "009999": { title: "Page absente" },
  }
  try {
    await writeUhcMod(directory, translation)
    const mod = await loadGeneratedMod(join(directory, "mod.js"))
    const first = uhcPage("Commande anglaise", "Corps anglais", ["first.gif"])
    const log = uhcPage("Open log", "|PESTERLOG|English dialogue", ["log.gif"])
    const special = { ...uhcPage("Special", "English outside text", ["movie.swf", "interactive.html"]), kind: "FLASH_HTML5" }
    const fallback = uhcPage("English fallback", "Still English", ["fallback.png"])
    const archive = { mspa: { story: { "001901": first, "001902": log, "001903": special, "001904": fallback } } }
    const originalMedia = special.media
    const warnings: string[] = []
    let reads = 0

    const hooks = mod.computed({
      readJson(path) {
        reads += 1
        assert.equal(path, "./translation.json")
        return translation
      },
      logger: { warn: (message) => warnings.push(message) },
    })
    hooks.edit(archive)

    assert.equal(reads, 1)
    assert.equal(archive.mspa.story["001901"], first)
    assert.equal(first.title, "Commande française artificielle")
    assert.equal(first.content, "Corps anglais")
    assert.equal(log.title, "Open log")
    assert.equal(log.content, "|PESTERLOG|Dialogue français artificiel")
    assert.equal(special.media, originalMedia)
    assert.deepEqual(special.media, ["movie.swf", "interactive.html"])
    assert.equal(special.kind, "FLASH_HTML5")
    assert.deepEqual(fallback, uhcPage("English fallback", "Still English", ["fallback.png"]))
    assert.deepEqual(warnings, ["Page UHC inconnue: 009999"])
    assert.equal(typeof mod.title, "string")
    assert.equal(typeof mod.author, "string")
    assert.equal(mod.modVersion, 1)

    const compatibility = JSON.parse(await readFile(join(directory, "compatibility.json"), "utf8")) as unknown
    assert.deepEqual(compatibility, UHC_COMPATIBILITY)
    const credits = await readFile(join(directory, "CREDITS.txt"), "utf8")
    assert.match(credits, /Homestuck en Français/)
    assert.match(credits, /Unofficial Homestuck Collection/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("compare edit et une application paresseuse sur 8130 pages synthétiques", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-uhc-scale-"))
  const translation: GeneratedTranslation = {}
  const eagerStory: Record<string, UhcPageFixture> = {}
  const lazyStory: Record<string, UhcPageFixture> = {}
  for (let ordinal = 1; ordinal <= 8130; ordinal += 1) {
    const id = String(ordinal + 1900).padStart(6, "0")
    translation[id] = { title: `FR ${ordinal}` }
    eagerStory[id] = uhcPage(`EN ${ordinal}`, `Body ${ordinal}`, [`media-${ordinal}.bin`])
    lazyStory[id] = uhcPage(`EN ${ordinal}`, `Body ${ordinal}`, [`media-${ordinal}.bin`])
  }

  try {
    await writeUhcMod(directory, {})
    const mod = await loadGeneratedMod(join(directory, "mod.js"))
    mod.computed({ readJson: () => translation, logger: { warn: () => undefined } }).edit({ mspa: { story: eagerStory } })
    for (const [id, patch] of Object.entries(translation)) applyLikeEditPage(lazyStory[id], patch)

    assert.equal(Object.keys(eagerStory).length, 8130)
    assert.deepEqual(eagerStory, lazyStory)
    assert.deepEqual(eagerStory["001901"]?.media, ["media-1.bin"])
    assert.deepEqual(eagerStory["010030"]?.media, ["media-8130.bin"])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("documente le comportement d'ordre avec un second mod synthétique", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-uhc-order-"))
  try {
    await writeUhcMod(directory, {})
    const mod = await loadGeneratedMod(join(directory, "mod.js"))
    const applyFrench = (page: UhcPageFixture) => mod.computed({
      readJson: () => ({ "001901": { title: "FR" } }),
      logger: { warn: () => undefined },
    }).edit({ mspa: { story: { "001901": page } } })
    const applySecond = (page: UhcPageFixture) => { page.title = "SECOND" }

    const frenchThenSecond = uhcPage("EN", "Body", [])
    applyFrench(frenchThenSecond)
    applySecond(frenchThenSecond)
    assert.equal(frenchThenSecond.title, "SECOND")

    const secondThenFrench = uhcPage("EN", "Body", [])
    applySecond(secondThenFrench)
    applyFrench(secondThenFrench)
    assert.equal(secondThenFrench.title, "FR")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

async function loadGeneratedMod(path: string): Promise<GeneratedMod> {
  const source = await readFile(path, "utf8")
  const moduleRecord: { exports: unknown } = { exports: {} }
  vm.runInNewContext(source, { module: moduleRecord, exports: moduleRecord.exports }, { filename: path })
  return moduleRecord.exports as GeneratedMod
}

function uhcPage(title: string, content: string, media: string[]): UhcPageFixture {
  return { title, content, media, next: [] }
}

function applyLikeEditPage(page: UhcPageFixture | undefined, patch: TranslationChanges): void {
  if (page === undefined) return
  if (Object.prototype.hasOwnProperty.call(patch, "title")) page.title = patch.title ?? ""
  if (Object.prototype.hasOwnProperty.call(patch, "content")) page.content = patch.content ?? ""
}
