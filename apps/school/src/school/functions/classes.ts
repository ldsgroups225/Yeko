import type { ClassFilters } from '@repo/data-ops/queries/classes'
import { Result as R } from '@praha/byethrow'
import * as classQueries from '@repo/data-ops/queries/classes'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

const classSchema = z.object({
  schoolYearId: z.string(),
  gradeId: z.string(),
  seriesId: z.string().nullable().optional(),
  section: z.string().min(1).max(10),
  classroomId: z.string().nullable().optional(),
  homeroomTeacherId: z.string().nullable().optional(),
  maxStudents: z.number().int().min(1).max(100).default(40),
  status: z.enum(['active', 'archived']).default('active'),
})

export const getClasses = authServerFn
  .inputValidator(
    z.object({
      schoolYearId: z.string().nullish(),
      gradeId: z.string().optional(),
      seriesId: z.string().optional(),
      status: z.enum(['active', 'archived']).optional(),
      search: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('classes', 'view')

    // Filter out null values to match ClassFilters type
    const filters: ClassFilters = {
      ...data,
      schoolId,
      schoolYearId: data.schoolYearId ?? undefined,
      status: data.status,
    }

    const _result1 = await classQueries.getClasses(filters)
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des classes' }
    return { success: true as const, data: _result1.value }
  })

export const getClassById = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('classes', 'view')

    const _result2 = await classQueries.getClassById(schoolId, id)
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération de la classe' }
    return { success: true as const, data: _result2.value }
  })

export const createClass = authServerFn
  .inputValidator(classSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'create')

    const _result3 = await classQueries.createClass(schoolId, {
      ...data,
      schoolId,
      id: crypto.randomUUID(),
    })
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de la création de la classe' }
    if (!_result3.value)
      return { success: false as const, error: 'La création de la classe a échoué' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'classes',
      recordId: _result3.value.id,
      newValues: data,
    })
    return { success: true as const, data: _result3.value }
  })

export const updateClass = authServerFn
  .inputValidator(
    z.object({
      id: z.string(),
      updates: classSchema.partial(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const oldClassResult = await classQueries.getClassById(schoolId, data.id)
    const oldClass = R.isSuccess(oldClassResult) ? oldClassResult.value.class : undefined

    const _result4 = await classQueries.updateClass(schoolId, data.id, data.updates)
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de la mise à jour de la classe' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'classes',
      recordId: data.id,
      oldValues: oldClass,
      newValues: data.updates,
    })
    return { success: true as const, data: _result4.value }
  })

export const deleteClass = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'delete')

    const oldClassResult = await classQueries.getClassById(schoolId, id)
    const oldClass = R.isSuccess(oldClassResult) ? oldClassResult.value.class : undefined

    const _result5 = await classQueries.deleteClass(schoolId, id)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de la suppression de la classe' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'classes',
      recordId: id,
      oldValues: oldClass,
    })
    return { success: true as const, data: { success: true } }
  })
