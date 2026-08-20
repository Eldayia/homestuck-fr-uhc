import { execFileSync } from "node:child_process"
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

import { extractZip } from "./zip-utils.mjs"

const releaseDirectory = resolve(".release")
const archive = (await readdir(releaseDirectory)).find((name) => name.endsWith(".zip"))
if (archive === undefined) throw new Error("Aucune archive .zip dans .release")
const manifest = JSON.parse(await readFile(join(releaseDirectory, "release-manifest.json"), "utf8"))
if (manifest.archive !== archive || manifest.format !== "zip" || !Array.isArray(manifest.files)) {
  throw new Error("Manifest de release ZIP incohérent")
}
if (manifest.files.some((path) => path.startsWith("package/"))) throw new Error("Le ZIP contient encore un dossier package/ intermédiaire")

const installDirectory = await mkdtemp(join(tmpdir(), "hsfr-zip-"))
try {
  const extracted = await extractZip(join(releaseDirectory, archive), installDirectory)
  if (JSON.stringify(extracted.sort()) !== JSON.stringify([...manifest.files].sort())) {
    throw new Error("Le contenu extrait ne correspond pas au manifest")
  }
  await stat(join(installDirectory, "hsfr.cmd"))
  await stat(join(installDirectory, "data", "overrides", "pages.json"))
  const cli = join(installDirectory, "dist", "src", "cli", "index.js")
  const help = execFileSync(process.execPath, [cli, "--help"], { encoding: "utf8", cwd: installDirectory })
  if (!help.includes("hsfr install") || !help.includes("MODE B")) throw new Error("L'outil extrait ne fournit pas l'aide attendue")
  const launcherHelp = process.platform === "win32"
    ? execFileSync("cmd.exe", ["/d", "/c", join(installDirectory, "hsfr.cmd"), "--help"], { encoding: "utf8", cwd: installDirectory })
    : execFileSync("sh", [join(installDirectory, "hsfr"), "--help"], { encoding: "utf8", cwd: installDirectory })
  if (!launcherHelp.includes("hsfr install")) throw new Error("Le lanceur direct du ZIP ne fonctionne pas")
  process.stdout.write(`[OK] Extraction directe et exécution validées depuis ${archive}\n`)
} finally {
  await rm(installDirectory, { recursive: true, force: true })
}
