import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import * as schoolCoefficientQueries from '@repo/data-ops/queries/school-coefficients'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

// ===== SCHOOL COEFFICIENTS SERVER FUNCTIONS =====

/**
 * Get all coefficients with override status for the school
 */
export const getSchoolCoefficients = authServerFn
  .inputValidator(
    z.object({
      schoolYearTemplateId: z.string(),
      gradeId: z.string().optional(),
      seriesId: z.string().nullable().optional(),
      subjectId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('coefficients', 'view')

    const result = await schoolCoefficientQueries.getSchoolCoefficients({
      schoolId,
      ...data,
    })
    return { success: true as const, data: result }
  })

/**
 * Get the effective coefficient for a specific combination
 */
export const getEffectiveCoefficient = authServerFn
  .inputValidator(
    z.object({
      subjectId: z.string(),
      gradeId: z.string(),
      seriesId: z.string().nullable(),
      schoolYearTemplateId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('coefficients', 'view')

    const result = await schoolCoefficientQueries.getEffectiveCoefficient({
      schoolId,
      ...data,
    })
    return { success: true as const, data: result }
  })

/**
 * Create a coefficient override
 */
export const createCoefficientOverride = authServerFn
  .inputValidator(
    z.object({
      coefficientTemplateId: z.string(),
      weightOverride: z.number().min(0).max(20),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('coefficients', 'edit')

    const result = await schoolCoefficientQueries.createCoefficientOverride({
      schoolId,
      ...data,
    })

    // Audit log
    if (result) {
      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'school_subject_coefficients',
        recordId: result.id,
        newValues: data,
      })
    }

    return { success: true as const, data: result }
  })

/**
 * Update an existing coefficient override
 */
export const updateCoefficientOverride = authServerFn
  .inputValidator(
    z.object({
      id: z.string(),
      weightOverride: z.number().min(0).max(20),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('coefficients', 'edit')

    const result = await schoolCoefficientQueries.updateCoefficientOverride(
      data.id,
      data.weightOverride,
    )

    // Audit log
    if (result) {
      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'school_subject_coefficients',
        recordId: data.id,
        newValues: { weightOverride: data.weightOverride },
      })
    }

    return { success: true as const, data: result }
  })

/**
 * Delete a coefficient override (revert to template)
 */
export const deleteCoefficientOverride = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('coefficients', 'edit')

    await schoolCoefficientQueries.deleteCoefficientOverride(id)

    // Audit log
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'school_subject_coefficients',
      recordId: id,
    })

    return { success: true as const, data: { success: true } }
  })

/**
 * Bulk update coefficients (for matrix view)
 */
export const bulkUpdateSchoolCoefficients = authServerFn
  .inputValidator(
    z.object({
      updates: z.array(
        z.object({
          coefficientTemplateId: z.string(),
          weightOverride: z.number().min(0).max(20),
        }),
      ),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('coefficients', 'edit')

    const results = await schoolCoefficientQueries.bulkUpdateSchoolCoefficients({
      schoolId,
      updates: data.updates,
    })

    // Audit log
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'school_subject_coefficients',
      recordId: 'bulk',
      newValues: { updates: data.updates, count: results.length },
    })

    return { success: true as const, data: results }
  })

/**
 * Get coefficient matrix data for grid view
 */
export const getCoefficientMatrix = authServerFn
  .inputValidator(
    z.object({
      schoolYearTemplateId: z.string(),
      seriesId: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('coefficients', 'view')

    const result = await schoolCoefficientQueries.getCoefficientMatrix({
      schoolId,
      ...data,
    })
    return { success: true as const, data: result }
  })

/**
 * Copy coefficients from one school year to another
 */
export const copySchoolCoefficientsFromYear = authServerFn
  .inputValidator(
    z.object({
      sourceSchoolYearTemplateId: z.string(),
      targetSchoolYearTemplateId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('coefficients', 'edit')

    const results = await schoolCoefficientQueries.copySchoolCoefficientsFromYear({
      schoolId,
      ...data,
    })

    // Audit log
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'school_subject_coefficients',
      recordId: 'copy',
      newValues: {
        sourceYear: data.sourceSchoolYearTemplateId,
        targetYear: data.targetSchoolYearTemplateId,
        count: results.length,
      },
    })

    return { success: true as const, data: results }
  })

/**
 * Reset all coefficient overrides for the school
 */
export const resetAllSchoolCoefficients = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('coefficients', 'edit')

    // Get count before reset for audit
    const stats = await schoolCoefficientQueries.getSchoolCoefficientStats(schoolId)

    await schoolCoefficientQueries.resetAllSchoolCoefficients(schoolId)

    // Audit log
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'school_subject_coefficients',
      recordId: 'all',
      oldValues: { count: stats.totalOverrides },
    })

    return { success: true as const, data: { success: true, deletedCount: stats.totalOverrides } }
  })

/**
 * Get coefficient statistics for the school
 */
export const getSchoolCoefficientStats = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('coefficients', 'view')

    const result = await schoolCoefficientQueries.getSchoolCoefficientStats(schoolId)
    return { success: true as const, data: result }
  })
