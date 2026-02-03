import type { PaymentPlanTemplate, PaymentPlanTemplateInsert } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { paymentPlanTemplates } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

export interface GetPaymentPlanTemplatesParams {
  schoolId: string
  schoolYearId: string
  includeInactive?: boolean
}

export function getPaymentPlanTemplates(params: GetPaymentPlanTemplatesParams): ResultAsync<PaymentPlanTemplate[], DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, includeInactive = false } = params

  return ResultAsync.fromPromise(
    (async () => {
      const conditions = [eq(paymentPlanTemplates.schoolId, schoolId), eq(paymentPlanTemplates.schoolYearId, schoolYearId)]
      if (!includeInactive)
        conditions.push(eq(paymentPlanTemplates.status, 'active'))

      return db.select().from(paymentPlanTemplates).where(and(...conditions))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment plan templates'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId }))
}

export function getPaymentPlanTemplateById(templateId: string): ResultAsync<PaymentPlanTemplate | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(paymentPlanTemplates).where(eq(paymentPlanTemplates.id, templateId)).limit(1).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment plan template by ID'),
  ).mapErr(tapLogErr(databaseLogger, { templateId }))
}

export function getDefaultPaymentPlanTemplate(schoolId: string, schoolYearId: string): ResultAsync<PaymentPlanTemplate | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(paymentPlanTemplates)
      .where(and(
        eq(paymentPlanTemplates.schoolId, schoolId),
        eq(paymentPlanTemplates.schoolYearId, schoolYearId),
        eq(paymentPlanTemplates.isDefault, true),
        eq(paymentPlanTemplates.status, 'active'),
      ))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch default payment plan template'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId }))
}

export type CreatePaymentPlanTemplateData = Omit<PaymentPlanTemplateInsert, 'id' | 'createdAt' | 'updatedAt'>

export function createPaymentPlanTemplate(data: CreatePaymentPlanTemplateData): ResultAsync<PaymentPlanTemplate, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [template] = await db.insert(paymentPlanTemplates).values({ id: crypto.randomUUID(), ...data }).returning()
      if (!template) {
        throw dbError('INTERNAL_ERROR', 'Failed to create payment plan template')
      }
      return template
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create payment plan template'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId }))
}

export type UpdatePaymentPlanTemplateData = Partial<Omit<PaymentPlanTemplateInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export function updatePaymentPlanTemplate(
  templateId: string,
  data: UpdatePaymentPlanTemplateData,
): ResultAsync<PaymentPlanTemplate | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [template] = await db
        .update(paymentPlanTemplates)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(paymentPlanTemplates.id, templateId))
        .returning()
      return template
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update payment plan template'),
  ).mapErr(tapLogErr(databaseLogger, { templateId }))
}

export function deletePaymentPlanTemplate(templateId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(paymentPlanTemplates).where(eq(paymentPlanTemplates.id, templateId)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete payment plan template'),
  ).mapErr(tapLogErr(databaseLogger, { templateId }))
}

export function setDefaultPaymentPlanTemplate(
  schoolId: string,
  schoolYearId: string,
  templateId: string,
): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // Remove default from all templates for this school/year
      await tx
        .update(paymentPlanTemplates)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(eq(paymentPlanTemplates.schoolId, schoolId), eq(paymentPlanTemplates.schoolYearId, schoolYearId)))

      // Set the new default
      await tx
        .update(paymentPlanTemplates)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(paymentPlanTemplates.id, templateId))
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to set default payment plan template'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId, templateId }))
}
