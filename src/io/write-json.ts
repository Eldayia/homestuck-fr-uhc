import { mkdir, rename, rm, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { randomUUID } from "node:crypto"

import { stableStringify } from "../domain/hash.js"

export async function writeStableJsonFile(path: string, value: unknown): Promise<void> {
  const stable = JSON.parse(stableStringify(value)) as unknown
  await writeTextFileAtomically(path, `${JSON.stringify(stable, null, 2)}\n`)
}

export async function writeTextFileAtomically(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, content, "utf8")
    await rename(temporary, path)
  } finally {
    await rm(temporary, { force: true })
  }
}
