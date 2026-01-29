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
    | 'PAYMENT_CONFLICT'
    | 'INVALID_INSTALLMENT'
    | 'UNBALANCED_TRANSACTION'

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

  static from(error: unknown, type: DatabaseErrorType = 'INTERNAL_ERROR', message?: string, details: Record<string, unknown> = {}): DatabaseError {
    if (error instanceof DatabaseError)
      return error
    if (error instanceof Error) {
      return new DatabaseError(type, message || error.message, details, error)
    }
    return new DatabaseError(type, message || String(error), details, error)
  }
}

export function dbError(type: DatabaseErrorType, message: string, details?: Record<string, unknown>) {
  return new DatabaseError(type, message, details)
}
