import { inArray } from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { COEFFICIENT_LIMITS } from '@/constants/coefficients'
import { databaseMiddleware } from '@/core/middleware/database'

import {
  BulkCreateCoefficientsSchema,
  BulkUpdateCoefficientsSchema,
  CoefficientTemplateIdSchema,
  CopyCoefficientsSchema,
  CreateCoefficientTemplateSchema,
  GetCoefficientTemplatesSchema,
  UpdateCoefficientTemplateSchema,
} from '@/schemas/coefficients'

// ===== COEFFICIENT TEMPLATES =====

export const coefficientTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetCoefficientTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const { getCoefficientTemplates } = await import('@repo/data-ops/queries/coefficients')
    return await getCoefficientTemplates(ctx.data)
  })

export const coefficientTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CoefficientTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getCoefficientTemplateById } = await import('@repo/data-ops/queries/coefficients')
    return await getCoefficientTemplateById(ctx.data.id)
  })

export const createCoefficientTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateCoefficientTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { createCoefficientTemplate } = await import('@repo/data-ops/queries/coefficients')
    return await createCoefficientTemplate(ctx.data)
  })

export const updateCoefficientTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateCoefficientTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { updateCoefficientTemplate } = await import('@repo/data-ops/queries/coefficients')
    const { id, ...updateData } = ctx.data
    return await updateCoefficientTemplate(id, updateData)
  })

export const deleteCoefficientTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CoefficientTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteCoefficientTemplate } = await import('@repo/data-ops/queries/coefficients')
    await deleteCoefficientTemplate(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

export const bulkCreateCoefficientsMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkCreateCoefficientsSchema.parse(data))
  .handler(async (ctx) => {
    const { bulkCreateCoefficients } = await import('@repo/data-ops/queries/coefficients')
    return await bulkCreateCoefficients(ctx.data.coefficients)
  })

export const bulkUpdateCoefficientsMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkUpdateCoefficientsSchema.parse(data))
  .handler(async (ctx) => {
    const { bulkUpdateCoefficients } = await import('@repo/data-ops/queries/coefficients')
    await bulkUpdateCoefficients(ctx.data)
    return { success: true }
  })

export const copyCoefficientsMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CopyCoefficientsSchema.parse(data))
  .handler(async (ctx) => {
    const { copyCoefficientTemplates } = await import('@repo/data-ops/queries/coefficients')
    return await copyCoefficientTemplates(ctx.data.sourceYearId, ctx.data.targetYearId)
  })

export const coefficientStatsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getCoefficientStats } = await import('@repo/data-ops/queries/coefficients')
    return await getCoefficientStats()
  })

// Schema for coefficient import validation
const CoefficientImportValidationSchema = z.object({
  data: z.array(z.object({
    schoolYearTemplateId: z.string().min(1),
    subjectId: z.string().min(1),
    gradeId: z.string().min(1),
    seriesId: z.string().nullable().optional(),
    weight: z.number(),
  })),
})

export interface CoefficientValidationError {
  row: number
  field: string
  message: string
}

export const validateCoefficientImportMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CoefficientImportValidationSchema.parse(data))
  .handler(async (ctx) => {
    const { data } = ctx.data
    const errors: CoefficientValidationError[] = []

    if (data.length === 0) {
      return { valid: false, errors: [{ row: 0, field: 'data', message: 'Aucune donnée à valider' }] }
    }

    const { getDb } = await import('@repo/data-ops/database/setup')
    const { schoolYearTemplates, subjects, grades, series } = await import('@repo/data-ops/drizzle/core-schema')
    const db = getDb()

    // Extract unique IDs for batch validation
    const uniqueYearIds = [...new Set(data.map(d => d.schoolYearTemplateId))]
    const uniqueSubjectIds = [...new Set(data.map(d => d.subjectId))]
    const uniqueGradeIds = [...new Set(data.map(d => d.gradeId))]
    const uniqueSeriesIds = [...new Set(data.map(d => d.seriesId).filter((id): id is string => !!id))]

    // Batch query database to check existence
    const results = await Promise.all([
      db.select({ id: schoolYearTemplates.id }).from(schoolYearTemplates).where(inArray(schoolYearTemplates.id, uniqueYearIds)),
      db.select({ id: subjects.id }).from(subjects).where(inArray(subjects.id, uniqueSubjectIds)),
      db.select({ id: grades.id }).from(grades).where(inArray(grades.id, uniqueGradeIds)),
      uniqueSeriesIds.length > 0
        ? db.select({ id: series.id }).from(series).where(inArray(series.id, uniqueSeriesIds))
        : Promise.resolve([]),
    ])

    const existingYears = results[0]
    const existingSubjects = results[1]
    const existingGrades = results[2]
    const existingSeries = results[3]

    // Build lookup sets for fast validation
    const yearIdSet = new Set(existingYears.map((y: { id: string }) => y.id))
    const subjectIdSet = new Set(existingSubjects.map((s: { id: string }) => s.id))
    const gradeIdSet = new Set(existingGrades.map((g: { id: string }) => g.id))
    const seriesIdSet = new Set(existingSeries.map((s: { id: string }) => s.id))

    // Track combinations for duplicate detection
    const seenCombinations = new Set<string>()

    // Validate each row
    data.forEach((row, index) => {
      const rowNum = index + 1

      // Check school year exists
      if (!yearIdSet.has(row.schoolYearTemplateId)) {
        errors.push({ row: rowNum, field: 'schoolYearTemplateId', message: 'Année scolaire introuvable' })
      }

      // Check subject exists
      if (!subjectIdSet.has(row.subjectId)) {
        errors.push({ row: rowNum, field: 'subjectId', message: 'Matière introuvable' })
      }

      // Check grade exists
      if (!gradeIdSet.has(row.gradeId)) {
        errors.push({ row: rowNum, field: 'gradeId', message: 'Classe introuvable' })
      }

      // Check series exists (if provided)
      if (row.seriesId && !seriesIdSet.has(row.seriesId)) {
        errors.push({ row: rowNum, field: 'seriesId', message: 'Série introuvable' })
      }

      // Validate weight is in valid range
      if (row.weight < COEFFICIENT_LIMITS.MIN || row.weight > COEFFICIENT_LIMITS.MAX) {
        errors.push({
          row: rowNum,
          field: 'weight',
          message: `Coefficient doit être entre ${COEFFICIENT_LIMITS.MIN} et ${COEFFICIENT_LIMITS.MAX}`,
        })
      }

      // Check for duplicate combinations within import data
      const combinationKey = `${row.schoolYearTemplateId}|${row.subjectId}|${row.gradeId}|${row.seriesId || ''}`
      if (seenCombinations.has(combinationKey)) {
        errors.push({ row: rowNum, field: 'combination', message: 'Combinaison déjà existante dans le fichier' })
      }
      else {
        seenCombinations.add(combinationKey)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      summary: {
        total: data.length,
        valid: data.length - errors.length,
        invalid: errors.length,
      },
    }
  })
