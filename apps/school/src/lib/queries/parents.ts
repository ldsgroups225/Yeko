import { queryOptions } from '@tanstack/react-query'
import {
  autoMatchParents,
  getParentById,
  getParents,
} from '@/school/functions/parents'

export const parentsKeys = {
  all: ['parents'] as const,
  lists: () => [...parentsKeys.all, 'list'] as const,
  list: (filters: ParentFilters) => [...parentsKeys.lists(), filters] as const,
  details: () => [...parentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...parentsKeys.details(), id] as const,
  autoMatch: () => [...parentsKeys.all, 'auto-match'] as const,
}

export interface ParentFilters {
  search?: string
  invitationStatus?: string
  page?: number
  limit?: number
}

export const parentsOptions = {
  list: (filters: ParentFilters = {}) =>
    queryOptions({
      queryKey: parentsKeys.list(filters),
      queryFn: async () => {
        const res = await getParents({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: parentsKeys.detail(id),
      queryFn: async () => {
        const res = await getParentById({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  autoMatch: () =>
    queryOptions({
      queryKey: parentsKeys.autoMatch(),
      queryFn: async () => {
        const res = await autoMatchParents()
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 0, // Always fresh
      gcTime: 5 * 60 * 1000,
      enabled: false, // Manual trigger only
    }),
}
