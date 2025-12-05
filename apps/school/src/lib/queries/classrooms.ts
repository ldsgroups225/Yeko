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
  type?: string
  status?: string
  search?: string
}

export const classroomsOptions = {
  list: (filters: ClassroomFilters = {}) =>
    queryOptions({
      queryKey: classroomsKeys.list(filters),
      queryFn: () => getClassrooms({ data: filters }),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: classroomsKeys.detail(id),
      queryFn: () => getClassroomById({ data: id }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),
}
