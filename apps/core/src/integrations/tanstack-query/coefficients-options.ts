import type {
  CoefficientTemplate,
  Grade,
  SchoolYearTemplate,
  Serie,
  Subject,
} from '@repo/data-ops/drizzle/core-schema'
import type {
  BulkCreateCoefficientsInput,
  BulkUpdateCoefficientsInput,
  CoefficientTemplateIdInput,
  CopyCoefficientsInput,
  CreateCoefficientTemplateInput,
  UpdateCoefficientTemplateInput,
} from '@/schemas/coefficients'
import { queryOptions } from '@tanstack/react-query'
import {
  bulkCreateCoefficientsMutation,
  bulkUpdateCoefficientsMutation,
  coefficientStatsQuery,
  coefficientTemplateByIdQuery,
  coefficientTemplatesQuery,
  copyCoefficientsMutation,
  createCoefficientTemplateMutation,
  deleteCoefficientTemplateMutation,
  updateCoefficientTemplateMutation,
  validateCoefficientImportMutation,
} from '@/core/functions/coefficients'

// Type for validation input
interface ValidateCoefficientImportInput {
  data: Array<{
    schoolYearTemplateId: string
    subjectId: string
    gradeId: string
    seriesId?: string | null
    weight: number
  }>
}

// Define the complex type locally
type CoefficientWithDetails = CoefficientTemplate & {
  schoolYearTemplate: Pick<SchoolYearTemplate, 'id' | 'name' | 'isActive'> | { id: string, name: string, isActive: boolean | null } | null
  subject: Pick<Subject, 'id' | 'name' | 'shortName' | 'category'> | { id: string, name: string, shortName: string | null, category: string | null } | null
  grade: Pick<Grade, 'id' | 'name' | 'code' | 'order'> | null
  series: Pick<Serie, 'id' | 'name' | 'code'> | { id: string, name: string, code: string | null } | null
}

// ===== COEFFICIENT TEMPLATES =====

export function coefficientTemplatesQueryOptions(params: {
  schoolYearTemplateId?: string
  gradeId?: string
  seriesId?: string
  subjectId?: string
  page?: number
  limit?: number
}) {
  return queryOptions<{
    coefficients: CoefficientWithDetails[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>({
    queryKey: ['coefficient-templates', params],
    queryFn: () => coefficientTemplatesQuery({ data: params }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  })
}

export function coefficientTemplateByIdQueryOptions(id: string) {
  return queryOptions<CoefficientWithDetails | null>({
    queryKey: ['coefficient-template', id],
    queryFn: () => coefficientTemplateByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

export const coefficientsMutationKeys = {
  createTemplate: ['coefficients', 'template', 'create'] as const,
  updateTemplate: ['coefficients', 'template', 'update'] as const,
  deleteTemplate: ['coefficients', 'template', 'delete'] as const,
  bulkCreate: ['coefficients', 'bulkCreate'] as const,
  bulkUpdate: ['coefficients', 'bulkUpdate'] as const,
  copy: ['coefficients', 'copy'] as const,
  validateImport: ['coefficients', 'validateImport'] as const,
}

export const createCoefficientTemplateMutationOptions = {
  mutationKey: coefficientsMutationKeys.createTemplate,
  mutationFn: (data: CreateCoefficientTemplateInput) => createCoefficientTemplateMutation({ data }),
}

export const updateCoefficientTemplateMutationOptions = {
  mutationKey: coefficientsMutationKeys.updateTemplate,
  mutationFn: (data: UpdateCoefficientTemplateInput) => updateCoefficientTemplateMutation({ data }),
}

export const deleteCoefficientTemplateMutationOptions = {
  mutationKey: coefficientsMutationKeys.deleteTemplate,
  mutationFn: (data: CoefficientTemplateIdInput) => deleteCoefficientTemplateMutation({ data }),
}

export const bulkCreateCoefficientsMutationOptions = {
  mutationKey: coefficientsMutationKeys.bulkCreate,
  mutationFn: (data: BulkCreateCoefficientsInput) => bulkCreateCoefficientsMutation({ data }),
}

export const bulkUpdateCoefficientsMutationOptions = {
  mutationKey: coefficientsMutationKeys.bulkUpdate,
  mutationFn: (data: BulkUpdateCoefficientsInput) => bulkUpdateCoefficientsMutation({ data }),
}

export const copyCoefficientsMutationOptions = {
  mutationKey: coefficientsMutationKeys.copy,
  mutationFn: (data: CopyCoefficientsInput) => copyCoefficientsMutation({ data }),
}

export const validateCoefficientImportMutationOptions = {
  mutationKey: coefficientsMutationKeys.validateImport,
  mutationFn: (data: ValidateCoefficientImportInput) => validateCoefficientImportMutation({ data }),
}

export function coefficientStatsQueryOptions() {
  return queryOptions<{ total: number }>({
    queryKey: ['coefficient-stats'],
    queryFn: () => coefficientStatsQuery(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  })
}

// Export all as a single object for convenience
export const coefficientQueries = {
  coefficientTemplates: coefficientTemplatesQueryOptions,
  coefficientTemplateById: coefficientTemplateByIdQueryOptions,
  createCoefficientTemplate: createCoefficientTemplateMutationOptions,
  updateCoefficientTemplate: updateCoefficientTemplateMutationOptions,
  deleteCoefficientTemplate: deleteCoefficientTemplateMutationOptions,
  bulkCreateCoefficients: bulkCreateCoefficientsMutationOptions,
  bulkUpdateCoefficients: bulkUpdateCoefficientsMutationOptions,
  copyCoefficients: copyCoefficientsMutationOptions,
  stats: coefficientStatsQueryOptions,
}
