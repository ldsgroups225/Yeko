import type { FiscalYear, FiscalYearInsert, FiscalYearStatus } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { fiscalYears } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export interface GetFiscalYearsParams {
  schoolId: string
  status?: FiscalYearStatus
}

export async function getFiscalYears(params: GetFiscalYearsParams): R.ResultAsync<FiscalYear[], DatabaseError> {
  const db = getDb()
  const { schoolId, status } = params

  return R.pipe(
    R.try({
      try: async () => {
        const conditions = [eq(fiscalYears.schoolId, schoolId)]
        if (status)
          conditions.push(eq(fiscalYears.status, status))

        return await db.select().from(fiscalYears).where(and(...conditions)).orderBy(desc(fiscalYears.startDate))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}

export async function getFiscalYearById(fiscalYearId: string): R.ResultAsync<FiscalYear | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db.select().from(fiscalYears).where(eq(fiscalYears.id, fiscalYearId)).limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { fiscalYearId })),
  )
}

export async function getFiscalYearBySchoolYear(schoolId: string, schoolYearId: string): R.ResultAsync<FiscalYear | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select()
          .from(fiscalYears)
          .where(and(eq(fiscalYears.schoolId, schoolId), eq(fiscalYears.schoolYearId, schoolYearId)))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchBySchoolYearFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId })),
  )
}

export async function getOpenFiscalYear(schoolId: string): R.ResultAsync<FiscalYear | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select()
          .from(fiscalYears)
          .where(and(eq(fiscalYears.schoolId, schoolId), eq(fiscalYears.status, 'open')))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchOpenFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}

export async function getFiscalYearForDate(schoolId: string, date: string): R.ResultAsync<FiscalYear | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select()
          .from(fiscalYears)
          .where(and(eq(fiscalYears.schoolId, schoolId), lte(fiscalYears.startDate, date), gte(fiscalYears.endDate, date)))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchForDateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, date })),
  )
}

export type CreateFiscalYearData = Omit<FiscalYearInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createFiscalYear(data: CreateFiscalYearData): R.ResultAsync<FiscalYear, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [fiscalYear] = await db.insert(fiscalYears).values({ id: crypto.randomUUID(), ...data }).returning()
        if (!fiscalYear) {
          throw new Error(getNestedErrorMessage('finance', 'fiscalYear.createFailed'))
        }
        return fiscalYear
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId })),
  )
}

export async function closeFiscalYear(
  fiscalYearId: string,
  closedBy: string,
): R.ResultAsync<FiscalYear | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [fiscalYear] = await db
          .update(fiscalYears)
          .set({ status: 'closed', closedAt: new Date(), closedBy, updatedAt: new Date() })
          .where(eq(fiscalYears.id, fiscalYearId))
          .returning()
        return fiscalYear
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.closeFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { fiscalYearId, closedBy })),
  )
}

export async function lockFiscalYear(fiscalYearId: string): R.ResultAsync<FiscalYear | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [fiscalYear] = await db
          .update(fiscalYears)
          .set({ status: 'locked', updatedAt: new Date() })
          .where(eq(fiscalYears.id, fiscalYearId))
          .returning()
        return fiscalYear
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.lockFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { fiscalYearId })),
  )
}

export async function reopenFiscalYear(fiscalYearId: string): R.ResultAsync<FiscalYear | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [fiscalYear] = await db
          .update(fiscalYears)
          .set({ status: 'open', closedAt: null, closedBy: null, updatedAt: new Date() })
          .where(eq(fiscalYears.id, fiscalYearId))
          .returning()
        return fiscalYear
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.reopenFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { fiscalYearId })),
  )
}
