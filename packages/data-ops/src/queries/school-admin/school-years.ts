import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { schoolYearTemplates, termTemplates } from '@/drizzle/core-schema'
import { schoolYears, terms } from '@/drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getSchoolYearsBySchool(
  schoolId: string,
  options?: {
    isActive?: boolean
    limit?: number
    offset?: number
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  const conditions = [eq(schoolYears.schoolId, schoolId)]

  if (options?.isActive !== undefined) {
    conditions.push(eq(schoolYears.isActive, options.isActive))
  }

  return db
    .select({
      id: schoolYears.id,
      schoolId: schoolYears.schoolId,
      schoolYearTemplateId: schoolYears.schoolYearTemplateId,
      startDate: schoolYears.startDate,
      endDate: schoolYears.endDate,
      isActive: schoolYears.isActive,
      createdAt: schoolYears.createdAt,
      template: {
        id: schoolYearTemplates.id,
        name: schoolYearTemplates.name,
      },
    })
    .from(schoolYears)
    .innerJoin(schoolYearTemplates, eq(schoolYears.schoolYearTemplateId, schoolYearTemplates.id))
    .where(and(...conditions))
    .orderBy(desc(schoolYears.startDate))
    .limit(limit)
    .offset(offset)
}

export async function getSchoolYearById(schoolYearId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select()
    .from(schoolYears)
    .where(and(eq(schoolYears.id, schoolYearId), eq(schoolYears.schoolId, schoolId)))
    .limit(1)

  return result[0] || null
}

export async function getActiveSchoolYear(schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select()
    .from(schoolYears)
    .where(and(eq(schoolYears.schoolId, schoolId), eq(schoolYears.isActive, true)))
    .limit(1)

  return result[0] || null
}

export async function createSchoolYear(data: {
  schoolId: string
  schoolYearTemplateId: string
  startDate: Date
  endDate: Date
  isActive?: boolean
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  return db.transaction(async (tx: any) => {
    // If setting as active, deactivate other school years
    if (data.isActive) {
      await tx.update(schoolYears).set({ isActive: false }).where(eq(schoolYears.schoolId, data.schoolId))
    }

    // Create school year
    const [schoolYear] = await tx
      .insert(schoolYears)
      .values({
        id: crypto.randomUUID(),
        schoolId: data.schoolId,
        schoolYearTemplateId: data.schoolYearTemplateId,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive || false,
      })
      .returning()

    // Get term templates using select instead of query (tx doesn't have query property)
    const termTemplatesList = await tx
      .select()
      .from(termTemplates)
      .where(eq(termTemplates.schoolYearTemplateId, data.schoolYearTemplateId))
      .orderBy(termTemplates.order)

    // Create terms based on templates
    if (termTemplatesList.length > 0) {
      const totalDays = Math.floor((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysPerTerm = Math.floor(totalDays / termTemplatesList.length)

      for (let i = 0; i < termTemplatesList.length; i++) {
        const template = termTemplatesList[i]
        const termStartDate = new Date(data.startDate)
        termStartDate.setDate(termStartDate.getDate() + i * daysPerTerm)

        const termEndDate = new Date(termStartDate)
        termEndDate.setDate(termEndDate.getDate() + daysPerTerm - 1)

        // Last term ends on school year end date
        if (i === termTemplatesList.length - 1) {
          termEndDate.setTime(data.endDate.getTime())
        }

        await tx.insert(terms).values({
          id: crypto.randomUUID(),
          schoolYearId: schoolYear.id,
          termTemplateId: template.id,
          startDate: termStartDate,
          endDate: termEndDate,
        })
      }
    }

    return schoolYear
  })
}

export async function updateSchoolYear(
  schoolYearId: string,
  schoolId: string,
  data: {
    startDate?: Date
    endDate?: Date
    isActive?: boolean
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  return db.transaction(async (tx: any) => {
    // Verify school year belongs to school
    const schoolYear = await getSchoolYearById(schoolYearId, schoolId)
    if (!schoolYear) {
      throw new Error(SCHOOL_ERRORS.SCHOOL_YEAR_NOT_FOUND)
    }

    // If setting as active, deactivate other school years
    if (data.isActive) {
      await tx.update(schoolYears).set({ isActive: false }).where(eq(schoolYears.schoolId, schoolId))
    }

    const [updated] = await tx
      .update(schoolYears)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schoolYears.id, schoolYearId))
      .returning()

    return updated
  })
}

export async function deleteSchoolYear(schoolYearId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify school year belongs to school
  const schoolYear = await getSchoolYearById(schoolYearId, schoolId)
  if (!schoolYear) {
    throw new Error(SCHOOL_ERRORS.SCHOOL_YEAR_NOT_FOUND)
  }

  // Hard delete (cascade will handle terms, classes, enrollments)
  await db.delete(schoolYears).where(eq(schoolYears.id, schoolYearId))

  return { success: true }
}
