import type { Parent, ParentInsert } from '../../drizzle/school-schema'
import type { CreateParentInput, LinkParentInput } from './types'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { parents, studentParents, students } from '../../drizzle/school-schema'
import { DatabaseError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'
import { findParentByPhone } from './bulk'

// ==================== CRUD Operations ====================

export async function createParent(data: CreateParentInput): R.ResultAsync<Parent, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        // Check if parent with same phone exists
        const checkResult = await findParentByPhone(data.phone)
        if (checkResult.type === 'Success' && checkResult.value) {
          throw new DatabaseError('CONFLICT', getNestedErrorMessage('parents', 'alreadyExistsWithPhone', { phone: data.phone }))
        }
        if (checkResult.type === 'Failure') {
          throw checkResult.error
        }

        const [parent] = await db
          .insert(parents)
          .values({
            id: crypto.randomUUID(),
            ...data,
            invitationStatus: 'pending',
          } as ParentInsert)
          .returning()

        if (!parent) {
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('parents', 'createFailed'))
        }

        return parent
      },
      catch: (e) => {
        console.error('CREATE PARENT ERROR:', e)
        return DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'createFailed'))
      },
    }),
    R.mapError(tapLogErr(databaseLogger, { action: 'create_parent' })),
  )
}

export async function updateParent(id: string, data: Partial<CreateParentInput>): R.ResultAsync<Parent, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        const [parent] = await db
          .update(parents)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(parents.id, id))
          .returning()

        if (!parent)
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('parents', 'notFound'))

        return parent
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { parentId: id, action: 'update_parent' })),
  )
}

export async function deleteParent(id: string): R.ResultAsync<void, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        // Check if parent has linked children
        const [link] = await db.select().from(studentParents).where(eq(studentParents.parentId, id))

        if (link) {
          throw new DatabaseError('CONFLICT', getNestedErrorMessage('parents', 'deleteFailed'))
        }

        await db.delete(parents).where(eq(parents.id, id))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { parentId: id, action: 'delete_parent' })),
  )
}

// ==================== Parent-Student Linking ====================

export async function linkParentToStudent(data: LinkParentInput): R.ResultAsync<typeof studentParents.$inferSelect, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()

        // 1. Parallel verification: Check if link exists AND if student belongs to school
        const [[existing], [student]] = await Promise.all([
          db
            .select()
            .from(studentParents)
            .where(and(eq(studentParents.studentId, data.studentId), eq(studentParents.parentId, data.parentId))),
          db
            .select({ id: students.id, schoolId: students.schoolId })
            .from(students)
            .where(eq(students.id, data.studentId)),
        ])

        if (existing) {
          throw new DatabaseError('CONFLICT', getNestedErrorMessage('parents', 'linkFailed'))
        }

        if (!student || student.schoolId !== data.schoolId) {
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('students', 'notFound'))
        }

        if (data.isPrimary) {
          await db.update(studentParents).set({ isPrimary: false }).where(eq(studentParents.studentId, data.studentId))
        }

        const [link] = await db
          .insert(studentParents)
          .values({
            id: crypto.randomUUID(),
            studentId: data.studentId,
            parentId: data.parentId,
            relationship: data.relationship,
            isPrimary: data.isPrimary || false,
            canPickup: data.canPickup ?? true,
            receiveNotifications: data.receiveNotifications ?? true,
            notes: data.notes,
          })
          .returning()

        if (!link)
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('parents', 'linkFailed'))

        return link
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'linkFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: data.studentId, parentId: data.parentId, action: 'link_parent' })),
  )
}

export async function unlinkParentFromStudent(studentId: string, parentId: string): R.ResultAsync<void, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        await db
          .delete(studentParents)
          .where(and(eq(studentParents.studentId, studentId), eq(studentParents.parentId, parentId)))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'unlinkFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId, parentId, action: 'unlink_parent' })),
  )
}

export async function updateParentLink(
  studentId: string,
  parentId: string,
  data: Partial<Omit<LinkParentInput, 'studentId' | 'parentId'>>,
): R.ResultAsync<typeof studentParents.$inferSelect, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        if (data.isPrimary) {
          await db.update(studentParents).set({ isPrimary: false }).where(eq(studentParents.studentId, studentId))
        }

        const [link] = await db
          .update(studentParents)
          .set(data)
          .where(and(eq(studentParents.studentId, studentId), eq(studentParents.parentId, parentId)))
          .returning()

        if (!link)
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('parents', 'unlinkFailed'))

        return link
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'updateLinkFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId, parentId, action: 'update_parent_link' })),
  )
}
