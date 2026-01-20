import { queryOptions } from '@tanstack/react-query'
import { getCancelledSessions, getDetailedSchedule, getTeacherSubstitutionsFn } from '@/teacher/functions/schedule'

export function detailedScheduleQueryOptions(params: {
  teacherId: string
  schoolId: string
  schoolYearId: string
  startDate: string
  endDate: string
}) {
  return queryOptions({
    queryKey: ['teacher', 'schedule', 'detailed', params.teacherId, params.startDate, params.endDate],
    queryFn: () => getDetailedSchedule({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}

export function teacherSubstitutionsQueryOptions(params: {
  teacherId: string
  schoolId: string
  schoolYearId: string
  startDate: string
  endDate: string
}) {
  return queryOptions({
    queryKey: ['teacher', 'schedule', 'substitutions', params.teacherId, params.startDate, params.endDate],
    queryFn: () => getTeacherSubstitutionsFn({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}

export function cancelledSessionsQueryOptions(params: {
  teacherId: string
  schoolId: string
  schoolYearId: string
  startDate: string
  endDate: string
}) {
  return queryOptions({
    queryKey: ['teacher', 'schedule', 'cancellations', params.teacherId, params.startDate, params.endDate],
    queryFn: () => getCancelledSessions({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}
