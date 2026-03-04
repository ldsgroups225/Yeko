import type { EnrollmentStatistics } from '@repo/data-ops/queries/enrollments'
import type { MonthlyRevenue } from '@repo/data-ops/queries/finance-stats'
import type { StudentStatistics } from '@repo/data-ops/queries/students'
import { Result as R } from '@praha/byethrow'
import { getClasses } from '@repo/data-ops/queries/classes'
import { getEnrollmentStatistics } from '@repo/data-ops/queries/enrollments'
import { getFinanceStats, getMonthlyRevenue } from '@repo/data-ops/queries/finance-stats'
import { getRecentActivities } from '@repo/data-ops/queries/school-admin/audit'
import { countTeachersBySchool } from '@repo/data-ops/queries/school-admin/teachers'
import * as studentQueries from '@repo/data-ops/queries/students'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

export interface AdminDashboardStats {
  metrics: {
    totalStudents: number
    totalTeachers: number
    activeClasses: number
    revenueThisMonth: number
    pendingPayments: number
    overdueAmount: number
    pendingEnrollments: number
  }
  charts: {
    revenueLast6Months: MonthlyRevenue[]
    enrollmentByGrade: Array<{ gradeName: string, count: number, boys: number, girls: number }>
    genderDistribution: StudentStatistics['byGender']
  }
  recentActivities: Array<{
    id: string
    action: string
    tableName: string
    userName: string | null
    createdAt: Date
    details: any
  }>
}

export const getAdminDashboardStats = authServerFn
  .handler(async ({ context }): Promise<{ success: true, data: AdminDashboardStats } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('dashboard', 'view')

    const { schoolId } = context.school
    const schoolYearId = context.schoolYear?.schoolYearId

    try {
      const [
        studentStatsResult,
        teacherCount,
        classesResult,
        financeResult,
        monthlyRevenueResult,
        enrollmentStatsResult,
        recentActivitiesResult,
      ] = await Promise.all([
        studentQueries.getStudentStatistics(schoolId),
        countTeachersBySchool(schoolId),
        getClasses({ schoolId, status: 'active' }),
        getFinanceStats(schoolId),
        getMonthlyRevenue(schoolId, 6),
        schoolYearId
          ? getEnrollmentStatistics(schoolId, schoolYearId)
          : Promise.resolve(null),
        getRecentActivities(schoolId, 5),
      ])

      const studentStats = R.isFailure(studentStatsResult)
        ? { total: 0, byGender: [] as StudentStatistics['byGender'] }
        : studentStatsResult.value

      const activeClassesResultValue = R.isFailure(classesResult)
        ? []
        : classesResult.value
      const activeClasses = activeClassesResultValue.length

      const finance = R.isFailure(financeResult)
        ? { pendingPayments: 0, overdueAmount: 0 }
        : financeResult.value

      const monthlyRevenue = R.isFailure(monthlyRevenueResult)
        ? [] as MonthlyRevenue[]
        : monthlyRevenueResult.value

      const enrollmentStats = enrollmentStatsResult && R.isSuccess(enrollmentStatsResult)
        ? (enrollmentStatsResult.value as EnrollmentStatistics)
        : null

      const enrollmentByGrade = enrollmentStats
        ? enrollmentStats.byGrade.map((g: any) => ({
            gradeName: g.gradeName,
            count: Number(g.count),
            boys: Number(g.boys),
            girls: Number(g.girls),
          }))
        : []

      const recentActivities = recentActivitiesResult && R.isSuccess(recentActivitiesResult)
        ? recentActivitiesResult.value.map(a => ({
            id: a.id,
            action: a.action,
            tableName: a.tableName,
            userName: a.userName,
            createdAt: a.createdAt,
            details: a.newValues,
          }))
        : []

      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const revenueThisMonth = monthlyRevenue.find(m => m.month === currentMonth)?.revenue ?? 0

      return {
        success: true as const,
        data: {
          metrics: {
            totalStudents: enrollmentStats ? enrollmentStats.confirmed : 0,
            totalTeachers: teacherCount,
            activeClasses,
            revenueThisMonth,
            pendingPayments: finance.pendingPayments,
            overdueAmount: finance.overdueAmount,
            pendingEnrollments: enrollmentStats ? enrollmentStats.pending : 0,
          },
          charts: {
            revenueLast6Months: monthlyRevenue,
            enrollmentByGrade,
            genderDistribution: studentStats.byGender,
          },
          recentActivities,
        },
      }
    }
    catch (e) {
      console.error('======= DASHBOARD ERROR =======', e)
      return { success: false as const, error: String(e) }
    }
  })
