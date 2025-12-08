import { queryOptions } from '@tanstack/react-query'

import {
  getTeacherClasses,
  getTeacherDashboard,
  getTeacherSchedule,
} from '@/teacher/functions/dashboard'

interface DashboardParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
  date?: string
}

export function teacherDashboardQueryOptions(params: DashboardParams) {
  return queryOptions({
    queryKey: ['teacher', 'dashboard', params.teacherId, params.date],
    queryFn: () => getTeacherDashboard({ data: params }),
    staleTime: 30 * 1000, // 30 seconds - dashboard needs fresh data
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

interface ScheduleParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
  startDate: string
  endDate: string
}

export function teacherScheduleQueryOptions(params: ScheduleParams) {
  return queryOptions({
    queryKey: ['teacher', 'schedule', params.teacherId, params.startDate, params.endDate],
    queryFn: () => getTeacherSchedule({ data: params }),
    staleTime: 5 * 60 * 1000, // 5 minutes - schedule rarely changes
  })
}

interface ClassesParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
}

export function teacherClassesQueryOptions(params: ClassesParams) {
  return queryOptions({
    queryKey: ['teacher', 'classes', params.teacherId, params.schoolYearId],
    queryFn: () => getTeacherClasses({ data: params }),
    staleTime: 10 * 60 * 1000, // 10 minutes - classes rarely change
  })
}
