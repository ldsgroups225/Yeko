import { queryOptions } from '@tanstack/react-query'
import { getPaymentPlanTemplates } from '@/school/functions/payment-plan-templates'

export const paymentPlanTemplatesKeys = {
  all: ['payment-plan-templates'] as const,
  lists: () => [...paymentPlanTemplatesKeys.all, 'list'] as const,
  byYear: (yearId: string) => [...paymentPlanTemplatesKeys.lists(), yearId] as const,
}

export function paymentPlanTemplatesOptions(schoolYearId: string) {
  return queryOptions({
    queryKey: paymentPlanTemplatesKeys.byYear(schoolYearId),
    queryFn: async () => {
      const result = await getPaymentPlanTemplates({ data: { schoolYearId } })
      if (result.success)
        return result.data
      throw new Error(result.error)
    },
    staleTime: 60 * 60 * 1000,
  })
}
