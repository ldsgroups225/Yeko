/**
 * Attendance Query Options
 * TanStack Query options for student attendance tracking
 */
import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import {
  getAttendanceStats,
  getClassRoster,
  getStudentAttendanceHistory,
  getStudentAttendanceTrend,
} from '@/teacher/functions/attendance'

export const attendanceKeys = {
  all: ['attendance'] as const,
  rosters: () => [...attendanceKeys.all, 'roster'] as const,
  roster: (classId: string, date: string) => [...attendanceKeys.rosters(), classId, date] as const,
  stats: () => [...attendanceKeys.all, 'stats'] as const,
  classStats: (classId: string, start?: string, end?: string) =>
    [...attendanceKeys.stats(), classId, start, end] as const,
  history: () => [...attendanceKeys.all, 'history'] as const,
  studentHistory: (studentId: string, classId?: string) =>
    [...attendanceKeys.history(), studentId, classId] as const,
  trends: () => [...attendanceKeys.all, 'trend'] as const,
  studentTrend: (studentId: string, months?: number) =>
    [...attendanceKeys.trends(), studentId, months] as const,
}

// Options for getting class roster for attendance taking
export function classRosterQueryOptions(params: {
  classId: string
  schoolYearId: string
  date: string
}) {
  return queryOptions({
    queryKey: attendanceKeys.roster(params.classId, params.date),
    queryFn: () => getClassRoster({ data: params }),
    staleTime: 5 * 60 * 1000,
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
    queryKey: attendanceKeys.classStats(params.classId, params.startDate, params.endDate),
    queryFn: () => getAttendanceStats({ data: params }),
    staleTime: 10 * 60 * 1000,
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
    queryKey: attendanceKeys.studentHistory(params.studentId, params.classId),
    queryFn: () => getStudentAttendanceHistory({ data: params }),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

// Options for getting student attendance trend
export function studentAttendanceTrendQueryOptions(params: {
  studentId: string
  schoolYearId: string
  months?: number
}) {
  return queryOptions({
    queryKey: attendanceKeys.studentTrend(params.studentId, params.months),
    queryFn: () =>
      getStudentAttendanceTrend({
        data: { ...params, months: params.months ?? 6 },
      }),
    staleTime: 30 * 60 * 1000,
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

      if (!roster) {
        return {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          notMarked: 0,
        }
      }

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
