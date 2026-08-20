import { mkdir } from "node:fs/promises"
import { join } from "node:path"

import type { CanonicalTranslationPage, GeneratedTranslation } from "../domain/types.js"
import { MOD_VERSION } from "../domain/version.js"
import { writeStableJsonFile, writeTextFileAtomically } from "../io/write-json.js"

export { MOD_VERSION } from "../domain/version.js"

export const UHC_COMPATIBILITY = {
  schemaVersion: 1,
  integrationHook: "edit",
  targetAppVersion: "2.8.1",
  minimumAppVersion: null,
  testedAppVersions: [] as string[],
  manualValidationRequired: true,
  usesVueHooks: false,
  hasSettings: false,
  preservesUnpatchedFields: true,
} as const

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
  await writeStableJsonFile(join(outputDirectory, "translation.json"), translation)
  await writeTextFileAtomically(join(outputDirectory, "mod.js"), MOD_TEMPLATE)
  await writeStableJsonFile(join(outputDirectory, "compatibility.json"), UHC_COMPATIBILITY)
  await writeTextFileAtomically(join(outputDirectory, "CREDITS.txt"), CREDITS_TEMPLATE)
}

const MOD_TEMPLATE = `module.exports = {
  title: "Homestuck FR",
  summary: "Traduction française communautaire pour UHC",
  description: "Mod communautaire non officiel généré localement. Traduction et outils crédités dans CREDITS.txt.",
  author: "Équipe de traduction française et contributeurs Homestuck FR UHC",
  modVersion: ${MOD_VERSION},
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

const CREDITS_TEMPLATE = `Homestuck FR — crédits

Homestuck a été créé par Andrew Hussie.

Traduction française : projet Homestuck en Français
https://mspfa.com/?s=45546&p=1

The Unofficial Homestuck Collection a été créé par Bambosh, est maintenu
par GiovanH et a reçu les contributions de sa communauté.
https://github.com/GiovanH/unofficial-homestuck-collection

Intégration technique Homestuck FR UHC :
https://github.com/Eldayia/homestuck-fr-uhc

Consulter CREDITS.md et NOTICE dans le dépôt des outils pour les crédits
détaillés et les limites juridiques. Ce mod est non officiel.
`
