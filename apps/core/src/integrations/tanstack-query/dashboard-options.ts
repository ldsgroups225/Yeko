import { queryOptions } from '@tanstack/react-query'
import { dashboardStats, recentActivity, systemHealth } from '@/core/functions/dashboard-stats'

export function dashboardStatsQueryOptions(daysBack: number = 30) {
  return queryOptions({
    queryKey: ['dashboard', 'stats', daysBack],
    queryFn: () => dashboardStats({ data: { daysBack } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function systemHealthQueryOptions() {
  return queryOptions({
    queryKey: ['dashboard', 'health'],
    queryFn: () => systemHealth(),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchInterval: 10000, // 10 seconds
  })
}

export function recentActivityQueryOptions(limit: number = 10, daysBack: number = 7) {
  return queryOptions({
    queryKey: ['dashboard', 'activity', limit, daysBack],
    queryFn: () => recentActivity({ data: { limit, daysBack } }),
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  })
}

export const dashboardQueries = {
  stats: dashboardStatsQueryOptions,
  health: systemHealthQueryOptions,
  activity: recentActivityQueryOptions,
}
