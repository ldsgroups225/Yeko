import * as parentQueries from '@repo/data-ops/queries/parents'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

// ==================== Schemas ====================

// IconPhone validation regex for Ivory Coast format
const phoneRegex = /^(\+225)?\d{10}$/

// Simple HTML tag stripper for text sanitization
function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .trim()
}

// Zod transform for sanitizing text fields
function sanitizedString(maxLength: number) {
  return z.string().max(maxLength).transform(val => sanitizeText(val))
}

const parentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).transform(val => sanitizeText(val)),
  lastName: z.string().min(1, 'Last name is required').max(100).transform(val => sanitizeText(val)),
  phone: z.string().min(10, 'IconPhone is required').max(20).regex(phoneRegex, 'Format invalide. Utilisez: +2250701020304 ou 0701020304'),
  phone2: z.string().max(20).regex(phoneRegex, 'Format invalide').optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: sanitizedString(500).optional(),
  occupation: sanitizedString(100).optional(),
  workplace: sanitizedString(200).optional(),
})

const linkParentSchema = z.object({
  studentId: z.string(),
  parentId: z.string(),
  relationship: z.enum(['father', 'mother', 'guardian', 'grandparent', 'sibling', 'other']),
  isPrimary: z.boolean().optional(),
  canPickup: z.boolean().optional(),
  receiveNotifications: z.boolean().optional(),
  notes: sanitizedString(500).optional(),
})

const parentFiltersSchema = z.object({
  search: z.string().optional(),
  invitationStatus: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

// ==================== Server Functions ====================

export const getParents = createServerFn()
  .inputValidator(parentFiltersSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view') // Parents access tied to students
    return await parentQueries.getParents(context.schoolId, data)
  })

export const getParentById = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')
    return await parentQueries.getParentById(id)
  })

export const createParent = createServerFn()
  .inputValidator(parentSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    const parent = await parentQueries.createParent(data)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'create',
      tableName: 'parents',
      recordId: parent.id,
      newValues: data,
    })

    return parent
  })

export const updateParent = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      updates: parentSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    const parent = await parentQueries.updateParent(data.id, data.updates)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'parents',
      recordId: data.id,
      newValues: data.updates,
    })

    return parent
  })

export const deleteParent = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'delete')

    await parentQueries.deleteParent(id)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'parents',
      recordId: id,
    })

    return { success: true }
  })

export const linkParentToStudent = createServerFn()
  .inputValidator(linkParentSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    const link = await parentQueries.linkParentToStudent(data)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'create',
      tableName: 'student_parents',
      recordId: link!.id,
      newValues: data,
    })

    return link
  })

export const unlinkParentFromStudent = createServerFn()
  .inputValidator(
    z.object({
      studentId: z.string(),
      parentId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    await parentQueries.unlinkParentFromStudent(data.studentId, data.parentId)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'student_parents',
      recordId: `${data.studentId}-${data.parentId}`,
    })

    return { success: true }
  })

export const autoMatchParents = createServerFn().handler(async () => {
  const context = await getSchoolContext()
  if (!context)
    throw new Error('No school context')
  await requirePermission('students', 'edit')
  return await parentQueries.autoMatchParents(context.schoolId)
})

export const sendParentInvitation = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: parentId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    const result = await parentQueries.sendParentInvitation(parentId, context.schoolId)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'parents',
      recordId: parentId,
      newValues: { invitationStatus: 'sent' },
    })

    return result
  })
