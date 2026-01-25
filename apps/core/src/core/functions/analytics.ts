import { databaseMiddleware } from '@/core/middleware/database'
import { createServerFn } from '@tanstack/react-start'

// Helper to load queries dynamically
const loadDataOps = () => import('@repo/data-ops')
import { AnalyticsTimeRangeSchema } from '@/schemas/analytics'

// ===== ANALYTICS QUERIES =====

export const analyticsOverviewQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    const { getAnalyticsOverview } = await loadDataOps()
    return await getAnalyticsOverview(ctx.data.timeRange)
  })

export const schoolsPerformanceQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    const { getSchoolsPerformance } = await loadDataOps()
    return await getSchoolsPerformance(ctx.data.timeRange)
  })

export const platformUsageQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    const { getPlatformUsage } = await loadDataOps()
    return await getPlatformUsage(ctx.data.timeRange)
  })

export const generateReportMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => AnalyticsTimeRangeSchema.parse(data))
  .handler(async (ctx) => {
    const { generateReportData } = await loadDataOps()
    return await generateReportData(ctx.data.timeRange)
  })
