import type { Installment, InstallmentInsert, InstallmentStatus } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, lt, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { installments, paymentPlans, students } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export interface GetInstallmentsParams {
  paymentPlanId?: string
  status?: InstallmentStatus
}

export async function getInstallments(params: GetInstallmentsParams): R.ResultAsync<Installment[], DatabaseError> {
  const db = getDb()
  const { paymentPlanId, status } = params

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = []
        if (paymentPlanId)
          conditions.push(eq(installments.paymentPlanId, paymentPlanId))
        if (status)
          conditions.push(eq(installments.status, status))

        if (conditions.length === 0)
          return []

        return await db.select().from(installments).where(and(...conditions))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { paymentPlanId })),
  )
}

export async function getInstallmentById(installmentId: string): R.ResultAsync<Installment | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db.select().from(installments).where(eq(installments.id, installmentId)).limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { installmentId })),
  )
}

export async function getInstallmentsByPaymentPlan(paymentPlanId: string): R.ResultAsync<Installment[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db.select().from(installments).where(eq(installments.paymentPlanId, paymentPlanId)).orderBy(installments.installmentNumber)
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchByPaymentPlanFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { paymentPlanId })),
  )
}

export type CreateInstallmentData = Omit<InstallmentInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createInstallment(data: CreateInstallmentData): R.ResultAsync<Installment, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [installment] = await db.insert(installments).values({ id: crypto.randomUUID(), ...data }).returning()
        if (!installment) {
          throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.createFailed'))
        }
        return installment
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { paymentPlanId: data.paymentPlanId })),
  )
}

export async function createInstallmentsBulk(dataList: CreateInstallmentData[]): R.ResultAsync<Installment[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        if (dataList.length === 0)
          return []
        const values = dataList.map(data => ({ id: crypto.randomUUID(), ...data }))
        return await db.insert(installments).values(values).returning()
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.bulkCreateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { count: dataList.length })),
  )
}

export async function waiveInstallment(installmentId: string): R.ResultAsync<Installment | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [installment] = await db
          .update(installments)
          .set({ status: 'waived', balance: '0', updatedAt: new Date() })
          .where(eq(installments.id, installmentId))
          .returning()
        return installment
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.waiveFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { installmentId })),
  )
}

export async function getOverdueInstallments(schoolYearId: string): R.ResultAsync<Array<Installment & { studentId: string }>, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const today = new Date().toISOString().split('T')[0]!
        const result = await db
          .select({
            installment: installments,
            studentId: paymentPlans.studentId,
          })
          .from(installments)
          .innerJoin(paymentPlans, eq(installments.paymentPlanId, paymentPlans.id))
          .where(and(
            eq(paymentPlans.schoolYearId, schoolYearId),
            lt(installments.dueDate, today),
            eq(installments.status, 'pending'),
          ))

        return result.map(r => ({ ...r.installment, studentId: r.studentId }))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchOverdueFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolYearId })),
  )
}

export async function updateOverdueInstallments(schoolYearId: string): R.ResultAsync<number, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const today = new Date().toISOString().split('T')[0]!
        const overdueInstallmentIds = await db
          .select({ id: installments.id })
          .from(installments)
          .innerJoin(paymentPlans, eq(installments.paymentPlanId, paymentPlans.id))
          .where(and(
            eq(paymentPlans.schoolYearId, schoolYearId),
            lt(installments.dueDate, today),
            eq(installments.status, 'pending'),
          ))

        if (overdueInstallmentIds.length === 0)
          return 0

        for (const { id } of overdueInstallmentIds) {
          await db
            .update(installments)
            .set({
              status: 'overdue',
              daysOverdue: sql`DATE_PART('day', NOW() - ${installments.dueDate}::timestamp)::int`,
              updatedAt: new Date(),
            })
            .where(eq(installments.id, id))
        }

        return overdueInstallmentIds.length
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.updateOverdueFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolYearId })),
  )
}

export interface OverdueInstallmentWithStudent {
  installmentId: string
  studentId: string
  studentName: string
  amount: string
  balance: string
  dueDate: string
  daysOverdue: number
}

export async function getOverdueInstallmentsWithStudents(schoolYearId: string): R.ResultAsync<OverdueInstallmentWithStudent[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const result = await db
          .select({
            installmentId: installments.id,
            studentId: students.id,
            firstName: students.firstName,
            lastName: students.lastName,
            amount: installments.amount,
            balance: installments.balance,
            dueDate: installments.dueDate,
            daysOverdue: installments.daysOverdue,
          })
          .from(installments)
          .innerJoin(paymentPlans, eq(installments.paymentPlanId, paymentPlans.id))
          .innerJoin(students, eq(paymentPlans.studentId, students.id))
          .where(and(eq(paymentPlans.schoolYearId, schoolYearId), eq(installments.status, 'overdue')))

        return result.map(r => ({
          installmentId: r.installmentId,
          studentId: r.studentId,
          studentName: `${r.lastName} ${r.firstName}`,
          amount: r.amount,
          balance: r.balance,
          dueDate: r.dueDate,
          daysOverdue: r.daysOverdue ?? 0,
        }))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchOverdueWithStudentsFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolYearId })),
  )
}
