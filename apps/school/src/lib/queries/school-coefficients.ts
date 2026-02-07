import type { CoefficientFilters, CoefficientMatrixFilters } from '@/schemas/coefficient-override'
import { queryOptions } from '@tanstack/react-query'
import {
  bulkUpdateSchoolCoefficients,
  copySchoolCoefficientsFromYear,
  createCoefficientOverride,
  deleteCoefficientOverride,
  getCoefficientMatrix,
  getEffectiveCoefficient,
  getSchoolCoefficients,
  getSchoolCoefficientStats,
  resetAllSchoolCoefficients,
  updateCoefficientOverride,
} from '@/school/functions/school-coefficients'
import { schoolMutationKeys } from './keys'

// ===== SCHOOL COEFFICIENTS QUERY OPTIONS =====

export const schoolCoefficientsKeys = {
  all: ['school-coefficients'] as const,
  lists: () => [...schoolCoefficientsKeys.all, 'list'] as const,
  list: (filters: CoefficientFilters) => [...schoolCoefficientsKeys.lists(), filters] as const,
  effective: () => [...schoolCoefficientsKeys.all, 'effective'] as const,
  effectiveDetail: (params: {
    subjectId: string
    gradeId: string
    seriesId: string | null
    schoolYearTemplateId: string
  }) => [...schoolCoefficientsKeys.effective(), params] as const,
  matrix: () => [...schoolCoefficientsKeys.all, 'matrix'] as const,
  matrixFiltered: (filters: CoefficientMatrixFilters) =>
    [...schoolCoefficientsKeys.matrix(), filters] as const,
  stats: () => [...schoolCoefficientsKeys.all, 'stats'] as const,
}

export const schoolCoefficientsOptions = {
  /**
   * List all coefficients with override status
   */
  list: (filters: CoefficientFilters) =>
    queryOptions({
      queryKey: schoolCoefficientsKeys.list(filters),
      queryFn: async () => {
        const res = await getSchoolCoefficients({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      enabled: !!filters.schoolYearTemplateId,
    }),

  /**
   * Get effective coefficient for a specific combination
   */
  effective: (params: {
    subjectId: string
    gradeId: string
    seriesId: string | null
    schoolYearTemplateId: string
  }) =>
    queryOptions({
      queryKey: schoolCoefficientsKeys.effectiveDetail(params),
      queryFn: async () => {
        const res = await getEffectiveCoefficient({ data: params })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!params.subjectId && !!params.gradeId && !!params.schoolYearTemplateId,
    }),

  /**
   * Get coefficient matrix for grid view
   */
  matrix: (filters: CoefficientMatrixFilters) =>
    queryOptions({
      queryKey: schoolCoefficientsKeys.matrixFiltered(filters),
      queryFn: async () => {
        const res = await getCoefficientMatrix({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!filters.schoolYearTemplateId,
    }),

  /**
   * Get coefficient statistics for the school
   */
  stats: () =>
    queryOptions({
      queryKey: schoolCoefficientsKeys.stats(),
      queryFn: async () => {
        const res = await getSchoolCoefficientStats()
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
}

// School coefficients mutations
export const schoolCoefficientsMutations = {
  create: {
    mutationKey: schoolMutationKeys.coefficients.create,
    mutationFn: (data: Parameters<typeof createCoefficientOverride>[0]['data']) => createCoefficientOverride({ data }),
  },
  update: {
    mutationKey: schoolMutationKeys.coefficients.update,
    mutationFn: (data: Parameters<typeof updateCoefficientOverride>[0]['data']) => updateCoefficientOverride({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.coefficients.delete,
    mutationFn: (id: string) => deleteCoefficientOverride({ data: id }),
  },
  bulkUpdate: {
    mutationKey: schoolMutationKeys.coefficients.bulkUpdate,
    mutationFn: (data: Parameters<typeof bulkUpdateSchoolCoefficients>[0]['data']) => bulkUpdateSchoolCoefficients({ data }),
  },
  copy: {
    mutationKey: schoolMutationKeys.coefficients.copy,
    mutationFn: (data: Parameters<typeof copySchoolCoefficientsFromYear>[0]['data']) => copySchoolCoefficientsFromYear({ data }),
  },
  reset: {
    mutationKey: schoolMutationKeys.coefficients.reset,
    mutationFn: () => resetAllSchoolCoefficients(),
  },
}
