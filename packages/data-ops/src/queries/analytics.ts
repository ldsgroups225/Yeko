import { and, count, desc, eq, gte, sql } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { schools } from '@/drizzle/core-schema'
import {
  getApiEndpointUsage,
  getAverageResponseTime,
  getDailyActiveUsers,
  getFeatureUsage,
  getMonthlyActiveUsers,
  getPeakUsageTimes,
  getSchoolEngagementScore,
  getUserActivityCount,
  getWeeklyActiveUsers,
} from './activity-tracking'

// ===== ANALYTICS OVERVIEW =====

export interface AnalyticsOverview {
  totalSchools: number
  schoolsGrowth: number
  activeUsers: number
  userGrowth: number
  engagementRate: number
  avgResponseTime: number
}

export async function getAnalyticsOverview(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<AnalyticsOverview> {
  const db = getDb()

  // Calculate date range
  const now = new Date()
  const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const days = daysMap[timeRange]
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)

  // Get total schools
  const [totalSchoolsResult] = await db
    .select({ count: count() })
    .from(schools)
  const totalSchools = totalSchoolsResult?.count || 0

  // Get schools in current period
  const [currentPeriodResult] = await db
    .select({ count: count() })
    .from(schools)
    .where(gte(schools.createdAt, startDate))
  const currentPeriodSchools = currentPeriodResult?.count || 0

  // Get schools in previous period
  const [previousPeriodResult] = await db
    .select({ count: count() })
    .from(schools)
    .where(
      and(
        gte(schools.createdAt, previousStartDate),
        sql`${schools.createdAt} < ${startDate}`,
      ),
    )
  const previousPeriodSchools = previousPeriodResult?.count || 0

  // Calculate growth percentage
  const schoolsGrowth = previousPeriodSchools > 0
    ? Math.round(((currentPeriodSchools - previousPeriodSchools) / previousPeriodSchools) * 100)
    : 0

  // Get real user activity data
  const activeUsers = await getDailyActiveUsers(startDate)

  // Calculate user growth
  const currentPeriodUsers = await getUserActivityCount(startDate, now)
  const previousPeriodUsers = await getUserActivityCount(previousStartDate, startDate)
  const userGrowth = previousPeriodUsers > 0
    ? Math.round(((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100)
    : 0

  // Calculate engagement rate (DAU / Total users who have ever been active)
  const totalActiveUsers = await getMonthlyActiveUsers(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000))
  const engagementRate = totalActiveUsers > 0
    ? Math.round((activeUsers / totalActiveUsers) * 100)
    : 0

  // Get real average response time
  const avgResponseTime = await getAverageResponseTime(startDate)

  return {
    totalSchools,
    schoolsGrowth,
    activeUsers,
    userGrowth,
    engagementRate,
    avgResponseTime,
  }
}

// ===== SCHOOLS PERFORMANCE =====

export interface SchoolsPerformance {
  byStatus: {
    active: number
    inactive: number
    suspended: number
  }
  topSchools: Array<{
    id: string
    name: string
    code: string
    status: string
    engagementScore: number
  }>
  enrollmentTrends: Array<{
    date: string
    count: number
  }>
}

export async function getSchoolsPerformance(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<SchoolsPerformance> {
  const db = getDb()

  // Get schools by status
  const [activeResult] = await db
    .select({ count: count() })
    .from(schools)
    .where(eq(schools.status, 'active'))

  const [inactiveResult] = await db
    .select({ count: count() })
    .from(schools)
    .where(eq(schools.status, 'inactive'))

  const [suspendedResult] = await db
    .select({ count: count() })
    .from(schools)
    .where(eq(schools.status, 'suspended'))

  // Get top schools with real engagement scores
  const topSchoolsData = await db
    .select({
      id: schools.id,
      name: schools.name,
      code: schools.code,
      status: schools.status,
    })
    .from(schools)
    .where(eq(schools.status, 'active'))
    .orderBy(desc(schools.createdAt))
    .limit(10) // Get more to calculate engagement

  // Calculate date range for engagement
  const engagementNow = new Date()
  const engagementDaysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const engagementDays = engagementDaysMap[timeRange]
  const engagementStartDate = new Date(engagementNow.getTime() - engagementDays * 24 * 60 * 60 * 1000)

  // Calculate engagement scores for each school
  const topSchoolsWithEngagement = await Promise.all(
    topSchoolsData.map(async (school: { id: string, name: string, code: string, status: string }) => {
      const engagementScore = await getSchoolEngagementScore(school.id, engagementStartDate)
      return {
        ...school,
        engagementScore,
      }
    }),
  )

  // Sort by engagement score and take top 5
  const topSchools = topSchoolsWithEngagement
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5)

  // Mock enrollment trends (TODO: Implement actual enrollment tracking)
  const enrollmentDaysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const enrollmentDays = enrollmentDaysMap[timeRange]
  const enrollmentTrends = Array.from({ length: Math.min(enrollmentDays, 30) }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (enrollmentDays - i))
    return {
      date: date.toISOString().split('T')[0]!,
      count: Math.floor(Math.random() * 10) + 1,
    }
  })

  return {
    byStatus: {
      active: activeResult?.count || 0,
      inactive: inactiveResult?.count || 0,
      suspended: suspendedResult?.count || 0,
    },
    topSchools,
    enrollmentTrends,
  }
}

// ===== PLATFORM USAGE =====

export interface PlatformUsage {
  dau: number // Daily Active Users
  wau: number // Weekly Active Users
  mau: number // Monthly Active Users
  featureUsage: Array<{
    name: string
    usage: number
  }>
  apiEndpoints: Array<{
    endpoint: string
    requests: number
    avgResponseTime: number
  }>
  peakUsageTimes: Array<{
    hour: number
    requests: number
  }>
}

export async function getPlatformUsage(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<PlatformUsage> {
  // Calculate date ranges
  const now = new Date()
  const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const days = daysMap[timeRange]
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const weekStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get real user activity data
  const dau = await getDailyActiveUsers(new Date(now.getTime() - 24 * 60 * 60 * 1000))
  const wau = await getWeeklyActiveUsers(weekStartDate)
  const mau = await getMonthlyActiveUsers(monthStartDate)

  // Get real feature usage
  const featureUsage = await getFeatureUsage(startDate)

  // Get real API endpoint usage
  const apiEndpoints = await getApiEndpointUsage(startDate)

  // Get real peak usage times
  const peakUsageTimes = await getPeakUsageTimes(startDate)

  return {
    dau,
    wau,
    mau,
    featureUsage,
    apiEndpoints,
    peakUsageTimes,
  }
}

// ===== REPORT GENERATION =====

export interface ReportData {
  generatedAt: string
  timeRange: string
  overview: AnalyticsOverview
  schoolsPerformance: SchoolsPerformance
  platformUsage: PlatformUsage
}

export async function generateReportData(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<ReportData> {
  const [overview, schoolsPerformance, platformUsage] = await Promise.all([
    getAnalyticsOverview(timeRange),
    getSchoolsPerformance(timeRange),
    getPlatformUsage(timeRange),
  ])

  return {
    generatedAt: new Date().toISOString(),
    timeRange,
    overview,
    schoolsPerformance,
    platformUsage,
  }
}
