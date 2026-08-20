import { mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

import { stableStringify } from "../domain/hash.js"

export async function writeStableJsonFile(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const stable = JSON.parse(stableStringify(value)) as unknown
  await writeFile(path, `${JSON.stringify(stable, null, 2)}\n`, "utf8")
}
