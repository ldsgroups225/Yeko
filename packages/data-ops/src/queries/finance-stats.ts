import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, gte, sql, sum } from 'drizzle-orm'
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
  paymentsThisMonth: number
  pendingPayments: number
  overdueAmount: number
}

export async function getFinanceStats(schoolId: string): R.ResultAsync<FinanceStats, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const now = new Date().toISOString().split('T')[0]
        const [[paymentsResult], [overdueResult]] = await Promise.all([
          db
            .select({
              totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${payments.status} = 'completed' THEN ${payments.amount} ELSE 0 END), 0)`,
              totalPayments: sql<number>`COUNT(*) FILTER (WHERE ${payments.status} = 'completed')::int`,
              totalPaymentsThisMonth: sql<number>`COUNT(*) FILTER (WHERE ${payments.status} = 'completed' AND DATE_TRUNC('month', ${payments.paymentDate}::date) = DATE_TRUNC('month', CURRENT_DATE))::int`,
              pendingAmount: sql<string>`COALESCE(SUM(CASE WHEN ${payments.status} = 'pending' THEN ${payments.amount} ELSE 0 END), 0)`,
            })
            .from(payments)
            .where(eq(payments.schoolId, schoolId)),
          db
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
            ),
        ])

        return {
          totalRevenue: Number(paymentsResult?.totalRevenue ?? 0),
          totalPayments: Number(paymentsResult?.totalPayments ?? 0),
          paymentsThisMonth: Number(
            paymentsResult?.totalPaymentsThisMonth ?? 0,
          ),
          pendingPayments: Number(paymentsResult?.pendingAmount ?? 0),
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
              gte(
                payments.paymentDate,
                sql`CURRENT_DATE - INTERVAL '1 month' * ${months}`,
              ),
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
