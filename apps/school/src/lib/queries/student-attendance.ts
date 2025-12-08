import { queryOptions } from '@tanstack/react-query'

import {
  checkChronicAbsence,
  getClassAttendanceForDate,
  getStatistics,
  getStudentHistory,
} from '@/school/functions/student-attendance'

export const studentAttendanceKeys = {
  all: ['student-attendance'] as const,
  class: (classId: string, date: string) =>
    [...studentAttendanceKeys.all, 'class', classId, date] as const,
  student: (studentId: string, startDate: string, endDate: string) =>
    [...studentAttendanceKeys.all, 'student', studentId, startDate, endDate] as const,
  statistics: (startDate: string, endDate: string) =>
    [...studentAttendanceKeys.all, 'statistics', startDate, endDate] as const,
  chronic: (studentId: string) =>
    [...studentAttendanceKeys.all, 'chronic', studentId] as const,
}

export function classAttendanceOptions(classId: string, date: string, classSessionId?: string) {
  return queryOptions({
    queryKey: studentAttendanceKeys.class(classId, date),
    queryFn: () => getClassAttendanceForDate({ data: { classId, date, classSessionId } }),
    staleTime: 2 * 60 * 1000,
    enabled: !!classId && !!date,
  })
}

export function studentAttendanceHistoryOptions(params: {
  studentId: string
  startDate: string
  endDate: string
  classId?: string
}) {
  return queryOptions({
    queryKey: studentAttendanceKeys.student(params.studentId, params.startDate, params.endDate),
    queryFn: () => getStudentHistory({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}

export function attendanceStatisticsOptions(params: {
  startDate: string
  endDate: string
  classId?: string
}) {
  return queryOptions({
    queryKey: studentAttendanceKeys.statistics(params.startDate, params.endDate),
    queryFn: () => getStatistics({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}

export function chronicAbsenceOptions(params: {
  studentId: string
  startDate: string
  endDate: string
}) {
  return queryOptions({
    queryKey: studentAttendanceKeys.chronic(params.studentId),
    queryFn: () => checkChronicAbsence({ data: params }),
    staleTime: 10 * 60 * 1000,
  })
}
