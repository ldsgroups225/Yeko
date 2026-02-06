import { queryOptions } from '@tanstack/react-query'

import {
  getGrade,
  getGradesByClass,
  getGradeStatistics,
  getGradeValidationHistory,
  getPendingValidations,
} from '@/school/functions/student-grades'

export const gradesKeys = {
  all: ['grades'] as const,
  lists: () => [...gradesKeys.all, 'list'] as const,
  byClass: (classId: string, subjectId: string, termId: string) =>
    [...gradesKeys.lists(), 'class', classId, subjectId, termId] as const,
  details: () => [...gradesKeys.all, 'detail'] as const,
  detail: (id: string) => [...gradesKeys.details(), id] as const,
  history: (gradeId: string) => [...gradesKeys.all, 'history', gradeId] as const,
  pending: (schoolId: string, filters?: PendingFilters) =>
    [...gradesKeys.all, 'pending', schoolId, filters] as const,
  statistics: (classId: string, termId: string, subjectId?: string) =>
    [...gradesKeys.all, 'stats', classId, termId, subjectId] as const,
}

export interface GradesByClassParams {
  classId: string
  subjectId: string
  termId: string
  teacherId?: string
}

export interface PendingFilters {
  termId?: string
  classId?: string
  subjectId?: string
}

export interface StatisticsParams {
  classId: string
  termId: string
  subjectId?: string
}

export const gradesOptions = {
  byClass: (params: GradesByClassParams) =>
    queryOptions({
      queryKey: gradesKeys.byClass(params.classId, params.subjectId, params.termId),
      queryFn: async () => {
        const res = await getGradesByClass({ data: params })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 30 * 1000, // 30 seconds - grades change frequently
      gcTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!params.classId && !!params.subjectId && !!params.termId,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: gradesKeys.detail(id),
      queryFn: async () => {
        const res = await getGrade({ data: { id } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: !!id,
    }),

  pending: (schoolId: string, filters: PendingFilters = {}) =>
    queryOptions({
      queryKey: gradesKeys.pending(schoolId, filters),
      queryFn: async () => {
        const res = await getPendingValidations({ data: { schoolId, ...filters } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: !!schoolId,
    }),

  statistics: (params: StatisticsParams) =>
    queryOptions({
      queryKey: gradesKeys.statistics(params.classId, params.termId, params.subjectId),
      queryFn: async () => {
        const res = await getGradeStatistics({ data: params })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!params.classId && !!params.termId,
    }),

  history: (gradeId: string) =>
    queryOptions({
      queryKey: gradesKeys.history(gradeId),
      queryFn: async () => {
        const res = await getGradeValidationHistory({ data: { gradeId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!gradeId,
    }),
}
