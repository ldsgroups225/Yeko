import { queryOptions } from '@tanstack/react-query'
import {
  getClassroomById,
  getClassrooms,
} from '@/school/functions/classrooms'

export const classroomsKeys = {
  all: ['classrooms'] as const,
  lists: () => [...classroomsKeys.all, 'list'] as const,
  list: (filters: ClassroomFilters) => [...classroomsKeys.lists(), filters] as const,
  details: () => [...classroomsKeys.all, 'detail'] as const,
  detail: (id: string) => [...classroomsKeys.details(), id] as const,
}

export interface ClassroomFilters {
  type?: 'regular' | 'lab' | 'gym' | 'library' | 'auditorium'
  status?: 'active' | 'inactive' | 'maintenance'
  search?: string
}

export const classroomsOptions = {
  list: (filters: ClassroomFilters = {}) =>
    queryOptions({
      queryKey: classroomsKeys.list(filters),
      queryFn: async () => {
        const res = await getClassrooms({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: classroomsKeys.detail(id),
      queryFn: async () => {
        const res = await getClassroomById({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),
}
