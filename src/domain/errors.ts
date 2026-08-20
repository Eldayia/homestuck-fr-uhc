export class HsfrError extends Error {
  constructor(message: string, readonly code: string) {
    super(message)
    this.name = new.target.name
  }
}

export class InputValidationError extends HsfrError {
  constructor(message: string) {
    super(message, "INPUT_VALIDATION_ERROR")
  }
}

export class UnsafeContentError extends HsfrError {
  constructor(message: string) {
    super(message, "UNSAFE_CONTENT")
  }
}

export class MappingError extends HsfrError {
  constructor(message: string) {
    super(message, "MAPPING_ERROR")
  }
}

export class OverrideConflictError extends HsfrError {
  constructor(message: string) {
    super(message, "OVERRIDE_CONFLICT")
  }
}

export class DistributionBlockedError extends HsfrError {
  constructor(message: string) {
    super(message, "CONTENT_DISTRIBUTION_BLOCKED")
  }
}

export class SourceAccessError extends HsfrError {
  constructor(message: string) {
    super(message, "SOURCE_ACCESS_ERROR")
  }
}
