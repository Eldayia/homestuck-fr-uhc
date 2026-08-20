import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { basename, join, resolve } from "node:path"

const npmCli = process.env.npm_execpath
if (npmCli === undefined) throw new Error("Ce script doit être lancé avec npm run release:build")
const releaseDirectory = resolve(".release")
const workDirectory = await mkdtemp(join(tmpdir(), "hsfr-release-"))
const npmEnvironment = { ...process.env, npm_config_cache: join(workDirectory, "npm-cache") }

try {
  const first = await pack(join(workDirectory, "first"))
  const second = await pack(join(workDirectory, "second"))
  if (first.hash !== second.hash) throw new Error("Les deux archives MODE B ne sont pas reproductibles")
  if (JSON.stringify(first.files) !== JSON.stringify(second.files)) throw new Error("Les manifests des deux archives diffèrent")

  await rm(releaseDirectory, { recursive: true, force: true })
  await mkdir(releaseDirectory, { recursive: true })
  const archiveName = basename(first.path)
  await cp(first.path, join(releaseDirectory, archiveName))
  await writeFile(join(releaseDirectory, "SHA256SUMS"), `${first.hash}  ${archiveName}\n`, "utf8")
  await writeFile(join(releaseDirectory, "release-manifest.json"), `${JSON.stringify({
    schemaVersion: 1,
    package: archiveName,
    sha256: first.hash,
    fileCount: first.files.length,
    files: first.files,
  }, null, 2)}\n`, "utf8")
  process.stdout.write(`[OK] Archive MODE B reproductible: ${archiveName} (${first.files.length} fichiers, ${first.hash})\n`)
} finally {
  await rm(workDirectory, { recursive: true, force: true })
}

async function pack(destination) {
  await mkdir(destination, { recursive: true })
  const raw = execFileSync(process.execPath, [npmCli, "pack", "--json", "--pack-destination", destination], {
    encoding: "utf8",
    env: npmEnvironment,
  })
  const result = JSON.parse(raw)[0]
  if (!result || typeof result.filename !== "string" || !Array.isArray(result.files)) throw new Error("Résultat npm pack invalide")
  const files = result.files.map((entry) => entry.path).sort()
  for (const path of files) assertAllowed(path)
  const archivePath = join(destination, result.filename)
  const archive = await readFile(archivePath)
  return { path: archivePath, files, hash: createHash("sha256").update(archive).digest("hex") }
}

function assertAllowed(path) {
  const allowedExact = new Set([
    "CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "CREDITS.md", "LICENSE", "NOTICE", "README.md", "THIRD_PARTY.md", "package.json",
  ])
  const allowedPrefixes = ["data/assets/", "data/mapping/", "data/metadata/", "data/overrides/", "dist/", "docs/", "schemas/"]
  if (!allowedExact.has(path) && !allowedPrefixes.some((prefix) => path.startsWith(prefix))) {
    throw new Error(`Fichier interdit dans l'archive MODE B: ${path}`)
  }
  if (/translation\.json$|\.(?:7z|gif|jpe?g|mp3|mp4|png|swf|webp|zip)$/i.test(path)) {
    throw new Error(`Contenu ou asset interdit dans l'archive MODE B: ${path}`)
  }
}
