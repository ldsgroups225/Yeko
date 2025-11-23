import { z } from 'zod'
import { COEFFICIENT_LIMITS } from '@/constants/coefficients'

// ===== COEFFICIENT TEMPLATES =====

export const CreateCoefficientTemplateSchema = z.object({
  weight: z.number().int().min(COEFFICIENT_LIMITS.MIN, 'Le coefficient doit être positif').max(COEFFICIENT_LIMITS.MAX, `Le coefficient ne peut pas dépasser ${COEFFICIENT_LIMITS.MAX}`),
  schoolYearTemplateId: z.string().min(1, 'L\'année scolaire est requise'),
  subjectId: z.string().min(1, 'La matière est requise'),
  gradeId: z.string().min(1, 'La classe est requise'),
  seriesId: z.string().nullable().optional(),
})

export const UpdateCoefficientTemplateSchema = CreateCoefficientTemplateSchema.partial().merge(z.object({
  id: z.string().min(1),
}))

export const CoefficientTemplateIdSchema = z.object({
  id: z.string().min(1),
})

export const GetCoefficientTemplatesSchema = z.object({
  schoolYearTemplateId: z.string().optional(),
  gradeId: z.string().optional(),
  seriesId: z.string().optional(),
  subjectId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(200).default(100),
})

export const BulkCreateCoefficientsSchema = z.object({
  coefficients: z.array(z.object({
    weight: z.number().int().min(COEFFICIENT_LIMITS.MIN).max(COEFFICIENT_LIMITS.MAX),
    schoolYearTemplateId: z.string().min(1),
    subjectId: z.string().min(1),
    gradeId: z.string().min(1),
    seriesId: z.string().nullable().optional(),
  })),
})

export const BulkUpdateCoefficientsSchema = z.array(z.object({
  id: z.string().min(1),
  weight: z.number().int().min(COEFFICIENT_LIMITS.MIN).max(COEFFICIENT_LIMITS.MAX),
}))

export const CopyCoefficientsSchema = z.object({
  sourceYearId: z.string().min(1, 'L\'année source est requise'),
  targetYearId: z.string().min(1, 'L\'année cible est requise'),
})

// Type exports
export type CreateCoefficientTemplateInput = z.infer<typeof CreateCoefficientTemplateSchema>
export type UpdateCoefficientTemplateInput = z.infer<typeof UpdateCoefficientTemplateSchema>
export type CoefficientTemplateIdInput = z.infer<typeof CoefficientTemplateIdSchema>
export type GetCoefficientTemplatesInput = z.infer<typeof GetCoefficientTemplatesSchema>
export type BulkCreateCoefficientsInput = z.infer<typeof BulkCreateCoefficientsSchema>
export type BulkUpdateCoefficientsInput = z.infer<typeof BulkUpdateCoefficientsSchema>
export type CopyCoefficientsInput = z.infer<typeof CopyCoefficientsSchema>
