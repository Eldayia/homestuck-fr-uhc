import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

import type { TranslationSource, TranslationSourceSnapshot } from "../../src/domain/types.js"
import { InputValidationError, SourceAccessError } from "../../src/domain/errors.js"
import { writeStableJsonFile } from "../../src/io/write-json.js"
import { MspfaSnapshotSource, parseMspfaSnapshot } from "./snapshot-source.js"

const DEFAULT_ENDPOINT = "https://mspfa.com/"
const DEFAULT_USER_AGENT = "homestuck-fr-uhc/0.1.0 (+https://github.com/Eldayia/homestuck-fr-uhc)"

export interface MspfaNetworkSourceOptions {
  adventureId: string
  cacheDirectory: string
  offline?: boolean
  timeoutMs?: number
  retries?: number
  minimumIntervalMs?: number
  maximumResponseBytes?: number
  fetchImplementation?: typeof fetch
  sleep?: (milliseconds: number) => Promise<void>
  now?: () => number
}

export class MspfaNetworkSource implements TranslationSource {
  private readonly fetchImplementation: typeof fetch
  private readonly sleep: (milliseconds: number) => Promise<void>
  private readonly now: () => number

  constructor(private readonly options: MspfaNetworkSourceOptions) {
    if (!/^\d+$/.test(options.adventureId)) {
      throw new InputValidationError("L'identifiant MSPFA doit être numérique")
    }
    assertNonNegativeInteger(options.retries ?? 2, "retries")
    assertPositiveInteger(options.timeoutMs ?? 30_000, "timeoutMs")
    assertNonNegativeInteger(options.minimumIntervalMs ?? 60_000, "minimumIntervalMs")
    assertPositiveInteger(options.maximumResponseBytes ?? 32 * 1024 * 1024, "maximumResponseBytes")

    this.fetchImplementation = options.fetchImplementation ?? fetch
    this.sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)))
    this.now = options.now ?? Date.now
  }

  async load(): Promise<TranslationSourceSnapshot> {
    const rawPath = this.rawCachePath()
    if (this.options.offline === true) {
      try {
        return await new MspfaSnapshotSource(rawPath, this.options.adventureId).load()
      } catch (error) {
        throw new SourceAccessError(`Mode hors ligne: cache MSPFA inutilisable (${errorMessage(error)})`)
      }
    }

    await mkdir(this.options.cacheDirectory, { recursive: true })
    await this.respectMinimumInterval()
    const rawText = await this.fetchWithRetries()

    let raw: unknown
    try {
      raw = JSON.parse(rawText) as unknown
    } catch (error) {
      throw new SourceAccessError(`MSPFA a renvoyé un JSON invalide: ${errorMessage(error)}`)
    }

    const snapshot = parseMspfaSnapshot(raw, this.options.adventureId)
    await writeFileAtomically(rawPath, rawText)
    await writeStableJsonFile(this.metadataPath(), {
      schemaVersion: 1,
      adventureId: this.options.adventureId,
      endpoint: DEFAULT_ENDPOINT,
      fetchedAt: new Date(this.now()).toISOString(),
      sourceRevision: snapshot.sourceRevision ?? null,
    })
    return snapshot
  }

  private async respectMinimumInterval(): Promise<void> {
    const minimumIntervalMs = this.options.minimumIntervalMs ?? 60_000
    let lastRequestAt = 0
    try {
      const state = JSON.parse(await readFile(this.requestStatePath(), "utf8")) as { lastRequestAt?: unknown }
      if (typeof state.lastRequestAt === "string") {
        lastRequestAt = Date.parse(state.lastRequestAt)
      }
    } catch {
      // L'absence ou la corruption de l'état ne rend pas le cache brut inutilisable.
    }

    const waitMs = Math.max(0, lastRequestAt + minimumIntervalMs - this.now())
    if (waitMs > 0) await this.sleep(waitMs)
    await writeStableJsonFile(this.requestStatePath(), {
      schemaVersion: 1,
      lastRequestAt: new Date(this.now()).toISOString(),
    })
  }

  private async fetchWithRetries(): Promise<string> {
    const retries = this.options.retries ?? 2
    let lastError: unknown

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await this.performRequest()
        if (response.ok) return await this.readBoundedResponse(response)

        const retryable = response.status === 429 || response.status >= 500
        const message = `MSPFA a répondu HTTP ${response.status}`
        if (!retryable || attempt === retries) throw new SourceAccessError(message)
        lastError = new SourceAccessError(message)
      } catch (error) {
        if (error instanceof SourceAccessError && !/^MSPFA a répondu HTTP (?:429|5\d\d)$/.test(error.message)) {
          throw error
        }
        lastError = error
        if (attempt === retries) break
      }

      await this.sleep(Math.min(1_000 * 2 ** attempt, 10_000))
    }

    throw new SourceAccessError(`Impossible de récupérer MSPFA après ${retries + 1} tentative(s): ${errorMessage(lastError)}`)
  }

  private async performRequest(): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 30_000)
    try {
      return await this.fetchImplementation(DEFAULT_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": DEFAULT_USER_AGENT,
        },
        body: new URLSearchParams({ do: "story", s: this.options.adventureId }),
        redirect: "error",
        signal: controller.signal,
      })
    } catch (error) {
      const reason = controller.signal.aborted ? "délai dépassé" : errorMessage(error)
      throw new Error(`Requête MSPFA échouée: ${reason}`)
    } finally {
      clearTimeout(timeout)
    }
  }

  private async readBoundedResponse(response: Response): Promise<string> {
    const maximum = this.options.maximumResponseBytes ?? 32 * 1024 * 1024
    const declaredLength = Number(response.headers.get("content-length"))
    if (Number.isFinite(declaredLength) && declaredLength > maximum) {
      throw new SourceAccessError(`Réponse MSPFA trop volumineuse: ${declaredLength} octets`)
    }
    const text = await response.text()
    const actualLength = Buffer.byteLength(text, "utf8")
    if (actualLength > maximum) {
      throw new SourceAccessError(`Réponse MSPFA trop volumineuse: ${actualLength} octets`)
    }
    return text
  }

  private rawCachePath(): string {
    return join(this.options.cacheDirectory, `${this.options.adventureId}.raw.json`)
  }

  private metadataPath(): string {
    return join(this.options.cacheDirectory, `${this.options.adventureId}.metadata.json`)
  }

  private requestStatePath(): string {
    return join(this.options.cacheDirectory, "request-state.json")
  }
}

async function writeFileAtomically(path: string, content: string): Promise<void> {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`
  try {
    await writeFile(temporary, content, "utf8")
    await rename(temporary, path)
  } finally {
    await rm(temporary, { force: true })
  }
}

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) throw new InputValidationError(`${label} doit être un entier positif`)
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) throw new InputValidationError(`${label} doit être un entier positif ou nul`)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
