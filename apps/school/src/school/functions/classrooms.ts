import { Result as R } from '@praha/byethrow'
import * as classroomQueries from '@repo/data-ops/queries/classrooms'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

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

export const getClassrooms = authServerFn
  .inputValidator(
    z.object({
      type: classroomSchema.shape.type.optional(),
      status: classroomSchema.shape.status.optional(),
      search: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classrooms', 'view')
    const _result1 = await classroomQueries.getClassrooms({ ...data, schoolId: context.school.schoolId })
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des salles' }
    return { success: true as const, data: _result1.value }
  })

export const getClassroomById = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classrooms', 'view')
    const _result2 = await classroomQueries.getClassroomById(id)
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération de la salle' }
    return { success: true as const, data: _result2.value }
  })

export const createClassroom = authServerFn
  .inputValidator(classroomSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classrooms', 'create')

    const _result3 = await classroomQueries.createClassroom({
      ...data,
      schoolId,
      id: crypto.randomUUID(),
    })
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de la création de la salle' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'classrooms',
      recordId: _result3.value.id,
      newValues: data,
    })
    return { success: true as const, data: _result3.value }
  })

export const updateClassroom = authServerFn
  .inputValidator(
    z.object({
      id: z.string(),
      updates: classroomSchema.partial(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classrooms', 'edit')

    const oldResult = await classroomQueries.getClassroomById(data.id)
    if (R.isFailure(oldResult))
      return { success: false as const, error: 'Salle non trouvée' }
    const oldClassroom = oldResult.value

    const _result4 = await classroomQueries.updateClassroom(data.id, data.updates)
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de la mise à jour de la salle' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'classrooms',
      recordId: data.id,
      oldValues: oldClassroom?.classroom,
      newValues: data.updates,
    })
    return { success: true as const, data: _result4.value }
  })

export const deleteClassroom = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classrooms', 'delete')

    const oldResult = await classroomQueries.getClassroomById(id)
    if (R.isFailure(oldResult))
      return { success: false as const, error: 'Salle non trouvée' }
    const oldClassroom = oldResult.value

    const _result5 = await classroomQueries.deleteClassroom(id)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de la suppression de la salle' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'classrooms',
      recordId: id,
      oldValues: oldClassroom?.classroom,
    })
    return { success: true as const, data: { success: true } }
  })
