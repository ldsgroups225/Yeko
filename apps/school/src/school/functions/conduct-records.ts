import {
  addConductFollowUp,
  completeFollowUp,
  createConductRecord,
  deleteConductRecord,
  deleteFollowUp,
  getConductRecord,
  getConductRecords,
  getStudentConductSummary,
  markConductParentAcknowledged,
  markConductParentNotified,
  updateConductRecord,
  updateConductStatus,
} from '@repo/data-ops/queries/conduct-records'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'

import { conductFollowUpSchema, conductRecordSchema, updateConductStatusSchema } from '@/schemas/conduct-record'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

/**
 * Get conduct records with filters
 */
export const listConductRecords = authServerFn
  .inputValidator(z.object({
    schoolYearId: z.string(),
    studentId: z.string().optional(),
    classId: z.string().optional(),
    type: z.enum(['incident', 'sanction', 'reward', 'note']).optional(),
    category: z.enum(['behavior', 'academic', 'attendance', 'uniform', 'property', 'violence', 'bullying', 'cheating', 'achievement', 'improvement', 'other']).optional(),
    status: z.enum(['open', 'investigating', 'pending_decision', 'resolved', 'closed', 'appealed']).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('conduct', 'view')
      const result = await getConductRecords({
        schoolId: context.school.schoolId,
        ...data,
      })
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération des dossiers de conduite' }
    }
  })

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
      // TODO: Implement actual notification sending
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
 * Get student conduct summary
 */
export const getStudentSummary = authServerFn
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('conduct', 'view')
      const result = await getStudentConductSummary(data.studentId, data.schoolYearId)
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération du résumé de conduite' }
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
