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
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { conductFollowUpSchema, conductRecordSchema, updateConductStatusSchema } from '@/schemas/conduct-record'
import { getSchoolContext } from '../middleware/school-context'

/**
 * Get conduct records with filters
 */
export const listConductRecords = createServerFn()
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
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getConductRecords({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Get single conduct record with details
 */
export const getConductRecordById = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getConductRecord(data.id)
  })

/**
 * Create conduct record
 */
export const createRecord = createServerFn()
  .inputValidator(conductRecordSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const result = await createConductRecord({
      ...data,
      schoolId: context.schoolId,
      recordedBy: context.userId,
    })

    return result
  })

/**
 * Update conduct record
 */
export const updateRecord = createServerFn()
  .inputValidator(conductRecordSchema.extend({ id: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const { id, ...updateData } = data
    const result = await updateConductRecord(id, updateData)

    return result
  })

/**
 * Update conduct status
 */
export const changeStatus = createServerFn()
  .inputValidator(updateConductStatusSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const result = await updateConductStatus({
      id: data.id,
      status: data.status,
      resolutionNotes: data.resolutionNotes ?? undefined,
      resolvedBy: context.userId,
    })

    return result
  })

/**
 * Add follow-up to conduct record
 */
export const addFollowUp = createServerFn()
  .inputValidator(conductFollowUpSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const result = await addConductFollowUp({
      ...data,
      createdBy: context.userId,
    })

    return result
  })

/**
 * Complete a follow-up
 */
export const markFollowUpComplete = createServerFn()
  .inputValidator(z.object({
    id: z.string(),
    outcome: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const result = await completeFollowUp(data.id, data.outcome)

    return result
  })

/**
 * Notify parent of conduct record
 */
export const notifyParentOfConduct = createServerFn()
  .inputValidator(z.object({
    conductRecordId: z.string(),
    method: z.enum(['email', 'sms', 'in_app']),
    message: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    // TODO: Implement actual notification sending
    const result = await markConductParentNotified(data.conductRecordId)

    return result
  })

/**
 * Mark parent acknowledged
 */
export const markParentAcknowledged = createServerFn()
  .inputValidator(z.object({
    conductRecordId: z.string(),
    response: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const result = await markConductParentAcknowledged(
      data.conductRecordId,
      data.response,
    )

    return result
  })

/**
 * Get student conduct summary
 */
export const getStudentSummary = createServerFn()
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getStudentConductSummary(data.studentId, data.schoolYearId)
  })

/**
 * Delete conduct record
 */
export const removeRecord = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteConductRecord(data.id)
    return { success: true }
  })

/**
 * Delete follow-up
 */
export const removeFollowUp = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteFollowUp(data.id)
    return { success: true }
  })
