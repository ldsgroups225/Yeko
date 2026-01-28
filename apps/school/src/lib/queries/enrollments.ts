import { queryOptions } from '@tanstack/react-query'
import {
  getEnrollmentById,
  getEnrollments,
  getEnrollmentStatistics,
} from '@/school/functions/enrollments'

export const enrollmentsKeys = {
  all: ['enrollments'] as const,
  lists: () => [...enrollmentsKeys.all, 'list'] as const,
  list: (filters: EnrollmentFilters) => [...enrollmentsKeys.lists(), filters] as const,
  details: () => [...enrollmentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...enrollmentsKeys.details(), id] as const,
  statistics: (schoolYearId: string) => [...enrollmentsKeys.all, 'statistics', schoolYearId] as const,
}

export interface EnrollmentFilters {
  schoolYearId?: string
  classId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export const enrollmentsOptions = {
  list: (filters: EnrollmentFilters = {}) =>
    queryOptions({
      queryKey: enrollmentsKeys.list(filters),
      queryFn: async () => {
        const result = await getEnrollments({ data: filters })
        if (result.success)
          return result.data
        throw new Error(result.error)
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: enrollmentsKeys.detail(id),
      queryFn: async () => {
        const result = await getEnrollmentById({ data: id })
        if (result.success)
          return result.data
        throw new Error(result.error)
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  statistics: (schoolYearId: string) =>
    queryOptions({
      queryKey: enrollmentsKeys.statistics(schoolYearId),
      queryFn: async () => {
        const result = await getEnrollmentStatistics({ data: schoolYearId })
        if (result.success)
          return result.data
        throw new Error(result.error)
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000,
      enabled: !!schoolYearId,
    }),
}
