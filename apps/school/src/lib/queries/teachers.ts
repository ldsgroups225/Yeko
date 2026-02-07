import { queryOptions } from '@tanstack/react-query'
import {
  assignSubjects,
  createNewTeacher,
  deleteExistingTeacher,
  getTeacher,
  getTeacherClassesList,
  getTeachers,
  getTeacherSchedulesList,
  linkTeacherByEmailFn,
  updateExistingTeacher,
} from '@/school/functions/teachers'
import { schoolMutationKeys } from './keys'

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
      staleTime: 5 * 60 * 1000,
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
      staleTime: 5 * 60 * 1000,
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
      staleTime: 5 * 60 * 1000,
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
      staleTime: 5 * 60 * 1000,
    }),
}

// Teachers mutations
export const teacherMutations = {
  assignSubjects: {
    mutationKey: schoolMutationKeys.teachers.assign,
    mutationFn: (data: Parameters<typeof assignSubjects>[0]['data']) => assignSubjects({ data }),
  },
  create: {
    mutationKey: schoolMutationKeys.teachers.create,
    mutationFn: (data: Parameters<typeof createNewTeacher>[0]['data']) => createNewTeacher({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.teachers.delete,
    mutationFn: (id: string) => deleteExistingTeacher({ data: id }),
  },
  linkByEmail: {
    mutationKey: schoolMutationKeys.teachers.link,
    mutationFn: (data: Parameters<typeof linkTeacherByEmailFn>[0]['data']) => linkTeacherByEmailFn({ data }),
  },
  update: {
    mutationKey: schoolMutationKeys.teachers.update,
    mutationFn: (data: Parameters<typeof updateExistingTeacher>[0]['data']) => updateExistingTeacher({ data }),
  },
}
