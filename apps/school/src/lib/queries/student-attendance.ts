import { queryOptions } from '@tanstack/react-query'

import {
  bulkRecordClassAttendance,
  checkChronicAbsence,
  excuseAbsence,
  getClassAttendanceForDate,
  getStatistics,
  getStudentHistory,
  notifyParent,
  recordStudentAttendance,
  removeStudentAttendance,
} from '@/school/functions/student-attendance'
import { schoolMutationKeys } from './keys'

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
    queryFn: async () => {
      const res = await getClassAttendanceForDate({ data: { classId, date, classSessionId } })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
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
    queryFn: async () => {
      const res = await getStudentHistory({ data: params })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
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
    queryFn: async () => {
      const res = await getStatistics({ data: params })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
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
    queryFn: async () => {
      const res = await checkChronicAbsence({ data: params })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
    staleTime: 10 * 60 * 1000,
  })
}

// Student attendance mutations
export const studentAttendanceMutations = {
  record: {
    mutationKey: schoolMutationKeys.studentAttendance.record,
    mutationFn: (data: Parameters<typeof recordStudentAttendance>[0]['data']) => recordStudentAttendance({ data }),
  },
  bulkRecord: {
    mutationKey: schoolMutationKeys.studentAttendance.bulkRecord,
    mutationFn: (data: Parameters<typeof bulkRecordClassAttendance>[0]['data']) => bulkRecordClassAttendance({ data }),
  },
  excuse: {
    mutationKey: schoolMutationKeys.studentAttendance.excuse,
    mutationFn: (data: Parameters<typeof excuseAbsence>[0]['data']) => excuseAbsence({ data }),
  },
  notify: {
    mutationKey: schoolMutationKeys.studentAttendance.notify,
    mutationFn: (data: Parameters<typeof notifyParent>[0]['data']) => notifyParent({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.studentAttendance.delete,
    mutationFn: (data: Parameters<typeof removeStudentAttendance>[0]['data']) => removeStudentAttendance({ data }),
  },
}
