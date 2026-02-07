import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  approveExistingRefund,
  cancelExistingRefund,
  getPendingRefunds,
  getRefund,
  getRefundsList,
  processExistingRefund,
  rejectExistingRefund,
  requestRefund,
} from '@/school/functions/refunds'
import { schoolMutationKeys } from './keys'

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
      queryFn: async () => {
        const res = await getRefundsList({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      placeholderData: keepPreviousData,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: refundsKeys.detail(id),
      queryFn: async () => {
        const res = await getRefund({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!id,
    }),

  pendingCount: () =>
    queryOptions({
      queryKey: refundsKeys.pendingCount(),
      queryFn: async () => {
        const res = await getPendingRefunds()
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 1 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    }),
}

// Refunds mutations
export const refundsMutations = {
  create: {
    mutationKey: schoolMutationKeys.refunds.create,
    mutationFn: (data: Parameters<typeof requestRefund>[0]['data']) => requestRefund({ data }),
  },
  approve: {
    mutationKey: schoolMutationKeys.refunds.approve,
    mutationFn: (data: Parameters<typeof approveExistingRefund>[0]['data']) => approveExistingRefund({ data }),
  },
  reject: {
    mutationKey: schoolMutationKeys.refunds.reject,
    mutationFn: (data: Parameters<typeof rejectExistingRefund>[0]['data']) => rejectExistingRefund({ data }),
  },
  process: {
    mutationKey: schoolMutationKeys.refunds.process,
    mutationFn: (data: Parameters<typeof processExistingRefund>[0]['data']) => processExistingRefund({ data }),
  },
  cancel: {
    mutationKey: schoolMutationKeys.refunds.cancel,
    mutationFn: (data: Parameters<typeof cancelExistingRefund>[0]['data']) => cancelExistingRefund({ data }),
  },
}
