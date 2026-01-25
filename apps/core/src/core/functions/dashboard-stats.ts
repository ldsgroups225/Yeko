import { createServerFn } from '@tanstack/react-start'
import { databaseMiddleware } from '@/core/middleware/database'
import { DashboardStatsSchema, RecentActivitySchema } from '@/schemas/dashboard'

// Fetch dashboard statistics
export const dashboardStats = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => DashboardStatsSchema.parse(data))
  .handler(async (ctx) => {
    const { daysBack } = ctx.data
    const { getDashboardStats } = await import('@repo/data-ops/queries/dashboard-stats')
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
    databaseMiddleware,
  ])
  .handler(async () => {
    const { getSystemHealth } = await import('@repo/data-ops/queries/dashboard-stats')
    return await getSystemHealth()
  })

// Fetch recent activity
export const recentActivity = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => RecentActivitySchema.parse(data))
  .handler(async (ctx) => {
    const { limit } = ctx.data
    const { getRecentActivity } = await import('@repo/data-ops/queries/dashboard-stats')
    return await getRecentActivity(limit)
  })
