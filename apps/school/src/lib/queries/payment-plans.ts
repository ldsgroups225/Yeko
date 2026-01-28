import { queryOptions } from '@tanstack/react-query'
import {
  getDefaultTemplate,
  getPaymentPlansList,
  getPaymentPlansSummaryData,
  getPaymentPlanTemplate,
  getPaymentPlanTemplatesList,
  getPaymentPlanWithInstallments,
  getStudentPaymentPlan,
} from '@/school/functions/payment-plans'

export const paymentPlansKeys = {
  all: ['paymentPlans'] as const,
  lists: () => [...paymentPlansKeys.all, 'list'] as const,
  list: (filters: PaymentPlanFilters) => [...paymentPlansKeys.lists(), filters] as const,
  details: () => [...paymentPlansKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentPlansKeys.details(), id] as const,
  withInstallments: (id: string) => [...paymentPlansKeys.details(), id, 'installments'] as const,
  student: (studentId: string, schoolYearId?: string) => [...paymentPlansKeys.all, 'student', studentId, schoolYearId] as const,
  summary: (schoolYearId?: string) => [...paymentPlansKeys.all, 'summary', schoolYearId] as const,
  templates: () => [...paymentPlansKeys.all, 'templates'] as const,
  templateList: (filters: TemplateFilters) => [...paymentPlansKeys.templates(), filters] as const,
  templateDetail: (id: string) => [...paymentPlansKeys.templates(), id] as const,
  defaultTemplate: (schoolYearId?: string) => [...paymentPlansKeys.templates(), 'default', schoolYearId] as const,
}

export interface PaymentPlanFilters {
  schoolYearId?: string
  studentId?: string
  status?: 'active' | 'completed' | 'defaulted' | 'cancelled'
}

export interface TemplateFilters {
  schoolYearId?: string
  includeInactive?: boolean
}

export const paymentPlansOptions = {
  list: (filters: PaymentPlanFilters = {}) =>
    queryOptions({
      queryKey: paymentPlansKeys.list(filters),
      queryFn: async () => {
        const res = await getPaymentPlansList({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: paymentPlansKeys.withInstallments(id),
      queryFn: async () => {
        const res = await getPaymentPlanWithInstallments({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!id,
    }),

  student: (studentId: string, schoolYearId?: string) =>
    queryOptions({
      queryKey: paymentPlansKeys.student(studentId, schoolYearId),
      queryFn: async () => {
        const res = await getStudentPaymentPlan({ data: { studentId, schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!studentId,
    }),

  summary: (schoolYearId?: string) =>
    queryOptions({
      queryKey: paymentPlansKeys.summary(schoolYearId),
      queryFn: async () => {
        const res = await getPaymentPlansSummaryData({ data: { schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  templateList: (filters: TemplateFilters = {}) =>
    queryOptions({
      queryKey: paymentPlansKeys.templateList(filters),
      queryFn: async () => {
        const res = await getPaymentPlanTemplatesList({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  templateDetail: (id: string) =>
    queryOptions({
      queryKey: paymentPlansKeys.templateDetail(id),
      queryFn: async () => {
        const res = await getPaymentPlanTemplate({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  defaultTemplate: (schoolYearId?: string) =>
    queryOptions({
      queryKey: paymentPlansKeys.defaultTemplate(schoolYearId),
      queryFn: async () => {
        const res = await getDefaultTemplate({ data: { schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
}
