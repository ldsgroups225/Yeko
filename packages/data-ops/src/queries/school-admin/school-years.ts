import type { FiscalYearInsert, SchoolYearInsert, TermInsert } from '../../drizzle/school-schema'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { schoolYearTemplates, termTemplates } from '../../drizzle/core-schema'
import { fiscalYears, schoolYears, terms } from '../../drizzle/school-schema'
import { DatabaseError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export interface SchoolYearWithTemplate {
  id: string
  schoolId: string
  schoolYearTemplateId: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: Date
  template: {
    id: string
    name: string
  }
}

export async function getSchoolYearsBySchool(
  schoolId: string,
  options?: {
    isActive?: boolean
    limit?: number
    offset?: number
  },
): R.ResultAsync<SchoolYearWithTemplate[], DatabaseError> {
  if (!schoolId) {
    return { type: 'Failure', error: new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT) }
  }

  const db = getDb()
  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0
  const conditions = [eq(schoolYears.schoolId, schoolId)]

  if (options?.isActive !== undefined) {
    conditions.push(eq(schoolYears.isActive, options.isActive))
  }

  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
        db
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
          .innerJoin(
            schoolYearTemplates,
            eq(schoolYears.schoolYearTemplateId, schoolYearTemplates.id),
          )
          .where(and(...conditions))
          .orderBy(desc(schoolYears.startDate))
          .limit(limit)
          .offset(offset),
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('schoolYear', 'fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, action: 'get_school_years' })),
  )
}

export async function getSchoolYearById(
  schoolYearId: string,
  schoolId: string,
): R.ResultAsync<typeof schoolYears.$inferSelect | null, DatabaseError> {
  if (!schoolId) {
    return { type: 'Failure', error: new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT) }
  }

  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
        db
          .select()
          .from(schoolYears)
          .where(and(eq(schoolYears.id, schoolYearId), eq(schoolYears.schoolId, schoolId)))
          .limit(1)
          .then(rows => rows[0] ?? null),
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('schoolYear', 'fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolYearId, schoolId, action: 'get_school_year_by_id' })),
  )
}

export async function getActiveSchoolYear(schoolId: string): R.ResultAsync<typeof schoolYears.$inferSelect | null, DatabaseError> {
  if (!schoolId) {
    return { type: 'Failure', error: new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT) }
  }

  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
        db
          .select()
          .from(schoolYears)
          .where(and(eq(schoolYears.schoolId, schoolId), eq(schoolYears.isActive, true)))
          .limit(1)
          .then(rows => rows[0] ?? null),
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('schoolYear', 'fetchActiveFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, action: 'get_active_school_year' })),
  )
}

export async function createSchoolYear(data: {
  schoolId: string
  schoolYearTemplateId: string
  startDate: Date
  endDate: Date
  isActive?: boolean
}): R.ResultAsync<typeof schoolYears.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        if (!data.schoolId) {
          throw new Error(getNestedErrorMessage('schoolYear', 'noSchoolContext'))
        }
        // If setting as active, deactivate other school years first
        if (data.isActive) {
          await db
            .update(schoolYears)
            .set({ isActive: false })
            .where(eq(schoolYears.schoolId, data.schoolId))
        }

        const insertData: SchoolYearInsert = {
          id: crypto.randomUUID(),
          schoolId: data.schoolId,
          schoolYearTemplateId: data.schoolYearTemplateId,
          startDate: data.startDate.toISOString().split('T', 1)[0]!,
          endDate: data.endDate.toISOString().split('T', 1)[0]!,
          isActive: data.isActive || false,
        }

        const [schoolYear] = await db.insert(schoolYears).values(insertData).returning()

        if (!schoolYear)
          throw new Error(getNestedErrorMessage('schoolYear', 'createFailed'))

        const fiscalYearData: FiscalYearInsert = {
          id: crypto.randomUUID(),
          schoolId: data.schoolId,
          schoolYearId: schoolYear.id,
          name: `FY ${data.startDate.getFullYear()}-${data.endDate.getFullYear()}`,
          startDate: data.startDate.toISOString().split('T', 1)[0]!,
          endDate: data.endDate.toISOString().split('T', 1)[0]!,
          status: 'open',
        }

        await db.insert(fiscalYears).values(fiscalYearData)

        // Get term templates
        const termTemplatesList = await db
          .select()
          .from(termTemplates)
          .where(eq(termTemplates.schoolYearTemplateId, data.schoolYearTemplateId))
          .orderBy(termTemplates.order)

        // Create terms based on templates
        if (termTemplatesList.length > 0) {
          const totalDays = Math.floor(
            (data.endDate.getTime() - data.startDate.getTime())
            / (1000 * 60 * 60 * 24),
          )
          const daysPerTerm = Math.floor(totalDays / termTemplatesList.length)

          const termsToInsert: TermInsert[] = []
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

            termsToInsert.push({
              id: crypto.randomUUID(),
              schoolYearId: schoolYear.id,
              termTemplateId: template!.id,
              startDate: termStartDate.toISOString().split('T', 1)[0]!,
              endDate: termEndDate.toISOString().split('T', 1)[0]!,
            })
          }

          if (termsToInsert.length > 0) {
            await db.insert(terms).values(termsToInsert)
          }
        }

        return schoolYear
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('schoolYear', 'createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId, action: 'create_school_year' })),
  )
}

export async function updateSchoolYear(
  schoolYearId: string,
  schoolId: string,
  data: {
    startDate?: Date
    endDate?: Date
    isActive?: boolean
  },
): R.ResultAsync<typeof schoolYears.$inferSelect, DatabaseError> {
  if (!schoolId) {
    return { type: 'Failure', error: new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT) }
  }

  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Verify school year belongs to school
        const [existing] = await db.select().from(schoolYears).where(and(eq(schoolYears.id, schoolYearId), eq(schoolYears.schoolId, schoolId))).limit(1)
        if (!existing) {
          throw new Error(getNestedErrorMessage('schoolYear', 'notFound'))
        }

        if (data.isActive) {
          await db
            .update(schoolYears)
            .set({ isActive: false })
            .where(eq(schoolYears.schoolId, schoolId))
        }

        const [updated] = await db
          .update(schoolYears)
          .set({
            startDate: data.startDate?.toISOString().split('T', 1)[0],
            endDate: data.endDate?.toISOString().split('T', 1)[0],
            isActive: data.isActive,
          })
          .where(eq(schoolYears.id, schoolYearId))
          .returning()

        if (!updated)
          throw new Error(getNestedErrorMessage('schoolYear', 'updateFailed'))
        return updated
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('schoolYear', 'updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolYearId, schoolId, action: 'update_school_year' })),
  )
}

export async function deleteSchoolYear(schoolYearId: string, schoolId: string): R.ResultAsync<{ success: boolean }, DatabaseError> {
  if (!schoolId) {
    return { type: 'Failure', error: new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT) }
  }

  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [existing] = await db.select().from(schoolYears).where(and(eq(schoolYears.id, schoolYearId), eq(schoolYears.schoolId, schoolId))).limit(1)
        if (!existing) {
          throw new Error(getNestedErrorMessage('schoolYear', 'notFound'))
        }

        await db.delete(schoolYears).where(eq(schoolYears.id, schoolYearId))
        return { success: true }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('schoolYear', 'deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolYearId, schoolId, action: 'delete_school_year' })),
  )
}
