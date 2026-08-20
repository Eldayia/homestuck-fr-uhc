import assert from "node:assert/strict"
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"

import { LocalJsonSource } from "../adapters/local-json/index.js"
import { writeStableJsonFile } from "../src/io/write-json.js"
import { runUpdate } from "../src/update/update-workflow.js"

test("détecte changements, insertion, disparition et déplacement sans écrire en dry-run", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-update-"))
  const firstSnapshot = join(directory, "first.json")
  const secondSnapshot = join(directory, "second.json")
  const statePath = join(directory, "source-state.json")
  const reportPath = join(directory, "report.md")

  try {
    const fixture = JSON.parse(await readFile(resolve("tests/fixtures/source.json"), "utf8")) as {
      pages: Array<Record<string, unknown>>
      sourceRevision: string
    }
    await writeStableJsonFile(firstSnapshot, fixture)

    const initialDryRun = await runUpdate({
      source: new LocalJsonSource(firstSnapshot),
      statePath,
      reportPath,
      dryRun: true,
      now: () => new Date("2026-08-20T00:00:00Z"),
    })
    assert.equal(initialDryRun.diff.new.length, 10)
    await assert.rejects(() => access(statePath))
    await assert.rejects(() => access(reportPath))

    await runUpdate({
      source: new LocalJsonSource(firstSnapshot),
      statePath,
      reportPath,
      dryRun: false,
      now: () => new Date("2026-08-20T00:00:00Z"),
    })
    const originalState = await readFile(statePath, "utf8")

    const moved = { ...fixture.pages[2], pageNumber: 11 }
    fixture.pages[0] = { ...fixture.pages[0], body: "Contenu artificiel modifié." }
    fixture.pages[1] = { ...fixture.pages[1], modifiedAt: "2026-08-21T00:00:00Z" }
    fixture.pages = fixture.pages.filter((page) => page.pageNumber !== 3)
    fixture.pages.push(moved)
    fixture.sourceRevision = "fixture-v2"
    await writeStableJsonFile(secondSnapshot, fixture)

    const comparison = await runUpdate({
      source: new LocalJsonSource(secondSnapshot),
      statePath,
      reportPath,
      dryRun: true,
      now: () => new Date("2026-08-21T00:00:00Z"),
    })
    assert.deepEqual(comparison.diff.updated, [1])
    assert.deepEqual(comparison.diff.metadataOnly, [2])
    assert.deepEqual(comparison.diff.new, [11])
    assert.deepEqual(comparison.diff.missing, [3])
    assert.deepEqual(comparison.diff.movedCandidates.map(({ from, to }) => ({ from, to })), [{ from: 3, to: 11 }])
    assert.equal(await readFile(statePath, "utf8"), originalState)

    await runUpdate({
      source: new LocalJsonSource(secondSnapshot),
      statePath,
      reportPath,
      dryRun: false,
      now: () => new Date("2026-08-21T00:00:00Z"),
    })
    const report = await readFile(reportPath, "utf8")
    assert.match(report, /Updated: 1/)
    assert.match(report, /Source 3 → 11 \(revue requise\)/)
    assert.doesNotMatch(report, /Contenu artificiel modifié|Démonstration/)
    assert.notEqual(await readFile(statePath, "utf8"), originalState)

    const validState = await readFile(statePath, "utf8")
    await writeFile(secondSnapshot, "{ invalide", "utf8")
    await assert.rejects(() => runUpdate({
      source: new LocalJsonSource(secondSnapshot),
      statePath,
      reportPath,
      dryRun: false,
    }))
    assert.equal(await readFile(statePath, "utf8"), validState)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
