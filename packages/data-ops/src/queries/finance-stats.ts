import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, sql, sum } from 'drizzle-orm'
import { getDb } from '../database/setup'
import {
  installments,
  paymentPlans,
  payments,
  schoolYears,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export interface FinanceStats {
  totalRevenue: number
  totalPayments: number
  pendingPayments: number
  overdueAmount: number
}

export async function getFinanceStats(schoolId: string): R.ResultAsync<FinanceStats, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [revenueResult] = await db
          .select({
            amount: sum(payments.amount),
            count: sql<number>`count(*)::int`,
          })
          .from(payments)
          .where(
            and(
              eq(payments.schoolId, schoolId),
              eq(payments.status, 'completed'),
            ),
          )

        const [pendingResult] = await db
          .select({
            amount: sum(payments.amount),
          })
          .from(payments)
          .where(
            and(
              eq(payments.schoolId, schoolId),
              eq(payments.status, 'pending'),
            ),
          )

        const now = new Date().toISOString().split('T')[0]
        const [overdueResult] = await db
          .select({
            amount: sum(installments.balance),
          })
          .from(installments)
          .innerJoin(paymentPlans, eq(installments.paymentPlanId, paymentPlans.id))
          .innerJoin(schoolYears, eq(paymentPlans.schoolYearId, schoolYears.id))
          .where(
            and(
              eq(schoolYears.schoolId, schoolId),
              sql`${installments.dueDate} < ${now}`,
              sql`${installments.balance} > 0`,
            ),
          )

        return {
          totalRevenue: Number(revenueResult?.amount ?? 0),
          totalPayments: Number(revenueResult?.count ?? 0),
          pendingPayments: Number(pendingResult?.amount ?? 0),
          overdueAmount: Number(overdueResult?.amount ?? 0),
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'stats.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}

export interface MonthlyRevenue {
  month: string
  revenue: number
}

export async function getMonthlyRevenue(schoolId: string, months: number = 6): R.ResultAsync<MonthlyRevenue[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .select({
            month: sql<string>`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`,
            revenue: sum(payments.amount),
          })
          .from(payments)
          .where(
            and(
              eq(payments.schoolId, schoolId),
              eq(payments.status, 'completed'),
              sql`${payments.paymentDate} >= CURRENT_DATE - INTERVAL '${sql.raw(String(months))} months'`,
            ),
          )
          .groupBy(sql`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`)
          .orderBy(sql`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`)

        return rows.map(row => ({
          month: row.month,
          revenue: Number(row.revenue ?? 0),
        }))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'stats.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, months })),
  )
}
