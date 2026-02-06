import type { ClassSessionStatus } from '@/schemas/curriculum-progress'

import { queryOptions } from '@tanstack/react-query'
import {
  getChapterCompletions,
  getClassesBehindSchedule,
  getClassSession,
  getClassSessions,
  getCurriculumProgress,
  getProgressBySubject,
  getProgressOverview,
  getProgressStatsByStatus,
  getTeacherProgressSummary,
  isChapterCompleted,
} from '@/school/functions/curriculum-progress'

// ============================================
// QUERY KEYS
// ============================================

export const progressKeys = {
  all: ['curriculum-progress'] as const,
  lists: () => [...progressKeys.all, 'list'] as const,
  overview: (schoolId: string, schoolYearId: string, termId?: string) =>
    [...progressKeys.lists(), 'overview', schoolId, schoolYearId, termId] as const,
  byClass: (classId: string, termId: string, subjectId?: string) =>
    [...progressKeys.lists(), 'class', classId, termId, subjectId] as const,
  bySubject: (schoolId: string, termId: string) =>
    [...progressKeys.lists(), 'subject', schoolId, termId] as const,
  byTeacher: (teacherId: string, termId: string) =>
    [...progressKeys.lists(), 'teacher', teacherId, termId] as const,
  behindSchedule: (schoolId: string, termId: string, threshold?: number) =>
    [...progressKeys.all, 'behind', schoolId, termId, threshold] as const,
  statsByStatus: (schoolId: string, termId: string) =>
    [...progressKeys.all, 'stats', schoolId, termId] as const,
  sessions: () => [...progressKeys.all, 'sessions'] as const,
  sessionsList: (classId: string, filters?: SessionFilters) =>
    [...progressKeys.sessions(), 'list', classId, filters] as const,
  sessionDetail: (id: string) =>
    [...progressKeys.sessions(), 'detail', id] as const,
  chapters: () => [...progressKeys.all, 'chapters'] as const,
  chapterCompletions: (classId: string, subjectId?: string) =>
    [...progressKeys.chapters(), 'completions', classId, subjectId] as const,
  chapterStatus: (classId: string, chapterId: string) =>
    [...progressKeys.chapters(), 'status', classId, chapterId] as const,
}

// ============================================
// INTERFACES
// ============================================

export interface SessionFilters {
  subjectId?: string
  startDate?: string
  endDate?: string
  status?: ClassSessionStatus
}

export interface ProgressByClassParams {
  classId: string
  termId: string
  subjectId?: string
}

export interface ProgressOverviewParams {
  schoolId: string
  schoolYearId: string
  termId?: string
}

export interface ClassesBehindParams {
  schoolId: string
  termId: string
  threshold?: number
}

// ============================================
// QUERY OPTIONS
// ============================================

export const progressOptions = {
  overview: (params: ProgressOverviewParams) =>
    queryOptions({
      queryKey: progressKeys.overview(params.schoolId, params.schoolYearId, params.termId),
      queryFn: async () => {
        const res = await getProgressOverview({ data: params })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000, // 2 minutes - progress updates frequently
      gcTime: 15 * 60 * 1000,
      enabled: !!params.schoolId && !!params.schoolYearId,
    }),

  byClass: (params: ProgressByClassParams) =>
    queryOptions({
      queryKey: progressKeys.byClass(params.classId, params.termId, params.subjectId),
      queryFn: async () => {
        const res = await getCurriculumProgress({ data: params })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!params.classId && !!params.termId,
    }),

  bySubject: (schoolId: string, termId: string) =>
    queryOptions({
      queryKey: progressKeys.bySubject(schoolId, termId),
      queryFn: async () => {
        const res = await getProgressBySubject({ data: { schoolId, termId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!schoolId && !!termId,
    }),

  byTeacher: (teacherId: string, termId: string) =>
    queryOptions({
      queryKey: progressKeys.byTeacher(teacherId, termId),
      queryFn: async () => {
        const res = await getTeacherProgressSummary({ data: { teacherId, termId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!teacherId && !!termId,
    }),

  behindSchedule: (params: ClassesBehindParams) =>
    queryOptions({
      queryKey: progressKeys.behindSchedule(params.schoolId, params.termId, params.threshold),
      queryFn: async () => {
        const res = await getClassesBehindSchedule({ data: params })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!params.schoolId && !!params.termId,
    }),

  statsByStatus: (schoolId: string, termId: string) =>
    queryOptions({
      queryKey: progressKeys.statsByStatus(schoolId, termId),
      queryFn: async () => {
        const res = await getProgressStatsByStatus({ data: { schoolId, termId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!schoolId && !!termId,
    }),

  sessions: (classId: string, filters: SessionFilters = {}) =>
    queryOptions({
      queryKey: progressKeys.sessionsList(classId, filters),
      queryFn: async () => {
        const res = await getClassSessions({ data: { classId, ...filters } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000,
      enabled: !!classId,
    }),

  sessionDetail: (id: string) =>
    queryOptions({
      queryKey: progressKeys.sessionDetail(id),
      queryFn: async () => {
        const res = await getClassSession({ data: { id } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!id,
    }),

  chapterCompletions: (classId: string, subjectId?: string) =>
    queryOptions({
      queryKey: progressKeys.chapterCompletions(classId, subjectId),
      queryFn: async () => {
        const res = await getChapterCompletions({ data: { classId, subjectId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!classId,
    }),

  isChapterCompleted: (classId: string, chapterId: string) =>
    queryOptions({
      queryKey: progressKeys.chapterStatus(classId, chapterId),
      queryFn: async () => {
        const res = await isChapterCompleted({ data: { classId, chapterId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!classId && !!chapterId,
    }),
}
