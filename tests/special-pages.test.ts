import assert from "node:assert/strict"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"

import { LocalJsonSource } from "../adapters/local-json/index.js"
import { InputValidationError } from "../src/domain/errors.js"
import type { AssetManifest } from "../src/domain/types.js"
import { readAssetManifest } from "../src/io/asset-manifest.js"
import { readMappings } from "../src/io/config.js"
import { renderSpecialPagesReport } from "../src/special/special-pages-report.js"

const fixtures = resolve("tests/fixtures")

test("inventorie les pages spéciales sans texte ni chemin de média", async () => {
  const [snapshot, mappings] = await Promise.all([
    new LocalJsonSource(join(fixtures, "source.json")).load(),
    readMappings(join(fixtures, "mapping.json")),
  ])
  const manifest: AssetManifest = {
    schemaVersion: 1,
    assets: [{
      assetId: "fixture-image-1",
      uhcMspaId: "005900",
      kind: "image",
      source: "uhc-local",
      sourceHash: `sha256:${"1".repeat(64)}`,
      status: "local-only",
      distributionReference: null,
    }],
  }
  const report = renderSpecialPagesReport(snapshot, mappings, manifest)

  assert.match(report, /Pages spéciales: 2 sur 10/)
  assert.match(report, /005900.*fixture-image-1:local-only/)
  assert.match(report, /006900.*INTERACTIVE_TRANSLATION_REQUIRED/)
  assert.doesNotMatch(report, /Observer l'image|Page interactive factice|Seul le texte extérieur/)
  assert.doesNotMatch(report, /\.png|\.swf|interactive\.html/)
})

test("valide la cohérence juridique du manifest d'assets", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-assets-"))
  const validPath = join(directory, "valid.json")
  const invalidPath = join(directory, "invalid.json")
  try {
    const base = {
      schemaVersion: 1,
      assets: [{
        assetId: "fixture-authorized",
        uhcMspaId: "001901",
        kind: "image",
        source: "translation-local",
        sourceHash: `sha256:${"2".repeat(64)}`,
        status: "authorized",
        distributionReference: "docs/permission-fixture",
      }],
    }
    await writeFile(validPath, JSON.stringify(base), "utf8")
    assert.equal((await readAssetManifest(validPath)).assets.length, 1)

    await writeFile(invalidPath, JSON.stringify({ ...base, assets: [{ ...base.assets[0], distributionReference: null }] }), "utf8")
    await assert.rejects(() => readAssetManifest(invalidPath), InputValidationError)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
