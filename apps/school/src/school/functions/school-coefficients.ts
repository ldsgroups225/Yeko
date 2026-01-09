import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import * as schoolCoefficientQueries from '@repo/data-ops/queries/school-coefficients'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

// ===== SCHOOL COEFFICIENTS SERVER FUNCTIONS =====

/**
 * Get all coefficients with override status for the school
 */
export const getSchoolCoefficients = createServerFn()
  .inputValidator(
    z.object({
      schoolYearTemplateId: z.string(),
      gradeId: z.string().optional(),
      seriesId: z.string().nullable().optional(),
      subjectId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'view')

    return await schoolCoefficientQueries.getSchoolCoefficients({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Get the effective coefficient for a specific combination
 */
export const getEffectiveCoefficient = createServerFn()
  .inputValidator(
    z.object({
      subjectId: z.string(),
      gradeId: z.string(),
      seriesId: z.string().nullable(),
      schoolYearTemplateId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'view')

    return await schoolCoefficientQueries.getEffectiveCoefficient({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Create a coefficient override
 */
export const createCoefficientOverride = createServerFn()
  .inputValidator(
    z.object({
      coefficientTemplateId: z.string(),
      weightOverride: z.number().min(0).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'edit')

    const result = await schoolCoefficientQueries.createCoefficientOverride({
      schoolId: context.schoolId,
      ...data,
    })

    // Audit log
    if (result) {
      await createAuditLog({
        schoolId: context.schoolId,
        userId: context.userId,
        action: 'create',
        tableName: 'school_subject_coefficients',
        recordId: result.id,
        newValues: data,
      })
    }

    return result
  })

/**
 * Update an existing coefficient override
 */
export const updateCoefficientOverride = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      weightOverride: z.number().min(0).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'edit')

    const result = await schoolCoefficientQueries.updateCoefficientOverride(
      data.id,
      data.weightOverride,
    )

    // Audit log
    if (result) {
      await createAuditLog({
        schoolId: context.schoolId,
        userId: context.userId,
        action: 'update',
        tableName: 'school_subject_coefficients',
        recordId: data.id,
        newValues: { weightOverride: data.weightOverride },
      })
    }

    return result
  })

/**
 * Delete a coefficient override (revert to template)
 */
export const deleteCoefficientOverride = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'edit')

    await schoolCoefficientQueries.deleteCoefficientOverride(id)

    // Audit log
    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'school_subject_coefficients',
      recordId: id,
    })

    return { success: true }
  })

/**
 * Bulk update coefficients (for matrix view)
 */
export const bulkUpdateSchoolCoefficients = createServerFn()
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
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'edit')

    const results = await schoolCoefficientQueries.bulkUpdateSchoolCoefficients({
      schoolId: context.schoolId,
      updates: data.updates,
    })

    // Audit log
    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'school_subject_coefficients',
      recordId: 'bulk',
      newValues: { updates: data.updates, count: results.length },
    })

    return results
  })

/**
 * Get coefficient matrix data for grid view
 */
export const getCoefficientMatrix = createServerFn()
  .inputValidator(
    z.object({
      schoolYearTemplateId: z.string(),
      seriesId: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'view')

    return await schoolCoefficientQueries.getCoefficientMatrix({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * IconCopy coefficients from one school year to another
 */
export const copySchoolCoefficientsFromYear = createServerFn()
  .inputValidator(
    z.object({
      sourceSchoolYearTemplateId: z.string(),
      targetSchoolYearTemplateId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'edit')

    const results = await schoolCoefficientQueries.copySchoolCoefficientsFromYear({
      schoolId: context.schoolId,
      ...data,
    })

    // Audit log
    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'create',
      tableName: 'school_subject_coefficients',
      recordId: 'copy',
      newValues: {
        sourceYear: data.sourceSchoolYearTemplateId,
        targetYear: data.targetSchoolYearTemplateId,
        count: results.length,
      },
    })

    return results
  })

/**
 * Reset all coefficient overrides for the school
 */
export const resetAllSchoolCoefficients = createServerFn()
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'edit')

    // Get count before reset for audit
    const stats = await schoolCoefficientQueries.getSchoolCoefficientStats(context.schoolId)

    await schoolCoefficientQueries.resetAllSchoolCoefficients(context.schoolId)

    // Audit log
    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'school_subject_coefficients',
      recordId: 'all',
      oldValues: { count: stats.totalOverrides },
    })

    return { success: true, deletedCount: stats.totalOverrides }
  })

/**
 * Get coefficient statistics for the school
 */
export const getSchoolCoefficientStats = createServerFn()
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('coefficients', 'view')

    return await schoolCoefficientQueries.getSchoolCoefficientStats(context.schoolId)
  })
