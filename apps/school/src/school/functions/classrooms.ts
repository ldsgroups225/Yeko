import * as classroomQueries from '@repo/data-ops/queries/classrooms'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

const classroomSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  type: z.enum(['regular', 'lab', 'gym', 'library', 'auditorium']),
  capacity: z.number().int().min(1).max(200).default(30),
  floor: z.string().max(20).optional(),
  building: z.string().max(50).optional(),
  equipment: z
    .object({
      projector: z.boolean().optional(),
      computers: z.number().int().optional(),
      whiteboard: z.boolean().optional(),
      smartboard: z.boolean().optional(),
      ac: z.boolean().optional(),
      other: z.array(z.string()).optional(),
    })
    .optional(),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
  notes: z.string().optional(),
})

export const getClassrooms = createServerFn()
  .inputValidator(
    z.object({
      type: classroomSchema.shape.type.optional(),
      status: classroomSchema.shape.status.optional(),
      search: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classrooms', 'view')
    return await classroomQueries.getClassrooms({ ...data, schoolId: context.schoolId })
  })

export const getClassroomById = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classrooms', 'view')
    return await classroomQueries.getClassroomById(id)
  })

export const createClassroom = createServerFn()
  .inputValidator(classroomSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classrooms', 'create')
    const classroom = await classroomQueries.createClassroom({
      ...data,
      schoolId: context.schoolId,
      id: crypto.randomUUID(),
    })

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'create',
      tableName: 'classrooms',
      recordId: classroom!.id,
      newValues: data,
    })

    return classroom
  })

export const updateClassroom = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      updates: classroomSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classrooms', 'edit')

    const oldClassroom = await classroomQueries.getClassroomById(data.id)
    const updated = await classroomQueries.updateClassroom(data.id, data.updates)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'classrooms',
      recordId: data.id,
      oldValues: oldClassroom?.classroom,
      newValues: data.updates,
    })

    return updated
  })

export const deleteClassroom = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classrooms', 'delete')

    const oldClassroom = await classroomQueries.getClassroomById(id)
    await classroomQueries.deleteClassroom(id)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'classrooms',
      recordId: id,
      oldValues: oldClassroom?.classroom,
    })

    return { success: true }
  })
