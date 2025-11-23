import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect } from 'vitest'
import { getDb } from '../database/setup'
import { activityLogs, apiMetrics, schools } from '../drizzle/core-schema'
import {
  getApiEndpointUsage,
  getAverageResponseTime,
  getDailyActiveUsers,
  getFeatureUsage,
  getMonthlyActiveUsers,
  getPeakUsageTimes,
  getSchoolEngagementScore,
  getWeeklyActiveUsers,
  logActivity,
  logApiMetric,
} from '../queries/activity-tracking'
import {
  getAnalyticsOverview,
  getPlatformUsage,
  getSchoolsPerformance,
} from '../queries/analytics'

describe('activity Tracking', () => {
  const db = getDb()
  const testUserId = 'test-user-123'
  const testSchoolId = 'test-school-123'

  beforeAll(async () => {
    // Create test school
    await db.insert(schools).values({
      id: testSchoolId,
      name: 'Test School',
      code: 'TEST001',
      status: 'active',
    })
  })

  afterAll(async () => {
    // Cleanup
    await db.delete(activityLogs)
    await db.delete(apiMetrics)
    await db.delete(schools).where(eq(schools.id, testSchoolId))
  })

  test('should log user activity', async () => {
    const id = await logActivity({
      userId: testUserId,
      schoolId: testSchoolId,
      action: 'view',
      resource: 'school',
      resourceId: testSchoolId,
      metadata: { test: true },
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    })

    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
  })

  test('should log API metrics', async () => {
    const id = await logApiMetric({
      endpoint: '/api/schools',
      method: 'GET',
      statusCode: 200,
      responseTimeMs: 45,
      userId: testUserId,
      schoolId: testSchoolId,
      errorMessage: null,
    })

    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
  })

  test('should get daily active users', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const count = await getDailyActiveUsers(yesterday)

    expect(count).toBeGreaterThanOrEqual(0)
    expect(typeof count).toBe('number')
  })

  test('should get weekly active users', async () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const count = await getWeeklyActiveUsers(lastWeek)

    expect(count).toBeGreaterThanOrEqual(0)
    expect(typeof count).toBe('number')
  })

  test('should get monthly active users', async () => {
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const count = await getMonthlyActiveUsers(lastMonth)

    expect(count).toBeGreaterThanOrEqual(0)
    expect(typeof count).toBe('number')
  })

  test('should get feature usage statistics', async () => {
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const usage = await getFeatureUsage(lastMonth)

    expect(Array.isArray(usage)).toBe(true)
    usage.forEach((item) => {
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('usage')
      expect(typeof item.usage).toBe('number')
    })
  })

  test('should get API endpoint usage', async () => {
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const usage = await getApiEndpointUsage(lastMonth)

    expect(Array.isArray(usage)).toBe(true)
    usage.forEach((item) => {
      expect(item).toHaveProperty('endpoint')
      expect(item).toHaveProperty('requests')
      expect(item).toHaveProperty('avgResponseTime')
    })
  })

  test('should get peak usage times', async () => {
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const times = await getPeakUsageTimes(lastMonth)

    expect(Array.isArray(times)).toBe(true)
    expect(times).toHaveLength(24) // 24 hours
    times.forEach((item) => {
      expect(item).toHaveProperty('hour')
      expect(item).toHaveProperty('requests')
      expect(item.hour).toBeGreaterThanOrEqual(0)
      expect(item.hour).toBeLessThan(24)
    })
  })

  test('should get school engagement score', async () => {
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const score = await getSchoolEngagementScore(testSchoolId, lastMonth)

    expect(typeof score).toBe('number')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  test('should get average response time', async () => {
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const avgTime = await getAverageResponseTime(lastMonth)

    expect(typeof avgTime).toBe('number')
    expect(avgTime).toBeGreaterThanOrEqual(0)
  })
})

describe('analytics Queries', () => {
  test('should get analytics overview for 30 days', async () => {
    const result = await getAnalyticsOverview('30d')

    expect(result).toHaveProperty('totalSchools')
    expect(result).toHaveProperty('schoolsGrowth')
    expect(result).toHaveProperty('activeUsers')
    expect(result).toHaveProperty('userGrowth')
    expect(result).toHaveProperty('engagementRate')
    expect(result).toHaveProperty('avgResponseTime')

    expect(typeof result.totalSchools).toBe('number')
    expect(typeof result.schoolsGrowth).toBe('number')
    expect(typeof result.activeUsers).toBe('number')
    expect(typeof result.userGrowth).toBe('number')
    expect(typeof result.engagementRate).toBe('number')
    expect(typeof result.avgResponseTime).toBe('number')
  })

  test('should get schools performance', async () => {
    const result = await getSchoolsPerformance('30d')

    expect(result).toHaveProperty('byStatus')
    expect(result).toHaveProperty('topSchools')
    expect(result).toHaveProperty('enrollmentTrends')

    expect(result.byStatus).toHaveProperty('active')
    expect(result.byStatus).toHaveProperty('inactive')
    expect(result.byStatus).toHaveProperty('suspended')

    expect(Array.isArray(result.topSchools)).toBe(true)
    expect(Array.isArray(result.enrollmentTrends)).toBe(true)
  })

  test('should get platform usage', async () => {
    const result = await getPlatformUsage('30d')

    expect(result).toHaveProperty('dau')
    expect(result).toHaveProperty('wau')
    expect(result).toHaveProperty('mau')
    expect(result).toHaveProperty('featureUsage')
    expect(result).toHaveProperty('apiEndpoints')
    expect(result).toHaveProperty('peakUsageTimes')

    expect(typeof result.dau).toBe('number')
    expect(typeof result.wau).toBe('number')
    expect(typeof result.mau).toBe('number')
    expect(Array.isArray(result.featureUsage)).toBe(true)
    expect(Array.isArray(result.apiEndpoints)).toBe(true)
    expect(Array.isArray(result.peakUsageTimes)).toBe(true)
  })

  test('should handle different time ranges', async () => {
    const timeRanges: Array<'7d' | '30d' | '90d' | '1y'> = ['7d', '30d', '90d', '1y']

    for (const timeRange of timeRanges) {
      const result = await getAnalyticsOverview(timeRange)
      expect(result).toBeDefined()
      expect(result.totalSchools).toBeGreaterThanOrEqual(0)
    }
  })

  test('should calculate growth correctly', async () => {
    const result = await getAnalyticsOverview('30d')

    // Growth can be positive, negative, or zero
    expect(typeof result.schoolsGrowth).toBe('number')
    expect(Number.isFinite(result.schoolsGrowth)).toBe(true)
  })
})

describe('analytics Edge Cases', () => {
  test('should handle empty database gracefully', async () => {
    // This test assumes a fresh database or after cleanup
    const result = await getAnalyticsOverview('7d')

    expect(result.totalSchools).toBeGreaterThanOrEqual(0)
    expect(result.activeUsers).toBeGreaterThanOrEqual(0)
  })

  test('should handle future dates gracefully', async () => {
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    const count = await getDailyActiveUsers(futureDate)

    expect(count).toBe(0)
  })

  test('should return consistent data structure', async () => {
    const result1 = await getAnalyticsOverview('30d')
    const result2 = await getAnalyticsOverview('30d')

    expect(Object.keys(result1).sort()).toStrictEqual(Object.keys(result2).sort())
  })
})
