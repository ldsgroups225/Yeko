import { queryOptions } from '@tanstack/react-query'
import {
  getAutoApplyDiscountsList,
  getDiscount,
  getDiscountsList,
} from '@/school/functions/discounts'

export const discountsKeys = {
  all: ['discounts'] as const,
  lists: () => [...discountsKeys.all, 'list'] as const,
  list: (filters: DiscountFilters) => [...discountsKeys.lists(), filters] as const,
  autoApply: () => [...discountsKeys.all, 'autoApply'] as const,
  details: () => [...discountsKeys.all, 'detail'] as const,
  detail: (id: string) => [...discountsKeys.details(), id] as const,
}

export interface DiscountFilters {
  type?: 'sibling' | 'scholarship' | 'staff' | 'early_payment' | 'financial_aid' | 'other'
  includeInactive?: boolean
}

export const discountsOptions = {
  list: (filters: DiscountFilters = {}) =>
    queryOptions({
      queryKey: discountsKeys.list(filters),
      queryFn: async () => {
        const res = await getDiscountsList({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  autoApply: () =>
    queryOptions({
      queryKey: discountsKeys.autoApply(),
      queryFn: async () => {
        const res = await getAutoApplyDiscountsList()
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: discountsKeys.detail(id),
      queryFn: async () => {
        const res = await getDiscount({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),
}
