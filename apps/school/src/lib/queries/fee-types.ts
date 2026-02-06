import { queryOptions } from '@tanstack/react-query'
import {
  getAvailableTemplates,
  getFeeType,
  getFeeTypesList,
  importFeeTypesFromTemplates,
} from '@/school/functions/fee-types'

export const feeTypesKeys = {
  all: ['feeTypes'] as const,
  lists: () => [...feeTypesKeys.all, 'list'] as const,
  list: (filters: FeeTypeFilters) => [...feeTypesKeys.lists(), filters] as const,
  details: () => [...feeTypesKeys.all, 'detail'] as const,
  detail: (id: string) => [...feeTypesKeys.details(), id] as const,
}

export interface FeeTypeFilters {
  category?: 'tuition' | 'registration' | 'exam' | 'transport' | 'uniform' | 'books' | 'meals' | 'activities' | 'other'
  includeInactive?: boolean
}

export const feeTypesOptions = {
  list: (filters: FeeTypeFilters = {}) =>
    queryOptions({
      queryKey: feeTypesKeys.list(filters),
      queryFn: async () => {
        const res = await getFeeTypesList({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: feeTypesKeys.detail(id),
      queryFn: async () => {
        const res = await getFeeType({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  templates: () =>
    queryOptions({
      queryKey: ['feeTypeTemplates'],
      queryFn: async () => {
        const res = await getAvailableTemplates({})
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
}

export const importFromTemplates = {
  mutation: async (templateIds: string[]) => {
    const res = await importFeeTypesFromTemplates({ data: { templateIds } })
    if (!res.success)
      throw new Error(res.error)
    return res.data
  },
}
