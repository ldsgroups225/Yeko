import { infiniteQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  cancelExistingPayment,
  getCashierSummary,
  getPayment,
  getPaymentByReceipt,
  getPaymentsList,
  getPaymentsListKeyset,
  recordPayment,
} from '@/school/functions/payments'
import { schoolMutationKeys } from './keys'

export const paymentsKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentsKeys.all, 'list'] as const,
  list: (filters: PaymentFilters) => [...paymentsKeys.lists(), filters] as const,
  details: () => [...paymentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentsKeys.details(), id] as const,
  byReceipt: (receiptNumber: string) => [...paymentsKeys.all, 'receipt', receiptNumber] as const,
  cashierSummary: (date: string, cashierId?: string) => [...paymentsKeys.all, 'cashierSummary', date, cashierId] as const,
}

export interface PaymentFilters {
  studentId?: string
  paymentPlanId?: string
  method?: 'cash' | 'bank_transfer' | 'mobile_money' | 'card' | 'check' | 'other'
  status?: 'pending' | 'completed' | 'cancelled' | 'refunded' | 'partial_refund'
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface PaymentKeysetCursor {
  paymentDate: string
  createdAt: Date
  id: string
}

export interface PaymentKeysetFilters extends Omit<PaymentFilters, 'page'> {
  cursor?: PaymentKeysetCursor
}

export const paymentsOptions = {
  list: (filters: PaymentFilters = {}) =>
    queryOptions({
      queryKey: paymentsKeys.list(filters),
      queryFn: async () => {
        const res = await getPaymentsList({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      placeholderData: keepPreviousData,
    }),

  listKeyset: (filters: PaymentKeysetFilters = {}) =>
    queryOptions({
      queryKey: [...paymentsKeys.lists(), 'keyset', filters] as const,
      queryFn: async () => {
        const res = await getPaymentsListKeyset({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      placeholderData: keepPreviousData,
    }),

  infiniteKeyset: (filters: Omit<PaymentKeysetFilters, 'cursor'> = {}) =>
    infiniteQueryOptions({
      queryKey: [...paymentsKeys.lists(), 'infinite-keyset', filters] as const,
      initialPageParam: undefined as PaymentKeysetCursor | undefined,
      queryFn: async ({ pageParam }) => {
        const res = await getPaymentsListKeyset({
          data: {
            ...filters,
            cursor: pageParam,
          },
        })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: paymentsKeys.detail(id),
      queryFn: async () => {
        const res = await getPayment({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!id,
    }),

  byReceipt: (receiptNumber: string) =>
    queryOptions({
      queryKey: paymentsKeys.byReceipt(receiptNumber),
      queryFn: async () => {
        const res = await getPaymentByReceipt({ data: receiptNumber })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!receiptNumber,
    }),

  cashierSummary: (date: string, cashierId?: string) =>
    queryOptions({
      queryKey: paymentsKeys.cashierSummary(date, cashierId),
      queryFn: async () => {
        const res = await getCashierSummary({ data: { date, cashierId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 1 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: !!date,
    }),
}

// Payment mutations
export const paymentsMutations = {
  create: {
    mutationKey: schoolMutationKeys.payments.create,
    mutationFn: async (data: Parameters<typeof recordPayment>[0]['data']) => {
      const response = await recordPayment({ data })
      if (!response.success)
        throw new Error(response.error)
      return response.data
    },
  },
  cancel: {
    mutationKey: schoolMutationKeys.payments.void, // Using 'void' key for cancellation as defined in keys.ts
    mutationFn: (data: Parameters<typeof cancelExistingPayment>[0]['data']) => cancelExistingPayment({ data }),
  },
}
