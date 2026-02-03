import type {
  Payment,
  PaymentAllocation,
  PaymentInsert,
  PaymentMethod,
  PaymentStatus,
} from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import {
  installments,
  paymentAllocations,
  paymentPlans,
  payments,
  studentFees,
} from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

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

export function getPayments(params: GetPaymentsParams): ResultAsync<PaginatedPayments, DatabaseError> {
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

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payments'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, studentId }))
}

export function getPaymentById(paymentId: string): ResultAsync<Payment | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(payments).where(eq(payments.id, paymentId)).limit(1).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment by ID'),
  ).mapErr(tapLogErr(databaseLogger, { paymentId }))
}

export function getPaymentByReceiptNumber(schoolId: string, receiptNumber: string): ResultAsync<Payment | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(payments)
      .where(and(eq(payments.schoolId, schoolId), eq(payments.receiptNumber, receiptNumber)))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment by receipt number'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, receiptNumber }))
}

export function generateReceiptNumber(schoolId: string): ResultAsync<string, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to generate receipt number'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}

export type CreatePaymentData = Omit<PaymentInsert, 'id' | 'receiptNumber' | 'createdAt' | 'updatedAt'>

export interface CreatePaymentAllocationData {
  studentFeeId: string
  installmentId?: string
  amount: string
}

export interface CreatePaymentWithAllocationsData extends CreatePaymentData {
  allocations: CreatePaymentAllocationData[]
}

export function createPayment(data: CreatePaymentData): ResultAsync<Payment, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const receiptNumberResult = await generateReceiptNumber(data.schoolId)
      if (receiptNumberResult.isErr())
        throw receiptNumberResult.error
      const receiptNumber = receiptNumberResult.value

      const [payment] = await db.insert(payments).values({ id: crypto.randomUUID(), receiptNumber, ...data }).returning()
      if (!payment) {
        throw dbError('INTERNAL_ERROR', 'Failed to create payment')
      }
      return payment
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create payment'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId }))
}

export function createPaymentWithAllocations(
  data: CreatePaymentWithAllocationsData,
): ResultAsync<{ payment: Payment, allocations: PaymentAllocation[] }, DatabaseError> {
  const db = getDb()
  const { allocations: allocationData, ...paymentData } = data

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // Validate payment amount matches allocations
      const totalAllocated = allocationData.reduce((sum: number, a: CreatePaymentAllocationData) => sum + Number.parseFloat(a.amount), 0)
      const paymentAmount = Number.parseFloat(paymentData.amount)

      if (Math.abs(totalAllocated - paymentAmount) > 0.01) {
        throw dbError('PAYMENT_CONFLICT', `Payment amount (${paymentAmount}) does not match total allocations (${totalAllocated})`)
      }

      const receiptNumberResult = await generateReceiptNumber(paymentData.schoolId)
      if (receiptNumberResult.isErr())
        throw receiptNumberResult.error
      const receiptNumber = receiptNumberResult.value

      const [payment] = await tx
        .insert(payments)
        .values({ id: crypto.randomUUID(), receiptNumber, ...paymentData })
        .returning()

      if (!payment) {
        throw dbError('INTERNAL_ERROR', 'Failed to create payment record')
      }

      const allocations: PaymentAllocation[] = []
      for (const alloc of allocationData) {
        const [allocation] = await tx
          .insert(paymentAllocations)
          .values({ id: crypto.randomUUID(), paymentId: payment.id, ...alloc })
          .returning()

        if (!allocation) {
          throw dbError('INTERNAL_ERROR', 'Failed to create payment allocation')
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
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create payment with allocations'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId, studentId: data.studentId }))
}

export function cancelPayment(
  paymentId: string,
  cancelledBy: string,
  reason: string,
): ResultAsync<Payment, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      const paymentResult = await getPaymentById(paymentId)
      if (paymentResult.isErr())
        throw paymentResult.error
      const payment = paymentResult.value

      if (!payment)
        throw dbError('NOT_FOUND', `Payment with ID ${paymentId} not found`)
      if (payment.status === 'cancelled')
        throw dbError('CONFLICT', 'Payment is already cancelled')

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
        throw dbError('INTERNAL_ERROR', 'Failed to cancel payment record')
      }

      return cancelledPayment
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to cancel payment'),
  ).mapErr(tapLogErr(databaseLogger, { paymentId, cancelledBy }))
}

export interface CashierDailySummary {
  cashierId: string
  date: string
  totalPayments: number
  totalAmount: number
  byMethod: Record<PaymentMethod, { count: number, amount: number }>
}

export function getCashierDailySummary(schoolId: string, cashierId: string, date: string): ResultAsync<CashierDailySummary, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch cashier summary'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, cashierId, date }))
}
