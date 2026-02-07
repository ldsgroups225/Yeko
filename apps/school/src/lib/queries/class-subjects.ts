import { queryOptions } from '@tanstack/react-query'
import {
  assignTeacherToClassSubject,
  bulkAssignTeacher,
  copyClassSubjects,
  detectTeacherConflicts,
  getAssignmentMatrix,
  getClassSubjects,
  removeClassSubject,
  removeTeacherFromClassSubject,
  saveClassSubject,
  updateClassSubjectConfig,
} from '@/school/functions/class-subjects'
import { schoolMutationKeys } from './keys'

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
      queryFn: async () => {
        const res = await getClassSubjects({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),

  matrix: (schoolYearId: string) =>
    queryOptions({
      queryKey: classSubjectsKeys.matrixByYear(schoolYearId),
      queryFn: async () => {
        const res = await getAssignmentMatrix({ data: schoolYearId })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!schoolYearId,
    }),

  teacherConflicts: (teacherId: string, schoolYearId: string) =>
    queryOptions({
      queryKey: classSubjectsKeys.teacherConflicts(teacherId, schoolYearId),
      queryFn: async () => {
        const res = await detectTeacherConflicts({ data: { teacherId, schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000, // 2 minutes - conflicts change more frequently
      gcTime: 10 * 60 * 1000,
      enabled: !!teacherId && !!schoolYearId,
    }),
}

// Class-subject mutations
export const classSubjectsMutations = {
  assignTeacher: {
    mutationKey: schoolMutationKeys.classSubjects.assignTeacher,
    mutationFn: (data: Parameters<typeof assignTeacherToClassSubject>[0]['data']) => assignTeacherToClassSubject({ data }),
  },
  bulkAssignTeacher: {
    mutationKey: schoolMutationKeys.assignments.bulkAssign,
    mutationFn: (data: Parameters<typeof bulkAssignTeacher>[0]['data']) => bulkAssignTeacher({ data }),
  },
  removeTeacher: {
    mutationKey: schoolMutationKeys.assignments.delete,
    mutationFn: (data: Parameters<typeof removeTeacherFromClassSubject>[0]['data']) => removeTeacherFromClassSubject({ data }),
  },
  save: {
    mutationKey: schoolMutationKeys.classSubjects.save,
    mutationFn: (data: Parameters<typeof saveClassSubject>[0]['data']) => saveClassSubject({ data }),
  },
  updateConfig: {
    mutationKey: schoolMutationKeys.classSubjects.updateConfig,
    mutationFn: (data: Parameters<typeof updateClassSubjectConfig>[0]['data']) => updateClassSubjectConfig({ data }),
  },
  remove: {
    mutationKey: schoolMutationKeys.classSubjects.delete,
    mutationFn: (data: Parameters<typeof removeClassSubject>[0]['data']) => removeClassSubject({ data }),
  },
  copy: {
    mutationKey: schoolMutationKeys.classSubjects.copy,
    mutationFn: (data: Parameters<typeof copyClassSubjects>[0]['data']) => copyClassSubjects({ data }),
  },
}
