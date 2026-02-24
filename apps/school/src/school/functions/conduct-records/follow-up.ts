import {
  addConductFollowUp,
  completeFollowUp,
  deleteFollowUp,
  markConductParentAcknowledged,
  markConductParentNotified,
} from '@repo/data-ops/queries/conduct-records'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { conductFollowUpSchema } from '@/schemas/conduct-record'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Add follow-up to conduct record
 */
export const addFollowUp = authServerFn
  .inputValidator(conductFollowUpSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('conduct', 'edit')
      const result = await addConductFollowUp({
        ...data,
        createdBy: userId,
      })

      if (!result) {
        throw new Error('Failed to add follow-up')
      }

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'conduct_follow_ups',
        recordId: result.id,
        newValues: data,
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de l\'ajout du suivi' }
    }
  })

/**
 * Complete a follow-up
 */
export const markFollowUpComplete = authServerFn
  .inputValidator(z.object({
    id: z.string(),
    outcome: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('conduct', 'edit')
      const result = await completeFollowUp(data.id, data.outcome)

      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'conduct_follow_ups',
        recordId: data.id,
        newValues: { completedAt: new Date(), outcome: data.outcome },
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la clôture du suivi' }
    }
  })

/**
 * Notify parent of conduct record
 */
export const notifyParentOfConduct = authServerFn
  .inputValidator(z.object({
    conductRecordId: z.string(),
    method: z.enum(['email', 'sms', 'in_app']),
    message: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('conduct', 'edit')
      const result = await markConductParentNotified(data.conductRecordId)

      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'conduct_records',
        recordId: data.conductRecordId,
        newValues: { parentNotified: true, method: data.method },
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la notification des parents' }
    }
  })

/**
 * Mark parent acknowledged
 */
export const markParentAcknowledged = authServerFn
  .inputValidator(z.object({
    conductRecordId: z.string(),
    response: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('conduct', 'edit')
      const result = await markConductParentAcknowledged(
        data.conductRecordId,
        data.response,
      )

      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'conduct_records',
        recordId: data.conductRecordId,
        newValues: { parentAcknowledged: true, response: data.response },
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de l\'enregistrement de l\'accusé de réception' }
    }
  })

/**
 * Delete follow-up
 */
export const removeFollowUp = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('conduct', 'delete')
      await deleteFollowUp(data.id)

      await createAuditLog({
        schoolId,
        userId,
        action: 'delete',
        tableName: 'conduct_follow_ups',
        recordId: data.id,
      })

      return { success: true as const, data: { success: true } }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la suppression du suivi' }
    }
  })
