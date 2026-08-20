import assert from "node:assert/strict"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"

import { LocalJsonSource } from "../adapters/local-json/index.js"
import { MspfaSnapshotSource, parseMspfaSnapshot } from "../adapters/mspfa/snapshot-source.js"
import { InputValidationError } from "../src/domain/errors.js"
import { writeStableJsonFile } from "../src/io/write-json.js"
import { normalizePage } from "../src/normalizer/normalize-page.js"

const fixture = resolve("tests/fixtures/mspfa-compact.json")

test("convertit un export compact MSPFA en snapshot canonique versionné", async () => {
  const snapshot = await new MspfaSnapshotSource(fixture, "99999").load()

  assert.equal(snapshot.schemaVersion, 1)
  assert.equal(snapshot.provider, "mspfa")
  assert.equal(snapshot.adventureId, "99999")
  assert.equal(snapshot.metadata.title, "Aventure MSPFA synthétique")
  assert.equal(snapshot.pages.length, 3)
  assert.equal(snapshot.pages[0]?.pageNumber, 1)
  assert.equal(snapshot.pages[0]?.modifiedAt, "2026-08-20T00:00:00.000Z")
  assert.equal(snapshot.pages[1]?.logLabel, "PESTERLOG")
  const logPage = snapshot.pages[1]
  assert.ok(logPage)
  assert.equal(
    normalizePage(snapshot.provider, snapshot.adventureId, logPage).translation.content,
    "|PESTERLOG|AA : Message factice.",
  )
  assert.deepEqual(snapshot.pages[2]?.classifications, [
    "TEXT_TRANSLATABLE",
    "FLASH_TRANSLATION_REQUIRED",
  ])
  assert.match(snapshot.sourceRevision ?? "", /^sha256:[0-9a-f]{64}$/)
  assert.doesNotMatch(JSON.stringify(snapshot), /NEVER_EXECUTE_THIS_FIXTURE|background: url/)
})

test("refuse un identifiant d'aventure inattendu", async () => {
  await assert.rejects(
    () => new MspfaSnapshotSource(fixture, "45546").load(),
    InputValidationError,
  )
})

test("classifie séparément images, Flash et interactions", () => {
  const snapshot = parseMspfaSnapshot({
    i: 99998,
    n: "Classification artificielle",
    p: [{
      c: "Médias artificiels",
      b: "[img]https://example.test/factice.png[/img] [flash=factice.swf] [iframe=https://example.test]",
      n: [],
    }],
  })

  assert.deepEqual(snapshot.pages[0]?.classifications, [
    "TEXT_TRANSLATABLE",
    "IMAGE_TRANSLATION_REQUIRED",
    "FLASH_TRANSLATION_REQUIRED",
    "INTERACTIVE_TRANSLATION_REQUIRED",
  ])
})

test("produit un snapshot relisible par la source locale", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-mspfa-"))
  const output = join(directory, "snapshot.json")
  try {
    const imported = await new MspfaSnapshotSource(fixture).load()
    await writeStableJsonFile(output, imported)
    const reloaded = await new LocalJsonSource(output).load()
    assert.deepEqual(reloaded, imported)

    const serialized = await readFile(output, "utf8")
    assert.doesNotMatch(serialized, /NEVER_EXECUTE_THIS_FIXTURE|background: url/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
