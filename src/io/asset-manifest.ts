import { InputValidationError } from "../domain/errors.js"
import type { AssetManifest, AssetManifestEntry } from "../domain/types.js"
import { assertArray, assertRecord, readJsonFile, requiredString } from "./json.js"

export async function readAssetManifest(path: string): Promise<AssetManifest> {
  const value = await readJsonFile(path)
  assertRecord(value, "assetManifest")
  if (value.schemaVersion !== 1) throw new InputValidationError("assetManifest.schemaVersion doit valoir 1")
  assertArray(value.assets, "assetManifest.assets")
  const seen = new Set<string>()
  const assets = value.assets.map((entry, index) => parseAsset(entry, index, seen))
  return { schemaVersion: 1, assets }
}

function parseAsset(value: unknown, index: number, seen: Set<string>): AssetManifestEntry {
  const label = `assetManifest.assets[${index}]`
  assertRecord(value, label)
  const assetId = requiredString(value, "assetId", label)
  if (seen.has(assetId)) throw new InputValidationError(`Asset dupliqué dans le manifest: ${assetId}`)
  seen.add(assetId)
  const uhcMspaId = requiredString(value, "uhcMspaId", label)
  if (!/^\d{6}$/.test(uhcMspaId)) throw new InputValidationError(`${label}.uhcMspaId est invalide`)
  const kind = requiredString(value, "kind", label)
  if (kind !== "image" && kind !== "flash" && kind !== "html5" && kind !== "interactive") {
    throw new InputValidationError(`${label}.kind est invalide`)
  }
  const source = requiredString(value, "source", label)
  if (source !== "uhc-local" && source !== "translation-local") throw new InputValidationError(`${label}.source est invalide`)
  const sourceHash = requiredString(value, "sourceHash", label)
  if (!/^sha256:[0-9a-f]{64}$/.test(sourceHash)) throw new InputValidationError(`${label}.sourceHash est invalide`)
  const status = requiredString(value, "status", label)
  if (status !== "local-only" && status !== "authorized" && status !== "blocked") {
    throw new InputValidationError(`${label}.status est invalide`)
  }
  if (value.distributionReference !== null && typeof value.distributionReference !== "string") {
    throw new InputValidationError(`${label}.distributionReference doit être une chaîne ou null`)
  }
  if (status === "authorized" && (typeof value.distributionReference !== "string" || value.distributionReference.length === 0)) {
    throw new InputValidationError(`${label}: un asset autorisé exige une référence de distribution`)
  }
  if (status !== "authorized" && value.distributionReference !== null) {
    throw new InputValidationError(`${label}: seul un asset autorisé peut porter une référence de distribution`)
  }
  return {
    assetId,
    uhcMspaId,
    kind,
    source,
    sourceHash,
    status,
    distributionReference: value.distributionReference,
  }
}
