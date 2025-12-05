import { queryOptions } from '@tanstack/react-query'
import {
  detectTeacherConflicts,
  getAssignmentMatrix,
  getClassSubjects,
} from '@/school/functions/class-subjects'

export const classSubjectsKeys = {
  all: ['classSubjects'] as const,
  lists: () => [...classSubjectsKeys.all, 'list'] as const,
  list: (filters: ClassSubjectFilters) => [...classSubjectsKeys.lists(), filters] as const,
  matrix: () => [...classSubjectsKeys.all, 'matrix'] as const,
  matrixByYear: (schoolYearId: string) => [...classSubjectsKeys.matrix(), schoolYearId] as const,
  conflicts: () => [...classSubjectsKeys.all, 'conflicts'] as const,
  teacherConflicts: (teacherId: string, schoolYearId: string) =>
    [...classSubjectsKeys.conflicts(), teacherId, schoolYearId] as const,
}

export interface ClassSubjectFilters {
  classId?: string
  subjectId?: string
  teacherId?: string
  schoolYearId?: string
}

export const classSubjectsOptions = {
  list: (filters: ClassSubjectFilters = {}) =>
    queryOptions({
      queryKey: classSubjectsKeys.list(filters),
      queryFn: () => getClassSubjects({ data: filters }),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),

  matrix: (schoolYearId: string) =>
    queryOptions({
      queryKey: classSubjectsKeys.matrixByYear(schoolYearId),
      queryFn: () => getAssignmentMatrix({ data: schoolYearId }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!schoolYearId,
    }),

  teacherConflicts: (teacherId: string, schoolYearId: string) =>
    queryOptions({
      queryKey: classSubjectsKeys.teacherConflicts(teacherId, schoolYearId),
      queryFn: () => detectTeacherConflicts({ data: { teacherId, schoolYearId } }),
      staleTime: 2 * 60 * 1000, // 2 minutes - conflicts change more frequently
      gcTime: 10 * 60 * 1000,
      enabled: !!teacherId && !!schoolYearId,
    }),
}
