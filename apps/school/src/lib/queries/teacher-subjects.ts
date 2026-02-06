import { queryOptions } from '@tanstack/react-query'
import { getAvailableSubjectsForTeacher, getTeacherAssignments } from '@/school/functions/teacher-subjects'

export const teacherSubjectsKeys = {
  all: ['teacher-subjects'] as const,
  lists: () => [...teacherSubjectsKeys.all, 'list'] as const,
  list: (teacherId: string) => [...teacherSubjectsKeys.lists(), teacherId] as const,
  available: (teacherId: string, schoolYearId: string) => [...teacherSubjectsKeys.all, 'available', teacherId, schoolYearId] as const,
}

export const teacherSubjectsOptions = {
  list: (teacherId: string) =>
    queryOptions({
      queryKey: teacherSubjectsKeys.list(teacherId),
      queryFn: async () => {
      const res = await getTeacherAssignments({ data: { teacherId } })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
    }),

  available: (teacherId: string, schoolYearId?: string) =>
    queryOptions({
      queryKey: teacherSubjectsKeys.available(teacherId, schoolYearId || ''),
      queryFn: async () => {
        if (!schoolYearId)
          return []
        const res = await getAvailableSubjectsForTeacher({ data: { teacherId, schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      enabled: !!schoolYearId,
    }),
}
