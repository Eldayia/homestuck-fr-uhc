import { readFileSync } from "node:fs"

const packageJson = JSON.parse(readFileSync("package.json", "utf8"))
const readiness = JSON.parse(readFileSync("data/metadata/release-readiness.json", "utf8"))
const failures = []

if (packageJson.private !== true) failures.push("package.json doit rester private pour empêcher npm publish")
if (packageJson.license === "UNLICENSED") failures.push("la licence du code n'est pas approuvée")
if (readiness.toolVersion !== packageJson.version) failures.push("la version du registre de release diffère de package.json")
if (!readiness.licenseApproved) failures.push("licenseApproved doit être true")
if (!readiness.manualUhcValidationPassed) failures.push("manualUhcValidationPassed doit être true")
if (!readiness.publicationApproved) failures.push("publicationApproved doit être true")
if (typeof readiness.validationReference !== "string" || readiness.validationReference.length === 0) failures.push("une référence de validation approuvée est requise")

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`[RELEASE_BLOCKED] ${failure}\n`)
  process.exitCode = 1
} else {
  process.stdout.write("[OK] Décisions humaines de release enregistrées.\n")
}
