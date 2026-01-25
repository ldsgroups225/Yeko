import type { Installment, InstallmentInsert, InstallmentStatus } from '../drizzle/school-schema'
import { getDb } from '../database/setup'
import { installments, paymentPlans, students } from '../drizzle/school-schema'
import { and, eq, lt, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export interface GetInstallmentsParams {
  paymentPlanId?: string
  status?: InstallmentStatus
}

export async function getInstallments(params: GetInstallmentsParams): Promise<Installment[]> {
  const db = getDb()
  const { paymentPlanId, status } = params
  const conditions = []
  if (paymentPlanId)
    conditions.push(eq(installments.paymentPlanId, paymentPlanId))
  if (status)
    conditions.push(eq(installments.status, status))

  if (conditions.length === 0)
    return []
  return db.select().from(installments).where(and(...conditions))
}

export async function getInstallmentById(installmentId: string): Promise<Installment | null> {
  const db = getDb()
  const [installment] = await db.select().from(installments).where(eq(installments.id, installmentId)).limit(1)
  return installment ?? null
}

export async function getInstallmentsByPaymentPlan(paymentPlanId: string): Promise<Installment[]> {
  const db = getDb()
  return db.select().from(installments).where(eq(installments.paymentPlanId, paymentPlanId)).orderBy(installments.installmentNumber)
}

export type CreateInstallmentData = Omit<InstallmentInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createInstallment(data: CreateInstallmentData): Promise<Installment> {
  const db = getDb()
  const [installment] = await db.insert(installments).values({ id: nanoid(), ...data }).returning()
  if (!installment) {
    throw new Error('Failed to create installment')
  }
  return installment
}

export async function createInstallmentsBulk(dataList: CreateInstallmentData[]): Promise<Installment[]> {
  const db = getDb()
  if (dataList.length === 0)
    return []
  const values = dataList.map(data => ({ id: nanoid(), ...data }))
  return db.insert(installments).values(values).returning()
}

export async function waiveInstallment(installmentId: string): Promise<Installment | undefined> {
  const db = getDb()
  const [installment] = await db
    .update(installments)
    .set({ status: 'waived', balance: '0', updatedAt: new Date() })
    .where(eq(installments.id, installmentId))
    .returning()
  return installment
}

export async function getOverdueInstallments(schoolYearId: string): Promise<Array<Installment & { studentId: string }>> {
  const db = getDb()
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
}

export async function updateOverdueInstallments(schoolYearId: string): Promise<number> {
  const db = getDb()
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

export async function getOverdueInstallmentsWithStudents(schoolYearId: string): Promise<OverdueInstallmentWithStudent[]> {
  const db = getDb()
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
}
