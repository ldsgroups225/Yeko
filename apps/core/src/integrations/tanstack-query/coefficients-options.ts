import type {
  BulkCreateCoefficientsInput,
  BulkUpdateCoefficientsInput,
  CoefficientTemplateIdInput,
  CopyCoefficientsInput,
  CreateCoefficientTemplateInput,
  UpdateCoefficientTemplateInput,
} from '@/schemas/coefficients'
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
} from '@/core/functions/coefficients'

// ===== COEFFICIENT TEMPLATES =====

export function coefficientTemplatesQueryOptions(params: {
  schoolYearTemplateId?: string
  gradeId?: string
  seriesId?: string
  subjectId?: string
  page?: number
  limit?: number
}) {
  return {
    queryKey: ['coefficient-templates', params],
    queryFn: () => coefficientTemplatesQuery({ data: params }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  }
}

export function coefficientTemplateByIdQueryOptions(id: string) {
  return {
    queryKey: ['coefficient-template', id],
    queryFn: () => coefficientTemplateByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  }
}

export const createCoefficientTemplateMutationOptions = {
  mutationFn: (data: CreateCoefficientTemplateInput) => createCoefficientTemplateMutation({ data }),
}

export const updateCoefficientTemplateMutationOptions = {
  mutationFn: (data: UpdateCoefficientTemplateInput) => updateCoefficientTemplateMutation({ data }),
}

export const deleteCoefficientTemplateMutationOptions = {
  mutationFn: (data: CoefficientTemplateIdInput) => deleteCoefficientTemplateMutation({ data }),
}

export const bulkCreateCoefficientsMutationOptions = {
  mutationFn: (data: BulkCreateCoefficientsInput) => bulkCreateCoefficientsMutation({ data }),
}

export const bulkUpdateCoefficientsMutationOptions = {
  mutationFn: (data: BulkUpdateCoefficientsInput) => bulkUpdateCoefficientsMutation({ data }),
}

export const copyCoefficientsMutationOptions = {
  mutationFn: (data: CopyCoefficientsInput) => copyCoefficientsMutation({ data }),
}

export function coefficientStatsQueryOptions() {
  return {
    queryKey: ['coefficient-stats'],
    queryFn: () => coefficientStatsQuery(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  }
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
