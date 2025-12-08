import { queryOptions } from '@tanstack/react-query'
import {
  getPendingRefunds,
  getRefund,
  getRefundsList,
} from '@/school/functions/refunds'

export const refundsKeys = {
  all: ['refunds'] as const,
  lists: () => [...refundsKeys.all, 'list'] as const,
  list: (filters: RefundFilters) => [...refundsKeys.lists(), filters] as const,
  details: () => [...refundsKeys.all, 'detail'] as const,
  detail: (id: string) => [...refundsKeys.details(), id] as const,
  pendingCount: () => [...refundsKeys.all, 'pendingCount'] as const,
}

export interface RefundFilters {
  paymentId?: string
  status?: 'pending' | 'approved' | 'rejected' | 'processed' | 'cancelled'
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export const refundsOptions = {
  list: (filters: RefundFilters = {}) =>
    queryOptions({
      queryKey: refundsKeys.list(filters),
      queryFn: () => getRefundsList({ data: filters }),
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: refundsKeys.detail(id),
      queryFn: () => getRefund({ data: id }),
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!id,
    }),

  pendingCount: () =>
    queryOptions({
      queryKey: refundsKeys.pendingCount(),
      queryFn: () => getPendingRefunds(),
      staleTime: 1 * 60 * 1000, // 1 minute - pending count should be fresh
      gcTime: 5 * 60 * 1000,
    }),
}
