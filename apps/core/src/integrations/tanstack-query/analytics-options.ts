import { queryOptions } from '@tanstack/react-query'

import {
  analyticsOverviewQuery,
  generateReportMutation,
  platformUsageQuery,
  schoolsPerformanceQuery,
} from '@/core/functions/analytics'

export type AnalyticsRange = '7d' | '30d' | '90d' | '1y'

export const analyticsKeys = {
  all: ['analytics'] as const,
  overviews: () => [...analyticsKeys.all, 'overview'] as const,
  overview: (range: AnalyticsRange) => [...analyticsKeys.overviews(), range] as const,
  schoolsPerf: () => [...analyticsKeys.all, 'schools-performance'] as const,
  schoolPerf: (range: AnalyticsRange) => [...analyticsKeys.schoolsPerf(), range] as const,
  usage: () => [...analyticsKeys.all, 'platform-usage'] as const,
  usageByRange: (range: AnalyticsRange) => [...analyticsKeys.usage(), range] as const,
}

export function analyticsOverviewQueryOptions(timeRange: AnalyticsRange = '30d') {
  return queryOptions({
    queryKey: analyticsKeys.overview(timeRange),
    queryFn: () => analyticsOverviewQuery({ data: { timeRange } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  })
}

export function schoolsPerformanceQueryOptions(timeRange: AnalyticsRange = '30d') {
  return queryOptions({
    queryKey: analyticsKeys.schoolPerf(timeRange),
    queryFn: () => schoolsPerformanceQuery({ data: { timeRange } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  })
}

export function platformUsageQueryOptions(timeRange: AnalyticsRange = '30d') {
  return queryOptions({
    queryKey: analyticsKeys.usageByRange(timeRange),
    queryFn: () => platformUsageQuery({ data: { timeRange } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  })
}

export const analyticsMutationKeys = {
  generateReport: ['analytics', 'generateReport'] as const,
}

export const generateReportMutationOptions = {
  mutationKey: analyticsMutationKeys.generateReport,
  mutationFn: (data: { timeRange: AnalyticsRange }) =>
    generateReportMutation({ data }),
}

export const analyticsQueries = {
  overview: analyticsOverviewQueryOptions,
  schoolsPerformance: schoolsPerformanceQueryOptions,
  platformUsage: platformUsageQueryOptions,
  generateReport: generateReportMutationOptions,
}
