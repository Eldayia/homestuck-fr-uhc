import assert from "node:assert/strict"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"

import { MspfaNetworkSource } from "../adapters/mspfa/network-source.js"
import { SourceAccessError } from "../src/domain/errors.js"

const fixturePath = resolve("tests/fixtures/mspfa-compact.json")

test("récupère par POST, met en cache et relit entièrement hors ligne", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-network-"))
  const raw = await readFile(fixturePath, "utf8")
  let requestCount = 0
  let capturedBody = ""
  let capturedUserAgent = ""
  const fakeFetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    requestCount += 1
    capturedBody = String(init?.body)
    capturedUserAgent = new Headers(init?.headers).get("User-Agent") ?? ""
    return new Response(raw, { status: 200, headers: { "Content-Type": "application/json" } })
  }) as typeof fetch

  try {
    const online = new MspfaNetworkSource({
      adventureId: "99999",
      cacheDirectory: directory,
      minimumIntervalMs: 0,
      fetchImplementation: fakeFetch,
    })
    const first = await online.load()
    assert.equal(requestCount, 1)
    assert.equal(capturedBody, "do=story&s=99999")
    assert.match(capturedUserAgent, /^homestuck-fr-uhc\/0\.1\.0/)
    assert.equal(first.pages.length, 3)
    assert.doesNotMatch(JSON.stringify(first), /NEVER_EXECUTE_THIS_FIXTURE/)

    const cachedRaw = await readFile(join(directory, "99999.raw.json"), "utf8")
    assert.match(cachedRaw, /NEVER_EXECUTE_THIS_FIXTURE/)

    const offline = new MspfaNetworkSource({
      adventureId: "99999",
      cacheDirectory: directory,
      offline: true,
      fetchImplementation: (() => {
        throw new Error("Le réseau ne doit pas être appelé")
      }) as typeof fetch,
    })
    const second = await offline.load()
    assert.deepEqual(second, first)
    assert.equal(requestCount, 1)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("limite la fréquence et retente seulement les erreurs temporaires", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-retry-"))
  const raw = await readFile(fixturePath, "utf8")
  let calls = 0
  let currentTime = Date.parse("2026-08-20T00:00:00Z")
  const waits: number[] = []
  const sleep = async (milliseconds: number) => {
    waits.push(milliseconds)
    currentTime += milliseconds
  }
  const fakeFetch = (async () => {
    calls += 1
    if (calls === 1) return new Response("temporaire", { status: 503 })
    return new Response(raw, { status: 200 })
  }) as typeof fetch

  try {
    const first = new MspfaNetworkSource({
      adventureId: "99999",
      cacheDirectory: directory,
      retries: 1,
      minimumIntervalMs: 60_000,
      fetchImplementation: fakeFetch,
      sleep,
      now: () => currentTime,
    })
    await first.load()
    assert.equal(calls, 2)
    assert.deepEqual(waits, [1_000])

    const second = new MspfaNetworkSource({
      adventureId: "99999",
      cacheDirectory: directory,
      retries: 0,
      minimumIntervalMs: 60_000,
      fetchImplementation: fakeFetch,
      sleep,
      now: () => currentTime,
    })
    await second.load()
    assert.equal(calls, 3)
    assert.deepEqual(waits, [1_000, 59_000])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("ne retente pas une erreur HTTP définitive et exige un cache hors ligne", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-http-"))
  let calls = 0
  const notFound = (async () => {
    calls += 1
    return new Response("absent", { status: 404 })
  }) as typeof fetch

  try {
    await assert.rejects(() => new MspfaNetworkSource({
      adventureId: "99999",
      cacheDirectory: directory,
      retries: 3,
      minimumIntervalMs: 0,
      fetchImplementation: notFound,
    }).load(), SourceAccessError)
    assert.equal(calls, 1)

    await assert.rejects(() => new MspfaNetworkSource({
      adventureId: "88888",
      cacheDirectory: directory,
      offline: true,
    }).load(), SourceAccessError)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("interrompt une requête trop lente et refuse une réponse trop volumineuse", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hsfr-limits-"))
  const slowFetch = ((_input: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
  })) as typeof fetch
  const oversizedFetch = (async () => new Response("contenu trop long", {
    status: 200,
    headers: { "Content-Length": "17" },
  })) as typeof fetch

  try {
    await assert.rejects(() => new MspfaNetworkSource({
      adventureId: "99999",
      cacheDirectory: directory,
      timeoutMs: 5,
      retries: 0,
      minimumIntervalMs: 0,
      fetchImplementation: slowFetch,
    }).load(), /délai dépassé/)

    await assert.rejects(() => new MspfaNetworkSource({
      adventureId: "99999",
      cacheDirectory: directory,
      maximumResponseBytes: 10,
      retries: 0,
      minimumIntervalMs: 0,
      fetchImplementation: oversizedFetch,
    }).load(), /trop volumineuse/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
