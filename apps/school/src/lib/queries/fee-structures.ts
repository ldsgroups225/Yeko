import { queryOptions } from '@tanstack/react-query'
import {
  getFeeStructure,
  getFeeStructuresList,
  getFeeStructuresWithDetails,
} from '@/school/functions/fee-structures'

export const feeStructuresKeys = {
  all: ['feeStructures'] as const,
  lists: () => [...feeStructuresKeys.all, 'list'] as const,
  list: (filters: FeeStructureFilters) => [...feeStructuresKeys.lists(), filters] as const,
  withDetails: (filters: FeeStructureFilters) => [...feeStructuresKeys.lists(), 'withDetails', filters] as const,
  details: () => [...feeStructuresKeys.all, 'detail'] as const,
  detail: (id: string) => [...feeStructuresKeys.details(), id] as const,
}

export interface FeeStructureFilters {
  schoolYearId?: string
  gradeId?: string
  seriesId?: string
  feeTypeId?: string
}

export const feeStructuresOptions = {
  list: (filters: FeeStructureFilters = {}) =>
    queryOptions({
      queryKey: feeStructuresKeys.list(filters),
      queryFn: async () => {
        const res = await getFeeStructuresList({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  withDetails: (filters: FeeStructureFilters = {}) =>
    queryOptions({
      queryKey: feeStructuresKeys.withDetails(filters),
      queryFn: async () => {
        const res = await getFeeStructuresWithDetails({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: feeStructuresKeys.detail(id),
      queryFn: async () => {
        const res = await getFeeStructure({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),
}
