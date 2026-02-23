import type { PaymentPlanTemplateInsert } from '../../drizzle/school-schema'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { paymentPlanTemplates } from '../../drizzle/school-schema'
import { DatabaseError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'
import { SCHOOL_ERRORS } from './constants'

export async function getPaymentPlanTemplatesBySchool(
  schoolId: string,
  schoolYearId: string,
): R.ResultAsync<typeof paymentPlanTemplates.$inferSelect[], DatabaseError> {
  if (!schoolId) {
    return R.fail(new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT))
  }

  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        return await db
          .select()
          .from(paymentPlanTemplates)
          .where(and(eq(paymentPlanTemplates.schoolId, schoolId), eq(paymentPlanTemplates.schoolYearId, schoolYearId)))
          .orderBy(desc(paymentPlanTemplates.createdAt))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('paymentPlanTemplate', 'fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId, action: 'get_payment_plan_templates' })),
  )
}

export async function createPaymentPlanTemplate(
  data: Omit<PaymentPlanTemplateInsert, 'id'>,
): R.ResultAsync<typeof paymentPlanTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const insertData: PaymentPlanTemplateInsert = {
          ...data,
          id: crypto.randomUUID(),
        }

        const [template] = await db.insert(paymentPlanTemplates).values(insertData).returning()

        if (!template)
          throw new Error(getNestedErrorMessage('paymentPlanTemplate', 'createFailed'))
        return template
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('paymentPlanTemplate', 'createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId, action: 'create_payment_plan_template' })),
  )
}

export async function updatePaymentPlanTemplate(
  templateId: string,
  schoolId: string,
  data: Partial<Omit<PaymentPlanTemplateInsert, 'id' | 'schoolId' | 'schoolYearId'>>,
): R.ResultAsync<typeof paymentPlanTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [updated] = await db
          .update(paymentPlanTemplates)
          .set(data)
          .where(and(eq(paymentPlanTemplates.id, templateId), eq(paymentPlanTemplates.schoolId, schoolId)))
          .returning()

        if (!updated)
          throw new Error(getNestedErrorMessage('paymentPlanTemplate', 'updateFailed'))
        return updated
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('paymentPlanTemplate', 'updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { templateId, schoolId, action: 'update_payment_plan_template' })),
  )
}

export async function deletePaymentPlanTemplate(
  templateId: string,
  schoolId: string,
): R.ResultAsync<{ success: boolean }, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        await db.delete(paymentPlanTemplates).where(and(eq(paymentPlanTemplates.id, templateId), eq(paymentPlanTemplates.schoolId, schoolId)))
        return { success: true }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('paymentPlanTemplate', 'deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { templateId, schoolId, action: 'delete_payment_plan_template' })),
  )
}
