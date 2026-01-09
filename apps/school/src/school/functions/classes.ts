import * as classQueries from '@repo/data-ops/queries/classes'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

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

export const getClasses = createServerFn()
  .inputValidator(
    z.object({
      schoolYearId: z.string().nullish(),
      gradeId: z.string().optional(),
      seriesId: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'view')

    // IconFilter out null values to match ClassFilters type
    const filters = {
      ...data,
      schoolId: context.schoolId,
      schoolYearId: data.schoolYearId ?? undefined,
    }

    return await classQueries.getClasses(filters)
  })

export const getClassById = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'view')
    return await classQueries.getClassById(id)
  })

export const createClass = createServerFn()
  .inputValidator(classSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'create')
    const newClass = await classQueries.createClass({
      ...data,
      schoolId: context.schoolId,
      id: crypto.randomUUID(),
    })

    // Audit log
    if (newClass) {
      await createAuditLog({
        schoolId: context.schoolId,
        userId: context.userId,
        action: 'create',
        tableName: 'classes',
        recordId: newClass.id,
        newValues: data,
      })
    }

    return newClass
  })

export const updateClass = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      updates: classSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'edit')

    // Get old values for audit
    const oldClass = await classQueries.getClassById(data.id)
    const updated = await classQueries.updateClass(data.id, data.updates)

    // Audit log
    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'classes',
      recordId: data.id,
      oldValues: oldClass?.class,
      newValues: data.updates,
    })

    return updated
  })

export const deleteClass = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'delete')

    // Get old values for audit
    const oldClass = await classQueries.getClassById(id)
    await classQueries.deleteClass(id)

    // Audit log
    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'classes',
      recordId: id,
      oldValues: oldClass?.class,
    })

    return { success: true }
  })
