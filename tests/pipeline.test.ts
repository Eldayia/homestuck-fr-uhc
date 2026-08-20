import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"

import { LocalJsonSource } from "../adapters/local-json/index.js"
import {
  DistributionBlockedError,
  InputValidationError,
  MappingError,
  OverrideConflictError,
} from "../src/domain/errors.js"
import { writeUhcMod } from "../src/generator/uhc-mod.js"
import { readDistributionPolicy, readMappings, readOverrides } from "../src/io/config.js"
import { applyOverrides } from "../src/overrides/apply-overrides.js"
import { runPipeline } from "../src/pipeline/build-pipeline.js"
import { assertContentDistributionAllowed } from "../src/policy/distribution.js"

const fixtures = resolve("tests/fixtures")

async function fixtureInput() {
  const [mappings, overrides] = await Promise.all([
    readMappings(join(fixtures, "mapping.json")),
    readOverrides(join(fixtures, "overrides.json")),
  ])
  return {
    source: new LocalJsonSource(join(fixtures, "source.json")),
    mappings,
    overrides,
  }
}

test("exécute le vertical slice sur dix pages artificielles", async () => {
  const result = await runPipeline(await fixtureInput())

  assert.equal(result.pages.length, 10)
  assert.equal(Object.keys(result.translation).length, 10)
  assert.equal(result.translation["001901"]?.title, "==&gt; Démonstration 1")
  assert.match(result.translation["001903"]?.content ?? "", /^\|PESTERLOG\|/)
  assert.equal(result.translation["007568"]?.content, "aLtErNaNcE volontaire !!! 3xactement conservée.")
})

test("génère deux sorties identiques et ne remplace jamais l'objet page UHC", async () => {
  const result = await runPipeline(await fixtureInput())
  const first = await mkdtemp(join(tmpdir(), "hsfr-first-"))
  const second = await mkdtemp(join(tmpdir(), "hsfr-second-"))

  try {
    await writeUhcMod(first, result.translation)
    await writeUhcMod(second, result.translation)
    const firstJson = await readFile(join(first, "translation.json"), "utf8")
    const secondJson = await readFile(join(second, "translation.json"), "utf8")
    const mod = await readFile(join(first, "mod.js"), "utf8")

    assert.equal(firstJson, secondJson)
    for (const filename of ["mod.js", "compatibility.json", "CREDITS.txt"]) {
      assert.equal(await readFile(join(first, filename), "utf8"), await readFile(join(second, filename), "utf8"))
    }
    assert.match(mod, /page\.title = patch\.title/)
    assert.match(mod, /page\.content = patch\.content/)
    assert.doesNotMatch(mod, /archive\.mspa\.story\[id\]\s*=/)
  } finally {
    await rm(first, { recursive: true, force: true })
    await rm(second, { recursive: true, force: true })
  }
})

test("bloque les mappings ambigus", async () => {
  const input = await fixtureInput()
  const first = input.mappings[0]
  assert.ok(first)
  input.mappings[0] = { ...first, status: "proposed", confidence: "ambiguous" }

  await assert.rejects(() => runPipeline(input), MappingError)
})

test("laisse en anglais les pages sans mapping vérifié", async () => {
  const input = await fixtureInput()
  input.mappings = input.mappings.slice(1)
  const result = await runPipeline(input)
  assert.equal(result.pages.length, 9)
  assert.equal(Object.keys(result.translation).length, 9)
})

test("bloque un mapping vérifié devenu obsolète", async () => {
  const input = await fixtureInput()
  const first = input.mappings[0]
  assert.ok(first)
  input.mappings[0] = { ...first, sourceHash: `sha256:${"0".repeat(64)}` }

  await assert.rejects(() => runPipeline(input), MappingError)
})

test("applique un override lié au hash et bloque un changement amont", async () => {
  const result = await runPipeline(await fixtureInput())
  const first = result.pages[0]
  assert.ok(first?.mapping)
  const mapping = first.mapping

  const applied = applyOverrides(result.pages, [{
    uhcMspaId: mapping.uhcMspaId,
    reason: "Test de compatibilité artificiel",
    appliesToNormalizedHash: first.source.normalizedHash,
    changes: { title: "Titre technique artificiel" },
  }])
  assert.equal(applied[0]?.translation.title, "Titre technique artificiel")

  assert.throws(() => applyOverrides(result.pages, [{
    uhcMspaId: mapping.uhcMspaId,
    reason: "Test de conflit artificiel",
    appliesToNormalizedHash: "sha256:ancien",
    changes: { title: "Ne doit pas être appliqué" },
  }]), OverrideConflictError)
})

test("bloque le packaging de contenu avec la politique par défaut", async () => {
  const policy = await readDistributionPolicy(resolve("data/metadata/distribution-policy.json"))
  assert.throws(() => assertContentDistributionAllowed(policy), DistributionBlockedError)
})

test("exige une décision datée, référencée et couvrant le texte", () => {
  assert.throws(() => assertContentDistributionAllowed({
    schemaVersion: 1,
    mode: "content",
    contentDistributionAllowed: true,
    decision: {
      status: "authorized",
      reference: null,
      decidedAt: "2026-08-20",
      scope: ["translation-text"],
    },
  }), DistributionBlockedError)

  assert.throws(() => assertContentDistributionAllowed({
    schemaVersion: 1,
    mode: "content",
    contentDistributionAllowed: true,
    decision: {
      status: "authorized",
      reference: "docs/LEGAL_RESEARCH.md#autorisation",
      decidedAt: "date inconnue",
      scope: ["translation-text"],
    },
  }), DistributionBlockedError)

  assert.throws(() => assertContentDistributionAllowed({
    schemaVersion: 1,
    mode: "content",
    contentDistributionAllowed: true,
    decision: {
      status: "authorized",
      reference: "docs/LEGAL_RESEARCH.md#autorisation",
      decidedAt: "2026-08-20",
      scope: ["translated-assets"],
    },
  }), DistributionBlockedError)

  assert.doesNotThrow(() => assertContentDistributionAllowed({
    schemaVersion: 1,
    mode: "content",
    contentDistributionAllowed: true,
    decision: {
      status: "authorized",
      reference: "docs/LEGAL_RESEARCH.md#autorisation",
      decidedAt: "2026-08-20",
      scope: ["translation-text"],
    },
  }))
})

test("refuse une politique JSON contradictoire", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-policy-"))
  const path = join(directory, "policy.json")
  try {
    await writeFile(path, JSON.stringify({
      schemaVersion: 1,
      mode: "tools-only",
      contentDistributionAllowed: true,
      decision: {
        status: "not-authorized",
        reference: null,
        decidedAt: null,
        scope: [],
      },
    }), "utf8")
    await assert.rejects(() => readDistributionPolicy(path), InputValidationError)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
