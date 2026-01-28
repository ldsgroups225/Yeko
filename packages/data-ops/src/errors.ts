/**
 * Standardized database error types for the Yeko Data Access Layer.
 */
export type DatabaseErrorType
  = | 'NOT_FOUND'
    | 'CONFLICT'
    | 'PERMISSION_DENIED'
    | 'VALIDATION_ERROR'
    | 'INTERNAL_ERROR'
    | 'UNAUTHORIZED'

export class DatabaseError extends Error {
  constructor(
    public type: DatabaseErrorType,
    message: string,
    public details?: Record<string, unknown>,
    public originalError?: unknown,
  ) {
    super(message)
    this.name = 'DatabaseError'
  }

  static from(error: unknown, type: DatabaseErrorType = 'INTERNAL_ERROR', message?: string): DatabaseError {
    if (error instanceof DatabaseError)
      return error
    if (error instanceof Error) {
      return new DatabaseError(type, message || error.message, {}, error)
    }
    return new DatabaseError(type, message || String(error), {}, error)
  }
}

export function dbError(type: DatabaseErrorType, message: string, details?: Record<string, unknown>) {
  return new DatabaseError(type, message, details)
}
