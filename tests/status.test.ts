import assert from "node:assert/strict"
import { join, resolve } from "node:path"
import test from "node:test"

import { LocalJsonSource } from "../adapters/local-json/index.js"
import { readMappings, readOverrides } from "../src/io/config.js"
import { createProjectStatus, renderProjectStatus } from "../src/status/project-status.js"

const fixtures = resolve("tests/fixtures")

test("calcule la couverture et les pages spéciales sans exposer le texte", async () => {
  const [snapshot, mappings, overrides] = await Promise.all([
    new LocalJsonSource(join(fixtures, "source.json")).load(),
    readMappings(join(fixtures, "mapping.json")),
    readOverrides(join(fixtures, "overrides.json")),
  ])
  const status = createProjectStatus(snapshot, mappings, overrides.length)
  const report = renderProjectStatus(status)

  assert.equal(status.sourcePages, 10)
  assert.equal(status.proposals.mapped, 10)
  assert.equal(status.verifiedCoveragePercent, 100)
  assert.equal(status.classifications.LOG_TRANSLATABLE, 3)
  assert.equal(status.classifications.IMAGE_TRANSLATION_REQUIRED, 1)
  assert.equal(status.classifications.INTERACTIVE_TRANSLATION_REQUIRED, 1)
  assert.match(report, /Couverture vérifiée actuelle: 100\.00%/)
  assert.doesNotMatch(report, /Démonstration|aLtErNaNcE|Texte vert/)
})
