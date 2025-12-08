import { queryOptions } from '@tanstack/react-query'

import {
  getAllConflicts,
  getClassroomAvailability,
  getTeacherAvailability,
  getTeacherWeeklyHours,
  getTimetableByClass,
  getTimetableByClassroom,
  getTimetableByTeacher,
  getTimetableSession,
} from '@/school/functions/timetables'

// ============================================
// QUERY KEYS
// ============================================

export const timetablesKeys = {
  all: ['timetables'] as const,
  lists: () => [...timetablesKeys.all, 'list'] as const,
  byClass: (classId: string, schoolYearId: string) =>
    [...timetablesKeys.lists(), 'class', classId, schoolYearId] as const,
  byTeacher: (teacherId: string, schoolYearId: string) =>
    [...timetablesKeys.lists(), 'teacher', teacherId, schoolYearId] as const,
  byClassroom: (classroomId: string, schoolYearId: string) =>
    [...timetablesKeys.lists(), 'classroom', classroomId, schoolYearId] as const,
  details: () => [...timetablesKeys.all, 'detail'] as const,
  detail: (id: string) => [...timetablesKeys.details(), id] as const,
  conflicts: (schoolId: string, schoolYearId: string) =>
    [...timetablesKeys.all, 'conflicts', schoolId, schoolYearId] as const,
  teacherHours: (teacherId: string, schoolYearId: string) =>
    [...timetablesKeys.all, 'hours', teacherId, schoolYearId] as const,
  teacherAvailability: (teacherId: string, schoolYearId: string, dayOfWeek: number) =>
    [...timetablesKeys.all, 'availability', 'teacher', teacherId, schoolYearId, dayOfWeek] as const,
  classroomAvailability: (classroomId: string, schoolYearId: string, dayOfWeek: number) =>
    [...timetablesKeys.all, 'availability', 'classroom', classroomId, schoolYearId, dayOfWeek] as const,
}

// ============================================
// QUERY OPTIONS
// ============================================

export interface TimetableByClassParams {
  classId: string
  schoolYearId: string
}

export interface TimetableByTeacherParams {
  teacherId: string
  schoolYearId: string
}

export interface TimetableByClassroomParams {
  classroomId: string
  schoolYearId: string
}

export interface AvailabilityParams {
  teacherId?: string
  classroomId?: string
  schoolYearId: string
  dayOfWeek: number
}

export const timetablesOptions = {
  byClass: (params: TimetableByClassParams) =>
    queryOptions({
      queryKey: timetablesKeys.byClass(params.classId, params.schoolYearId),
      queryFn: () => getTimetableByClass({ data: params }),
      staleTime: 10 * 60 * 1000, // 10 minutes - timetables rarely change
      gcTime: 60 * 60 * 1000, // 1 hour
      enabled: !!params.classId && !!params.schoolYearId,
    }),

  byTeacher: (params: TimetableByTeacherParams) =>
    queryOptions({
      queryKey: timetablesKeys.byTeacher(params.teacherId, params.schoolYearId),
      queryFn: () => getTimetableByTeacher({ data: params }),
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      enabled: !!params.teacherId && !!params.schoolYearId,
    }),

  byClassroom: (params: TimetableByClassroomParams) =>
    queryOptions({
      queryKey: timetablesKeys.byClassroom(params.classroomId, params.schoolYearId),
      queryFn: () => getTimetableByClassroom({ data: params }),
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      enabled: !!params.classroomId && !!params.schoolYearId,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: timetablesKeys.detail(id),
      queryFn: () => getTimetableSession({ data: { id } }),
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      enabled: !!id,
    }),

  conflicts: (schoolId: string, schoolYearId: string) =>
    queryOptions({
      queryKey: timetablesKeys.conflicts(schoolId, schoolYearId),
      queryFn: () => getAllConflicts({ data: { schoolId, schoolYearId } }),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,
      enabled: !!schoolId && !!schoolYearId,
    }),

  teacherHours: (teacherId: string, schoolYearId: string) =>
    queryOptions({
      queryKey: timetablesKeys.teacherHours(teacherId, schoolYearId),
      queryFn: () => getTeacherWeeklyHours({ data: { teacherId, schoolYearId } }),
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      enabled: !!teacherId && !!schoolYearId,
    }),

  teacherAvailability: (teacherId: string, schoolYearId: string, dayOfWeek: number) =>
    queryOptions({
      queryKey: timetablesKeys.teacherAvailability(teacherId, schoolYearId, dayOfWeek),
      queryFn: () => getTeacherAvailability({ data: { teacherId, schoolYearId, dayOfWeek } }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!teacherId && !!schoolYearId && dayOfWeek >= 1 && dayOfWeek <= 7,
    }),

  classroomAvailability: (classroomId: string, schoolYearId: string, dayOfWeek: number) =>
    queryOptions({
      queryKey: timetablesKeys.classroomAvailability(classroomId, schoolYearId, dayOfWeek),
      queryFn: () => getClassroomAvailability({ data: { classroomId, schoolYearId, dayOfWeek } }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!classroomId && !!schoolYearId && dayOfWeek >= 1 && dayOfWeek <= 7,
    }),
}
