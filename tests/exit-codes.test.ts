import assert from "node:assert/strict"
import test from "node:test"

import { EXIT_CODES, exitCodeForError } from "../src/cli/exit-codes.js"
import {
  DistributionBlockedError,
  InputValidationError,
  MappingError,
  OverrideConflictError,
  SourceAccessError,
  UnsafeContentError,
} from "../src/domain/errors.js"

test("associe un code de sortie stable à chaque famille d'erreur", () => {
  assert.equal(exitCodeForError(new InputValidationError("fixture")), EXIT_CODES.INPUT_VALIDATION)
  assert.equal(exitCodeForError(new UnsafeContentError("fixture")), EXIT_CODES.UNSAFE_CONTENT)
  assert.equal(exitCodeForError(new MappingError("fixture")), EXIT_CODES.MAPPING)
  assert.equal(exitCodeForError(new OverrideConflictError("fixture")), EXIT_CODES.OVERRIDE_CONFLICT)
  assert.equal(exitCodeForError(new DistributionBlockedError("fixture")), EXIT_CODES.DISTRIBUTION_BLOCKED)
  assert.equal(exitCodeForError(new SourceAccessError("fixture")), EXIT_CODES.SOURCE_ACCESS)
})
