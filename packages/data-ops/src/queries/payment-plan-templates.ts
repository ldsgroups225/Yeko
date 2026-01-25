import type { PaymentPlanTemplate, PaymentPlanTemplateInsert } from '../drizzle/school-schema'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { paymentPlanTemplates } from '../drizzle/school-schema'

export interface GetPaymentPlanTemplatesParams {
  schoolId: string
  schoolYearId: string
  includeInactive?: boolean
}

export async function getPaymentPlanTemplates(params: GetPaymentPlanTemplatesParams): Promise<PaymentPlanTemplate[]> {
  const db = getDb()
  const { schoolId, schoolYearId, includeInactive = false } = params
  const conditions = [eq(paymentPlanTemplates.schoolId, schoolId), eq(paymentPlanTemplates.schoolYearId, schoolYearId)]
  if (!includeInactive)
    conditions.push(eq(paymentPlanTemplates.status, 'active'))

  return db.select().from(paymentPlanTemplates).where(and(...conditions))
}

export async function getPaymentPlanTemplateById(templateId: string): Promise<PaymentPlanTemplate | null> {
  const db = getDb()
  const [template] = await db.select().from(paymentPlanTemplates).where(eq(paymentPlanTemplates.id, templateId)).limit(1)
  return template ?? null
}

export async function getDefaultPaymentPlanTemplate(schoolId: string, schoolYearId: string): Promise<PaymentPlanTemplate | null> {
  const db = getDb()
  const [template] = await db
    .select()
    .from(paymentPlanTemplates)
    .where(and(
      eq(paymentPlanTemplates.schoolId, schoolId),
      eq(paymentPlanTemplates.schoolYearId, schoolYearId),
      eq(paymentPlanTemplates.isDefault, true),
      eq(paymentPlanTemplates.status, 'active'),
    ))
    .limit(1)
  return template ?? null
}

export type CreatePaymentPlanTemplateData = Omit<PaymentPlanTemplateInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createPaymentPlanTemplate(data: CreatePaymentPlanTemplateData): Promise<PaymentPlanTemplate> {
  const db = getDb()
  const [template] = await db.insert(paymentPlanTemplates).values({ id: crypto.randomUUID(), ...data }).returning()
  if (!template) {
    throw new Error('Failed to create payment plan template')
  }
  return template
}

export type UpdatePaymentPlanTemplateData = Partial<Omit<PaymentPlanTemplateInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export async function updatePaymentPlanTemplate(
  templateId: string,
  data: UpdatePaymentPlanTemplateData,
): Promise<PaymentPlanTemplate | undefined> {
  const db = getDb()
  const [template] = await db
    .update(paymentPlanTemplates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(paymentPlanTemplates.id, templateId))
    .returning()
  return template
}

export async function deletePaymentPlanTemplate(templateId: string): Promise<void> {
  const db = getDb()
  await db.delete(paymentPlanTemplates).where(eq(paymentPlanTemplates.id, templateId))
}

export async function setDefaultPaymentPlanTemplate(
  schoolId: string,
  schoolYearId: string,
  templateId: string,
): Promise<void> {
  const db = getDb()
  // Remove default from all templates for this school/year
  await db
    .update(paymentPlanTemplates)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(paymentPlanTemplates.schoolId, schoolId), eq(paymentPlanTemplates.schoolYearId, schoolYearId)))

  // Set the new default
  await db
    .update(paymentPlanTemplates)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(paymentPlanTemplates.id, templateId))
}
