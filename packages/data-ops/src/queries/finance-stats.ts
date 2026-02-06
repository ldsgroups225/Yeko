import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, sql, sum } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
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

export function getFinanceStats(schoolId: string): ResultAsync<FinanceStats, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'stats.fetchFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}
