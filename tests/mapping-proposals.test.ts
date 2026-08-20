import assert from "node:assert/strict"
import test from "node:test"

import type { PageMapping, TranslationSourceSnapshot } from "../src/domain/types.js"
import { MappingError } from "../src/domain/errors.js"
import {
  extractHomestuckAssetOrdinals,
  proposeMappings,
} from "../src/mapper/propose-mappings.js"

const snapshot: TranslationSourceSnapshot = {
  schemaVersion: 1,
  provider: "fixture",
  adventureId: "mapping-test",
  sourceRevision: "fixture-mapping-v1",
  metadata: { title: "Mapping artificiel" },
  pages: [
    page(1, "https://example.test/storyfiles/hs2/00001.gif", [2]),
    page(2, "https://example.test/storyfiles/hs2/00002.gif", [3]),
    page(3, "Aucun asset, seulement des ancres.", [4]),
    page(4, "Ancre manuelle artificielle.", [5]),
    page(5, "/storyfiles/hs2/00005.gif et /panels/demo/00006.png", []),
    page(6, "/storyfiles/hs2/09999.gif", []),
  ],
}

const mappings: PageMapping[] = [verified(1, 1), verified(4, 4)]

test("combine assets, navigation et ancres sans auto-valider", () => {
  const document = proposeMappings(snapshot, mappings)
  const bySource = new Map(document.proposals.map((proposal) => [proposal.mspfaPageNumber, proposal]))

  assert.equal(bySource.get(1)?.status, "mapped")
  assert.equal(bySource.get(2)?.status, "candidate")
  assert.deepEqual(bySource.get(2)?.candidates.map((candidate) => candidate.homestuckOrdinal), [2])
  assert.equal(bySource.get(2)?.candidates[0]?.confidence, "exact")
  assert.ok((bySource.get(2)?.candidates[0]?.evidence.length ?? 0) >= 3)

  assert.equal(bySource.get(3)?.status, "candidate")
  assert.equal(bySource.get(3)?.candidates[0]?.homestuckOrdinal, 3)
  assert.equal(bySource.get(3)?.candidates[0]?.confidence, "high")

  assert.equal(bySource.get(5)?.status, "conflict")
  assert.deepEqual(bySource.get(5)?.candidates.map((candidate) => candidate.homestuckOrdinal), [5, 6])
  assert.ok(document.proposals.every((proposal) => proposal.existing?.status === "verified" || proposal.status !== "mapped"))
})

test("n'extrait que les identifiants présents dans des chemins d'assets reconnus", () => {
  assert.deepEqual(extractHomestuckAssetOrdinals(page(
    1,
    "nombre 01234; /storyfiles/hs2/00042.gif; https://cdn.test/panels/a/b/00123.png; /storyfiles/hs2/09999.gif",
    [],
  )), [42, 123])
})

test("refuse les mappings dupliqués avant de produire des candidats", () => {
  assert.throws(() => proposeMappings(snapshot, [
    verified(1, 1),
    verified(1, 2),
  ]), MappingError)
  assert.throws(() => proposeMappings(snapshot, [
    verified(1, 1),
    verified(2, 1),
  ]), MappingError)
})

function page(pageNumber: number, body: string, nextPageNumbers: number[]) {
  return {
    pageNumber,
    title: `Commande artificielle ${pageNumber}`,
    body,
    nextPageNumbers,
    classifications: ["TEXT_TRANSLATABLE" as const],
  }
}

function verified(mspfaPageNumber: number, homestuckOrdinal: number): PageMapping {
  return {
    mspfaPageNumber,
    homestuckOrdinal,
    uhcMspaId: String(homestuckOrdinal + 1900).padStart(6, "0"),
    status: "verified",
    confidence: "exact",
    evidence: [{ type: "fixture", value: "ancre artificielle" }],
    lastVerified: "2026-08-20",
  }
}
