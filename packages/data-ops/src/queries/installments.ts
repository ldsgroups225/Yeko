import type { Installment, InstallmentInsert, InstallmentStatus } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, lt, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { installments, paymentPlans, students } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export interface GetInstallmentsParams {
  paymentPlanId?: string
  status?: InstallmentStatus
}

export function getInstallments(params: GetInstallmentsParams): ResultAsync<Installment[], DatabaseError> {
  const db = getDb()
  const { paymentPlanId, status } = params

  return ResultAsync.fromPromise(
    (async () => {
      const conditions = []
      if (paymentPlanId)
        conditions.push(eq(installments.paymentPlanId, paymentPlanId))
      if (status)
        conditions.push(eq(installments.status, status))

      if (conditions.length === 0)
        return []

      return db.select().from(installments).where(and(...conditions))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchFailed')),
  ).mapErr(tapLogErr(databaseLogger, { paymentPlanId }))
}

export function getInstallmentById(installmentId: string): ResultAsync<Installment | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(installments).where(eq(installments.id, installmentId)).limit(1).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchByIdFailed')),
  ).mapErr(tapLogErr(databaseLogger, { installmentId }))
}

export function getInstallmentsByPaymentPlan(paymentPlanId: string): ResultAsync<Installment[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(installments).where(eq(installments.paymentPlanId, paymentPlanId)).orderBy(installments.installmentNumber),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchByPaymentPlanFailed')),
  ).mapErr(tapLogErr(databaseLogger, { paymentPlanId }))
}

export type CreateInstallmentData = Omit<InstallmentInsert, 'id' | 'createdAt' | 'updatedAt'>

export function createInstallment(data: CreateInstallmentData): ResultAsync<Installment, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [installment] = await db.insert(installments).values({ id: crypto.randomUUID(), ...data }).returning()
      if (!installment) {
        throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.createFailed'))
      }
      return installment
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.createFailed')),
  ).mapErr(tapLogErr(databaseLogger, { paymentPlanId: data.paymentPlanId }))
}

export function createInstallmentsBulk(dataList: CreateInstallmentData[]): ResultAsync<Installment[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      if (dataList.length === 0)
        return []
      const values = dataList.map(data => ({ id: crypto.randomUUID(), ...data }))
      return db.insert(installments).values(values).returning()
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.bulkCreateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { count: dataList.length }))
}

export function waiveInstallment(installmentId: string): ResultAsync<Installment | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [installment] = await db
        .update(installments)
        .set({ status: 'waived', balance: '0', updatedAt: new Date() })
        .where(eq(installments.id, installmentId))
        .returning()
      return installment
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.waiveFailed')),
  ).mapErr(tapLogErr(databaseLogger, { installmentId }))
}

export function getOverdueInstallments(schoolYearId: string): ResultAsync<Array<Installment & { studentId: string }>, DatabaseError> {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]!

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchOverdueFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolYearId }))
}

export function updateOverdueInstallments(schoolYearId: string): ResultAsync<number, DatabaseError> {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]!

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.updateOverdueFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolYearId }))
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

export function getOverdueInstallmentsWithStudents(schoolYearId: string): ResultAsync<OverdueInstallmentWithStudent[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'installment.fetchOverdueWithStudentsFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolYearId }))
}
