import { DatabaseError } from '@repo/data-ops/errors'
import * as classQueries from '@repo/data-ops/queries/classes'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createAuthenticatedServerFn } from '../lib/server-fn'
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

export const getClasses = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      schoolYearId: z.string().nullish(),
      gradeId: z.string().optional(),
      seriesId: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('classes', 'view')

    // Filter out null values to match ClassFilters type
    const filters: classQueries.ClassFilters = {
      ...data,
      schoolId: school.schoolId,
      schoolYearId: data.schoolYearId ?? undefined,
      status: data.status as any,
    }

    const result = await classQueries.getClasses(filters)
    if (result.isErr()) {
      throw result.error
    }
    return result.value
  })

export const getClassById = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('classes', 'view')

    const result = await classQueries.getClassById(school.schoolId, id)
    if (result.isErr()) {
      throw result.error
    }
    return result.value
  })

export const createClass = createAuthenticatedServerFn()
  .inputValidator(classSchema)
  .handler(async ({ data, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('classes', 'create')

    const result = await classQueries.createClass(school.schoolId, {
      ...data,
      schoolId: school.schoolId,
      id: crypto.randomUUID(),
    })

    if (result.isErr()) {
      throw result.error
    }

    const newClass = result.value
    if (!newClass)
      throw new DatabaseError('INTERNAL_ERROR', 'Failed to create class')
    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'create',
      tableName: 'classes',
      recordId: newClass.id,
      newValues: data,
    })

    return newClass
  })

export const updateClass = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      updates: classSchema.partial(),
    }),
  )
  .handler(async ({ data, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('classes', 'edit')

    const oldClassResult = await classQueries.getClassById(school.schoolId, data.id)
    const oldClass = oldClassResult.isOk() ? oldClassResult.value.class : undefined

    const result = await classQueries.updateClass(school.schoolId, data.id, data.updates)
    if (result.isErr()) {
      throw result.error
    }

    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'update',
      tableName: 'classes',
      recordId: data.id,
      oldValues: oldClass,
      newValues: data.updates,
    })

    return result.value
  })

export const deleteClass = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('classes', 'delete')

    const oldClassResult = await classQueries.getClassById(school.schoolId, id)
    const oldClass = oldClassResult.isOk() ? oldClassResult.value.class : undefined

    const result = await classQueries.deleteClass(school.schoolId, id)
    if (result.isErr()) {
      throw result.error
    }

    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'delete',
      tableName: 'classes',
      recordId: id,
      oldValues: oldClass,
    })

    return { success: true }
  })
