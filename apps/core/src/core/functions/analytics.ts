import {
  generateReportData,
  getAnalyticsOverview,
  getPlatformUsage,
  getSchoolsPerformance,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { exampleMiddlewareWithContext } from '@/core/middleware/example-middleware'
import { AnalyticsTimeRangeSchema } from '@/schemas/analytics'

// ===== ANALYTICS QUERIES =====

export const analyticsOverviewQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    return await getAnalyticsOverview(ctx.data.timeRange)
  })

export const schoolsPerformanceQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    return await getSchoolsPerformance(ctx.data.timeRange)
  })

export const platformUsageQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    return await getPlatformUsage(ctx.data.timeRange)
  })

export const generateReportMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    return await generateReportData(ctx.data.timeRange)
  })
