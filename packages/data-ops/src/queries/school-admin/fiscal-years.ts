import type { FiscalYearInsert } from '../../drizzle/school-schema'
import crypto from 'node:crypto'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq } from 'drizzle-orm'
import { ResultAsync, errAsync } from 'neverthrow'
import { getDb } from '../../database/setup'
import { fiscalYears, schoolYears } from '../../drizzle/school-schema'
import { DatabaseError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export function getFiscalYearsBySchool(
  schoolId: string,
  options?: {
    limit?: number
    offset?: number
  },
): ResultAsync<typeof fiscalYears.$inferSelect[], DatabaseError> {
  if (!schoolId) {
    return errAsync(new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT))
  }

  const db = getDb()
  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  return ResultAsync.fromPromise(
    db
      .select()
      .from(fiscalYears)
      .where(eq(fiscalYears.schoolId, schoolId))
      .orderBy(desc(fiscalYears.startDate))
      .limit(limit)
      .offset(offset),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('fiscalYear', 'fetchFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, action: 'get_fiscal_years' }))
}

export function updateFiscalYear(
  fiscalYearId: string,
  schoolId: string,
  data: Partial<Omit<FiscalYearInsert, 'id' | 'schoolId' | 'schoolYearId'>>,
): ResultAsync<typeof fiscalYears.$inferSelect, DatabaseError> {
  if (!schoolId) {
    return errAsync(new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT))
  }

  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [updated] = await db
        .update(fiscalYears)
        .set(data)
        .where(and(eq(fiscalYears.id, fiscalYearId), eq(fiscalYears.schoolId, schoolId)))
        .returning()

      if (!updated)
        throw new Error(getNestedErrorMessage('fiscalYear', 'updateFailed'))
      return updated
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('fiscalYear', 'updateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { fiscalYearId, schoolId, action: 'update_fiscal_year' }))
}
