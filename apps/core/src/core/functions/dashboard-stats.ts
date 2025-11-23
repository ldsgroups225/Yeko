import { DashboardStatsSchema, getDashboardStats, getRecentActivity, getSystemHealth, RecentActivitySchema } from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { exampleMiddlewareWithContext } from '@/core/middleware/example-middleware'

// Fetch dashboard statistics
export const dashboardStats = createServerFn()
  .middleware([
    exampleMiddlewareWithContext,
  ])
  .inputValidator(data => DashboardStatsSchema.parse(data))
  .handler(async (ctx) => {
    const { daysBack } = ctx.data
    const stats = await getDashboardStats(daysBack)
    return {
      ...stats,
      recentSchools: stats.recentSchools.map(s => ({
        ...s,
        settings: (s.settings as Record<string, any>) || {},
      })),
    }
  })

// Fetch system health status
export const systemHealth = createServerFn()
  .middleware([
    exampleMiddlewareWithContext,
  ])
  .handler(async () => {
    return await getSystemHealth()
  })

// Fetch recent activity
export const recentActivity = createServerFn()
  .middleware([
    exampleMiddlewareWithContext,
  ])
  .inputValidator(data => RecentActivitySchema.parse(data))
  .handler(async (ctx) => {
    const { limit } = ctx.data
    return await getRecentActivity(limit)
  })
