import { execFileSync } from "node:child_process"
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const npmCli = process.env.npm_execpath
if (npmCli === undefined) throw new Error("Ce script doit être lancé avec npm run release:test")
const releaseDirectory = resolve(".release")
const archive = (await readdir(releaseDirectory)).find((name) => name.endsWith(".tgz"))
if (archive === undefined) throw new Error("Aucune archive .tgz dans .release")
const manifest = JSON.parse(await readFile(join(releaseDirectory, "release-manifest.json"), "utf8"))
if (manifest.package !== archive || !Array.isArray(manifest.files)) throw new Error("Manifest de release incohérent")

const installDirectory = await mkdtemp(join(tmpdir(), "hsfr-install-"))
try {
  execFileSync(process.execPath, [npmCli, "install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", installDirectory, join(releaseDirectory, archive)], {
    stdio: "pipe",
    env: { ...process.env, npm_config_cache: join(installDirectory, "npm-cache") },
  })
  const cli = join(installDirectory, "node_modules", "homestuck-fr-uhc", "dist", "src", "cli", "index.js")
  const help = execFileSync(process.execPath, [cli, "--help"], { encoding: "utf8", cwd: installDirectory })
  if (!help.includes("hsfr build") || !help.includes("MODE B")) throw new Error("L'outil installé ne fournit pas l'aide attendue")
  process.stdout.write(`[OK] Installation neuve et exécution validées depuis ${archive}\n`)
} finally {
  await rm(installDirectory, { recursive: true, force: true })
}
