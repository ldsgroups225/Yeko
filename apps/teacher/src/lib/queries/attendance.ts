/**
 * Attendance Query Options
 * TanStack Query options for student attendance tracking
 */
import { queryOptions } from '@tanstack/react-query'

import {
  getAttendanceStats,
  getClassRoster,
  getStudentAttendanceHistory,
  getStudentAttendanceTrend,
} from '@/teacher/functions/attendance'

// Options for getting class roster for attendance taking
export function classRosterQueryOptions(params: {
  classId: string
  schoolYearId: string
  date: string
}) {
  return queryOptions({
    queryKey: ['attendance', 'classRoster', params.classId, params.date],
    queryFn: () => getClassRoster({ data: params }),
    staleTime: 5 * 60 * 1000, // 5 minutes - roster doesn't change often during a session
  })
}

// Options for getting attendance statistics
export function attendanceStatsQueryOptions(params: {
  classId: string
  schoolYearId: string
  startDate?: string
  endDate?: string
}) {
  return queryOptions({
    queryKey: ['attendance', 'stats', params.classId, params.startDate, params.endDate],
    queryFn: () => getAttendanceStats({ data: params }),
    staleTime: 10 * 60 * 1000, // 10 minutes - stats are calculated data
  })
}

// Options for getting student attendance history
export function studentAttendanceHistoryQueryOptions(params: {
  studentId: string
  classId?: string
  schoolYearId: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}) {
  return queryOptions({
    queryKey: [
      'attendance',
      'studentHistory',
      params.studentId,
      params.classId,
      params.startDate,
      params.endDate,
      params.offset,
    ],
    queryFn: () => getStudentAttendanceHistory({ data: params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Options for getting student attendance trend
export function studentAttendanceTrendQueryOptions(params: {
  studentId: string
  schoolYearId: string
  months?: number
}) {
  return queryOptions({
    queryKey: ['attendance', 'studentTrend', params.studentId, params.months],
    queryFn: () =>
      getStudentAttendanceTrend({
        data: { ...params, months: params.months ?? 6 },
      }),
    staleTime: 30 * 60 * 1000, // 30 minutes - trend data changes slowly
  })
}

// Derived query options for computing real-time attendance counts from roster
export function attendanceCountsQueryOptions(params: {
  classId: string
  schoolYearId: string
  date: string
}) {
  return queryOptions({
    queryKey: ['attendance', 'counts', params.classId, params.date],
    queryFn: async () => {
      const { roster } = await getClassRoster({ data: params })

      interface RosterItem {
        attendance: { status: string } | null
      }

      const counts = {
        total: roster.length,
        present: roster.filter((s: RosterItem) => s.attendance?.status === 'present').length,
        absent: roster.filter((s: RosterItem) => s.attendance?.status === 'absent').length,
        late: roster.filter((s: RosterItem) => s.attendance?.status === 'late').length,
        excused: roster.filter((s: RosterItem) => s.attendance?.status === 'excused').length,
        notMarked: roster.filter((s: RosterItem) => !s.attendance).length,
      }

      return counts
    },
    staleTime: 1 * 60 * 1000, // 1 minute - real-time during active session
  })
}
