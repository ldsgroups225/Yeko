import { z } from 'zod'

// ===== COEFFICIENT OVERRIDE SCHEMAS =====

/**
 * Schema for creating a coefficient override
 */
export const createCoefficientOverrideSchema = z.object({
  coefficientTemplateId: z.string(),
  weightOverride: z.number().min(0, 'Weight must be at least 0').max(20, 'Weight must be at most 20'),
})

export type CreateCoefficientOverrideInput = z.infer<typeof createCoefficientOverrideSchema>

/**
 * Schema for updating a coefficient override
 */
export const updateCoefficientOverrideSchema = z.object({
  id: z.string(),
  weightOverride: z.number().min(0, 'Weight must be at least 0').max(20, 'Weight must be at most 20'),
})

export type UpdateCoefficientOverrideInput = z.infer<typeof updateCoefficientOverrideSchema>

/**
 * Schema for bulk updating coefficients (matrix view)
 */
export const bulkUpdateCoefficientsSchema = z.object({
  updates: z.array(
    z.object({
      coefficientTemplateId: z.string(),
      weightOverride: z.number().min(0).max(20),
    }),
  ),
})

export type BulkUpdateCoefficientsInput = z.infer<typeof bulkUpdateCoefficientsSchema>

/**
 * Schema for coefficient filters
 */
export const coefficientFiltersSchema = z.object({
  schoolYearTemplateId: z.string(),
  gradeId: z.string().optional(),
  seriesId: z.string().nullable().optional(),
  subjectId: z.string().optional(),
})

export type CoefficientFilters = z.infer<typeof coefficientFiltersSchema>

/**
 * Schema for copying coefficients from another year
 */
export const copyCoefficientsSchema = z.object({
  sourceSchoolYearTemplateId: z.string(),
  targetSchoolYearTemplateId: z.string(),
})

export type CopyCoefficientsInput = z.infer<typeof copyCoefficientsSchema>

/**
 * Schema for matrix view filters
 */
export const coefficientMatrixFiltersSchema = z.object({
  schoolYearTemplateId: z.string(),
  seriesId: z.string().nullable().optional(),
})

export type CoefficientMatrixFilters = z.infer<typeof coefficientMatrixFiltersSchema>

// ===== RESPONSE TYPES =====

/**
 * Effective coefficient response type
 */
export interface EffectiveCoefficientResponse {
  templateId: string
  weight: number
  templateWeight: number
  isOverride: boolean
  overrideId: string | null
}

/**
 * Coefficient with override status
 */
export interface CoefficientWithOverrideResponse {
  id: string
  subjectId: string
  gradeId: string
  seriesId: string | null
  templateWeight: number
  effectiveWeight: number
  isOverride: boolean
  overrideId: string | null
  subject: {
    id: string
    name: string
    shortName: string
    category: string | null
  }
  grade: {
    id: string
    name: string
    code: string
    order: number
  }
  series: {
    id: string
    name: string
    code: string
  } | null
}

/**
 * Coefficient matrix response type
 */
export interface CoefficientMatrixResponse {
  subjects: Array<{
    id: string
    name: string
    shortName: string
    category: string | null
  }>
  grades: Array<{
    id: string
    name: string
    code: string
    order: number
  }>
  matrix: Record<string, Record<string, {
    templateId: string
    templateWeight: number
    effectiveWeight: number
    isOverride: boolean
    overrideId: string | null
  }>>
}
