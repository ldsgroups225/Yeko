import type { Refund, RefundInsert, RefundStatus } from '@/drizzle/school-schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '@/database/setup'
import { payments, refunds } from '@/drizzle/school-schema'

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

export async function getRefunds(params: GetRefundsParams): Promise<PaginatedRefunds> {
  const db = getDb()
  const { schoolId, paymentId, status, startDate, endDate, page = 1, pageSize = 20 } = params
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
}

export async function getRefundById(refundId: string): Promise<Refund | null> {
  const db = getDb()
  const [refund] = await db.select().from(refunds).where(eq(refunds.id, refundId)).limit(1)
  return refund ?? null
}

export async function generateRefundNumber(schoolId: string): Promise<string> {
  const db = getDb()
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
}

export type CreateRefundData = Omit<RefundInsert, 'id' | 'refundNumber' | 'createdAt' | 'updatedAt'>

export async function createRefund(data: CreateRefundData): Promise<Refund> {
  const db = getDb()
  const refundNumber = await generateRefundNumber(data.schoolId)
  const [refund] = await db.insert(refunds).values({ id: nanoid(), refundNumber, ...data }).returning()
  return refund
}

export async function approveRefund(refundId: string, approvedBy: string): Promise<Refund> {
  const db = getDb()
  const [refund] = await db
    .update(refunds)
    .set({ status: 'approved', approvedBy, approvedAt: new Date(), updatedAt: new Date() })
    .where(eq(refunds.id, refundId))
    .returning()
  return refund
}

export async function rejectRefund(refundId: string, rejectionReason: string): Promise<Refund> {
  const db = getDb()
  const [refund] = await db
    .update(refunds)
    .set({ status: 'rejected', rejectionReason, updatedAt: new Date() })
    .where(eq(refunds.id, refundId))
    .returning()
  return refund
}

export async function processRefund(refundId: string, processedBy: string, reference?: string): Promise<Refund> {
  const db = getDb()
  return db.transaction(async (tx: typeof db) => {
    const refund = await getRefundById(refundId)
    if (!refund)
      throw new Error('Refund not found')
    if (refund.status !== 'approved')
      throw new Error('Refund must be approved before processing')

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

    return processedRefund
  })
}

export async function cancelRefund(refundId: string): Promise<Refund> {
  const db = getDb()
  const [refund] = await db
    .update(refunds)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(refunds.id, refundId))
    .returning()
  return refund
}

export async function getPendingRefundsCount(schoolId: string): Promise<number> {
  const db = getDb()
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(refunds)
    .where(and(eq(refunds.schoolId, schoolId), eq(refunds.status, 'pending')))
  return result?.count ?? 0
}
