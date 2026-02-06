import { queryOptions } from '@tanstack/react-query'
import { getTeacher, getTeacherClassesList, getTeachers, getTeacherSchedulesList } from '@/school/functions/teachers'

export const teacherKeys = {
  all: ['teachers'] as const,
  lists: () => [...teacherKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...teacherKeys.lists(), filters] as const,
  details: () => [...teacherKeys.all, 'detail'] as const,
  detail: (id: string) => [...teacherKeys.details(), id] as const,
  classes: (id: string) => [...teacherKeys.all, 'classes', id] as const,
  schedules: (id: string, schoolYearId: string) => [...teacherKeys.all, 'schedules', id, schoolYearId] as const,
}

export const teacherOptions = {
  list: (filters: { search?: string, subjectId?: string } = {}, pagination = { page: 1, limit: 20 }) =>
    queryOptions({
      queryKey: teacherKeys.list({ ...filters, ...pagination }),
      queryFn: async () => {
        const res = await getTeachers({ data: { filters, pagination } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: teacherKeys.detail(id),
      queryFn: async () => {
        const res = await getTeacher({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      enabled: !!id,
    }),

  classes: (id: string) =>
    queryOptions({
      queryKey: teacherKeys.classes(id),
      queryFn: async () => {
        const res = await getTeacherClassesList({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      enabled: !!id,
    }),

  schedules: (id: string, schoolYearId: string) =>
    queryOptions({
      queryKey: teacherKeys.schedules(id, schoolYearId),
      queryFn: async () => {
        const res = await getTeacherSchedulesList({ data: { teacherId: id, schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      enabled: !!id && !!schoolYearId,
    }),
}
