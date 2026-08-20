import { InputValidationError } from "../domain/errors.js"
import type { SourcePage } from "../domain/types.js"

type LogLabel = NonNullable<SourcePage["logLabel"]>

const LOG_BLOCK = /\[spoiler=(PESTERLOG|DIALOGLOG|SPRITELOG)\]([\s\S]*?)\[\/spoiler\]/gi
const LOG_OPENING = /\[spoiler=(?:PESTERLOG|DIALOGLOG|SPRITELOG)\]/i

export function normalizeLogBody(body: string, expectedLabel: LogLabel): string {
  const blocks: string[] = []
  let cursor = 0
  let match: RegExpExecArray | null

  LOG_BLOCK.lastIndex = 0
  while ((match = LOG_BLOCK.exec(body)) !== null) {
    assertWhitespaceOnly(body.slice(cursor, match.index), expectedLabel)
    const label = match[1]?.toUpperCase()
    if (label !== expectedLabel) {
      throw new InputValidationError(`Log ${expectedLabel} contenant un bloc ${label ?? "inconnu"}`)
    }
    blocks.push(match[2] ?? "")
    cursor = match.index + match[0].length
  }

  if (blocks.length === 0) {
    if (LOG_OPENING.test(body)) throw new InputValidationError(`Wrapper ${expectedLabel} incomplet`)
    return body
  }
  assertWhitespaceOnly(body.slice(cursor), expectedLabel)
  return blocks.join("\n")
}

function assertWhitespaceOnly(value: string, label: LogLabel): void {
  if (value.trim().length > 0) {
    throw new InputValidationError(`Texte hors des blocs du log ${label}`)
  }
}
