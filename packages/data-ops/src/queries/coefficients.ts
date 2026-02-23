import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, count, eq } from 'drizzle-orm'
import { getDb } from '../database/setup'
import {
  coefficientTemplates,
  grades,
  schoolYearTemplates,
  series,
  subjects,
} from '../drizzle/core-schema'
import { DatabaseError } from '../errors'

// ===== COEFFICIENT TEMPLATES =====

export async function getCoefficientTemplates(options?: {
  schoolYearTemplateId?: string
  gradeId?: string
  seriesId?: string
  subjectId?: string
  page?: number
  limit?: number
}): R.ResultAsync<{
  coefficients: Array<typeof coefficientTemplates.$inferSelect & {
    schoolYearTemplate: { id: string, name: string, isActive: boolean | null } | null
    subject: { id: string, name: string, shortName: string | null, category: string | null } | null
    grade: { id: string, name: string, code: string, order: number } | null
    series: { id: string, name: string, code: string | null } | null
  }>
  pagination: { page: number, limit: number, total: number, totalPages: number }
}, DatabaseError> {
  const db = getDb()
  const { schoolYearTemplateId, gradeId, seriesId, subjectId, page = 1, limit = 100 } = options || {}
  const offset = (page - 1) * limit

  return R.pipe(
    R.try({
      try: async () => {
        const conditions = []

        if (schoolYearTemplateId) {
          conditions.push(eq(coefficientTemplates.schoolYearTemplateId, schoolYearTemplateId))
        }

        if (gradeId) {
          conditions.push(eq(coefficientTemplates.gradeId, gradeId))
        }

        if (seriesId) {
          conditions.push(eq(coefficientTemplates.seriesId, seriesId))
        }

        if (subjectId) {
          conditions.push(eq(coefficientTemplates.subjectId, subjectId))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        // Get total count
        const [countResult] = await db
          .select({ count: count() })
          .from(coefficientTemplates)
          .where(whereClause)

        const total = countResult?.count || 0

        // Get coefficients with relations
        const coefficients = await db
          .select({
            id: coefficientTemplates.id,
            weight: coefficientTemplates.weight,
            schoolYearTemplateId: coefficientTemplates.schoolYearTemplateId,
            subjectId: coefficientTemplates.subjectId,
            gradeId: coefficientTemplates.gradeId,
            seriesId: coefficientTemplates.seriesId,
            createdAt: coefficientTemplates.createdAt,
            updatedAt: coefficientTemplates.updatedAt,
            schoolYearTemplate: {
              id: schoolYearTemplates.id,
              name: schoolYearTemplates.name,
              isActive: schoolYearTemplates.isActive,
            },
            subject: {
              id: subjects.id,
              name: subjects.name,
              shortName: subjects.shortName,
              category: subjects.category,
            },
            grade: {
              id: grades.id,
              name: grades.name,
              code: grades.code,
              order: grades.order,
            },
            series: {
              id: series.id,
              name: series.name,
              code: series.code,
            },
          })
          .from(coefficientTemplates)
          .leftJoin(schoolYearTemplates, eq(coefficientTemplates.schoolYearTemplateId, schoolYearTemplates.id))
          .leftJoin(subjects, eq(coefficientTemplates.subjectId, subjects.id))
          .leftJoin(grades, eq(coefficientTemplates.gradeId, grades.id))
          .leftJoin(series, eq(coefficientTemplates.seriesId, series.id))
          .where(whereClause)
          .orderBy(
            asc(grades.order),
            asc(subjects.name),
            asc(series.name),
          )
          .limit(limit)
          .offset(offset)

        return {
          coefficients,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to get coefficient templates'),
    }),
    R.mapError(tapLogErr(databaseLogger, options)),
  )
}

export async function getCoefficientTemplateById(id: string): R.ResultAsync<(typeof coefficientTemplates.$inferSelect & {
  schoolYearTemplate: { id: string, name: string, isActive: boolean | null } | null
  subject: { id: string, name: string, shortName: string | null, category: string | null } | null
  grade: { id: string, name: string, code: string, order: number } | null
  series: { id: string, name: string, code: string | null } | null
}) | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [coefficient] = await db
          .select({
            id: coefficientTemplates.id,
            weight: coefficientTemplates.weight,
            schoolYearTemplateId: coefficientTemplates.schoolYearTemplateId,
            subjectId: coefficientTemplates.subjectId,
            gradeId: coefficientTemplates.gradeId,
            seriesId: coefficientTemplates.seriesId,
            createdAt: coefficientTemplates.createdAt,
            updatedAt: coefficientTemplates.updatedAt,
            schoolYearTemplate: {
              id: schoolYearTemplates.id,
              name: schoolYearTemplates.name,
              isActive: schoolYearTemplates.isActive,
            },
            subject: {
              id: subjects.id,
              name: subjects.name,
              shortName: subjects.shortName,
              category: subjects.category,
            },
            grade: {
              id: grades.id,
              name: grades.name,
              code: grades.code,
              order: grades.order,
            },
            series: {
              id: series.id,
              name: series.name,
              code: series.code,
            },
          })
          .from(coefficientTemplates)
          .leftJoin(schoolYearTemplates, eq(coefficientTemplates.schoolYearTemplateId, schoolYearTemplates.id))
          .leftJoin(subjects, eq(coefficientTemplates.subjectId, subjects.id))
          .leftJoin(grades, eq(coefficientTemplates.gradeId, grades.id))
          .leftJoin(series, eq(coefficientTemplates.seriesId, series.id))
          .where(eq(coefficientTemplates.id, id))

        return coefficient || null
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to get coefficient template by id'),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function createCoefficientTemplate(
  data: Omit<typeof coefficientTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): R.ResultAsync<typeof coefficientTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [newCoefficient] = await db
          .insert(coefficientTemplates)
          .values({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
        return newCoefficient!
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to create coefficient template'),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

export async function updateCoefficientTemplate(
  id: string,
  data: Partial<Omit<typeof coefficientTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
): R.ResultAsync<typeof coefficientTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [updated] = await db
          .update(coefficientTemplates)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(coefficientTemplates.id, id))
          .returning()

        if (!updated) {
          throw new Error(`Coefficient template with id ${id} not found`)
        }

        return updated
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to update coefficient template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, ...data })),
  )
}

export async function deleteCoefficientTemplate(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        await db.delete(coefficientTemplates).where(eq(coefficientTemplates.id, id))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to delete coefficient template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function bulkCreateCoefficients(
  coefficients: {
    weight: number
    schoolYearTemplateId: string
    subjectId: string
    gradeId: string
    seriesId?: string | null
  }[],
): R.ResultAsync<Array<typeof coefficientTemplates.$inferSelect>, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        if (coefficients.length === 0)
          return []

        const values = coefficients.map(coef => ({
          id: crypto.randomUUID(),
          ...coef,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        const newCoefficients = await db
          .insert(coefficientTemplates)
          .values(values)
          .returning()

        return newCoefficients
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to bulk create coefficients'),
    }),
    R.mapError(tapLogErr(databaseLogger, { count: coefficients.length })),
  )
}

export async function bulkUpdateCoefficients(
  updates: { id: string, weight: number }[],
): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        if (updates.length === 0)
          return

        await Promise.all(
          updates.map(update =>
            db.update(coefficientTemplates)
              .set({
                weight: update.weight,
                updatedAt: new Date(),
              })
              .where(eq(coefficientTemplates.id, update.id)),
          ),
        )
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to bulk update coefficients'),
    }),
    R.mapError(tapLogErr(databaseLogger, { count: updates.length })),
  )
}

// Copy coefficients from one year to another
export async function copyCoefficientTemplates(
  sourceYearId: string,
  targetYearId: string,
): R.ResultAsync<Array<typeof coefficientTemplates.$inferSelect>, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        // Get all coefficients from source year
        const sourceCoefficients = await db
          .select()
          .from(coefficientTemplates)
          .where(eq(coefficientTemplates.schoolYearTemplateId, sourceYearId))

        if (sourceCoefficients.length === 0) {
          return []
        }

        // Create new coefficients for target year
        const newCoefficients = sourceCoefficients.map(coef => ({
          id: crypto.randomUUID(),
          weight: coef.weight,
          schoolYearTemplateId: targetYearId,
          subjectId: coef.subjectId,
          gradeId: coef.gradeId,
          seriesId: coef.seriesId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        const created = await db
          .insert(coefficientTemplates)
          .values(newCoefficients)
          .returning()

        return created
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to copy coefficient templates'),
    }),
    R.mapError(tapLogErr(databaseLogger, { sourceYearId, targetYearId })),
  )
}

// Get coefficient stats
export async function getCoefficientStats(): R.ResultAsync<{ total: number }, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const [totalCount] = await db.select({ count: count() }).from(coefficientTemplates)
        return {
          total: totalCount?.count || 0,
        }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to get coefficient stats'),
    }),
    R.mapError(tapLogErr(databaseLogger, {})),
  )
}
