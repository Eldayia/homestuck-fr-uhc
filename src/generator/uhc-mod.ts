import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { stableStringify } from "../domain/hash.js"
import type { CanonicalTranslationPage, GeneratedTranslation } from "../domain/types.js"

export function createTranslation(pages: CanonicalTranslationPage[]): GeneratedTranslation {
  const entries = pages
    .map((page) => {
      if (page.mapping === undefined) throw new Error("Invariant: mapping absent après validation")
      return [page.mapping.uhcMspaId, page.translation] as const
    })
    .sort(([left], [right]) => left.localeCompare(right))
  return Object.fromEntries(entries)
}

export async function writeUhcMod(outputDirectory: string, translation: GeneratedTranslation): Promise<void> {
  await mkdir(outputDirectory, { recursive: true })
  await writeFile(join(outputDirectory, "translation.json"), `${prettyStableJson(translation)}\n`, "utf8")
  await writeFile(join(outputDirectory, "mod.js"), MOD_TEMPLATE, "utf8")
}

function prettyStableJson(value: unknown): string {
  return JSON.stringify(JSON.parse(stableStringify(value)) as unknown, null, 2)
}

const MOD_TEMPLATE = `module.exports = {
  title: "Homestuck FR",
  summary: "Traduction française communautaire pour UHC",
  description: "Mod communautaire non officiel, généré localement.",
  author: "Contributeurs Homestuck FR UHC",
  modVersion: 1,
  edit: true,

  computed(api) {
    const translation = api.readJson("./translation.json")

    return {
      edit(archive) {
        for (const [id, patch] of Object.entries(translation)) {
          const page = archive.mspa.story[id]
          if (!page) {
            api.logger.warn(\`Page UHC inconnue: \${id}\`)
            continue
          }
          if (Object.prototype.hasOwnProperty.call(patch, "title")) page.title = patch.title
          if (Object.prototype.hasOwnProperty.call(patch, "content")) page.content = patch.content
        }
      }
    }
  }
}
`
