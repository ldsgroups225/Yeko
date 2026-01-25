import type { ActivityItem, DashboardStats, SystemHealth } from '@repo/data-ops/schemas/dashboard'
import { getDb } from '../database/setup'
import { auth_user } from '../drizzle/auth-schema'
import { activityLogs, schools } from '../drizzle/core-schema'
import { and, count, desc, eq, gte, sql } from 'drizzle-orm'

// Fetch dashboard statistics
export async function getDashboardStats(daysBack: number = 30): Promise<DashboardStats> {
  const db = getDb()

  // Get total schools
  const [totalSchoolsResult] = await db
    .select({ count: count() })
    .from(schools)
  const totalSchools = totalSchoolsResult?.count || 0

  // Get active schools
  const [activeSchoolsResult] = await db
    .select({ count: count() })
    .from(schools)
    .where(eq(schools.status, 'active'))
  const activeSchools = activeSchoolsResult?.count || 0

  // Get recent registrations (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysBack)

  const [recentRegistrationsResult] = await db
    .select({ count: count() })
    .from(schools)
    .where(gte(schools.createdAt, thirtyDaysAgo))
  const recentRegistrations = recentRegistrationsResult?.count || 0

  // Get inactive schools
  const [inactiveSchoolsResult] = await db
    .select({ count: count() })
    .from(schools)
    .where(eq(schools.status, 'inactive'))
  const inactiveSchools = inactiveSchoolsResult?.count || 0

  // Get recent schools list
  const recentSchools = await db
    .select()
    .from(schools)
    .orderBy(desc(schools.createdAt))
    .limit(5)

  return {
    totalSchools,
    activeSchools,
    recentRegistrations,
    inactiveSchools,
    recentSchools,
  }
}

// Fetch system health status
export async function getSystemHealth(): Promise<SystemHealth> {
  const db = getDb()
  const startTime = performance.now()
  let dbStatus: 'healthy' | 'unhealthy' = 'healthy'
  let responseTime = 0

  try {
    // Test database connection
    await db.execute(sql`SELECT 1`)
    responseTime = Math.round(performance.now() - startTime)
  }
  catch (error) {
    console.error('Database health check failed:', error)
    dbStatus = 'unhealthy'
  }

  // Mock other services for now
  return {
    database: {
      status: dbStatus,
      latency: `${responseTime} ms`,
    },
    api: {
      status: 'healthy',
      uptime: '99.9%',
    },
    storage: {
      status: 'healthy',
      usage: '45%',
    },
  }
}

// Action to French description mapping
const actionDescriptionMap: Record<string, string> = {
  view: 'a consulté',
  create: 'a créé',
  update: 'a modifié',
  delete: 'a supprimé',
  export: 'a exporté',
  login: 's\'est connecté',
}

// Resource to French name mapping
const resourceNameMap: Record<string, string> = {
  school: 'une école',
  student: 'un élève',
  teacher: 'un enseignant',
  grade: 'une note',
  coefficient: 'un coefficient',
  program: 'un programme',
  analytics: 'les analytiques',
  dashboard: 'le tableau de bord',
  catalog: 'un catalogue',
  class: 'une classe',
  subject: 'une matière',
  series: 'une série',
  track: 'une filière',
}

function formatActivityDescription(
  action: string,
  resource: string | null,
): string {
  const actionText = actionDescriptionMap[action] || action
  const resourceText = resource ? resourceNameMap[resource] || resource : 'une ressource'
  return `${actionText} ${resourceText}`
}

// Fetch recent activity from activity_logs table
export async function getRecentActivity(
  limit: number = 10,
  startDate?: Date,
): Promise<ActivityItem[]> {
  const db = getDb()

  // Build where clause
  const conditions = []
  if (startDate) {
    conditions.push(gte(activityLogs.createdAt, startDate))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Query activities with user info
  const activities = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      resource: activityLogs.resource,
      resourceId: activityLogs.resourceId,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
      userName: auth_user.name,
      userEmail: auth_user.email,
    })
    .from(activityLogs)
    .leftJoin(auth_user, eq(activityLogs.userId, auth_user.id))
    .where(whereClause)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)

  // If no activities found, return empty array (no mock data)
  if (activities.length === 0) {
    return []
  }

  // Format activities for display
  return activities.map(activity => ({
    id: activity.id,
    type: activity.action,
    description: formatActivityDescription(
      activity.action,
      activity.resource,
    ),
    timestamp: activity.createdAt.toISOString(),
    user: activity.userName || activity.userEmail || 'Utilisateur inconnu',
    resource: activity.resource || undefined,
    resourceId: activity.resourceId || undefined,
  }))
}

// Activity statistics interface
export interface ActivityStats {
  totalActivities: number
  byAction: Record<string, number>
  byResource: Record<string, number>
  trend: Array<{ date: string, count: number }>
}

// Get activity statistics for a date range
export async function getActivityStats(
  startDate: Date,
  endDate: Date = new Date(),
): Promise<ActivityStats> {
  const db = getDb()

  // Total activities
  const [totalResult] = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(
      and(
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.createdAt} <= ${endDate}`,
      ),
    )

  // Group by action
  const byActionResults = await db
    .select({
      action: activityLogs.action,
      count: count(),
    })
    .from(activityLogs)
    .where(
      and(
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.createdAt} <= ${endDate}`,
      ),
    )
    .groupBy(activityLogs.action)

  const byAction: Record<string, number> = {}
  byActionResults.forEach((result) => {
    if (result.action) {
      byAction[result.action] = result.count
    }
  })

  // Group by resource
  const byResourceResults = await db
    .select({
      resource: activityLogs.resource,
      count: count(),
    })
    .from(activityLogs)
    .where(
      and(
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.createdAt} <= ${endDate}`,
      ),
    )
    .groupBy(activityLogs.resource)

  const byResource: Record<string, number> = {}
  byResourceResults.forEach((result) => {
    if (result.resource) {
      byResource[result.resource] = result.count
    }
  })

  // Daily trend
  const trendResults = await db
    .select({
      date: sql<string>`DATE(${activityLogs.createdAt})`,
      count: count(),
    })
    .from(activityLogs)
    .where(
      and(
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.createdAt} <= ${endDate}`,
      ),
    )
    .groupBy(sql`DATE(${activityLogs.createdAt})`)
    .orderBy(sql`DATE(${activityLogs.createdAt})`)

  const trend = trendResults.map(result => ({
    date: result.date,
    count: result.count,
  }))

  return {
    totalActivities: totalResult?.count || 0,
    byAction,
    byResource,
    trend,
  }
}

// Get user activity summary
export async function getUserActivitySummary(
  userId: string,
  days: number = 30,
): Promise<{
  totalActions: number
  lastActive: Date | null
  topActions: Array<{ action: string, count: number }>
}> {
  const db = getDb()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Total actions
  const [totalResult] = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.userId, userId),
        gte(activityLogs.createdAt, startDate),
      ),
    )

  // Last active
  const [lastActiveResult] = await db
    .select({ createdAt: activityLogs.createdAt })
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(1)

  // Top actions
  const topActionsResults = await db
    .select({
      action: activityLogs.action,
      count: count(),
    })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.userId, userId),
        gte(activityLogs.createdAt, startDate),
      ),
    )
    .groupBy(activityLogs.action)
    .orderBy(desc(count()))
    .limit(5)

  return {
    totalActions: totalResult?.count || 0,
    lastActive: lastActiveResult?.createdAt || null,
    topActions: topActionsResults.map(r => ({
      action: r.action,
      count: r.count,
    })),
  }
}
