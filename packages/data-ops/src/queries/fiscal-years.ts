import type { FiscalYear, FiscalYearInsert, FiscalYearStatus } from '../drizzle/school-schema'
import { getDb } from '../database/setup'
import { fiscalYears } from '../drizzle/school-schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export interface GetFiscalYearsParams {
  schoolId: string
  status?: FiscalYearStatus
}

export async function getFiscalYears(params: GetFiscalYearsParams): Promise<FiscalYear[]> {
  const db = getDb()
  const { schoolId, status } = params
  const conditions = [eq(fiscalYears.schoolId, schoolId)]
  if (status)
    conditions.push(eq(fiscalYears.status, status))

  return db.select().from(fiscalYears).where(and(...conditions)).orderBy(desc(fiscalYears.startDate))
}

export async function getFiscalYearById(fiscalYearId: string): Promise<FiscalYear | null> {
  const db = getDb()
  const [fiscalYear] = await db.select().from(fiscalYears).where(eq(fiscalYears.id, fiscalYearId)).limit(1)
  return fiscalYear ?? null
}

export async function getFiscalYearBySchoolYear(schoolId: string, schoolYearId: string): Promise<FiscalYear | null> {
  const db = getDb()
  const [fiscalYear] = await db
    .select()
    .from(fiscalYears)
    .where(and(eq(fiscalYears.schoolId, schoolId), eq(fiscalYears.schoolYearId, schoolYearId)))
    .limit(1)
  return fiscalYear ?? null
}

export async function getOpenFiscalYear(schoolId: string): Promise<FiscalYear | null> {
  const db = getDb()
  const [fiscalYear] = await db
    .select()
    .from(fiscalYears)
    .where(and(eq(fiscalYears.schoolId, schoolId), eq(fiscalYears.status, 'open')))
    .limit(1)
  return fiscalYear ?? null
}

export async function getFiscalYearForDate(schoolId: string, date: string): Promise<FiscalYear | null> {
  const db = getDb()
  const [fiscalYear] = await db
    .select()
    .from(fiscalYears)
    .where(and(eq(fiscalYears.schoolId, schoolId), lte(fiscalYears.startDate, date), gte(fiscalYears.endDate, date)))
    .limit(1)
  return fiscalYear ?? null
}

export type CreateFiscalYearData = Omit<FiscalYearInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createFiscalYear(data: CreateFiscalYearData): Promise<FiscalYear> {
  const db = getDb()
  const [fiscalYear] = await db.insert(fiscalYears).values({ id: nanoid(), ...data }).returning()
  if (!fiscalYear) {
    throw new Error('Failed to create fiscal year')
  }
  return fiscalYear
}

export async function closeFiscalYear(
  fiscalYearId: string,
  closedBy: string,
): Promise<FiscalYear | undefined> {
  const db = getDb()
  const [fiscalYear] = await db
    .update(fiscalYears)
    .set({ status: 'closed', closedAt: new Date(), closedBy, updatedAt: new Date() })
    .where(eq(fiscalYears.id, fiscalYearId))
    .returning()
  return fiscalYear
}

export async function lockFiscalYear(fiscalYearId: string): Promise<FiscalYear | undefined> {
  const db = getDb()
  const [fiscalYear] = await db
    .update(fiscalYears)
    .set({ status: 'locked', updatedAt: new Date() })
    .where(eq(fiscalYears.id, fiscalYearId))
    .returning()
  return fiscalYear
}

export async function reopenFiscalYear(fiscalYearId: string): Promise<FiscalYear | undefined> {
  const db = getDb()
  const [fiscalYear] = await db
    .update(fiscalYears)
    .set({ status: 'open', closedAt: null, closedBy: null, updatedAt: new Date() })
    .where(eq(fiscalYears.id, fiscalYearId))
    .returning()
  return fiscalYear
}
