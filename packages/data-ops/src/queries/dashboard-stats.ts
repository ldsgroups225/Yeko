import type { ActivityItem, DashboardStats, SystemHealth } from '@/schemas/dashboard'
import { count, desc, eq, gte, sql } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { schools } from '@/drizzle/core-schema'

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

// Fetch recent activity
export async function getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
  // NOTE: Activity logging table not yet implemented
  // TODO (Future Phase): Implement actual activity queries
  const mockActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'school_created',
      description: 'Nouvelle école créée: Lycée Saint-Exupéry',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      user: 'Admin User',
    },
    {
      id: '2',
      type: 'user_login',
      description: 'Connexion utilisateur: Jean Dupont',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      user: 'Jean Dupont',
    },
    {
      id: '3',
      type: 'settings_updated',
      description: 'Mise à jour des paramètres système',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      user: 'Super Admin',
    },
    {
      id: '4',
      type: 'school_updated',
      description: 'Mise à jour école: Collège Jean-Moulin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      user: 'Admin User',
    },
    {
      id: '5',
      type: 'report_generated',
      description: 'Génération rapport mensuel',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      user: 'System',
    },
  ]

  return mockActivity.slice(0, limit)
}
