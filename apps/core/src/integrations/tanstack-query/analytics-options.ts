import {
  analyticsOverviewQuery,
  generateReportMutation,
  platformUsageQuery,
  schoolsPerformanceQuery,
} from '@/core/functions/analytics'

export function analyticsOverviewQueryOptions(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
  return {
    queryKey: ['analytics', 'overview', timeRange],
    queryFn: () => analyticsOverviewQuery({ data: { timeRange } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  }
}

export function schoolsPerformanceQueryOptions(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
  return {
    queryKey: ['analytics', 'schools-performance', timeRange],
    queryFn: () => schoolsPerformanceQuery({ data: { timeRange } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  }
}

export function platformUsageQueryOptions(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
  return {
    queryKey: ['analytics', 'platform-usage', timeRange],
    queryFn: () => platformUsageQuery({ data: { timeRange } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  }
}

export const generateReportMutationOptions = {
  mutationFn: (data: { timeRange: '7d' | '30d' | '90d' | '1y' }) =>
    generateReportMutation({ data }),
}

export const analyticsQueries = {
  overview: analyticsOverviewQueryOptions,
  schoolsPerformance: schoolsPerformanceQueryOptions,
  platformUsage: platformUsageQueryOptions,
  generateReport: generateReportMutationOptions,
}
