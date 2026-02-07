import { queryOptions } from '@tanstack/react-query'
import {
  bulkCreateStudentFees,
  createNewStudentFee,
  getStudentFee,
  getStudentFeesDetails,
  getStudentFeesList,
  getStudentFeeSummaryData,
  getStudentsWithBalance,
  waiveExistingStudentFee,
} from '@/school/functions/student-fees'
import { schoolMutationKeys } from './keys'

export const studentFeesKeys = {
  all: ['studentFees'] as const,
  lists: () => [...studentFeesKeys.all, 'list'] as const,
  list: (filters: StudentFeeFilters) => [...studentFeesKeys.lists(), filters] as const,
  details: () => [...studentFeesKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentFeesKeys.details(), id] as const,
  studentDetails: (studentId: string, schoolYearId?: string) => [...studentFeesKeys.all, 'student', studentId, schoolYearId] as const,
  studentSummary: (studentId: string, schoolYearId?: string) => [...studentFeesKeys.all, 'summary', studentId, schoolYearId] as const,
  withBalance: (schoolYearId?: string) => [...studentFeesKeys.all, 'withBalance', schoolYearId] as const,
}

export interface StudentFeeFilters {
  studentId?: string
  enrollmentId?: string
  status?: 'pending' | 'partial' | 'paid' | 'waived' | 'cancelled'
}

export const studentFeesOptions = {
  list: (filters: StudentFeeFilters = {}) =>
    queryOptions({
      queryKey: studentFeesKeys.list(filters),
      queryFn: async () => {
        const res = await getStudentFeesList({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: studentFeesKeys.detail(id),
      queryFn: async () => {
        const res = await getStudentFee({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!id,
    }),

  studentDetails: (studentId: string, schoolYearId?: string) =>
    queryOptions({
      queryKey: studentFeesKeys.studentDetails(studentId, schoolYearId),
      queryFn: async () => {
        const res = await getStudentFeesDetails({ data: { studentId, schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!studentId,
    }),

  studentSummary: (studentId: string, schoolYearId?: string) =>
    queryOptions({
      queryKey: studentFeesKeys.studentSummary(studentId, schoolYearId),
      queryFn: async () => {
        const res = await getStudentFeeSummaryData({ data: { studentId, schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!studentId,
    }),

  withBalance: (schoolYearId?: string) =>
    queryOptions({
      queryKey: studentFeesKeys.withBalance(schoolYearId),
      queryFn: async () => {
        const res = await getStudentsWithBalance({ data: { schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
}

// Student fee mutations
export const studentFeesMutations = {
  create: {
    mutationKey: schoolMutationKeys.fees.assign,
    mutationFn: (data: Parameters<typeof createNewStudentFee>[0]['data']) => createNewStudentFee({ data }),
  },
  bulkCreate: {
    mutationKey: schoolMutationKeys.fees.bulkAssign,
    mutationFn: (data: Parameters<typeof bulkCreateStudentFees>[0]['data']) => bulkCreateStudentFees({ data }),
  },
  waive: {
    mutationKey: schoolMutationKeys.fees.remove,
    mutationFn: (data: Parameters<typeof waiveExistingStudentFee>[0]['data']) => waiveExistingStudentFee({ data }),
  },
}
