import { databaseMiddleware } from '@/core/middleware/database'
import { createServerFn } from '@tanstack/react-start'
import { DashboardStatsSchema, RecentActivitySchema } from '@/schemas/dashboard'
// Helper to load queries dynamically
const loadDataOps = () => import('@repo/data-ops')

// Fetch dashboard statistics
export const dashboardStats = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => DashboardStatsSchema.parse(data))
  .handler(async (ctx) => {
    const { daysBack } = ctx.data
    const { getDashboardStats } = await loadDataOps()
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
    const { getSystemHealth } = await loadDataOps()
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
    const { getRecentActivity } = await loadDataOps()
    return await getRecentActivity(limit)
  })
