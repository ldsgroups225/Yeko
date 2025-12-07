import { and, count, eq, isNull } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { coefficientTemplates, grades, series, subjects } from '@/drizzle/core-schema'
import { schoolSubjectCoefficients } from '@/drizzle/school-schema'

// ===== SCHOOL COEFFICIENT OVERRIDES =====

/**
 * Get all coefficients for a school with override status
 * Returns template values merged with any school-specific overrides
 */
export async function getSchoolCoefficients(options: {
  schoolId: string
  schoolYearTemplateId: string
  gradeId?: string
  seriesId?: string | null
  subjectId?: string
}) {
  const db = getDb()
  const { schoolId, schoolYearTemplateId, gradeId, seriesId, subjectId } = options

  const conditions = [
    eq(coefficientTemplates.schoolYearTemplateId, schoolYearTemplateId),
  ]

  if (gradeId) {
    conditions.push(eq(coefficientTemplates.gradeId, gradeId))
  }

  if (seriesId !== undefined) {
    if (seriesId === null) {
      conditions.push(isNull(coefficientTemplates.seriesId))
    }
    else {
      conditions.push(eq(coefficientTemplates.seriesId, seriesId))
    }
  }

  if (subjectId) {
    conditions.push(eq(coefficientTemplates.subjectId, subjectId))
  }

  // Get templates with any school overrides
  const results = await db
    .select({
      id: coefficientTemplates.id,
      templateWeight: coefficientTemplates.weight,
      schoolYearTemplateId: coefficientTemplates.schoolYearTemplateId,
      subjectId: coefficientTemplates.subjectId,
      gradeId: coefficientTemplates.gradeId,
      seriesId: coefficientTemplates.seriesId,
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
      // Override info
      overrideId: schoolSubjectCoefficients.id,
      overrideWeight: schoolSubjectCoefficients.weightOverride,
    })
    .from(coefficientTemplates)
    .innerJoin(subjects, eq(coefficientTemplates.subjectId, subjects.id))
    .innerJoin(grades, eq(coefficientTemplates.gradeId, grades.id))
    .leftJoin(series, eq(coefficientTemplates.seriesId, series.id))
    .leftJoin(
      schoolSubjectCoefficients,
      and(
        eq(schoolSubjectCoefficients.coefficientTemplateId, coefficientTemplates.id),
        eq(schoolSubjectCoefficients.schoolId, schoolId),
      ),
    )
    .where(and(...conditions))
    .orderBy(grades.order, subjects.name, series.name)

  // Transform to include effective weight
  return results.map((row: typeof results[number]) => ({
    id: row.id,
    subjectId: row.subjectId,
    gradeId: row.gradeId,
    seriesId: row.seriesId,
    templateWeight: row.templateWeight,
    effectiveWeight: row.overrideWeight ?? row.templateWeight,
    isOverride: row.overrideWeight !== null,
    overrideId: row.overrideId,
    subject: row.subject,
    grade: row.grade,
    series: row.series,
  }))
}

/**
 * Get the effective coefficient for a specific combination
 * Returns override if exists, otherwise falls back to template
 */
export async function getEffectiveCoefficient(options: {
  schoolId: string
  subjectId: string
  gradeId: string
  seriesId: string | null
  schoolYearTemplateId: string
}) {
  const db = getDb()
  const { schoolId, subjectId, gradeId, seriesId, schoolYearTemplateId } = options

  // Build template lookup conditions
  const templateConditions = [
    eq(coefficientTemplates.schoolYearTemplateId, schoolYearTemplateId),
    eq(coefficientTemplates.subjectId, subjectId),
    eq(coefficientTemplates.gradeId, gradeId),
  ]

  if (seriesId) {
    templateConditions.push(eq(coefficientTemplates.seriesId, seriesId))
  }
  else {
    templateConditions.push(isNull(coefficientTemplates.seriesId))
  }

  // Get template with any override
  const [result] = await db
    .select({
      templateId: coefficientTemplates.id,
      templateWeight: coefficientTemplates.weight,
      overrideId: schoolSubjectCoefficients.id,
      overrideWeight: schoolSubjectCoefficients.weightOverride,
    })
    .from(coefficientTemplates)
    .leftJoin(
      schoolSubjectCoefficients,
      and(
        eq(schoolSubjectCoefficients.coefficientTemplateId, coefficientTemplates.id),
        eq(schoolSubjectCoefficients.schoolId, schoolId),
      ),
    )
    .where(and(...templateConditions))
    .limit(1)

  if (!result) {
    return null
  }

  return {
    templateId: result.templateId,
    weight: result.overrideWeight ?? result.templateWeight,
    templateWeight: result.templateWeight,
    isOverride: result.overrideWeight !== null,
    overrideId: result.overrideId,
  }
}

/**
 * Create a coefficient override for a school
 */
export async function createCoefficientOverride(options: {
  schoolId: string
  coefficientTemplateId: string
  weightOverride: number
}) {
  const db = getDb()
  const { schoolId, coefficientTemplateId, weightOverride } = options

  // Validate weight is between 1-20
  if (weightOverride < 0 || weightOverride > 20) {
    throw new Error('Coefficient weight must be between 0 and 20')
  }

  const [inserted] = await db
    .insert(schoolSubjectCoefficients)
    .values({
      id: crypto.randomUUID(),
      schoolId,
      coefficientTemplateId,
      weightOverride,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return inserted
}

/**
 * Update an existing coefficient override
 */
export async function updateCoefficientOverride(
  id: string,
  weightOverride: number,
) {
  const db = getDb()

  // Validate weight is between 0-20
  if (weightOverride < 0 || weightOverride > 20) {
    throw new Error('Coefficient weight must be between 0 and 20')
  }

  const [updated] = await db
    .update(schoolSubjectCoefficients)
    .set({
      weightOverride,
      updatedAt: new Date(),
    })
    .where(eq(schoolSubjectCoefficients.id, id))
    .returning()

  return updated
}

/**
 * Delete a coefficient override (revert to template default)
 */
export async function deleteCoefficientOverride(id: string) {
  const db = getDb()
  await db.delete(schoolSubjectCoefficients).where(eq(schoolSubjectCoefficients.id, id))
}

/**
 * Create or update coefficient override (upsert)
 */
export async function upsertCoefficientOverride(options: {
  schoolId: string
  coefficientTemplateId: string
  weightOverride: number
}) {
  const db = getDb()
  const { schoolId, coefficientTemplateId, weightOverride } = options

  // Validate weight
  if (weightOverride < 0 || weightOverride > 20) {
    throw new Error('Coefficient weight must be between 0 and 20')
  }

  const [result] = await db
    .insert(schoolSubjectCoefficients)
    .values({
      id: crypto.randomUUID(),
      schoolId,
      coefficientTemplateId,
      weightOverride,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [schoolSubjectCoefficients.schoolId, schoolSubjectCoefficients.coefficientTemplateId],
      set: {
        weightOverride,
        updatedAt: new Date(),
      },
    })
    .returning()

  return result
}

/**
 * Bulk update coefficients (for matrix view)
 */
export async function bulkUpdateSchoolCoefficients(options: {
  schoolId: string
  updates: {
    coefficientTemplateId: string
    weightOverride: number
  }[]
}) {
  const db = getDb()
  const { schoolId, updates } = options

  if (updates.length === 0) {
    return []
  }

  // Validate all weights
  for (const update of updates) {
    if (update.weightOverride < 0 || update.weightOverride > 20) {
      throw new Error(`Invalid weight ${update.weightOverride} - must be between 0 and 20`)
    }
  }

  const results = await db.transaction(async (tx: ReturnType<typeof getDb>) => {
    const insertedOrUpdated = []
    for (const update of updates) {
      const [result] = await tx
        .insert(schoolSubjectCoefficients)
        .values({
          id: crypto.randomUUID(),
          schoolId,
          coefficientTemplateId: update.coefficientTemplateId,
          weightOverride: update.weightOverride,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [schoolSubjectCoefficients.schoolId, schoolSubjectCoefficients.coefficientTemplateId],
          set: {
            weightOverride: update.weightOverride,
            updatedAt: new Date(),
          },
        })
        .returning()
      insertedOrUpdated.push(result)
    }
    return insertedOrUpdated
  })

  return results
}

/**
 * Reset all overrides for a school (delete all school coefficient overrides)
 */
export async function resetAllSchoolCoefficients(schoolId: string) {
  const db = getDb()
  await db
    .delete(schoolSubjectCoefficients)
    .where(eq(schoolSubjectCoefficients.schoolId, schoolId))
}

/**
 * Get coefficient matrix data for grid view
 * Returns a 2D matrix of subjects × grades with coefficients
 */
export async function getCoefficientMatrix(options: {
  schoolId: string
  schoolYearTemplateId: string
  seriesId?: string | null
}) {
  const db = getDb()
  const { schoolId, schoolYearTemplateId, seriesId } = options

  const conditions = [
    eq(coefficientTemplates.schoolYearTemplateId, schoolYearTemplateId),
  ]

  if (seriesId !== undefined) {
    if (seriesId === null) {
      conditions.push(isNull(coefficientTemplates.seriesId))
    }
    else {
      conditions.push(eq(coefficientTemplates.seriesId, seriesId))
    }
  }

  // Get all coefficients with overrides
  const data = await db
    .select({
      templateId: coefficientTemplates.id,
      templateWeight: coefficientTemplates.weight,
      subjectId: coefficientTemplates.subjectId,
      subjectName: subjects.name,
      subjectShortName: subjects.shortName,
      subjectCategory: subjects.category,
      gradeId: coefficientTemplates.gradeId,
      gradeName: grades.name,
      gradeCode: grades.code,
      gradeOrder: grades.order,
      seriesId: coefficientTemplates.seriesId,
      seriesName: series.name,
      overrideId: schoolSubjectCoefficients.id,
      overrideWeight: schoolSubjectCoefficients.weightOverride,
    })
    .from(coefficientTemplates)
    .innerJoin(subjects, eq(coefficientTemplates.subjectId, subjects.id))
    .innerJoin(grades, eq(coefficientTemplates.gradeId, grades.id))
    .leftJoin(series, eq(coefficientTemplates.seriesId, series.id))
    .leftJoin(
      schoolSubjectCoefficients,
      and(
        eq(schoolSubjectCoefficients.coefficientTemplateId, coefficientTemplates.id),
        eq(schoolSubjectCoefficients.schoolId, schoolId),
      ),
    )
    .where(and(...conditions))
    .orderBy(grades.order, subjects.category, subjects.name)

  // Extract unique subjects and grades
  const subjectsMap = new Map<string, { id: string, name: string, shortName: string, category: string | null }>()
  const gradesMap = new Map<string, { id: string, name: string, code: string, order: number }>()

  for (const row of data) {
    if (!subjectsMap.has(row.subjectId)) {
      subjectsMap.set(row.subjectId, {
        id: row.subjectId,
        name: row.subjectName,
        shortName: row.subjectShortName,
        category: row.subjectCategory,
      })
    }
    if (!gradesMap.has(row.gradeId)) {
      gradesMap.set(row.gradeId, {
        id: row.gradeId,
        name: row.gradeName,
        code: row.gradeCode,
        order: row.gradeOrder,
      })
    }
  }

  // Build matrix
  const matrix: Record<string, Record<string, {
    templateId: string
    templateWeight: number
    effectiveWeight: number
    isOverride: boolean
    overrideId: string | null
  }>> = {}

  for (const row of data) {
    if (!matrix[row.subjectId]) {
      matrix[row.subjectId] = {}
    }
    const subjectMatrix = matrix[row.subjectId]
    if (subjectMatrix) {
      subjectMatrix[row.gradeId] = {
        templateId: row.templateId,
        templateWeight: row.templateWeight,
        effectiveWeight: row.overrideWeight ?? row.templateWeight,
        isOverride: row.overrideWeight !== null,
        overrideId: row.overrideId,
      }
    }
  }

  return {
    subjects: Array.from(subjectsMap.values()),
    grades: Array.from(gradesMap.values()).sort((a, b) => a.order - b.order),
    matrix,
  }
}

/**
 * Copy coefficients from one school year to another
 */
export async function copySchoolCoefficientsFromYear(options: {
  schoolId: string
  sourceSchoolYearTemplateId: string
  targetSchoolYearTemplateId: string
}) {
  const db = getDb()
  const { schoolId, sourceSchoolYearTemplateId, targetSchoolYearTemplateId } = options

  // Get existing overrides for source year
  const sourceOverrides = await db
    .select({
      weightOverride: schoolSubjectCoefficients.weightOverride,
      subjectId: coefficientTemplates.subjectId,
      gradeId: coefficientTemplates.gradeId,
      seriesId: coefficientTemplates.seriesId,
    })
    .from(schoolSubjectCoefficients)
    .innerJoin(
      coefficientTemplates,
      eq(schoolSubjectCoefficients.coefficientTemplateId, coefficientTemplates.id),
    )
    .where(and(
      eq(schoolSubjectCoefficients.schoolId, schoolId),
      eq(coefficientTemplates.schoolYearTemplateId, sourceSchoolYearTemplateId),
    ))

  if (sourceOverrides.length === 0) {
    return []
  }

  // Find matching templates in target year
  const results = await db.transaction(async (tx: ReturnType<typeof getDb>) => {
    const inserted = []

    for (const override of sourceOverrides) {
      // Find matching template in target year
      const conditions = [
        eq(coefficientTemplates.schoolYearTemplateId, targetSchoolYearTemplateId),
        eq(coefficientTemplates.subjectId, override.subjectId),
        eq(coefficientTemplates.gradeId, override.gradeId),
      ]

      if (override.seriesId) {
        conditions.push(eq(coefficientTemplates.seriesId, override.seriesId))
      }
      else {
        conditions.push(isNull(coefficientTemplates.seriesId))
      }

      const [targetTemplate] = await tx
        .select({ id: coefficientTemplates.id })
        .from(coefficientTemplates)
        .where(and(...conditions))
        .limit(1)

      if (targetTemplate) {
        const [result] = await tx
          .insert(schoolSubjectCoefficients)
          .values({
            id: crypto.randomUUID(),
            schoolId,
            coefficientTemplateId: targetTemplate.id,
            weightOverride: override.weightOverride,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing()
          .returning()

        if (result) {
          inserted.push(result)
        }
      }
    }

    return inserted
  })

  return results
}

/**
 * Get statistics about school coefficient overrides
 */
export async function getSchoolCoefficientStats(schoolId: string) {
  const db = getDb()

  const [stats] = await db
    .select({
      totalOverrides: count(schoolSubjectCoefficients.id),
    })
    .from(schoolSubjectCoefficients)
    .where(eq(schoolSubjectCoefficients.schoolId, schoolId))

  return {
    totalOverrides: stats?.totalOverrides || 0,
  }
}
