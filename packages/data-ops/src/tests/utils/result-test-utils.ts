import type { YekoLogger } from '@repo/logger'
import type { Mock } from 'vitest'
import { Result as R } from '@praha/byethrow'
import { vi } from 'vitest'
import { DatabaseError } from '../../errors'

/**
 * Creates a mocked ResultAsync that resolves to a success value
 */
export function mockResultAsync<T>(value: T): R.ResultAsync<T, never> {
  return R.succeed(Promise.resolve(value))
}

/**
 * Creates a mocked ResultAsync that resolves to an error
 */
export function mockResultAsyncError<E>(error: E): R.ResultAsync<never, E> {
  return R.fail(Promise.resolve(error))
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
export async function expectResultSuccess<T, E>(
  result: R.Result<T, E> | R.ResultAsync<T, E>,
): Promise<T> {
  const r = await result

  if (R.isFailure(r)) {
    throw new Error(`Expected success but got error: ${JSON.stringify(r.error)}`)
  }
  return r.value
}

/**
 * Asserts that a Result is an error and returns the error
 */
export async function expectResultError<T, E>(
  result: R.Result<T, E> | R.ResultAsync<T, E>,
): Promise<E> {
  const r = await result

  if (R.isSuccess(r)) {
    throw new Error(`Expected error but got success: ${JSON.stringify(r.value)}`)
  }
  return r.error
}

/**
 * Asserts that a ResultAsync error is a DatabaseError with specific type
 */
export async function expectDatabaseErrorType<T>(
  resultAsync: R.ResultAsync<T, DatabaseError>,
  expectedType: DatabaseError['type'],
): Promise<void> {
  const result = await resultAsync

  if (R.isSuccess(result)) {
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
 * Simple mock type for database testing
 */
export interface MockDb {
  query: Record<string, Record<string, Mock>>
  insert: Mock
  update: Mock
  delete: Mock
  select: Mock
  transaction: Mock
}
export function createMockLogger(): YekoLogger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    audit: vi.fn(),
    performance: vi.fn(),
    security: vi.fn(),
    child: vi.fn().mockReturnThis() as unknown as (category: string[]) => YekoLogger,
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

  const errorArg = calls[0]?.[0]

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
export function createMockDbClient(): MockDb {
  const mock = {
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
  return mock as unknown as MockDb
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
  resultAsync: R.ResultAsync<T, E>,
  options: {
    onSuccess?: (value: T) => void | Promise<void>
    onError?: (error: E) => void | Promise<void>
  },
): Promise<void> {
  const result = await resultAsync

  if (R.isSuccess(result) && options.onSuccess) {
    await options.onSuccess(result.value)
  }
  else if (R.isFailure(result) && options.onError) {
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
