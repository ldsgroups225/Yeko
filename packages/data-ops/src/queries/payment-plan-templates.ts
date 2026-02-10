import type { PaymentPlanTemplate, PaymentPlanTemplateInsert } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { paymentPlanTemplates } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

export interface GetPaymentPlanTemplatesParams {
  schoolId: string
  schoolYearId: string
  includeInactive?: boolean
}

export async function getPaymentPlanTemplates(params: GetPaymentPlanTemplatesParams): R.ResultAsync<PaymentPlanTemplate[], DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, includeInactive = false } = params

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = [eq(paymentPlanTemplates.schoolId, schoolId), eq(paymentPlanTemplates.schoolYearId, schoolYearId)]
        if (!includeInactive)
          conditions.push(eq(paymentPlanTemplates.status, 'active'))

        return await db.select().from(paymentPlanTemplates).where(and(...conditions))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment plan templates'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId })),
  )
}

export async function getPaymentPlanTemplateById(templateId: string): R.ResultAsync<PaymentPlanTemplate | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db.select().from(paymentPlanTemplates).where(eq(paymentPlanTemplates.id, templateId)).limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch payment plan template by ID'),
    }),
    R.mapError(tapLogErr(databaseLogger, { templateId })),
  )
}

export async function getDefaultPaymentPlanTemplate(schoolId: string, schoolYearId: string): R.ResultAsync<PaymentPlanTemplate | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .select()
          .from(paymentPlanTemplates)
          .where(and(
            eq(paymentPlanTemplates.schoolId, schoolId),
            eq(paymentPlanTemplates.schoolYearId, schoolYearId),
            eq(paymentPlanTemplates.isDefault, true),
            eq(paymentPlanTemplates.status, 'active'),
          ))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch default payment plan template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId })),
  )
}

export type CreatePaymentPlanTemplateData = Omit<PaymentPlanTemplateInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createPaymentPlanTemplate(data: CreatePaymentPlanTemplateData): R.ResultAsync<PaymentPlanTemplate, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [template] = await db.insert(paymentPlanTemplates).values({ id: crypto.randomUUID(), ...data }).returning()
        if (!template) {
          throw dbError('INTERNAL_ERROR', 'Failed to create payment plan template')
        }
        return template
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create payment plan template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId })),
  )
}

export type UpdatePaymentPlanTemplateData = Partial<Omit<PaymentPlanTemplateInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export async function updatePaymentPlanTemplate(
  templateId: string,
  data: UpdatePaymentPlanTemplateData,
): R.ResultAsync<PaymentPlanTemplate | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [template] = await db
          .update(paymentPlanTemplates)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(paymentPlanTemplates.id, templateId))
          .returning()
        return template
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update payment plan template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { templateId })),
  )
}

export async function deletePaymentPlanTemplate(templateId: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(paymentPlanTemplates).where(eq(paymentPlanTemplates.id, templateId))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete payment plan template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { templateId })),
  )
}

export async function setDefaultPaymentPlanTemplate(
  schoolId: string,
  schoolYearId: string,
  templateId: string,
): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.transaction(async (tx) => {
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
        })
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to set default payment plan template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId, templateId })),
  )
}
