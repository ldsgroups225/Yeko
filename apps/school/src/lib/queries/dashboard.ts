import { queryOptions } from '@tanstack/react-query'
import { getAdminDashboardStats } from '@/school/functions/dashboard'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  admin: (schoolYearId?: string) => [...dashboardKeys.all, 'admin', { schoolYearId }] as const,
}

export const dashboardOptions = {
  admin: (schoolYearId?: string) =>
    queryOptions({
      queryKey: dashboardKeys.admin(schoolYearId),
      queryFn: async () => {
        const res = await getAdminDashboardStats()
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    }),
}
