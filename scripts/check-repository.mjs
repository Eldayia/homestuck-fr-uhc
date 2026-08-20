import { execFileSync } from "node:child_process"
import { readFileSync, statSync } from "node:fs"
import { extname } from "node:path"

const tracked = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" }).split("\0").filter(Boolean)
const errors = []
const forbiddenExtensions = new Set([".7z", ".avif", ".exe", ".gif", ".jpeg", ".jpg", ".mp3", ".mp4", ".png", ".swf", ".webp", ".zip"])
const textExtensions = new Set([".cjs", ".js", ".json", ".md", ".mjs", ".ts", ".txt", ".yml", ".yaml"])

for (const path of tracked) {
  const normalized = path.replaceAll("\\", "/")
  const extension = extname(normalized).toLowerCase()
  if (forbiddenExtensions.has(extension)) errors.push(`${normalized}: format binaire ou archive interdit dans Git`)
  if (normalized === "translation.json" || normalized.endsWith("/translation.json")) {
    errors.push(`${normalized}: sortie de traduction interdite dans Git`)
  }
  if ((/^(?:\.cache|dist|coverage|generated)\//.test(normalized) && normalized !== "generated/.gitkeep") || /^reports\/update-/.test(normalized)) {
    errors.push(`${normalized}: cache ou sortie locale suivi par Git`)
  }
  if (statSync(path).size > 1_000_000) errors.push(`${normalized}: fichier suivi supérieur à 1 Mo`)

  if (!textExtensions.has(extension)) continue
  const text = readFileSync(path, "utf8")
  if (text.length > 0 && !text.endsWith("\n")) errors.push(`${normalized}: fin de ligne finale manquante`)
  if (extension !== ".md" && text.split(/\r?\n/).some((line) => /[ \t]+$/.test(line))) {
    errors.push(`${normalized}: espaces de fin de ligne`)
  }

  if (extension === ".json" && !normalized.startsWith("tests/fixtures/")) {
    try {
      const value = JSON.parse(text)
      if (isTranslationSnapshot(value) || isRawMspfaExport(value)) {
        errors.push(`${normalized}: corpus MSPFA réel ou snapshot textuel interdit hors fixtures`)
      }
    } catch {
      errors.push(`${normalized}: JSON suivi invalide`)
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) process.stderr.write(`[REPOSITORY_CHECK] ${error}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(`[OK] ${tracked.length} fichiers suivis vérifiés: aucun corpus, cache, archive ou asset binaire interdit.\n`)
}

function isTranslationSnapshot(value) {
  return isRecord(value)
    && value.schemaVersion === 1
    && typeof value.provider === "string"
    && typeof value.adventureId === "string"
    && Array.isArray(value.pages)
    && value.pages.some((page) => isRecord(page) && (typeof page.title === "string" || typeof page.body === "string"))
}

function isRawMspfaExport(value) {
  return isRecord(value)
    && Array.isArray(value.p)
    && value.p.some((page) => isRecord(page) && (typeof page.c === "string" || typeof page.b === "string"))
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}
