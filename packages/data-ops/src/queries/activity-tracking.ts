import type { ActivityLogInsert, ApiMetricInsert } from '@/drizzle/core-schema'
import { and, count, desc, eq, gte, sql } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { activityLogs, apiMetrics } from '@/drizzle/core-schema'

// ===== ACTIVITY LOGGING =====

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Log a user activity
 */
export async function logActivity(data: Omit<ActivityLogInsert, 'id' | 'createdAt'>) {
  const db = getDb()

  const id = generateUUID()

  await db.insert(activityLogs).values({
    id,
    ...data,
  })

  return id
}

/**
 * Log an API request metric
 */
export async function logApiMetric(data: Omit<ApiMetricInsert, 'id' | 'createdAt'>) {
  const db = getDb()

  const id = generateUUID()

  await db.insert(apiMetrics).values({
    id,
    ...data,
  })

  return id
}

// ===== ACTIVITY QUERIES =====

/**
 * Get daily active users count
 */
export async function getDailyActiveUsers(startDate: Date): Promise<number> {
  const db = getDb()

  const [result] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${activityLogs.userId})` })
    .from(activityLogs)
    .where(
      and(
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.userId} IS NOT NULL`,
      ),
    )

  return result?.count || 0
}

/**
 * Get weekly active users count
 */
export async function getWeeklyActiveUsers(startDate: Date): Promise<number> {
  const db = getDb()

  const [result] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${activityLogs.userId})` })
    .from(activityLogs)
    .where(
      and(
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.userId} IS NOT NULL`,
      ),
    )

  return result?.count || 0
}

/**
 * Get monthly active users count
 */
export async function getMonthlyActiveUsers(startDate: Date): Promise<number> {
  const db = getDb()

  const [result] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${activityLogs.userId})` })
    .from(activityLogs)
    .where(
      and(
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.userId} IS NOT NULL`,
      ),
    )

  return result?.count || 0
}

/**
 * Get feature usage statistics
 */
export interface FeatureUsage {
  name: string
  usage: number
}

export async function getFeatureUsage(startDate: Date): Promise<FeatureUsage[]> {
  const db = getDb()

  const results = await db
    .select({
      resource: activityLogs.resource,
      count: count(),
    })
    .from(activityLogs)
    .where(
      and(
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.resource} IS NOT NULL`,
      ),
    )
    .groupBy(activityLogs.resource)
    .orderBy(desc(count()))
    .limit(10)

  // Calculate total for percentage
  const total = results.reduce((sum, r) => sum + r.count, 0)

  // Map resource names to friendly names
  const resourceNameMap: Record<string, string> = {
    school: 'Gestion des écoles',
    catalog: 'Catalogues',
    program: 'Programmes',
    coefficient: 'Coefficients',
    analytics: 'Analytiques',
    grade: 'Notes',
    student: 'Élèves',
    teacher: 'Enseignants',
    class: 'Classes',
    subject: 'Matières',
  }

  return results.map(r => ({
    name: resourceNameMap[r.resource || ''] || r.resource || 'Autre',
    usage: total > 0 ? Math.round((r.count / total) * 100) : 0,
  }))
}

/**
 * Get API endpoint usage statistics
 */
export interface ApiEndpointUsage {
  endpoint: string
  requests: number
  avgResponseTime: number
}

export async function getApiEndpointUsage(startDate: Date): Promise<ApiEndpointUsage[]> {
  const db = getDb()

  const results = await db
    .select({
      endpoint: apiMetrics.endpoint,
      requests: count(),
      avgResponseTime: sql<number>`ROUND(AVG(${apiMetrics.responseTimeMs}))`,
    })
    .from(apiMetrics)
    .where(gte(apiMetrics.createdAt, startDate))
    .groupBy(apiMetrics.endpoint)
    .orderBy(desc(count()))
    .limit(10)

  return results.map(r => ({
    endpoint: r.endpoint,
    requests: r.requests,
    avgResponseTime: r.avgResponseTime || 0,
  }))
}

/**
 * Get peak usage times (24-hour breakdown)
 */
export interface PeakUsageTime {
  hour: number
  requests: number
}

export async function getPeakUsageTimes(startDate: Date): Promise<PeakUsageTime[]> {
  const db = getDb()

  const results = await db
    .select({
      hour: sql<number>`EXTRACT(HOUR FROM ${activityLogs.createdAt})`,
      requests: count(),
    })
    .from(activityLogs)
    .where(gte(activityLogs.createdAt, startDate))
    .groupBy(sql`EXTRACT(HOUR FROM ${activityLogs.createdAt})`)
    .orderBy(sql`EXTRACT(HOUR FROM ${activityLogs.createdAt})`)

  // Fill in missing hours with 0
  const hourMap = new Map(results.map(r => [r.hour, r.requests]))

  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    requests: hourMap.get(hour) || 0,
  }))
}

/**
 * Get school engagement score
 */
export async function getSchoolEngagementScore(schoolId: string, startDate: Date): Promise<number> {
  const db = getDb()

  // Count unique active users for this school
  const [activeUsers] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${activityLogs.userId})` })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.schoolId, schoolId),
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.userId} IS NOT NULL`,
      ),
    )

  // For now, return a simple metric based on activity count
  // In production, this would factor in total users, activity frequency, etc.
  const activityCount = activeUsers?.count || 0

  // Simple engagement score: cap at 100
  return Math.min(Math.round(activityCount * 10), 100)
}

/**
 * Get average API response time
 */
export async function getAverageResponseTime(startDate: Date): Promise<number> {
  const db = getDb()

  const [result] = await db
    .select({
      avg: sql<number>`ROUND(AVG(${apiMetrics.responseTimeMs}))`,
    })
    .from(apiMetrics)
    .where(gte(apiMetrics.createdAt, startDate))

  return result?.avg || 0
}

/**
 * Get user activity count for growth calculation
 */
export async function getUserActivityCount(startDate: Date, endDate: Date): Promise<number> {
  const db = getDb()

  const [result] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${activityLogs.userId})` })
    .from(activityLogs)
    .where(
      and(
        gte(activityLogs.createdAt, startDate),
        sql`${activityLogs.createdAt} < ${endDate}`,
        sql`${activityLogs.userId} IS NOT NULL`,
      ),
    )

  return result?.count || 0
}
