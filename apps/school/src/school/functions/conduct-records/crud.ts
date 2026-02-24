import {
  createConductRecord,
  deleteConductRecord,
  getConductRecord,
  updateConductRecord,
  updateConductStatus,
} from '@repo/data-ops/queries/conduct-records'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { conductRecordSchema, updateConductStatusSchema } from '@/schemas/conduct-record'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Get single conduct record with details
 */
export const getConductRecordById = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('conduct', 'view')
      const result = await getConductRecord(data.id)
      if (!result)
        return { success: false as const, error: 'Dossier de conduite non trouvé' }
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération du dossier de conduite' }
    }
  })

/**
 * Create conduct record
 */
export const createRecord = authServerFn
  .inputValidator(conductRecordSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('conduct', 'create')
      const result = await createConductRecord({
        ...data,
        schoolId,
        recordedBy: userId,
      })

      if (!result) {
        throw new Error('Failed to create conduct record')
      }

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'conduct_records',
        recordId: result.id,
        newValues: data,
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la création du dossier de conduite' }
    }
  })

/**
 * Update conduct record
 */
export const updateRecord = authServerFn
  .inputValidator(conductRecordSchema.extend({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('conduct', 'edit')
      const { id, ...updateData } = data
      const result = await updateConductRecord(id, updateData)

      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'conduct_records',
        recordId: id,
        newValues: updateData,
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la mise à jour du dossier de conduite' }
    }
  })

/**
 * Update conduct status
 */
export const changeStatus = authServerFn
  .inputValidator(updateConductStatusSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('conduct', 'edit')
      const result = await updateConductStatus({
        id: data.id,
        status: data.status,
        resolutionNotes: data.resolutionNotes ?? undefined,
        resolvedBy: userId,
      })

      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'conduct_records',
        recordId: data.id,
        newValues: { status: data.status, resolutionNotes: data.resolutionNotes },
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la mise à jour du statut' }
    }
  })

/**
 * Delete conduct record
 */
export const removeRecord = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('conduct', 'delete')
      await deleteConductRecord(data.id)

      await createAuditLog({
        schoolId,
        userId,
        action: 'delete',
        tableName: 'conduct_records',
        recordId: data.id,
      })

      return { success: true as const, data: { success: true } }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la suppression du dossier de conduite' }
    }
  })
