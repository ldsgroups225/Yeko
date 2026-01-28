import * as parentQueries from '@repo/data-ops/queries/parents'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { DatabaseError } from '@repo/data-ops/errors'
import { z } from 'zod'
import { createAuthenticatedServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

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
  email: z.email().optional().or(z.literal('')),
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

export const getParents = createAuthenticatedServerFn()
  .inputValidator(parentFiltersSchema)
  .handler(async ({ data, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')
    
    await requirePermission('students', 'view') // Parents access tied to students
    
    const result = await parentQueries.getParents(school.schoolId, data as any)
    if (result.isErr()) {
        throw result.error
    }
    return result.value
  })

export const getParentById = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')
    
    await requirePermission('students', 'view')
    
    const result = await parentQueries.getParentById(id)
    if (result.isErr()) {
        throw result.error
    }
    return result.value
  })

export const createParent = createAuthenticatedServerFn()
  .inputValidator(parentSchema)
  .handler(async ({ data, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')
    await requirePermission('students', 'create')

    const result = await parentQueries.createParent(data)
    if (result.isErr()) throw result.error
    const parent = result.value

    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'create',
      tableName: 'parents',
      recordId: parent.id,
      newValues: data,
    })

    return parent
  })

export const updateParent = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      updates: parentSchema.partial(),
    }),
  )
  .handler(async ({ data, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')
    await requirePermission('students', 'edit')

    const result = await parentQueries.updateParent(data.id, data.updates)
    if (result.isErr()) throw result.error
    const parent = result.value

    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'update',
      tableName: 'parents',
      recordId: data.id,
      newValues: data.updates,
    })

    return parent
  })

export const deleteParent = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')
    await requirePermission('students', 'delete')

    const result = await parentQueries.deleteParent(id)
    if (result.isErr()) throw result.error

    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'delete',
      tableName: 'parents',
      recordId: id,
    })

    return { success: true }
  })

export const linkParentToStudent = createAuthenticatedServerFn()
  .inputValidator(linkParentSchema)
  .handler(async ({ data, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')
    await requirePermission('students', 'edit')

    const result = await parentQueries.linkParentToStudent(data)
    if (result.isErr()) throw result.error
    const link = result.value

    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'create',
      tableName: 'student_parents',
      recordId: link!.id,
      newValues: data,
    })

    return link
  })

export const unlinkParentFromStudent = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      studentId: z.string(),
      parentId: z.string(),
    }),
  )
  .handler(async ({ data, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')
    await requirePermission('students', 'edit')

    const result = await parentQueries.unlinkParentFromStudent(data.studentId, data.parentId)
    if (result.isErr()) throw result.error

    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'delete',
      tableName: 'student_parents',
      recordId: `${data.studentId}-${data.parentId}`,
    })

    return { success: true }
  })

export const autoMatchParents = createAuthenticatedServerFn().handler(async ({ context }: any) => {
  const { school } = context
  if (!school)
    throw new DatabaseError('UNAUTHORIZED', 'No school context')
  await requirePermission('students', 'edit')
  
  const result = await parentQueries.autoMatchParents(school.schoolId)
  if (result.isErr()) throw result.error
  return result.value
})

export const sendParentInvitation = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: parentId, context }: any) => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')
    await requirePermission('students', 'edit')

    const result = await parentQueries.sendParentInvitation(parentId, school.schoolId)
    if (result.isErr()) throw result.error

    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'update',
      tableName: 'parents',
      recordId: parentId,
      newValues: { invitationStatus: 'sent' },
    })

    return result.value
  })
