import { queryOptions } from '@tanstack/react-query'

import {
  getCancelledSessions,
  getDetailedSchedule,
  getSubstitutionHistory,
  getTeacherClassSessionsFn,
  getTeacherSubstitutionsFn,
} from '@/teacher/functions/schedule'

// ============================================
// DETAILED SCHEDULE
// ============================================

interface DetailedScheduleParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
  startDate: string
  endDate: string
}

export function detailedScheduleQueryOptions(params: DetailedScheduleParams) {
  return queryOptions({
    queryKey: ['teacher', 'schedule', 'detailed', params.teacherId, params.startDate, params.endDate],
    queryFn: () => getDetailedSchedule({ data: params }),
    staleTime: 5 * 60 * 1000, // 5 minutes - schedule rarely changes
  })
}

// ============================================
// SUBSTITUTIONS
// ============================================

interface SubstitutionsParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
  startDate: string
  endDate: string
}

export function teacherSubstitutionsQueryOptions(params: SubstitutionsParams) {
  return queryOptions({
    queryKey: ['teacher', 'schedule', 'substitutions', params.teacherId, params.startDate, params.endDate],
    queryFn: () => getTeacherSubstitutionsFn({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}

interface SubstitutionHistoryParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export function substitutionHistoryQueryOptions(params: SubstitutionHistoryParams) {
  return queryOptions({
    queryKey: ['teacher', 'schedule', 'substitution-history', params.teacherId, params.startDate, params.endDate, params.page],
    queryFn: () => getSubstitutionHistory({ data: params }),
    staleTime: 10 * 60 * 1000, // 10 minutes - history rarely changes
  })
}

// ============================================
// CANCELLATIONS
// ============================================

interface CancellationsParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
  startDate: string
  endDate: string
}

export function cancelledSessionsQueryOptions(params: CancellationsParams) {
  return queryOptions({
    queryKey: ['teacher', 'schedule', 'cancellations', params.teacherId, params.startDate, params.endDate],
    queryFn: () => getCancelledSessions({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================
// CLASS SESSIONS
// ============================================

interface ClassSessionsParams {
  teacherId: string
  schoolId: string
  startDate: string
  endDate: string
}

export function teacherClassSessionsQueryOptions(params: ClassSessionsParams) {
  return queryOptions({
    queryKey: ['teacher', 'schedule', 'class-sessions', params.teacherId, params.startDate, params.endDate],
    queryFn: () => getTeacherClassSessionsFn({ data: params }),
    staleTime: 2 * 60 * 1000, // 2 minutes - sessions can change
  })
}
