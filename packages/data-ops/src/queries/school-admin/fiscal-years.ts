import type { FiscalYearInsert } from '../../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { fiscalYears } from '../../drizzle/school-schema'
import { DatabaseError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getFiscalYearsBySchool(
  schoolId: string,
  options?: {
    limit?: number
    offset?: number
  },
): R.ResultAsync<typeof fiscalYears.$inferSelect[], DatabaseError> {
  if (!schoolId) {
    return R.fail(new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT))
  }

  const db = getDb()
  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  return R.pipe(
    R.try({
      try: async () => {
        return await db
          .select()
          .from(fiscalYears)
          .where(eq(fiscalYears.schoolId, schoolId))
          .orderBy(desc(fiscalYears.startDate))
          .limit(limit)
          .offset(offset)
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('fiscalYear', 'fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, action: 'get_fiscal_years' })),
  )
}

export async function updateFiscalYear(
  fiscalYearId: string,
  schoolId: string,
  data: Partial<Omit<FiscalYearInsert, 'id' | 'schoolId' | 'schoolYearId'>>,
): R.ResultAsync<typeof fiscalYears.$inferSelect, DatabaseError> {
  if (!schoolId) {
    return R.fail(new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT))
  }

  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [updated] = await db
          .update(fiscalYears)
          .set(data)
          .where(and(eq(fiscalYears.id, fiscalYearId), eq(fiscalYears.schoolId, schoolId)))
          .returning()

        if (!updated)
          throw new Error(getNestedErrorMessage('fiscalYear', 'updateFailed'))
        return updated
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('fiscalYear', 'updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { fiscalYearId, schoolId, action: 'update_fiscal_year' })),
  )
}
