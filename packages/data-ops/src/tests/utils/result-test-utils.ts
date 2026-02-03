import type { Result } from 'neverthrow'
import type { Mock } from 'vitest'
import { ResultAsync } from 'neverthrow'
import { vi } from 'vitest'
import { DatabaseError } from '../../errors'

/**
 * Creates a mocked ResultAsync that resolves to a success value
 */
export function mockResultAsync<T>(value: T): ResultAsync<T, never> {
  return ResultAsync.fromPromise(Promise.resolve(value), () => {
    throw new Error('Should not error')
  }) as unknown as ResultAsync<T, never>
}

/**
 * Creates a mocked ResultAsync that resolves to an error
 */
export function mockResultAsyncError<E>(error: E): ResultAsync<never, E> {
  return ResultAsync.fromPromise(
    Promise.reject(error),
    e => e as E,
  ) as unknown as ResultAsync<never, E>
}

/**
 * Creates a typed DatabaseError for testing
 */
export function mockDatabaseError(
  type: DatabaseError['type'] = 'INTERNAL_ERROR',
  message = 'Test error',
  details?: Record<string, unknown>,
): DatabaseError {
  return new DatabaseError(type, message, details)
}

/**
 * Asserts that a Result is successful and returns the value
 */
export function expectResultSuccess<T, E>(
  result: Result<T, E> | ResultAsync<T, E>,
): Promise<T> | T {
  if (result instanceof ResultAsync) {
    return result.then((r) => {
      if (r.isErr()) {
        throw new Error(`Expected success but got error: ${JSON.stringify(r.error)}`)
      }
      return r.value
    })
  }

  if (result.isErr()) {
    throw new Error(`Expected success but got error: ${JSON.stringify(result.error)}`)
  }
  return result.value
}

/**
 * Asserts that a Result is an error and returns the error
 */
export function expectResultError<T, E>(
  result: Result<T, E> | ResultAsync<T, E>,
): Promise<E> | E {
  if (result instanceof ResultAsync) {
    return result.then((r) => {
      if (r.isOk()) {
        throw new Error(`Expected error but got success: ${JSON.stringify(r.value)}`)
      }
      return r.error
    })
  }

  if (result.isOk()) {
    throw new Error(`Expected error but got success: ${JSON.stringify(result.value)}`)
  }
  return result.error
}

/**
 * Asserts that a ResultAsync error is a DatabaseError with specific type
 */
export async function expectDatabaseErrorType<T>(
  resultAsync: ResultAsync<T, DatabaseError>,
  expectedType: DatabaseError['type'],
): Promise<void> {
  const result = await resultAsync

  if (result.isOk()) {
    throw new Error(`Expected DatabaseError of type ${expectedType} but got success`)
  }

  const error = result.error
  if (!(error instanceof DatabaseError)) {
    throw new Error(`Expected DatabaseError but got: ${typeof error}`)
  }

  if (error.type !== expectedType) {
    throw new Error(`Expected DatabaseError type ${expectedType} but got ${error.type}`)
  }
}

/**
 * Creates a mock logger for testing
 */
export function createMockLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    audit: vi.fn(),
    performance: vi.fn(),
    security: vi.fn(),
    withContext: vi.fn().mockReturnThis(),
    withUser: vi.fn().mockReturnThis(),
    withSchool: vi.fn().mockReturnThis(),
    withAcademicContext: vi.fn().mockReturnThis(),
  }
}

/**
 * Creates a mock for tapLogErr that tracks calls
 */
export function createMockTapLogErr() {
  const calls: Array<{ error: unknown, context?: unknown }> = []

  const mockFn = vi.fn((error: unknown) => {
    calls.push({ error })
    return error
  })

  return {
    fn: mockFn,
    calls,
    wasCalled: () => calls.length > 0,
    wasCalledWith: (error: unknown) =>
      calls.some(call => call.error === error),
    getCalls: () => calls,
    reset: () => {
      calls.length = 0
      mockFn.mockClear()
    },
  }
}

/**
 * Asserts that a mock function was called with a DatabaseError
 */
export function expectDatabaseErrorLogged(
  mockFn: Mock,
  expectedType?: DatabaseError['type'],
): void {
  const calls = mockFn.mock.calls

  if (calls.length === 0) {
    throw new Error('Expected logger to be called but it was not')
  }

  const errorArg = calls[0][0]

  if (!(errorArg instanceof DatabaseError)) {
    throw new Error(`Expected DatabaseError but got ${typeof errorArg}`)
  }

  if (expectedType && errorArg.type !== expectedType) {
    throw new Error(`Expected DatabaseError type ${expectedType} but got ${errorArg.type}`)
  }
}

/**
 * Creates a mock database client for testing
 */
export function createMockDbClient() {
  return {
    query: {
      students: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      parents: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      enrollments: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      classes: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      teachers: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      payments: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn() }) }),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: vi.fn() }) }) }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: vi.fn() }) }),
    select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn() }) }) }),
    transaction: vi.fn(async fn => fn({
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn() }) }),
      update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: vi.fn() }) }) }),
      delete: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: vi.fn() }) }),
    })),
  }
}

/**
 * Helper to simulate database errors
 */
export function simulateDbError(operation: () => Promise<unknown>, error: Error): Promise<unknown> {
  return Promise.reject(error)
}

/**
 * Helper to test both success and error paths
 */
export async function testResultAsyncPaths<T, E>(
  resultAsync: ResultAsync<T, E>,
  options: {
    onSuccess?: (value: T) => void | Promise<void>
    onError?: (error: E) => void | Promise<void>
  },
): Promise<void> {
  const result = await resultAsync

  if (result.isOk() && options.onSuccess) {
    await options.onSuccess(result.value)
  }
  else if (result.isErr() && options.onError) {
    await options.onError(result.error)
  }
}

/**
 * Type guard to check if error is a DatabaseError
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError
}

/**
 * Extract error type from DatabaseError
 */
export function getDatabaseErrorType(error: unknown): DatabaseError['type'] | null {
  if (isDatabaseError(error)) {
    return error.type
  }
  return null
}
