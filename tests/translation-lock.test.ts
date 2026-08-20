import assert from "node:assert/strict"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"

import { LocalJsonSource } from "../adapters/local-json/index.js"
import { InputValidationError } from "../src/domain/errors.js"
import { TOOL_VERSION } from "../src/domain/version.js"
import { readMappings, readOverrides } from "../src/io/config.js"
import { writeStableJsonFile } from "../src/io/write-json.js"
import { assertTranslationLock, createTranslationLock, readTranslationLock } from "../src/lock/translation-lock.js"

const fixtures = resolve("tests/fixtures")

test("crée un verrou déterministe indépendant de l'ordre des configurations", async () => {
  const [snapshot, mappings, overrides] = await Promise.all([
    new LocalJsonSource(join(fixtures, "source.json")).load(),
    readMappings(join(fixtures, "mapping.json")),
    readOverrides(join(fixtures, "overrides.json")),
  ])
  const first = createTranslationLock(snapshot, mappings, overrides)
  const second = createTranslationLock(snapshot, [...mappings].reverse(), [...overrides].reverse())
  assert.deepEqual(second, first)
  assert.equal(first.toolVersion, TOOL_VERSION)
  assert.doesNotMatch(JSON.stringify(first), /Démonstration|aLtErNaNcE/)

  const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8")) as { version: string }
  assert.equal(first.toolVersion, packageJson.version)
})

test("relit le verrou et bloque toute divergence de source", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-lock-"))
  try {
    const snapshot = await new LocalJsonSource(join(fixtures, "source.json")).load()
    const [mappings, overrides] = await Promise.all([
      readMappings(join(fixtures, "mapping.json")),
      readOverrides(join(fixtures, "overrides.json")),
    ])
    const lock = createTranslationLock(snapshot, mappings, overrides)
    const path = join(directory, "translation-lock.json")
    await writeStableJsonFile(path, lock)
    const reloaded = await readTranslationLock(path)
    assert.doesNotThrow(() => assertTranslationLock(reloaded, lock))

    const changedSnapshot = { ...snapshot, pages: snapshot.pages.map((page, index) => index === 0 ? { ...page, title: "Changement artificiel" } : page) }
    assert.throws(
      () => assertTranslationLock(reloaded, createTranslationLock(changedSnapshot, mappings, overrides)),
      InputValidationError,
    )
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
