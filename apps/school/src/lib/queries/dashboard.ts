import { queryOptions } from '@tanstack/react-query'
import { getAdminDashboardStats } from '@/school/functions/dashboard'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  admin: () => [...dashboardKeys.all, 'admin'] as const,
}

export const dashboardOptions = {
  admin: () =>
    queryOptions({
      queryKey: dashboardKeys.admin(),
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
