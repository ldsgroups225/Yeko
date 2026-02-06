import { queryOptions } from '@tanstack/react-query'
import { getCancelledSessions, getDetailedSchedule, getTeacherSubstitutionsFn } from '@/teacher/functions/schedule'

export const scheduleKeys = {
  all: ['teacher', 'schedule'] as const,
  detailed: (teacherId: string, startDate: string, endDate: string) =>
    [...scheduleKeys.all, 'detailed', teacherId, startDate, endDate] as const,
  substitutions: (teacherId: string, startDate: string, endDate: string) =>
    [...scheduleKeys.all, 'substitutions', teacherId, startDate, endDate] as const,
  cancellations: (teacherId: string, startDate: string, endDate: string) =>
    [...scheduleKeys.all, 'cancellations', teacherId, startDate, endDate] as const,
}

export function detailedScheduleQueryOptions(params: {
  teacherId: string
  schoolId: string
  schoolYearId: string
  startDate: string
  endDate: string
}) {
  return queryOptions({
    queryKey: scheduleKeys.detailed(params.teacherId, params.startDate, params.endDate),
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
    queryKey: scheduleKeys.substitutions(params.teacherId, params.startDate, params.endDate),
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
    queryKey: scheduleKeys.cancellations(params.teacherId, params.startDate, params.endDate),
    queryFn: () => getCancelledSessions({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}
