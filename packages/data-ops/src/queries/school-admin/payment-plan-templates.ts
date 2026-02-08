import type { PaymentPlanTemplateInsert } from '../../drizzle/school-schema'
import crypto from 'node:crypto'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq } from 'drizzle-orm'
import { errAsync, ResultAsync } from 'neverthrow'
import { getDb } from '../../database/setup'
import { paymentPlanTemplates } from '../../drizzle/school-schema'
import { DatabaseError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'
import { SCHOOL_ERRORS } from './constants'

export function getPaymentPlanTemplatesBySchool(
  schoolId: string,
  schoolYearId: string,
): ResultAsync<typeof paymentPlanTemplates.$inferSelect[], DatabaseError> {
  if (!schoolId) {
    return errAsync(new DatabaseError('VALIDATION_ERROR', SCHOOL_ERRORS.NO_SCHOOL_CONTEXT))
  }

  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .select()
      .from(paymentPlanTemplates)
      .where(and(eq(paymentPlanTemplates.schoolId, schoolId), eq(paymentPlanTemplates.schoolYearId, schoolYearId)))
      .orderBy(desc(paymentPlanTemplates.createdAt)),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('paymentPlanTemplate', 'fetchFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId, action: 'get_payment_plan_templates' }))
}

export function createPaymentPlanTemplate(
  data: Omit<PaymentPlanTemplateInsert, 'id'>,
): ResultAsync<typeof paymentPlanTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const insertData: PaymentPlanTemplateInsert = {
        ...data,
        id: crypto.randomUUID(),
      }

      const [template] = await db.insert(paymentPlanTemplates).values(insertData).returning()

      if (!template)
        throw new Error(getNestedErrorMessage('paymentPlanTemplate', 'createFailed'))
      return template
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('paymentPlanTemplate', 'createFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId, action: 'create_payment_plan_template' }))
}

export function updatePaymentPlanTemplate(
  templateId: string,
  schoolId: string,
  data: Partial<Omit<PaymentPlanTemplateInsert, 'id' | 'schoolId' | 'schoolYearId'>>,
): ResultAsync<typeof paymentPlanTemplates.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [updated] = await db
        .update(paymentPlanTemplates)
        .set(data)
        .where(and(eq(paymentPlanTemplates.id, templateId), eq(paymentPlanTemplates.schoolId, schoolId)))
        .returning()

      if (!updated)
        throw new Error(getNestedErrorMessage('paymentPlanTemplate', 'updateFailed'))
      return updated
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('paymentPlanTemplate', 'updateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { templateId, schoolId, action: 'update_payment_plan_template' }))
}

export function deletePaymentPlanTemplate(
  templateId: string,
  schoolId: string,
): ResultAsync<{ success: boolean }, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      await db.delete(paymentPlanTemplates).where(and(eq(paymentPlanTemplates.id, templateId), eq(paymentPlanTemplates.schoolId, schoolId)))
      return { success: true }
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('paymentPlanTemplate', 'deleteFailed')),
  ).mapErr(tapLogErr(databaseLogger, { templateId, schoolId, action: 'delete_payment_plan_template' }))
}
