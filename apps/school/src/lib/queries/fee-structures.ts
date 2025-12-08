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
      queryFn: () => getFeeStructuresList({ data: filters }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  withDetails: (filters: FeeStructureFilters = {}) =>
    queryOptions({
      queryKey: feeStructuresKeys.withDetails(filters),
      queryFn: () => getFeeStructuresWithDetails({ data: filters }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: feeStructuresKeys.detail(id),
      queryFn: () => getFeeStructure({ data: id }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),
}
