import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  bulkReEnroll,
  cancelEnrollment,
  confirmEnrollment,
  createEnrollment,
  deleteEnrollment,
  getEnrollmentById,
  getEnrollments,
  getEnrollmentStatistics,
  transferStudent,
} from '@/school/functions/enrollments'
import { schoolMutationKeys } from './keys'

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
  status?: 'pending' | 'confirmed' | 'cancelled' | 'transferred'
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
      placeholderData: keepPreviousData,
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

// Enrollment mutations
export const enrollmentsMutations = {
  create: {
    mutationKey: schoolMutationKeys.enrollments.create,
    mutationFn: (data: Parameters<typeof createEnrollment>[0]['data']) => createEnrollment({ data }),
  },
  confirm: {
    mutationKey: schoolMutationKeys.enrollments.confirm,
    mutationFn: (data: Parameters<typeof confirmEnrollment>[0]['data']) => confirmEnrollment({ data }),
  },
  cancel: {
    mutationKey: schoolMutationKeys.enrollments.cancel,
    mutationFn: (data: Parameters<typeof cancelEnrollment>[0]['data']) => cancelEnrollment({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.enrollments.delete,
    mutationFn: (id: string) => deleteEnrollment({ data: id }),
  },
  transfer: {
    mutationKey: schoolMutationKeys.students.transfer,
    mutationFn: (data: Parameters<typeof transferStudent>[0]['data']) => transferStudent({ data }),
  },
  bulkReEnroll: {
    mutationKey: schoolMutationKeys.students.bulkReEnroll,
    mutationFn: (data: Parameters<typeof bulkReEnroll>[0]['data']) => bulkReEnroll({ data }),
  },
}
