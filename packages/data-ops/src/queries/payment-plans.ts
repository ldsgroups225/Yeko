import type { Installment, PaymentPlan, PaymentPlanInsert, PaymentPlanStatus } from '../drizzle/school-schema'
import { getDb } from '../database/setup'
import { installments, paymentPlans, paymentPlanTemplates } from '../drizzle/school-schema'
import { and, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export interface GetPaymentPlansParams {
  schoolYearId: string
  studentId?: string
  status?: PaymentPlanStatus
}

export async function getPaymentPlans(params: GetPaymentPlansParams): Promise<PaymentPlan[]> {
  const db = getDb()
  const { schoolYearId, studentId, status } = params
  const conditions = [eq(paymentPlans.schoolYearId, schoolYearId)]
  if (studentId)
    conditions.push(eq(paymentPlans.studentId, studentId))
  if (status)
    conditions.push(eq(paymentPlans.status, status))

  return db.select().from(paymentPlans).where(and(...conditions))
}

export async function getPaymentPlanById(paymentPlanId: string): Promise<PaymentPlan | null> {
  const db = getDb()
  const [plan] = await db.select().from(paymentPlans).where(eq(paymentPlans.id, paymentPlanId)).limit(1)
  return plan ?? null
}

export async function getPaymentPlanForStudent(studentId: string, schoolYearId: string): Promise<PaymentPlan | null> {
  const db = getDb()
  const [plan] = await db
    .select()
    .from(paymentPlans)
    .where(and(eq(paymentPlans.studentId, studentId), eq(paymentPlans.schoolYearId, schoolYearId)))
    .limit(1)
  return plan ?? null
}

export type CreatePaymentPlanData = Omit<PaymentPlanInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createPaymentPlan(data: CreatePaymentPlanData): Promise<PaymentPlan> {
  const db = getDb()
  const [plan] = await db.insert(paymentPlans).values({ id: nanoid(), ...data }).returning()
  if (!plan) {
    throw new Error('Failed to create payment plan')
  }
  return plan
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

export async function createPaymentPlanFromTemplate(
  data: CreatePaymentPlanFromTemplateData,
): Promise<{ plan: PaymentPlan, installments: Installment[] }> {
  const db = getDb()
  const { studentId, schoolYearId, templateId, totalAmount, createdBy, startDate, notes } = data

  return db.transaction(async (tx: any) => {
    const [template] = await tx.select().from(paymentPlanTemplates).where(eq(paymentPlanTemplates.id, templateId)).limit(1)
    if (!template)
      throw new Error('Payment plan template not found')

    const [plan] = await tx
      .insert(paymentPlans)
      .values({
        id: nanoid(),
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
      throw new Error('Failed to create payment plan from template')
    }

    const totalAmountNum = Number.parseFloat(totalAmount)
    const startDateObj = new Date(startDate)
    const createdInstallments: Installment[] = []

    for (const scheduleItem of template.schedule) {
      const installmentAmount = ((scheduleItem.percentage / 100) * totalAmountNum).toFixed(2)
      const dueDate = new Date(startDateObj)
      dueDate.setDate(dueDate.getDate() + scheduleItem.dueDaysFromStart)

      const [installment] = await tx
        .insert(installments)
        .values({
          id: nanoid(),
          paymentPlanId: plan.id,
          installmentNumber: scheduleItem.number,
          label: scheduleItem.label,
          amount: installmentAmount,
          balance: installmentAmount,
          dueDate: dueDate.toISOString().split('T')[0]!,
        })
        .returning()
      if (!installment) {
        throw new Error('Failed to create installment from template')
      }
      createdInstallments.push(installment)
    }

    return { plan, installments: createdInstallments }
  })
}

export type UpdatePaymentPlanData = Partial<Pick<PaymentPlanInsert, 'status' | 'notes'>>

export async function updatePaymentPlan(
  paymentPlanId: string,
  data: UpdatePaymentPlanData,
): Promise<PaymentPlan | undefined> {
  const db = getDb()
  const [plan] = await db
    .update(paymentPlans)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(paymentPlans.id, paymentPlanId))
    .returning()
  return plan
}

export async function cancelPaymentPlan(paymentPlanId: string): Promise<PaymentPlan | undefined> {
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

export async function getPaymentPlansSummary(schoolYearId: string): Promise<PaymentPlanSummary> {
  const db = getDb()
  const [result] = await db
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

  return {
    totalPlans: result?.totalPlans ?? 0,
    activePlans: result?.activePlans ?? 0,
    completedPlans: result?.completedPlans ?? 0,
    defaultedPlans: result?.defaultedPlans ?? 0,
    totalExpected: Number.parseFloat(result?.totalExpected ?? '0'),
    totalCollected: Number.parseFloat(result?.totalCollected ?? '0'),
    totalOutstanding: Number.parseFloat(result?.totalOutstanding ?? '0'),
  }
}
