import type { Installment, PaymentPlan, PaymentPlanInsert, PaymentPlanStatus } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { installments, paymentPlans, paymentPlanTemplates } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

export interface GetPaymentPlansParams {
  schoolYearId: string
  studentId?: string
  status?: PaymentPlanStatus
}

export function getPaymentPlans(params: GetPaymentPlansParams): ResultAsync<PaymentPlan[], DatabaseError> {
  const db = getDb()
  const { schoolYearId, studentId, status } = params

  return ResultAsync.fromPromise(
    (async () => {
      const conditions = [eq(paymentPlans.schoolYearId, schoolYearId)]
      if (studentId)
        conditions.push(eq(paymentPlans.studentId, studentId))
      if (status)
        conditions.push(eq(paymentPlans.status, status))

      return db.select().from(paymentPlans).where(and(...conditions))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment plans'),
  ).mapErr(tapLogErr(databaseLogger, { schoolYearId, studentId }))
}

export function getPaymentPlanById(paymentPlanId: string): ResultAsync<PaymentPlan | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(paymentPlans).where(eq(paymentPlans.id, paymentPlanId)).limit(1).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment plan by ID'),
  ).mapErr(tapLogErr(databaseLogger, { paymentPlanId }))
}

export function getPaymentPlanForStudent(studentId: string, schoolYearId: string): ResultAsync<PaymentPlan | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(paymentPlans)
      .where(and(eq(paymentPlans.studentId, studentId), eq(paymentPlans.schoolYearId, schoolYearId)))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment plan for student'),
  ).mapErr(tapLogErr(databaseLogger, { studentId, schoolYearId }))
}

export type CreatePaymentPlanData = Omit<PaymentPlanInsert, 'id' | 'createdAt' | 'updatedAt'>

export function createPaymentPlan(data: CreatePaymentPlanData): ResultAsync<PaymentPlan, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [plan] = await db.insert(paymentPlans).values({ id: crypto.randomUUID(), ...data }).returning()
      if (!plan) {
        throw dbError('INTERNAL_ERROR', 'Failed to create payment plan')
      }
      return plan
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create payment plan'),
  ).mapErr(tapLogErr(databaseLogger, { schoolYearId: data.schoolYearId, studentId: data.studentId }))
}

export interface CreatePaymentPlanFromTemplateData {
  studentId: string
  schoolYearId: string
  templateId: string
  totalAmount: string
  createdBy: string
  startDate: string
  notes?: string
}

export function createPaymentPlanFromTemplate(
  data: CreatePaymentPlanFromTemplateData,
): ResultAsync<{ plan: PaymentPlan, installments: Installment[] }, DatabaseError> {
  const db = getDb()
  const { studentId, schoolYearId, templateId, totalAmount, createdBy, startDate, notes } = data

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      const [template] = await tx.select().from(paymentPlanTemplates).where(eq(paymentPlanTemplates.id, templateId)).limit(1)
      if (!template)
        throw dbError('NOT_FOUND', 'Payment plan template not found')

      const [plan] = await tx
        .insert(paymentPlans)
        .values({
          id: crypto.randomUUID(),
          studentId,
          schoolYearId,
          templateId,
          totalAmount,
          balance: totalAmount,
          createdBy,
          notes,
        })
        .returning()

      if (!plan) {
        throw dbError('INTERNAL_ERROR', 'Failed to create payment plan from template')
      }

      const totalAmountNum = Number.parseFloat(totalAmount)
      const startDateObj = new Date(startDate)
      const createdInstallments: Installment[] = []

      const installmentValues = template.schedule.map((scheduleItem) => {
        const installmentAmount = ((scheduleItem.percentage / 100) * totalAmountNum).toFixed(2)
        const dueDate = new Date(startDateObj)
        dueDate.setDate(dueDate.getDate() + scheduleItem.dueDaysFromStart)

        return {
          id: crypto.randomUUID(),
          paymentPlanId: plan.id,
          installmentNumber: scheduleItem.number,
          label: scheduleItem.label,
          amount: installmentAmount,
          balance: installmentAmount,
          dueDate: dueDate.toISOString().split('T')[0]!,
        }
      })

      if (installmentValues.length > 0) {
        const inserted = await tx
          .insert(installments)
          .values(installmentValues)
          .returning()
        createdInstallments.push(...inserted)
      }

      return { plan, installments: createdInstallments }
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create payment plan from template'),
  ).mapErr(tapLogErr(databaseLogger, { studentId, templateId }))
}

export type UpdatePaymentPlanData = Partial<Pick<PaymentPlanInsert, 'status' | 'notes'>>

export function updatePaymentPlan(
  paymentPlanId: string,
  data: UpdatePaymentPlanData,
): ResultAsync<PaymentPlan | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [plan] = await db
        .update(paymentPlans)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(paymentPlans.id, paymentPlanId))
        .returning()
      return plan
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update payment plan'),
  ).mapErr(tapLogErr(databaseLogger, { paymentPlanId }))
}

export function cancelPaymentPlan(paymentPlanId: string): ResultAsync<PaymentPlan | undefined, DatabaseError> {
  return updatePaymentPlan(paymentPlanId, { status: 'cancelled' })
}

export interface PaymentPlanSummary {
  totalPlans: number
  activePlans: number
  completedPlans: number
  defaultedPlans: number
  totalExpected: number
  totalCollected: number
  totalOutstanding: number
}

export function getPaymentPlansSummary(schoolYearId: string): ResultAsync<PaymentPlanSummary, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select({
        totalPlans: sql<number>`COUNT(*)::int`,
        activePlans: sql<number>`COUNT(*) FILTER (WHERE ${paymentPlans.status} = 'active')::int`,
        completedPlans: sql<number>`COUNT(*) FILTER (WHERE ${paymentPlans.status} = 'completed')::int`,
        defaultedPlans: sql<number>`COUNT(*) FILTER (WHERE ${paymentPlans.status} = 'defaulted')::int`,
        totalExpected: sql<string>`COALESCE(SUM(${paymentPlans.totalAmount}), 0)`,
        totalCollected: sql<string>`COALESCE(SUM(${paymentPlans.paidAmount}), 0)`,
        totalOutstanding: sql<string>`COALESCE(SUM(${paymentPlans.balance}), 0)`,
      })
      .from(paymentPlans)
      .where(eq(paymentPlans.schoolYearId, schoolYearId))
      .then((rows) => {
        const result = rows[0]
        return {
          totalPlans: result?.totalPlans ?? 0,
          activePlans: result?.activePlans ?? 0,
          completedPlans: result?.completedPlans ?? 0,
          defaultedPlans: result?.defaultedPlans ?? 0,
          totalExpected: Number.parseFloat(result?.totalExpected ?? '0'),
          totalCollected: Number.parseFloat(result?.totalCollected ?? '0'),
          totalOutstanding: Number.parseFloat(result?.totalOutstanding ?? '0'),
        }
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment plans summary'),
  ).mapErr(tapLogErr(databaseLogger, { schoolYearId }))
}
