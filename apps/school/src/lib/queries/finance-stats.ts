import { queryOptions } from '@tanstack/react-query'
import { getFinanceDashboardStats } from '@/school/functions/payments'

export const financeStatsKeys = {
  all: ['finance-stats'] as const,
  summary: () => [...financeStatsKeys.all, 'summary'] as const,
}

export const financeStatsOptions = {
  summary: () =>
    queryOptions({
      queryKey: financeStatsKeys.summary(),
      queryFn: async () => {
        const res = await getFinanceDashboardStats()
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,
    }),
}
