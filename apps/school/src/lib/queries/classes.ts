import { queryOptions } from '@tanstack/react-query'
import {
  getClassById,
  getClasses,
} from '@/school/functions/classes'

export const classesKeys = {
  all: ['classes'] as const,
  lists: () => [...classesKeys.all, 'list'] as const,
  list: (filters: ClassFilters) => [...classesKeys.lists(), filters] as const,
  details: () => [...classesKeys.all, 'detail'] as const,
  detail: (id: string) => [...classesKeys.details(), id] as const,
}

export interface ClassFilters {
  schoolYearId?: string
  gradeId?: string
  seriesId?: string
  status?: 'active' | 'archived'
  search?: string
}

export const classesOptions = {
  list: (filters: ClassFilters = {}) =>
    queryOptions({
      queryKey: classesKeys.list(filters),
      queryFn: async () => {
        const res = await getClasses({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: classesKeys.detail(id),
      queryFn: async () => {
        const res = await getClassById({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),
}
