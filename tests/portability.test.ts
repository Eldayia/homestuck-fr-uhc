import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"

import { LocalJsonSource } from "../adapters/local-json/index.js"
import { writeStableJsonFile } from "../src/io/write-json.js"

test("accepte les chemins Unicode et stabilise les fins de ligne Windows/Linux", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-portabilite-é-"))
  const sourcePath = join(directory, "entrée-ユニコード.json")
  const outputPath = join(directory, "sortie-ç.json")
  try {
    const fixture = await readFile(resolve("tests/fixtures/source.json"), "utf8")
    await writeFile(sourcePath, fixture.replace(/\r?\n/g, "\r\n"), "utf8")

    const snapshot = await new LocalJsonSource(sourcePath).load()
    await writeStableJsonFile(outputPath, snapshot)
    const output = await readFile(outputPath, "utf8")

    assert.equal(snapshot.pages.length, 10)
    assert.equal(output.includes("\r"), false)
    assert.equal(output.endsWith("\n"), true)
    assert.match(output, /Démonstration/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
