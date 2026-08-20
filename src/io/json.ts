import { readFile } from "node:fs/promises"

import { InputValidationError } from "../domain/errors.js"

export async function readJsonFile(path: string): Promise<unknown> {
  let text: string
  try {
    text = await readFile(path, "utf8")
  } catch (error) {
    throw new InputValidationError(`Impossible de lire ${path}: ${errorMessage(error)}`)
  }

  try {
    return JSON.parse(text) as unknown
  } catch (error) {
    throw new InputValidationError(`JSON invalide dans ${path}: ${errorMessage(error)}`)
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new InputValidationError(`${label} doit être un objet JSON`)
  }
}

export function assertArray(value: unknown, label: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new InputValidationError(`${label} doit être un tableau JSON`)
  }
}

export function requiredString(record: Record<string, unknown>, key: string, label: string): string {
  const value = record[key]
  if (typeof value !== "string" || value.length === 0) {
    throw new InputValidationError(`${label}.${key} doit être une chaîne non vide`)
  }
  return value
}

export function requiredInteger(record: Record<string, unknown>, key: string, label: string): number {
  const value = record[key]
  if (!Number.isInteger(value)) {
    throw new InputValidationError(`${label}.${key} doit être un entier`)
  }
  return value as number
}
