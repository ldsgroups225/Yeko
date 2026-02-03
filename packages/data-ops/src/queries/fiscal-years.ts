import type { FiscalYear, FiscalYearInsert, FiscalYearStatus } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { fiscalYears } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export interface GetFiscalYearsParams {
  schoolId: string
  status?: FiscalYearStatus
}

export function getFiscalYears(params: GetFiscalYearsParams): ResultAsync<FiscalYear[], DatabaseError> {
  const db = getDb()
  const { schoolId, status } = params

  return ResultAsync.fromPromise(
    (async () => {
      const conditions = [eq(fiscalYears.schoolId, schoolId)]
      if (status)
        conditions.push(eq(fiscalYears.status, status))

      return db.select().from(fiscalYears).where(and(...conditions)).orderBy(desc(fiscalYears.startDate))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}

export function getFiscalYearById(fiscalYearId: string): ResultAsync<FiscalYear | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(fiscalYears).where(eq(fiscalYears.id, fiscalYearId)).limit(1).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchByIdFailed')),
  ).mapErr(tapLogErr(databaseLogger, { fiscalYearId }))
}

export function getFiscalYearBySchoolYear(schoolId: string, schoolYearId: string): ResultAsync<FiscalYear | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(fiscalYears)
      .where(and(eq(fiscalYears.schoolId, schoolId), eq(fiscalYears.schoolYearId, schoolYearId)))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchBySchoolYearFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId }))
}

export function getOpenFiscalYear(schoolId: string): ResultAsync<FiscalYear | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(fiscalYears)
      .where(and(eq(fiscalYears.schoolId, schoolId), eq(fiscalYears.status, 'open')))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchOpenFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}

export function getFiscalYearForDate(schoolId: string, date: string): ResultAsync<FiscalYear | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(fiscalYears)
      .where(and(eq(fiscalYears.schoolId, schoolId), lte(fiscalYears.startDate, date), gte(fiscalYears.endDate, date)))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.fetchForDateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, date }))
}

export type CreateFiscalYearData = Omit<FiscalYearInsert, 'id' | 'createdAt' | 'updatedAt'>

export function createFiscalYear(data: CreateFiscalYearData): ResultAsync<FiscalYear, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [fiscalYear] = await db.insert(fiscalYears).values({ id: crypto.randomUUID(), ...data }).returning()
      if (!fiscalYear) {
        throw new Error(getNestedErrorMessage('finance', 'fiscalYear.createFailed'))
      }
      return fiscalYear
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.createFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId }))
}

export function closeFiscalYear(
  fiscalYearId: string,
  closedBy: string,
): ResultAsync<FiscalYear | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [fiscalYear] = await db
        .update(fiscalYears)
        .set({ status: 'closed', closedAt: new Date(), closedBy, updatedAt: new Date() })
        .where(eq(fiscalYears.id, fiscalYearId))
        .returning()
      return fiscalYear
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.closeFailed')),
  ).mapErr(tapLogErr(databaseLogger, { fiscalYearId, closedBy }))
}

export function lockFiscalYear(fiscalYearId: string): ResultAsync<FiscalYear | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [fiscalYear] = await db
        .update(fiscalYears)
        .set({ status: 'locked', updatedAt: new Date() })
        .where(eq(fiscalYears.id, fiscalYearId))
        .returning()
      return fiscalYear
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.lockFailed')),
  ).mapErr(tapLogErr(databaseLogger, { fiscalYearId }))
}

export function reopenFiscalYear(fiscalYearId: string): ResultAsync<FiscalYear | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [fiscalYear] = await db
        .update(fiscalYears)
        .set({ status: 'open', closedAt: null, closedBy: null, updatedAt: new Date() })
        .where(eq(fiscalYears.id, fiscalYearId))
        .returning()
      return fiscalYear
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'fiscalYear.reopenFailed')),
  ).mapErr(tapLogErr(databaseLogger, { fiscalYearId }))
}
