import { queryOptions } from '@tanstack/react-query'

import {
  getAttendanceRange,
  getDailyAttendance,
  getPunctualityReport,
} from '@/school/functions/teacher-attendance'

export const teacherAttendanceKeys = {
  all: ['teacher-attendance'] as const,
  daily: (schoolId: string, date: string) =>
    [...teacherAttendanceKeys.all, 'daily', schoolId, date] as const,
  range: (schoolId: string, startDate: string, endDate: string) =>
    [...teacherAttendanceKeys.all, 'range', schoolId, startDate, endDate] as const,
  report: (schoolId: string, startDate: string, endDate: string) =>
    [...teacherAttendanceKeys.all, 'report', schoolId, startDate, endDate] as const,
}

export function dailyTeacherAttendanceOptions(date: string) {
  return queryOptions({
    queryKey: teacherAttendanceKeys.daily('current', date),
    queryFn: async () => {
      const res = await getDailyAttendance({ data: { date } })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function teacherAttendanceRangeOptions(params: {
  startDate: string
  endDate: string
  teacherId?: string
  status?: 'present' | 'late' | 'absent' | 'excused' | 'on_leave'
}) {
  return queryOptions({
    queryKey: teacherAttendanceKeys.range('current', params.startDate, params.endDate),
    queryFn: async () => {
      const res = await getAttendanceRange({ data: params })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function teacherPunctualityReportOptions(params: {
  startDate: string
  endDate: string
  teacherId?: string
}) {
  return queryOptions({
    queryKey: teacherAttendanceKeys.report('current', params.startDate, params.endDate),
    queryFn: async () => {
      const res = await getPunctualityReport({ data: params })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
