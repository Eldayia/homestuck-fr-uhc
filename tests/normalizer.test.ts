import assert from "node:assert/strict"
import test from "node:test"

import { InputValidationError } from "../src/domain/errors.js"
import type { SourcePage } from "../src/domain/types.js"
import { createTranslation } from "../src/generator/uhc-mod.js"
import { normalizePage } from "../src/normalizer/normalize-page.js"
import { validatePages } from "../src/validator/validate-pages.js"

test("normalise les trois wrappers de logs MSPFA", () => {
  for (const label of ["PESTERLOG", "DIALOGLOG", "SPRITELOG"] as const) {
    const normalized = normalizePage("fixture", "logs", page({
      body: `[spoiler=${label}]AA : aLtErNaNcE !!![/spoiler]\n[spoiler=${label}][color=#008800]BB : réponse[/color][/spoiler]`,
      logLabel: label,
      classifications: ["LOG_TRANSLATABLE"],
    }))
    assert.equal(
      normalized.translation.content,
      `|${label}|AA : aLtErNaNcE !!!<br><span style="color: #008800">BB : réponse</span>`,
    )
  }
})

test("refuse les wrappers de logs ambigus ou incomplets", () => {
  assert.throws(() => normalizePage("fixture", "logs", page({
    body: "texte extérieur[spoiler=PESTERLOG]AA[/spoiler]",
    logLabel: "PESTERLOG",
    classifications: ["LOG_TRANSLATABLE"],
  })), InputValidationError)
  assert.throws(() => normalizePage("fixture", "logs", page({
    body: "[spoiler=DIALOGLOG]AA[/spoiler]",
    logLabel: "PESTERLOG",
    classifications: ["LOG_TRANSLATABLE"],
  })), InputValidationError)
  assert.throws(() => normalizePage("fixture", "logs", page({
    body: "[spoiler=SPRITELOG]AA",
    logLabel: "SPRITELOG",
    classifications: ["LOG_TRANSLATABLE"],
  })), InputValidationError)
})

test("distingue les champs absents des chaînes volontairement vides", () => {
  const absent = normalizePage("fixture", "empty", page({}))
  const empty = normalizePage("fixture", "empty", page({ body: "" }))
  const mapping = {
    mspfaPageNumber: 1,
    homestuckOrdinal: 1,
    uhcMspaId: "001901",
    status: "verified" as const,
    confidence: "exact" as const,
    evidence: [{ type: "fixture" as const, value: "champ vide artificiel" }],
  }
  const mappedEmpty = { ...empty, mapping }

  assert.deepEqual(absent.translation, {})
  assert.deepEqual(empty.translation, { content: "" })
  assert.notEqual(absent.source.rawHash, empty.source.rawHash)
  assert.notEqual(absent.source.normalizedHash, empty.source.normalizedHash)
  assert.doesNotThrow(() => validatePages([mappedEmpty]))
  assert.deepEqual(createTranslation([mappedEmpty]), { "001901": { content: "" } })
  assert.throws(() => validatePages([{ ...absent, mapping }]), InputValidationError)
})

test("préserve espaces, ponctuation et quirks tout en normalisant les fins de ligne", () => {
  const windows = normalizePage("fixture", "format", page({
    title: "  ==> cOmMaNdE ?!  ",
    body: "  Premier bloc.\r\nDeuxième BLOC !!!  ",
  }))
  const unix = normalizePage("fixture", "format", page({
    title: "  ==> cOmMaNdE ?!  ",
    body: "  Premier bloc.\nDeuxième BLOC !!!  ",
  }))

  assert.equal(windows.translation.title, "  ==&gt; cOmMaNdE ?!  ")
  assert.equal(windows.translation.content, "  Premier bloc.<br>Deuxième BLOC !!!  ")
  assert.equal(windows.source.normalizedHash, unix.source.normalizedHash)
  assert.notEqual(windows.source.rawHash, unix.source.rawHash)
})

function page(overrides: Partial<SourcePage>): SourcePage {
  return {
    pageNumber: 1,
    nextPageNumbers: [],
    classifications: ["TEXT_TRANSLATABLE"],
    ...overrides,
  }
}
