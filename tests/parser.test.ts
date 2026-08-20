import assert from "node:assert/strict"
import test from "node:test"

import { UnsafeContentError } from "../src/domain/errors.js"
import { parseSafeBbcode } from "../src/parser/safe-bbcode.js"

test("convertit uniquement le BBCode autorisé et échappe le HTML", () => {
  const output = parseSafeBbcode('[b]Fort[/b]\n<i>littéral</i> [url=https://example.test/a?x=1&y=2]lien[/url]')

  assert.equal(
    output,
    '<strong>Fort</strong><br>&lt;i&gt;littéral&lt;/i&gt; <a href="https://example.test/a?x=1&amp;y=2" rel="noopener noreferrer">lien</a>',
  )
})

test("refuse le contenu actif", () => {
  assert.throws(() => parseSafeBbcode("<script>alert(1)</script>"), UnsafeContentError)
  assert.throws(() => parseSafeBbcode("[url=javascript:alert(1)]x[/url]"), UnsafeContentError)
  assert.throws(() => parseSafeBbcode("[video]x[/video]"), UnsafeContentError)
})
