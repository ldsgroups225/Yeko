import { and, count, desc, eq, gte, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, schools, series } from '../drizzle/core-schema'
import { classes, enrollments, schoolYears, students } from '../drizzle/school-schema'
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

  // Get real user activity data and growth in parallel
  const [
    activeUsers,
    currentPeriodUsers,
    previousPeriodUsers,
    totalActiveUsers,
    avgResponseTime,
  ] = await Promise.all([
    getDailyActiveUsers(startDate),
    getUserActivityCount(startDate, now),
    getUserActivityCount(previousStartDate, startDate),
    getMonthlyActiveUsers(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)),
    getAverageResponseTime(startDate),
  ])

  // Calculate growth percentage
  const schoolsGrowth = previousPeriodSchools > 0
    ? Math.round(((currentPeriodSchools - previousPeriodSchools) / previousPeriodSchools) * 100)
    : 0

  // Calculate user growth
  const userGrowth = previousPeriodUsers > 0
    ? Math.round(((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100)
    : 0

  // Calculate engagement rate (DAU / Total users who have ever been active)
  const engagementRate = totalActiveUsers > 0
    ? Math.round((activeUsers / totalActiveUsers) * 100)
    : 0

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

  // Get schools by status in parallel
  const [
    [activeResult],
    [inactiveResult],
    [suspendedResult],
  ] = await Promise.all([
    db.select({ count: count() }).from(schools).where(eq(schools.status, 'active')),
    db.select({ count: count() }).from(schools).where(eq(schools.status, 'inactive')),
    db.select({ count: count() }).from(schools).where(eq(schools.status, 'suspended')),
  ])

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

  // Get real enrollment trends from students table
  const enrollmentTrends = await getEnrollmentTrends(timeRange)

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

  // Get real user activity data, feature usage, API stats, and peak times in parallel
  const [
    dau,
    wau,
    mau,
    featureUsage,
    apiEndpoints,
    peakUsageTimes,
  ] = await Promise.all([
    getDailyActiveUsers(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
    getWeeklyActiveUsers(weekStartDate),
    getMonthlyActiveUsers(monthStartDate),
    getFeatureUsage(startDate),
    getApiEndpointUsage(startDate),
    getPeakUsageTimes(startDate),
  ])

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

export interface EnrollmentTrend {
  date: string
  count: number
}

export interface EnrollmentStats {
  total: number
  active: number
  inactive: number
  graduated: number
  transferred: number
  withdrawn: number
  byGrade: Array<{ grade: string, count: number }>
  bySeries: Array<{ series: string, count: number }>
  trends: EnrollmentTrend[]
  dropoutRate: number
}

/**
 * Get enrollment trends over time
 */
export async function getEnrollmentTrends(
  timeRange: '7d' | '30d' | '90d' | '1y',
  schoolId?: string,
): Promise<EnrollmentTrend[]> {
  const db = getDb()

  // Calculate date range
  const now = new Date()
  const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const days = daysMap[timeRange]
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  // Build conditions
  const conditions = [gte(students.createdAt, startDate)]
  if (schoolId) {
    conditions.push(eq(students.schoolId, schoolId))
  }

  // Query daily enrollment counts
  const trendsResults = await db
    .select({
      date: sql<string>`DATE(${students.createdAt})`,
      count: count(),
    })
    .from(students)
    .where(and(...conditions))
    .groupBy(sql`DATE(${students.createdAt})`)
    .orderBy(sql`DATE(${students.createdAt})`)

  return trendsResults.map((r: { date: string, count: number }) => ({
    date: r.date,
    count: r.count,
  }))
}

/**
 * Get comprehensive enrollment statistics
 */
export async function getEnrollmentStats(
  schoolId?: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d',
): Promise<EnrollmentStats> {
  const db = getDb()

  // Build base conditions
  const baseConditions = schoolId ? [eq(students.schoolId, schoolId)] : []

  // Total enrollments
  const [totalResult] = await db
    .select({ count: count() })
    .from(students)
    .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)

  // Active students
  const [activeResult] = await db
    .select({ count: count() })
    .from(students)
    .where(and(eq(students.status, 'active'), ...baseConditions))

  // Graduated students
  const [graduatedResult] = await db
    .select({ count: count() })
    .from(students)
    .where(and(eq(students.status, 'graduated'), ...baseConditions))

  // Transferred students
  const [transferredResult] = await db
    .select({ count: count() })
    .from(students)
    .where(and(eq(students.status, 'transferred'), ...baseConditions))

  // Withdrawn students
  const [withdrawnResult] = await db
    .select({ count: count() })
    .from(students)
    .where(and(eq(students.status, 'withdrawn'), ...baseConditions))

  // Calculate inactive (graduated + transferred + withdrawn)
  const inactive = (graduatedResult?.count || 0) + (transferredResult?.count || 0) + (withdrawnResult?.count || 0)

  // Get enrollment trends
  const trends = await getEnrollmentTrends(timeRange, schoolId)

  // Calculate dropout rate (withdrawn / total)
  const total = totalResult?.count || 0
  const withdrawn = withdrawnResult?.count || 0
  const dropoutRate = total > 0 ? Math.round((withdrawn / total) * 100) : 0

  // Note: byGrade and bySeries require joining with enrollments table

  // Implementation of byGrade logic
  const byGradeResults = await db
    .select({
      grade: grades.name,
      count: count(students.id),
    })
    .from(students)
    .innerJoin(enrollments, eq(students.id, enrollments.studentId))
    .innerJoin(schoolYears, eq(enrollments.schoolYearId, schoolYears.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .where(and(
      eq(students.status, 'active'),
      eq(enrollments.status, 'confirmed'),
      eq(schoolYears.isActive, true),
      ...(schoolId ? [eq(students.schoolId, schoolId)] : [])
    ))
    .groupBy(grades.name)

  const byGrade = byGradeResults.map(r => ({ grade: r.grade, count: Number(r.count) }))

  // Implementation of bySeries logic
  const bySeriesResults = await db
    .select({
      series: series.name,
      count: count(students.id),
    })
    .from(students)
    .innerJoin(enrollments, eq(students.id, enrollments.studentId))
    .innerJoin(schoolYears, eq(enrollments.schoolYearId, schoolYears.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(series, eq(classes.seriesId, series.id))
    .where(and(
      eq(students.status, 'active'),
      eq(enrollments.status, 'confirmed'),
      eq(schoolYears.isActive, true),
      ...(schoolId ? [eq(students.schoolId, schoolId)] : [])
    ))
    .groupBy(series.name)

  const bySeries = bySeriesResults.map(r => ({ series: r.series, count: Number(r.count) }))

  return {
    total,
    active: activeResult?.count || 0,
    inactive,
    graduated: graduatedResult?.count || 0,
    transferred: transferredResult?.count || 0,
    withdrawn,
    byGrade,
    bySeries,
    trends,
    dropoutRate,
  }
}

/**
 * Get enrollment growth comparison between periods
 */
export interface EnrollmentGrowth {
  current: number
  previous: number
  growth: number
  growthPercentage: number
}

export async function getEnrollmentGrowth(
  schoolId?: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d',
): Promise<EnrollmentGrowth> {
  const db = getDb()

  // Calculate date ranges
  const now = new Date()
  const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const days = daysMap[timeRange]
  const currentStartDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const previousStartDate = new Date(currentStartDate.getTime() - days * 24 * 60 * 60 * 1000)

  // Build conditions
  const baseConditions = schoolId ? [eq(students.schoolId, schoolId)] : []

  // Current period enrollments
  const [currentResult] = await db
    .select({ count: count() })
    .from(students)
    .where(and(gte(students.createdAt, currentStartDate), ...baseConditions))

  // Previous period enrollments
  const [previousResult] = await db
    .select({ count: count() })
    .from(students)
    .where(
      and(
        gte(students.createdAt, previousStartDate),
        sql`${students.createdAt} < ${currentStartDate}`,
        ...baseConditions,
      ),
    )

  const current = currentResult?.count || 0
  const previous = previousResult?.count || 0
  const growth = current - previous
  const growthPercentage = previous > 0 ? Math.round((growth / previous) * 100) : (current > 0 ? 100 : 0)

  return {
    current,
    previous,
    growth,
    growthPercentage,
  }
}

/**
 * Get enrollment patterns (monthly distribution)
 */
export interface EnrollmentPattern {
  peakMonth: string
  peakCount: number
  averagePerMonth: number
  monthlyDistribution: Array<{ month: string, count: number }>
}

export async function getEnrollmentPatterns(
  schoolId?: string,
  years: number = 1,
): Promise<EnrollmentPattern> {
  const db = getDb()

  // Calculate date range
  const now = new Date()
  const startDate = new Date(now.getTime() - years * 365 * 24 * 60 * 60 * 1000)

  // Build conditions
  const conditions = [gte(students.createdAt, startDate)]
  if (schoolId) {
    conditions.push(eq(students.schoolId, schoolId))
  }

  // Query monthly enrollment counts
  const monthlyResults = await db
    .select({
      month: sql<string>`TO_CHAR(${students.createdAt}, 'YYYY-MM')`,
      count: count(),
    })
    .from(students)
    .where(and(...conditions))
    .groupBy(sql`TO_CHAR(${students.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${students.createdAt}, 'YYYY-MM')`)

  const monthlyDistribution = monthlyResults.map((r: { month: string, count: number }) => ({
    month: r.month,
    count: r.count,
  }))

  // Find peak month
  let peakMonth = ''
  let peakCount = 0
  let totalCount = 0

  for (const item of monthlyDistribution) {
    totalCount += item.count
    if (item.count > peakCount) {
      peakCount = item.count
      peakMonth = item.month
    }
  }

  const averagePerMonth = monthlyDistribution.length > 0
    ? Math.round(totalCount / monthlyDistribution.length)
    : 0

  return {
    peakMonth,
    peakCount,
    averagePerMonth,
    monthlyDistribution,
  }
}
