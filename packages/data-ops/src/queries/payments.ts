import type {
  Payment,
  PaymentAllocation,
  PaymentInsert,
  PaymentMethod,
  PaymentStatus,
} from '@/drizzle/school-schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '@/database/setup'
import {
  installments,
  paymentAllocations,
  paymentPlans,
  payments,
  studentFees,
} from '@/drizzle/school-schema'

export interface GetPaymentsParams {
  schoolId: string
  studentId?: string
  paymentPlanId?: string
  method?: PaymentMethod
  status?: PaymentStatus
  startDate?: string
  endDate?: string
  processedBy?: string
  page?: number
  pageSize?: number
}

export interface PaginatedPayments {
  data: Payment[]
  total: number
  page: number
  pageSize: number
}

export async function getPayments(params: GetPaymentsParams): Promise<PaginatedPayments> {
  const db = getDb()
  const {
    schoolId,
    studentId,
    paymentPlanId,
    method,
    status,
    startDate,
    endDate,
    processedBy,
    page = 1,
    pageSize = 20,
  } = params

  const conditions = [eq(payments.schoolId, schoolId)]
  if (studentId)
    conditions.push(eq(payments.studentId, studentId))
  if (paymentPlanId)
    conditions.push(eq(payments.paymentPlanId, paymentPlanId))
  if (method)
    conditions.push(eq(payments.method, method))
  if (status)
    conditions.push(eq(payments.status, status))
  if (processedBy)
    conditions.push(eq(payments.processedBy, processedBy))
  if (startDate)
    conditions.push(gte(payments.paymentDate, startDate))
  if (endDate)
    conditions.push(lte(payments.paymentDate, endDate))

  const [data, countResult] = await Promise.all([
    db.select().from(payments).where(and(...conditions)).orderBy(desc(payments.paymentDate), desc(payments.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(payments).where(and(...conditions)),
  ])

  return { data, total: countResult[0]?.count ?? 0, page, pageSize }
}

export async function getPaymentById(paymentId: string): Promise<Payment | null> {
  const db = getDb()
  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1)
  return payment ?? null
}

export async function getPaymentByReceiptNumber(schoolId: string, receiptNumber: string): Promise<Payment | null> {
  const db = getDb()
  const [payment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.schoolId, schoolId), eq(payments.receiptNumber, receiptNumber)))
    .limit(1)
  return payment ?? null
}

export async function generateReceiptNumber(schoolId: string): Promise<string> {
  const db = getDb()
  const year = new Date().getFullYear()
  const prefix = `REC-${year}-`

  const [lastPayment] = await db
    .select({ receiptNumber: payments.receiptNumber })
    .from(payments)
    .where(and(eq(payments.schoolId, schoolId), sql`${payments.receiptNumber} LIKE ${`${prefix}%`}`))
    .orderBy(desc(payments.receiptNumber))
    .limit(1)

  let nextNumber = 1
  if (lastPayment?.receiptNumber) {
    const lastNum = Number.parseInt(lastPayment.receiptNumber.replace(prefix, ''), 10)
    if (!Number.isNaN(lastNum))
      nextNumber = lastNum + 1
  }

  return `${prefix}${nextNumber.toString().padStart(5, '0')}`
}

export type CreatePaymentData = Omit<PaymentInsert, 'id' | 'receiptNumber' | 'createdAt' | 'updatedAt'>

export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  const db = getDb()
  const receiptNumber = await generateReceiptNumber(data.schoolId)
  const [payment] = await db.insert(payments).values({ id: nanoid(), receiptNumber, ...data }).returning()
  if (!payment) {
    throw new Error('Failed to create payment')
  }
  return payment
}

export interface CreatePaymentWithAllocationsData extends CreatePaymentData {
  allocations: Array<{ studentFeeId: string, installmentId?: string, amount: string }>
}

export async function createPaymentWithAllocations(
  data: CreatePaymentWithAllocationsData,
): Promise<{ payment: Payment, allocations: PaymentAllocation[] }> {
  const db = getDb()
  const { allocations: allocationData, ...paymentData } = data

  return db.transaction(async (tx: any) => {
    const receiptNumber = await generateReceiptNumber(paymentData.schoolId)

    const [payment] = await tx
      .insert(payments)
      .values({ id: nanoid(), receiptNumber, ...paymentData })
      .returning()
    if (!payment) {
      throw new Error('Failed to create payment')
    }
    const allocations: PaymentAllocation[] = []
    for (const alloc of allocationData) {
      const [allocation] = await tx
        .insert(paymentAllocations)
        .values({ id: nanoid(), paymentId: payment.id, ...alloc })
        .returning()
      if (!allocation) {
        throw new Error('Failed to create payment allocation')
      }
      allocations.push(allocation)

      await tx
        .update(studentFees)
        .set({
          paidAmount: sql`${studentFees.paidAmount} + ${alloc.amount}::decimal`,
          balance: sql`${studentFees.balance} - ${alloc.amount}::decimal`,
          status: sql`CASE WHEN ${studentFees.balance} - ${alloc.amount}::decimal <= 0 THEN 'paid' WHEN ${studentFees.paidAmount} + ${alloc.amount}::decimal > 0 THEN 'partial' ELSE ${studentFees.status} END`,
          updatedAt: new Date(),
        })
        .where(eq(studentFees.id, alloc.studentFeeId))

      if (alloc.installmentId) {
        await tx
          .update(installments)
          .set({
            paidAmount: sql`${installments.paidAmount} + ${alloc.amount}::decimal`,
            balance: sql`${installments.balance} - ${alloc.amount}::decimal`,
            status: sql`CASE WHEN ${installments.balance} - ${alloc.amount}::decimal <= 0 THEN 'paid' WHEN ${installments.paidAmount} + ${alloc.amount}::decimal > 0 THEN 'partial' ELSE ${installments.status} END`,
            paidAt: sql`CASE WHEN ${installments.balance} - ${alloc.amount}::decimal <= 0 THEN NOW() ELSE ${installments.paidAt} END`,
            updatedAt: new Date(),
          })
          .where(eq(installments.id, alloc.installmentId))
      }
    }

    if (payment.paymentPlanId) {
      await tx
        .update(paymentPlans)
        .set({
          paidAmount: sql`${paymentPlans.paidAmount} + ${payment.amount}::decimal`,
          balance: sql`${paymentPlans.balance} - ${payment.amount}::decimal`,
          status: sql`CASE WHEN ${paymentPlans.balance} - ${payment.amount}::decimal <= 0 THEN 'completed' ELSE ${paymentPlans.status} END`,
          updatedAt: new Date(),
        })
        .where(eq(paymentPlans.id, payment.paymentPlanId))
    }

    return { payment, allocations }
  })
}

export async function cancelPayment(
  paymentId: string,
  cancelledBy: string,
  reason: string,
): Promise<Payment | undefined> {
  const db = getDb()
  const payment = await getPaymentById(paymentId)
  if (!payment)
    throw new Error('Payment not found')

  return db.transaction(async (tx: any) => {
    const allocs = await tx.select().from(paymentAllocations).where(eq(paymentAllocations.paymentId, paymentId))

    for (const alloc of allocs) {
      await tx
        .update(studentFees)
        .set({
          paidAmount: sql`${studentFees.paidAmount} - ${alloc.amount}::decimal`,
          balance: sql`${studentFees.balance} + ${alloc.amount}::decimal`,
          status: sql`CASE WHEN ${studentFees.paidAmount} - ${alloc.amount}::decimal <= 0 THEN 'pending' ELSE 'partial' END`,
          updatedAt: new Date(),
        })
        .where(eq(studentFees.id, alloc.studentFeeId))

      if (alloc.installmentId) {
        await tx
          .update(installments)
          .set({
            paidAmount: sql`${installments.paidAmount} - ${alloc.amount}::decimal`,
            balance: sql`${installments.balance} + ${alloc.amount}::decimal`,
            status: sql`CASE WHEN ${installments.paidAmount} - ${alloc.amount}::decimal <= 0 THEN 'pending' ELSE 'partial' END`,
            paidAt: null,
            updatedAt: new Date(),
          })
          .where(eq(installments.id, alloc.installmentId))
      }
    }

    if (payment.paymentPlanId) {
      await tx
        .update(paymentPlans)
        .set({
          paidAmount: sql`${paymentPlans.paidAmount} - ${payment.amount}::decimal`,
          balance: sql`${paymentPlans.balance} + ${payment.amount}::decimal`,
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(paymentPlans.id, payment.paymentPlanId))
    }

    const [cancelledPayment] = await tx
      .update(payments)
      .set({ status: 'cancelled', cancelledAt: new Date(), cancelledBy, cancellationReason: reason, updatedAt: new Date() })
      .where(eq(payments.id, paymentId))
      .returning()

    if (!cancelledPayment) {
      throw new Error('Failed to cancel payment')
    }
    return cancelledPayment
  })
}

export interface CashierDailySummary {
  cashierId: string
  date: string
  totalPayments: number
  totalAmount: number
  byMethod: Record<PaymentMethod, { count: number, amount: number }>
}

export async function getCashierDailySummary(schoolId: string, cashierId: string, date: string): Promise<CashierDailySummary> {
  const db = getDb()
  const dayPayments = await db
    .select()
    .from(payments)
    .where(and(eq(payments.schoolId, schoolId), eq(payments.processedBy, cashierId), eq(payments.paymentDate, date), eq(payments.status, 'completed')))

  const byMethod: Record<string, { count: number, amount: number }> = {}
  let totalAmount = 0

  for (const p of dayPayments) {
    if (!byMethod[p.method]) {
      byMethod[p.method] = { count: 0, amount: 0 }
    }
    const entry = byMethod[p.method]!
    entry.count++
    entry.amount += Number.parseFloat(p.amount)
    totalAmount += Number.parseFloat(p.amount)
  }

  return { cashierId, date, totalPayments: dayPayments.length, totalAmount, byMethod: byMethod as CashierDailySummary['byMethod'] }
}
