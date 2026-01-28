import { type Result, type ResultAsync, err, ok } from 'neverthrow'
import type { z } from 'zod'
import type { YekoLogger } from '../types'

/**
 * Type-safe wrapper for Zod's safeParse that returns a neverthrow Result.
 * Standardizes validation errors into the Result-based pipeline.
 */
export function safeParse<T>(schema: z.Schema<T>, data: unknown): Result<T, z.ZodError> {
  const result = schema.safeParse(data)
  if (result.success) {
    return ok(result.data)
  }
  return err(result.error)
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
  result: Result<T, E>,
  logger: YekoLogger,
  context?: import('../types').YekoLogContext,
): Result<T, E> {
  if (result.isErr()) {
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
  resultAsync: ResultAsync<T, E>,
  logger: YekoLogger,
  context?: import('../types').YekoLogContext,
): Promise<Result<T, E>> {
  const result = await resultAsync
  return orLog(result, logger, context)
}

/**
 * Higher-order function for use with Result.mapErr.
 * Allows effortless logging of errors within a Result chain:
 * @example
 * result.mapErr(tapLogErr(logger, { userId }))
 */
export function tapLogErr<E>(logger: YekoLogger, context?: import('../types').YekoLogContext) {
  return (error: E) => {
    const logError = error instanceof Error ? error : new Error(String(error))
    logger.error('Captured error in pipeline', logError, context)
    return error
  }
}

