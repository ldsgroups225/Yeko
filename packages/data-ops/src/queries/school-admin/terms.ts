import { and, asc, eq } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { termTemplates } from '@/drizzle/core-schema'
import { schoolYears, terms } from '@/drizzle/school-schema'
import { SCHOOL_ERRORS } from './constants'

export async function getTermsBySchoolYear(schoolYearId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify school year belongs to school
  const schoolYearResult = await db
    .select()
    .from(schoolYears)
    .where(and(eq(schoolYears.id, schoolYearId), eq(schoolYears.schoolId, schoolId)))
    .limit(1)

  if (!schoolYearResult[0]) {
    throw new Error(SCHOOL_ERRORS.SCHOOL_YEAR_NOT_FOUND)
  }

  return db
    .select({
      id: terms.id,
      schoolYearId: terms.schoolYearId,
      termTemplateId: terms.termTemplateId,
      startDate: terms.startDate,
      endDate: terms.endDate,
      createdAt: terms.createdAt,
      template: {
        id: termTemplates.id,
        name: termTemplates.name,
        type: termTemplates.type,
        order: termTemplates.order,
      },
    })
    .from(terms)
    .innerJoin(termTemplates, eq(terms.termTemplateId, termTemplates.id))
    .where(eq(terms.schoolYearId, schoolYearId))
    .orderBy(asc(termTemplates.order))
}

export async function getTermById(termId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select()
    .from(terms)
    .innerJoin(schoolYears, eq(terms.schoolYearId, schoolYears.id))
    .where(and(eq(terms.id, termId), eq(schoolYears.schoolId, schoolId)))
    .limit(1)

  return result[0] || null
}

export async function updateTerm(
  termId: string,
  schoolId: string,
  data: {
    startDate?: Date
    endDate?: Date
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify term belongs to school
  const term = await getTermById(termId, schoolId)
  if (!term) {
    throw new Error(SCHOOL_ERRORS.TERM_NOT_FOUND)
  }

  const { startDate, endDate, ...rest } = data

  const [updated] = await db
    .update(terms)
    .set({
      ...rest,
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
      updatedAt: new Date(),
    })
    .where(eq(terms.id, termId))
    .returning()

  return updated
}

export async function deleteTerm(termId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify term belongs to school
  const term = await getTermById(termId, schoolId)
  if (!term) {
    throw new Error(SCHOOL_ERRORS.TERM_NOT_FOUND)
  }

  // Hard delete
  await db.delete(terms).where(eq(terms.id, termId))

  return { success: true }
}
