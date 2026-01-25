import { createServerFn } from '@tanstack/react-start'
import { databaseMiddleware } from '@/core/middleware/database'
import { AnalyticsTimeRangeSchema } from '@/schemas/analytics'

// ===== ANALYTICS QUERIES =====

export const analyticsOverviewQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    const { getAnalyticsOverview } = await import('@repo/data-ops/queries/analytics')
    return await getAnalyticsOverview(ctx.data.timeRange)
  })

export const schoolsPerformanceQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    const { getSchoolsPerformance } = await import('@repo/data-ops/queries/analytics')
    return await getSchoolsPerformance(ctx.data.timeRange)
  })

export const platformUsageQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    const { getPlatformUsage } = await import('@repo/data-ops/queries/analytics')
    return await getPlatformUsage(ctx.data.timeRange)
  })

export const generateReportMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    const { generateReportData } = await import('@repo/data-ops/queries/analytics')
    return await generateReportData(ctx.data.timeRange)
  })
