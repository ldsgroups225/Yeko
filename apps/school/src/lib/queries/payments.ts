import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  getCashierSummary,
  getPayment,
  getPaymentByReceipt,
  getPaymentsList,
} from '@/school/functions/payments'

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
