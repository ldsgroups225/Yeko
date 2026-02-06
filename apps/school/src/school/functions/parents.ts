import * as parentQueries from '@repo/data-ops/queries/parents'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
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
  invitationStatus: z.enum(['pending', 'sent', 'accepted', 'expired']).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

// ==================== Server Functions ====================

export const getParents = authServerFn
  .inputValidator(parentFiltersSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'view')

    const result = await parentQueries.getParents(school.schoolId, data)
    return result.match(
      value => ({ success: true as const, data: value }),
      error => ({ success: false as const, error: error.message }),
    )
  })

export const getParentById = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'view')

    const result = await parentQueries.getParentById(id)
    return result.match(
      value => ({ success: true as const, data: value }),
      error => ({ success: false as const, error: error.message }),
    )
  })

export const createParent = authServerFn
  .inputValidator(parentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'create')

    const result = await parentQueries.createParent(data)
    return result.match(
      async (parent) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'create',
          tableName: 'parents',
          recordId: parent.id,
          newValues: data,
        })
        return { success: true as const, data: parent }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const updateParent = authServerFn
  .inputValidator(
    z.object({
      id: z.string(),
      updates: parentSchema.partial(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'edit')

    const result = await parentQueries.updateParent(data.id, data.updates)
    return result.match(
      async (parent) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'update',
          tableName: 'parents',
          recordId: data.id,
          newValues: data.updates,
        })
        return { success: true as const, data: parent }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const deleteParent = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'delete')

    const result = await parentQueries.deleteParent(id)
    return result.match(
      async () => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'delete',
          tableName: 'parents',
          recordId: id,
        })
        return { success: true as const, data: { success: true } }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const linkParentToStudent = authServerFn
  .inputValidator(linkParentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'edit')

    const result = await parentQueries.linkParentToStudent(data)
    return result.match(
      async (link) => {
        if (!link)
          return { success: false as const, error: 'Lien parent-étudiant échoué' }

        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'create',
          tableName: 'student_parents',
          recordId: link.id,
          newValues: data,
        })
        return { success: true as const, data: link }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const unlinkParentFromStudent = authServerFn
  .inputValidator(
    z.object({
      studentId: z.string(),
      parentId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'edit')

    const result = await parentQueries.unlinkParentFromStudent(data.studentId, data.parentId)
    return result.match(
      async () => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'delete',
          tableName: 'student_parents',
          recordId: `${data.studentId}-${data.parentId}`,
        })
        return { success: true as const, data: { success: true } }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const autoMatchParents = authServerFn.handler(async ({ context }) => {
  if (!context?.school)
    return { success: false as const, error: 'Établissement non sélectionné' }

  const { school } = context
  await requirePermission('students', 'edit')

  const result = await parentQueries.autoMatchParents(school.schoolId)
  return result.match(
    value => ({ success: true as const, data: value }),
    error => ({ success: false as const, error: error.message }),
  )
})

export const sendParentInvitation = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: parentId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'edit')

    const result = await parentQueries.sendParentInvitation(parentId, school.schoolId)
    return result.match(
      async (value) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'update',
          tableName: 'parents',
          recordId: parentId,
          newValues: { invitationStatus: 'sent' },
        })
        return { success: true as const, data: value }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })
