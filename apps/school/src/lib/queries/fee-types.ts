import { queryOptions } from '@tanstack/react-query'
import {
  getFeeType,
  getFeeTypesList,
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
      queryFn: () => getFeeTypesList({ data: filters }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: feeTypesKeys.detail(id),
      queryFn: () => getFeeType({ data: id }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),
}
