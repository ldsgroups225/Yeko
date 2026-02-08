import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import {
  createPaymentPlanTemplate as createPaymentPlanTemplateQuery,
  deletePaymentPlanTemplate as deletePaymentPlanTemplateQuery,
  getPaymentPlanTemplatesBySchool,
  updatePaymentPlanTemplate as updatePaymentPlanTemplateQuery,
} from '@repo/data-ops/queries/school-admin/payment-plan-templates'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

export const getPaymentPlanTemplates = authServerFn
  .inputValidator(z.object({ schoolYearId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('finance', 'view')
    return (await getPaymentPlanTemplatesBySchool(context.school.schoolId, data.schoolYearId)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des modèles de plan de paiement' }),
    )
  })

export const createPaymentPlanTemplate = authServerFn
  .inputValidator(
    z.object({
      schoolYearId: z.string().min(1),
      name: z.string().min(1, 'Nom requis'),
      nameEn: z.string().optional(),
      installmentsCount: z.number().int().min(1),
      schedule: z.array(
        z.object({
          number: z.number().int(),
          percentage: z.number(),
          dueDaysFromStart: z.number().int(),
          label: z.string(),
        }),
      ),
      isDefault: z.boolean().optional().default(false),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'edit')

    return (await createPaymentPlanTemplateQuery({
      schoolId,
      ...data,
    })).match(
      async (template) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'payment_plan_templates',
          recordId: template.id,
          newValues: data,
        })
        return { success: true as const, data: template }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la création du modèle de plan de paiement' }),
    )
  })

export const updatePaymentPlanTemplate = authServerFn
  .inputValidator(
    z.object({
      id: z.string().min(1),
      name: z.string().optional(),
      nameEn: z.string().optional(),
      installmentsCount: z.number().int().optional(),
      schedule: z.array(
        z.object({
          number: z.number().int(),
          percentage: z.number(),
          dueDaysFromStart: z.number().int(),
          label: z.string(),
        }),
      ).optional(),
      isDefault: z.boolean().optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'edit')

    const { id, ...updateData } = data
    return (await updatePaymentPlanTemplateQuery(id, schoolId, updateData)).match(
      async (template) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'payment_plan_templates',
          recordId: id,
          newValues: data,
        })
        return { success: true as const, data: template }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la mise à jour du modèle de plan de paiement' }),
    )
  })

export const deletePaymentPlanTemplate = authServerFn
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'delete')

    return (await deletePaymentPlanTemplateQuery(data.id, schoolId)).match(
      async () => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'delete',
          tableName: 'payment_plan_templates',
          recordId: data.id,
        })
        return { success: true as const, data: { success: true } }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la suppression du modèle de plan de paiement' }),
    )
  })
