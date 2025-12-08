import { queryOptions } from '@tanstack/react-query'
import {
  getStudentFee,
  getStudentFeesDetails,
  getStudentFeesList,
  getStudentFeeSummaryData,
  getStudentsWithBalance,
} from '@/school/functions/student-fees'

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
      queryFn: () => getStudentFeesList({ data: filters }),
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: studentFeesKeys.detail(id),
      queryFn: () => getStudentFee({ data: id }),
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!id,
    }),

  studentDetails: (studentId: string, schoolYearId?: string) =>
    queryOptions({
      queryKey: studentFeesKeys.studentDetails(studentId, schoolYearId),
      queryFn: () => getStudentFeesDetails({ data: { studentId, schoolYearId } }),
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!studentId,
    }),

  studentSummary: (studentId: string, schoolYearId?: string) =>
    queryOptions({
      queryKey: studentFeesKeys.studentSummary(studentId, schoolYearId),
      queryFn: () => getStudentFeeSummaryData({ data: { studentId, schoolYearId } }),
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!studentId,
    }),

  withBalance: (schoolYearId?: string) =>
    queryOptions({
      queryKey: studentFeesKeys.withBalance(schoolYearId),
      queryFn: () => getStudentsWithBalance({ data: { schoolYearId } }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
}
