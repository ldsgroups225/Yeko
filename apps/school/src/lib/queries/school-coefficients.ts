import type { CoefficientFilters, CoefficientMatrixFilters } from '@/schemas/coefficient-override'
import { queryOptions } from '@tanstack/react-query'
import {
  getCoefficientMatrix,
  getEffectiveCoefficient,
  getSchoolCoefficients,
  getSchoolCoefficientStats,
} from '@/school/functions/school-coefficients'

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
