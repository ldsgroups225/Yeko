import type { InvitationSendResult } from './types'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { parents, studentParents, students } from '../../drizzle/school-schema'
import { DatabaseError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'

// Hash token for secure storage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function sendParentInvitation(parentId: string, schoolId: string): R.ResultAsync<InvitationSendResult, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()

        // Get parent info first
        const [existingParent] = await db
          .select()
          .from(parents)
          .where(eq(parents.id, parentId))

        if (!existingParent) {
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('parents', 'notFound'))
        }

        if (!existingParent.email) {
          throw new DatabaseError('VALIDATION_ERROR', getNestedErrorMessage('parents', 'noEmail'))
        }

        // Generate invitation token
        const token = crypto.randomBytes(32).toString('hex')
        const hashedToken = hashToken(token)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        // Update parent with invitation info
        const [parent] = await db
          .update(parents)
          .set({
            invitationStatus: 'sent',
            invitationToken: hashedToken,
            invitationSentAt: new Date(),
            invitationExpiresAt: expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(parents.id, parentId))
          .returning()

        if (!parent) {
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('parents', 'updateFailed'))
        }

        // Get linked children for email context
        const children = await db
          .select({
            firstName: students.firstName,
            lastName: students.lastName,
          })
          .from(studentParents)
          .innerJoin(students, eq(studentParents.studentId, students.id))
          .where(eq(studentParents.parentId, parentId))

        if (children.length === 0) {
          throw new DatabaseError('VALIDATION_ERROR', getNestedErrorMessage('parents', 'noChildren'))
        }

        const { schools } = await import('../../drizzle/core-schema')
        const [school] = await db
          .select({ name: schools.name })
          .from(schools)
          .where(eq(schools.id, schoolId))

        const schoolName = school?.name || 'École'
        const studentNames = children.map((c: { firstName: string, lastName: string }) => `${c.firstName} ${c.lastName}`)
        const parentName = `${parent.firstName} ${parent.lastName}`

        const { sendParentInvitationEmail } = await import('../../services/email')
        const invitationUrl = `${process.env.APP_URL || 'https://parent.yeko.app'}/accept-invitation?token=${token}`

        const emailResult = await sendParentInvitationEmail({
          to: parent.email!,
          parentName,
          studentNames,
          schoolName,
          invitationUrl,
          expiresAt,
        })

        if (!emailResult.success) {
          await db
            .update(parents)
            .set({ invitationStatus: 'expired', updatedAt: new Date() })
            .where(eq(parents.id, parentId))

          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('parents', 'invitationFailedWithError', { error: String(emailResult.error) }))
        }

        return { parent, token, emailSent: true }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'sendInvitationFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { parentId, schoolId, action: 'send_parent_invitation' })),
  )
}

export async function acceptParentInvitation(token: string, userId: string): R.ResultAsync<typeof parents.$inferSelect, DatabaseError> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        const hashedToken = hashToken(token)
        const [parent] = await db
          .select()
          .from(parents)
          .where(and(eq(parents.invitationToken, hashedToken), eq(parents.invitationStatus, 'sent')))

        if (!parent) {
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('parents', 'invalidToken'))
        }

        if (parent.invitationExpiresAt && new Date() > parent.invitationExpiresAt) {
          await db.update(parents).set({ invitationStatus: 'expired', updatedAt: new Date() }).where(eq(parents.id, parent.id))
          throw new DatabaseError('VALIDATION_ERROR', getNestedErrorMessage('parents', 'invalidToken'))
        }

        const [updated] = await db
          .update(parents)
          .set({
            userId,
            invitationStatus: 'accepted',
            invitationToken: null,
            updatedAt: new Date(),
          })
          .where(eq(parents.id, parent.id))
          .returning()

        if (!updated) {
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('parents', 'updateFailed'))
        }

        return updated
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('parents', 'acceptInvitationFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { userId, action: 'accept_parent_invitation' })),
  )
}
