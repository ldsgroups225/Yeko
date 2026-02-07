import { queryOptions } from '@tanstack/react-query'
import {
  createNewFeeType,
  deleteExistingFeeType,
  getAvailableTemplates,
  getFeeType,
  getFeeTypesList,
  importFeeTypesFromTemplates,
  updateExistingFeeType,
} from '@/school/functions/fee-types'
import { schoolMutationKeys } from './keys'

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

// Fee types mutations
export const feeTypesMutations = {
  create: {
    mutationKey: schoolMutationKeys.feeTypes.create,
    mutationFn: (data: Parameters<typeof createNewFeeType>[0]['data']) => createNewFeeType({ data }),
  },
  update: {
    mutationKey: schoolMutationKeys.feeTypes.update,
    mutationFn: (data: Parameters<typeof updateExistingFeeType>[0]['data']) => updateExistingFeeType({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.feeTypes.delete,
    mutationFn: (id: string) => deleteExistingFeeType({ data: id }),
  },
  import: {
    mutationKey: schoolMutationKeys.feeTypes.create,
    mutationFn: (data: Parameters<typeof importFeeTypesFromTemplates>[0]['data']) => importFeeTypesFromTemplates({ data }),
  },
}
