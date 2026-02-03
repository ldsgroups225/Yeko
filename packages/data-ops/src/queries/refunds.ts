import type { Refund, RefundInsert, RefundStatus } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { payments, refunds } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

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

export function getRefunds(params: GetRefundsParams): ResultAsync<PaginatedRefunds, DatabaseError> {
  const db = getDb()
  const { schoolId, paymentId, status, startDate, endDate, page = 1, pageSize = 20 } = params

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch refunds'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, paymentId }))
}

export function getRefundById(refundId: string): ResultAsync<Refund | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(refunds).where(eq(refunds.id, refundId)).limit(1).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch refund by ID'),
  ).mapErr(tapLogErr(databaseLogger, { refundId }))
}

export function generateRefundNumber(schoolId: string): ResultAsync<string, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to generate refund number'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}

export type CreateRefundData = Omit<RefundInsert, 'id' | 'refundNumber' | 'createdAt' | 'updatedAt'>

export function createRefund(data: CreateRefundData): ResultAsync<Refund, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const refundNumberResult = await generateRefundNumber(data.schoolId)
      if (refundNumberResult.isErr())
        throw refundNumberResult.error

      const refundNumber = refundNumberResult.value
      const [refund] = await db.insert(refunds).values({ id: crypto.randomUUID(), refundNumber, ...data }).returning()
      if (!refund) {
        throw dbError('INTERNAL_ERROR', 'Failed to create refund')
      }
      return refund
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create refund'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId, paymentId: data.paymentId }))
}

export function approveRefund(refundId: string, approvedBy: string): ResultAsync<Refund | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [refund] = await db
        .update(refunds)
        .set({ status: 'approved', approvedBy, approvedAt: new Date(), updatedAt: new Date() })
        .where(eq(refunds.id, refundId))
        .returning()
      return refund
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to approve refund'),
  ).mapErr(tapLogErr(databaseLogger, { refundId, approvedBy }))
}

export function rejectRefund(refundId: string, rejectionReason: string): ResultAsync<Refund | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [refund] = await db
        .update(refunds)
        .set({ status: 'rejected', rejectionReason, updatedAt: new Date() })
        .where(eq(refunds.id, refundId))
        .returning()
      return refund
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to reject refund'),
  ).mapErr(tapLogErr(databaseLogger, { refundId }))
}

export function processRefund(
  refundId: string,
  processedBy: string,
  reference?: string,
): ResultAsync<Refund | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      const [refund] = await tx.select().from(refunds).where(eq(refunds.id, refundId)).limit(1)
      if (!refund)
        throw dbError('NOT_FOUND', 'Refund not found')
      if (refund.status !== 'approved')
        throw dbError('CONFLICT', 'Refund must be approved before processing')

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
        throw dbError('INTERNAL_ERROR', 'Failed to process refund')
      }

      return processedRefund
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to process refund'),
  ).mapErr(tapLogErr(databaseLogger, { refundId, processedBy }))
}

export function cancelRefund(refundId: string): ResultAsync<Refund | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [refund] = await db
        .update(refunds)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(refunds.id, refundId))
        .returning()
      return refund
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to cancel refund'),
  ).mapErr(tapLogErr(databaseLogger, { refundId }))
}

export function getPendingRefundsCount(schoolId: string): ResultAsync<number, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(refunds)
      .where(and(eq(refunds.schoolId, schoolId), eq(refunds.status, 'pending')))
      .then(result => result[0]?.count ?? 0),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to get pending refunds count'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}
