import { queryOptions } from '@tanstack/react-query'
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
      queryFn: () => getPaymentsList({ data: filters }),
      staleTime: 2 * 60 * 1000, // 2 minutes - payments change frequently
      gcTime: 10 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: paymentsKeys.detail(id),
      queryFn: () => getPayment({ data: id }),
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!id,
    }),

  byReceipt: (receiptNumber: string) =>
    queryOptions({
      queryKey: paymentsKeys.byReceipt(receiptNumber),
      queryFn: () => getPaymentByReceipt({ data: receiptNumber }),
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!receiptNumber,
    }),

  cashierSummary: (date: string, cashierId?: string) =>
    queryOptions({
      queryKey: paymentsKeys.cashierSummary(date, cashierId),
      queryFn: () => getCashierSummary({ data: { date, cashierId } }),
      staleTime: 1 * 60 * 1000, // 1 minute - cashier summary needs to be fresh
      gcTime: 5 * 60 * 1000,
      enabled: !!date,
    }),
}
