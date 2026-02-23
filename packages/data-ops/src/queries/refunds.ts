import type { Refund, RefundInsert, RefundStatus } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { payments, refunds } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export interface GetRefundsParams {
  schoolId: string
  paymentId?: string
  status?: RefundStatus
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface PaginatedRefunds {
  data: Refund[]
  total: number
  page: number
  pageSize: number
}

export async function getRefunds(params: GetRefundsParams): R.ResultAsync<PaginatedRefunds, DatabaseError> {
  const db = getDb()
  const { schoolId, paymentId, status, startDate, endDate, page = 1, pageSize = 20 } = params

  return R.pipe(
    R.try({
      try: async () => {
        const conditions = [eq(refunds.schoolId, schoolId)]
        if (paymentId)
          conditions.push(eq(refunds.paymentId, paymentId))
        if (status)
          conditions.push(eq(refunds.status, status))
        if (startDate)
          conditions.push(gte(refunds.requestedAt, new Date(startDate)))
        if (endDate)
          conditions.push(lte(refunds.requestedAt, new Date(endDate)))

        const [data, countResult] = await Promise.all([
          db.select().from(refunds).where(and(...conditions)).orderBy(desc(refunds.requestedAt)).limit(pageSize).offset((page - 1) * pageSize),
          db.select({ count: sql<number>`count(*)::int` }).from(refunds).where(and(...conditions)),
        ])

        return { data, total: countResult[0]?.count ?? 0, page, pageSize }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, paymentId })),
  )
}

export async function getRefundById(refundId: string): R.ResultAsync<Refund | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db.select().from(refunds).where(eq(refunds.id, refundId)).limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { refundId })),
  )
}

export async function generateRefundNumber(schoolId: string): R.ResultAsync<string, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const year = new Date().getFullYear()
        const prefix = `REF-${year}-`

        const [lastRefund] = await db
          .select({ refundNumber: refunds.refundNumber })
          .from(refunds)
          .where(and(eq(refunds.schoolId, schoolId), sql`${refunds.refundNumber} LIKE ${`${prefix}%`}`))
          .orderBy(desc(refunds.refundNumber))
          .limit(1)

        let nextNumber = 1
        if (lastRefund?.refundNumber) {
          const lastNum = Number.parseInt(lastRefund.refundNumber.replace(prefix, ''), 10)
          if (!Number.isNaN(lastNum))
            nextNumber = lastNum + 1
        }

        return `${prefix}${nextNumber.toString().padStart(5, '0')}`
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.generateNumberFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}

export type CreateRefundData = Omit<RefundInsert, 'id' | 'refundNumber' | 'createdAt' | 'updatedAt'>

export async function createRefund(data: CreateRefundData): R.ResultAsync<Refund, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const refundNumberResult = await generateRefundNumber(data.schoolId)
        if (R.isFailure(refundNumberResult))
          throw refundNumberResult.error

        const refundNumber = refundNumberResult.value
        const [refund] = await db.insert(refunds).values({ id: crypto.randomUUID(), refundNumber, ...data }).returning()
        if (!refund) {
          throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.createFailed'))
        }
        return refund
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId, paymentId: data.paymentId })),
  )
}

export async function approveRefund(refundId: string, approvedBy: string): R.ResultAsync<Refund | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [refund] = await db
          .update(refunds)
          .set({ status: 'approved', approvedBy, approvedAt: new Date(), updatedAt: new Date() })
          .where(eq(refunds.id, refundId))
          .returning()
        return refund
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.approveFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { refundId, approvedBy })),
  )
}

export async function rejectRefund(refundId: string, rejectionReason: string): R.ResultAsync<Refund | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [refund] = await db
          .update(refunds)
          .set({ status: 'rejected', rejectionReason, updatedAt: new Date() })
          .where(eq(refunds.id, refundId))
          .returning()
        return refund
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.rejectFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { refundId })),
  )
}

export async function processRefund(
  refundId: string,
  processedBy: string,
  reference?: string,
): R.ResultAsync<Refund | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        return await db.transaction(async (tx) => {
          const [refund] = await tx.select().from(refunds).where(eq(refunds.id, refundId)).limit(1)
          if (!refund)
            throw dbError('NOT_FOUND', getNestedErrorMessage('finance', 'refund.notFound'))
          if (refund.status !== 'approved')
            throw dbError('CONFLICT', getNestedErrorMessage('finance', 'refund.mustBeApproved'))

          // Update payment status
          await tx
            .update(payments)
            .set({
              status: sql`CASE WHEN ${payments.amount} = ${refund.amount} THEN 'refunded' ELSE 'partial_refund' END`,
              updatedAt: new Date(),
            })
            .where(eq(payments.id, refund.paymentId))

          // Update refund status
          const [processedRefund] = await tx
            .update(refunds)
            .set({ status: 'processed', processedBy, processedAt: new Date(), reference, updatedAt: new Date() })
            .where(eq(refunds.id, refundId))
            .returning()

          if (!processedRefund) {
            throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.processFailed'))
          }

          return processedRefund
        })
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.processFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { refundId, processedBy })),
  )
}

export async function cancelRefund(refundId: string): R.ResultAsync<Refund | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [refund] = await db
          .update(refunds)
          .set({ status: 'cancelled', updatedAt: new Date() })
          .where(eq(refunds.id, refundId))
          .returning()
        return refund
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.cancelFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { refundId })),
  )
}

export async function getPendingRefundsCount(schoolId: string): R.ResultAsync<number, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const result = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(refunds)
          .where(and(eq(refunds.schoolId, schoolId), eq(refunds.status, 'pending')))
        return result[0]?.count ?? 0
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'refund.pendingCountFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}
