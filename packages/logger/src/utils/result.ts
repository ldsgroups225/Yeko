import type { z } from 'zod'
import type { YekoLogger } from '../types'
import { Result as R } from '@praha/byethrow'

/**
 * Type-safe wrapper for Zod's safeParse that returns a byethrow Result.
 * Standardizes validation errors into the Result-based pipeline.
 */
export function safeParse<T>(schema: z.Schema<T>, data: unknown): R.Result<T, z.ZodError> {
  const result = schema.safeParse(data)
  if (result.success) {
    return { type: 'Success', value: result.data }
  }
  return { type: 'Failure', error: result.error }
}

/**
 * Observability bridge: Logs an error Result if it exists and returns the original Result.
 * Enables zero-downtime integration of logging into existing Result pipelines.
 *
 * @param result The Result to check and log
 * @param logger The YekoLogger instance to use
 * @param context Additional context (e.g. schoolId, userId) for the log
 */
export function orLog<T, E>(
  result: R.Result<T, E>,
  logger: YekoLogger,
  context?: import('../types').YekoLogContext,
): R.Result<T, E> {
  if (R.isFailure(result)) {
    const error = result.error instanceof Error ? result.error : new Error(String(result.error))
    logger.error('Operation failed', error, context)
  }
  return result
}

/**
 * Async version of the observability bridge for ResultAsync.
 * Awaits the ResultAsync and logs the error if present.
 */
export async function orLogAsync<T, E>(
  resultAsync: R.ResultAsync<T, E>,
  logger: YekoLogger,
  context?: import('../types').YekoLogContext,
): R.ResultAsync<T, E> {
  const result = await resultAsync
  return orLog(result, logger, context)
}

/**
 * Higher-order function for use with Result.mapErr.
 * Allows effortless logging of errors within a Result chain:
 * @example
 * Result.pipe(result, Result.mapError(tapLogErr(logger, { userId })))
 */
export function tapLogErr<E>(logger: YekoLogger, context?: import('../types').YekoLogContext) {
  return (error: E) => {
    const logError = error instanceof Error ? error : new Error(String(error))
    logger.error('Captured error in pipeline', logError, context)
    return error
  }
}
