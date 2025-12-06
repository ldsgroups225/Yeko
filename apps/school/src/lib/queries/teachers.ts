import { queryOptions } from '@tanstack/react-query'
import { getTeachers } from '@/school/functions/teachers'

export const teacherKeys = {
  all: ['teachers'] as const,
  lists: () => [...teacherKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...teacherKeys.lists(), filters] as const,
}

export const teacherOptions = {
  list: (filters: { search?: string, subjectId?: string } = {}, pagination = { page: 1, limit: 20 }) =>
    queryOptions({
      queryKey: teacherKeys.list({ ...filters, ...pagination }),
      queryFn: () => getTeachers({ data: { filters, pagination } }),
    }),
}
