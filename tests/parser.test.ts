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
  assert.throws(() => parseSafeBbcode('<img src="x" onerror="alert(1)">'), UnsafeContentError)
  assert.throws(() => parseSafeBbcode("[url=javascript:alert(1)]x[/url]"), UnsafeContentError)
  assert.throws(() => parseSafeBbcode("[img]javascript:alert(1)[/img]"), UnsafeContentError)
})

test("retire les iframes MSPFA sans recopier leur contenu actif", () => {
  assert.equal(
    parseSafeBbcode('avant<iframe src="https://example.test/embed">secours</iframe>après'),
    "avantaprès",
  )
})

test("convertit les images distantes sans embarquer leurs fichiers", () => {
  assert.equal(
    parseSafeBbcode("[img]https://example.test/image.png?x=1&y=2[/img]"),
    '<img src="https://example.test/image.png?x=1&amp;y=2" alt="" loading="lazy">',
  )
  assert.equal(
    parseSafeBbcode("[img=640x480]https://example.test/image.png[/img]"),
    '<img src="https://example.test/image.png" alt="" loading="lazy" width="640" height="480">',
  )
})

test("conserve les marqueurs entre crochets qui ne sont pas du BBCode", () => {
  assert.equal(parseSafeBbcode("[CG] texte artificiel"), "[CG] texte artificiel")
})
