import assert from "node:assert/strict"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"

import { InputValidationError } from "../src/domain/errors.js"
import type { PageMapping, TranslationSourceSnapshot } from "../src/domain/types.js"
import { writeStableJsonFile } from "../src/io/write-json.js"
import { sourcePageHash } from "../src/mapper/page-mapper.js"
import { proposeMappings } from "../src/mapper/propose-mappings.js"
import { buildUhcReference, hashComparableTitle, readUhcReference } from "../src/mapper/uhc-reference.js"

test("construit un index UHC structurel sans conserver le texte", async () => {
  const reference = await buildUhcReference(resolve("tests/fixtures/uhc-mspa.json"))
  const serialized = JSON.stringify(reference)

  assert.equal(reference.pages.length, 2)
  assert.equal(reference.pages[0]?.homestuckOrdinal, 1)
  assert.equal(reference.pages[0]?.titleHash, hashComparableTitle("Commande artificielle identique"))
  assert.deepEqual(reference.pages[1]?.mediaAssetOrdinals, [2])
  assert.equal(reference.pages[1]?.mediaCount, 2)
  assert.equal(reference.pages[1]?.isLog, true)
  assert.doesNotMatch(serialized, /Commande artificielle identique/)
  assert.doesNotMatch(serialized, /Dialogue synthétique confidentiel/)
  assert.match(reference.sourceHash, /^sha256:[0-9a-f]{64}$/)
})

test("relit un index versionné et refuse les incohérences", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-uhc-reference-"))
  try {
    const reference = await buildUhcReference(resolve("tests/fixtures/uhc-mspa.json"))
    const validPath = join(directory, "reference.json")
    await writeStableJsonFile(validPath, reference)
    assert.deepEqual(await readUhcReference(validPath), reference)

    const invalidPath = join(directory, "invalid.json")
    await writeFile(invalidPath, JSON.stringify({ ...reference, pages: [{ ...reference.pages[0], uhcMspaId: "999999" }] }), "utf8")
    await assert.rejects(() => readUhcReference(invalidPath), InputValidationError)

    const emptyArchive = join(directory, "empty-mspa.json")
    await writeFile(emptyArchive, JSON.stringify({ story: {} }), "utf8")
    await assert.rejects(() => buildUhcReference(emptyArchive), InputValidationError)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("enrichit les candidats avec la référence UHC locale", async () => {
  const reference = await buildUhcReference(resolve("tests/fixtures/uhc-mspa.json"))
  const page = {
    pageNumber: 1,
    title: "Commande artificielle identique",
    body: "[img]/storyfiles/hs2/00001.gif[/img]",
    nextPageNumbers: [],
    classifications: ["TEXT_TRANSLATABLE" as const],
  }
  const snapshot: TranslationSourceSnapshot = {
    schemaVersion: 1,
    provider: "fixture",
    adventureId: "uhc-reference-test",
    metadata: {},
    pages: [page],
  }
  const candidate = proposeMappings(snapshot, [], reference).proposals[0]?.candidates[0]

  assert.equal(candidate?.homestuckOrdinal, 1)
  assert.ok(candidate?.evidence.some((evidence) => evidence.type === "uhc-reference"))
  assert.ok(candidate?.evidence.some((evidence) => evidence.type === "title"))
  assert.ok(candidate?.evidence.some((evidence) => evidence.type === "structure"))
})

test("marque obsolète un mapping vérifié lorsque son hash source change", () => {
  const page = {
    pageNumber: 1,
    title: "Page synthétique",
    body: "Texte synthétique",
    nextPageNumbers: [],
    classifications: ["TEXT_TRANSLATABLE" as const],
  }
  const snapshot: TranslationSourceSnapshot = {
    schemaVersion: 1,
    provider: "fixture",
    adventureId: "stale-test",
    metadata: {},
    pages: [page],
  }
  const mapping: PageMapping = {
    mspfaPageNumber: 1,
    homestuckOrdinal: 1,
    uhcMspaId: "001901",
    status: "verified",
    confidence: "exact",
    evidence: [{ type: "fixture", value: "preuve synthétique" }],
    sourceHash: sourcePageHash(page),
    lastVerified: "2026-08-20",
  }

  assert.equal(proposeMappings(snapshot, [mapping]).proposals[0]?.status, "mapped")
  const staleMapping = { ...mapping, sourceHash: `sha256:${"0".repeat(64)}` }
  const proposal = proposeMappings(snapshot, [staleMapping]).proposals[0]
  assert.equal(proposal?.status, "stale")
  assert.equal(proposal?.candidates[0]?.confidence, "ambiguous")
})
