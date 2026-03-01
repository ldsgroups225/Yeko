import type { MonthlyRevenue } from '@repo/data-ops/queries/finance-stats'
import type { StudentStatistics } from '@repo/data-ops/queries/students'
import { Result as R } from '@praha/byethrow'
import { getClasses } from '@repo/data-ops/queries/classes'
import { getEnrollmentStatistics } from '@repo/data-ops/queries/enrollments'
import { getFinanceStats, getMonthlyRevenue } from '@repo/data-ops/queries/finance-stats'
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
      ] = await Promise.all([
        studentQueries.getStudentStatistics(schoolId),
        countTeachersBySchool(schoolId),
        getClasses({ schoolId, status: 'active' }),
        getFinanceStats(schoolId),
        getMonthlyRevenue(schoolId, 6),
        schoolYearId
          ? getEnrollmentStatistics(schoolId, schoolYearId)
          : null,
      ])

      const studentStats = R.isFailure(studentStatsResult)
        ? { total: 0, byGender: [], byStatus: [], byAge: [], newAdmissions: 0 }
        : studentStatsResult.value

      const activeClasses = R.isFailure(classesResult)
        ? 0
        : classesResult.value.length

      const finance = R.isFailure(financeResult)
        ? { totalRevenue: 0, totalPayments: 0, pendingPayments: 0, overdueAmount: 0 }
        : financeResult.value

      const monthlyRevenue = R.isFailure(monthlyRevenueResult)
        ? []
        : monthlyRevenueResult.value

      const enrollmentByGrade = enrollmentStatsResult
        ? R.isFailure(enrollmentStatsResult)
          ? []
          : enrollmentStatsResult.value.byGrade.map(g => ({
              gradeName: g.gradeName,
              count: Number(g.count),
              boys: Number(g.boys),
              girls: Number(g.girls),
            }))
        : []

      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const revenueThisMonth = monthlyRevenue.find(m => m.month === currentMonth)?.revenue ?? 0

      return {
        success: true as const,
        data: {
          metrics: {
            totalStudents: studentStats.total,
            totalTeachers: teacherCount,
            activeClasses,
            revenueThisMonth,
            pendingPayments: finance.pendingPayments,
            overdueAmount: finance.overdueAmount,
            pendingEnrollments: enrollmentStatsResult && R.isSuccess(enrollmentStatsResult) ? enrollmentStatsResult.value.pending : 0,
          },
          charts: {
            revenueLast6Months: monthlyRevenue,
            enrollmentByGrade,
            genderDistribution: studentStats.byGender,
          },
        },
      }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération des statistiques du tableau de bord' }
    }
  })
