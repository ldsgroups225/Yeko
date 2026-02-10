import type {
  Payment,
  PaymentAllocation,
  PaymentInsert,
  PaymentMethod,
  PaymentStatus,
} from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import {
  installments,
  paymentAllocations,
  paymentPlans,
  payments,
  studentFees,
  students,
} from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

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

export interface PaymentWithDetails extends Omit<Payment, 'totalCount'> {
  studentName: string
  studentMatricule: string | null
}

export interface PaginatedPayments {
  data: PaymentWithDetails[]
  total: number
  page: number
  pageSize: number
}

export async function getPayments(params: GetPaymentsParams): R.ResultAsync<PaginatedPayments, DatabaseError> {
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

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
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

        const rows = await db
          .select({
            id: payments.id,
            receiptNumber: payments.receiptNumber,
            amount: payments.amount,
            method: payments.method,
            status: payments.status,
            createdAt: payments.createdAt,
            paymentDate: payments.paymentDate,
            studentName: sql<string>`concat(${students.firstName}, ' ', ${students.lastName})`.as('studentName'),
            studentMatricule: students.matricule,
            totalCount: sql<number>`COUNT(*) OVER()`.as('total_count'),
          })
          .from(payments)
          .leftJoin(students, eq(payments.studentId, students.id))
          .where(and(...conditions))
          .orderBy(desc(payments.paymentDate), desc(payments.createdAt))
          .limit(pageSize)
          .offset((page - 1) * pageSize)

        const total = rows[0]?.totalCount ?? 0
        const data = rows.map(({ totalCount: _totalCount, ...rest }) => rest)

        return { data: data as PaymentWithDetails[], total, page, pageSize }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, studentId })),
  )
}

export async function getPaymentById(paymentId: string): R.ResultAsync<Payment | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { paymentId })),
  )
}

export async function getPaymentByReceiptNumber(schoolId: string, receiptNumber: string): R.ResultAsync<Payment | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .select()
          .from(payments)
          .where(and(eq(payments.schoolId, schoolId), eq(payments.receiptNumber, receiptNumber)))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.fetchByReceiptNumberFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, receiptNumber })),
  )
}

export async function generateReceiptNumber(schoolId: string): R.ResultAsync<string, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.generateReceiptNumberFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
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

export async function createPayment(data: CreatePaymentData): R.ResultAsync<Payment, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const receiptNumberResult = await generateReceiptNumber(data.schoolId)
        if (R.isFailure(receiptNumberResult))
          throw receiptNumberResult.error
        const receiptNumber = receiptNumberResult.value

        const [payment] = await db.insert(payments).values({ id: crypto.randomUUID(), receiptNumber, ...data }).returning()
        if (!payment) {
          throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.createRecordFailed'))
        }
        return payment
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId })),
  )
}

export async function createPaymentWithAllocations(
  data: CreatePaymentWithAllocationsData,
): R.ResultAsync<{ payment: Payment, allocations: PaymentAllocation[] }, DatabaseError> {
  const db = getDb()
  const { allocations: allocationData, ...paymentData } = data

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Validate payment amount matches allocations
        const totalAllocated = allocationData.reduce((sum: number, a: CreatePaymentAllocationData) => sum + Number.parseFloat(a.amount), 0)
        const paymentAmount = Number.parseFloat(paymentData.amount)

        if (Math.abs(totalAllocated - paymentAmount) > 0.01) {
          throw dbError('PAYMENT_CONFLICT', getNestedErrorMessage('finance', 'payment.amountMismatch', { paymentAmount, totalAllocated }))
        }

        const receiptNumberResult = await generateReceiptNumber(paymentData.schoolId)
        if (R.isFailure(receiptNumberResult))
          throw receiptNumberResult.error
        const receiptNumber = receiptNumberResult.value

        const [payment] = await db
          .insert(payments)
          .values({ id: crypto.randomUUID(), receiptNumber, ...paymentData })
          .returning()

        if (!payment) {
          throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.createRecordFailed'))
        }

        const allocations: PaymentAllocation[] = []
        for (const alloc of allocationData) {
          const [allocation] = await db
            .insert(paymentAllocations)
            .values({ id: crypto.randomUUID(), paymentId: payment.id, ...alloc })
            .returning()

          if (!allocation) {
            throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.createAllocationFailed'))
          }
          allocations.push(allocation)

          await db
            .update(studentFees)
            .set({
              paidAmount: sql`${studentFees.paidAmount} + ${alloc.amount}::decimal`,
              balance: sql`${studentFees.balance} - ${alloc.amount}::decimal`,
              status: sql`CASE WHEN ${studentFees.balance} - ${alloc.amount}::decimal <= 0 THEN 'paid' WHEN ${studentFees.paidAmount} + ${alloc.amount}::decimal > 0 THEN 'partial' ELSE ${studentFees.status} END`,
              updatedAt: new Date(),
            })
            .where(eq(studentFees.id, alloc.studentFeeId))

          if (alloc.installmentId) {
            await db
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
          await db
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
      },
      catch: (err: unknown) => {
        const error = err as Error
        console.error('Payment creation error:', error)
        return DatabaseError.from(error, 'INTERNAL_ERROR', `Payment creation failed: ${error.message || String(error)}`)
      },
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId, studentId: data.studentId })),
  )
}

export async function cancelPayment(
  paymentId: string,
  cancelledBy: string,
  reason: string,
): R.ResultAsync<Payment, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const paymentResult = await getPaymentById(paymentId)
        if (R.isFailure(paymentResult))
          throw paymentResult.error
        const payment = paymentResult.value

        if (!payment)
          throw dbError('NOT_FOUND', getNestedErrorMessage('finance', 'payment.notFoundWithId', { id: paymentId }))
        if (payment.status === 'cancelled')
          throw dbError('CONFLICT', getNestedErrorMessage('finance', 'payment.alreadyCancelled'))

        const allocs = await db.select().from(paymentAllocations).where(eq(paymentAllocations.paymentId, paymentId))

        for (const alloc of allocs) {
          await db
            .update(studentFees)
            .set({
              paidAmount: sql`${studentFees.paidAmount} - ${alloc.amount}::decimal`,
              balance: sql`${studentFees.balance} + ${alloc.amount}::decimal`,
              status: sql`CASE WHEN ${studentFees.paidAmount} - ${alloc.amount}::decimal <= 0 THEN 'pending' ELSE 'partial' END`,
              updatedAt: new Date(),
            })
            .where(eq(studentFees.id, alloc.studentFeeId))

          if (alloc.installmentId) {
            await db
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
          await db
            .update(paymentPlans)
            .set({
              paidAmount: sql`${paymentPlans.paidAmount} - ${payment.amount}::decimal`,
              balance: sql`${paymentPlans.balance} + ${payment.amount}::decimal`,
              status: 'active',
              updatedAt: new Date(),
            })
            .where(eq(paymentPlans.id, payment.paymentPlanId))
        }

        const [cancelledPayment] = await db
          .update(payments)
          .set({ status: 'cancelled', cancelledAt: new Date(), cancelledBy, cancellationReason: reason, updatedAt: new Date() })
          .where(eq(payments.id, paymentId))
          .returning()

        if (!cancelledPayment) {
          throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.cancelRecordFailed'))
        }

        return cancelledPayment
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.cancelFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { paymentId, cancelledBy })),
  )
}

export interface CashierDailySummary {
  cashierId: string
  date: string
  totalPayments: number
  totalAmount: number
  byMethod: Record<PaymentMethod, { count: number, amount: number }>
}

export async function getCashierDailySummary(schoolId: string, cashierId: string, date: string): R.ResultAsync<CashierDailySummary, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'payment.fetchSummaryFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, cashierId, date })),
  )
}
