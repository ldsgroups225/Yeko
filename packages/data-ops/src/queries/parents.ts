import type { InvitationStatus, Parent, ParentInsert, Relationship } from '../drizzle/school-schema'
import crypto from 'node:crypto'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { parents, studentParents, students, users } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

// ==================== Types ====================

export interface ParentFilters {
  search?: string
  invitationStatus?: InvitationStatus
  hasChildren?: boolean
  page?: number
  limit?: number
}

export interface CreateParentInput {
  firstName: string
  lastName: string
  phone: string
  phone2?: string
  email?: string
  address?: string
  occupation?: string
  workplace?: string
}

export interface LinkParentInput {
  studentId: string
  parentId: string
  relationship: Relationship
  isPrimary?: boolean
  canPickup?: boolean
  receiveNotifications?: boolean
  notes?: string
}

export interface ParentWithChildrenCount extends Parent {
  childrenCount: number
  hasUser: boolean
}

export interface PaginatedParents {
  data: ParentWithChildrenCount[]
  total: number
  page: number
  totalPages: number
}

export interface ParentChildren {
  student: typeof students.$inferSelect
  relationship: Relationship | null
  isPrimary: boolean | null
  canPickup: boolean | null
  receiveNotifications: boolean | null
}

export interface ParentWithDetails extends Parent {
  user: typeof users.$inferSelect | null
  children: ParentChildren[]
}

export interface StudentParentDetail {
  parent: typeof parents.$inferSelect
  relationship: Relationship | null
  isPrimary: boolean | null
}

export interface AutoMatchResult {
  matched: number
  created: number
  suggestions: Array<{
    studentId: string
    studentName: string
    phone: string
    existingParent?: typeof parents.$inferSelect
  }>
}

export interface InvitationSendResult {
  parent: typeof parents.$inferSelect
  token: string
  emailSent: boolean
}

// ==================== Queries ====================

export function getParents(
  schoolId: string,
  filters: ParentFilters,
): ResultAsync<
  PaginatedParents,
  DatabaseError
> {
  const { search, invitationStatus, hasChildren, page = 1, limit = 20 } = filters

  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      const offset = (page - 1) * limit

      const conditions = [eq(students.schoolId, schoolId)]

      if (search) {
        conditions.push(
          or(
            ilike(parents.firstName, `%${search}%`),
            ilike(parents.lastName, `%${search}%`),
            ilike(parents.phone, `%${search}%`),
          )!,
        )
      }

      if (invitationStatus) {
        conditions.push(eq(parents.invitationStatus, invitationStatus))
      }

      const query = db
        .select({
          parent: parents,
          childrenCount: sql<number>`COUNT(DISTINCT ${studentParents.id})`,
          hasUser: sql<boolean>`CASE WHEN ${parents.userId} IS NOT NULL THEN true ELSE false END`,
        })
        .from(parents)
        .leftJoin(studentParents, eq(studentParents.parentId, parents.id))
        .leftJoin(students, eq(studentParents.studentId, students.id))
        .where(and(...conditions))
        .groupBy(parents.id)

      const data = await query.limit(limit).offset(offset)

      // Filter by children count in application layer if needed
      // Note: filtering after pagination is not ideal but children_count is aggregated
      // Ideally this should be a HAVING clause but checking children existence is easier this way
      let processedData = data.map(d => ({
        ...d.parent,
        childrenCount: Number(d.childrenCount),
        hasUser: Boolean(d.hasUser),
      }))

      if (hasChildren !== undefined) {
        processedData = processedData.filter(p => (hasChildren ? p.childrenCount > 0 : p.childrenCount === 0))
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${parents.id})` })
        .from(parents)
        .leftJoin(studentParents, eq(studentParents.parentId, parents.id))
        .leftJoin(students, eq(studentParents.studentId, students.id))
        .where(eq(students.schoolId, schoolId))

      return {
        data: processedData,
        total: Number(countResult[0]?.count || 0),
        page,
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
      }
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to fetch parents'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, action: 'get_parents' }))
}

export function getParentById(id: string): ResultAsync<ParentWithDetails, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      const [parent] = await db
        .select({
          parent: parents,
          user: users,
        })
        .from(parents)
        .leftJoin(users, eq(parents.userId, users.id))
        .where(eq(parents.id, id))

      if (!parent)
        throw new DatabaseError('NOT_FOUND', 'Parent not found')

      // Get linked children
      const children = await db
        .select({
          student: students,
          relationship: studentParents.relationship,
          isPrimary: studentParents.isPrimary,
          canPickup: studentParents.canPickup,
          receiveNotifications: studentParents.receiveNotifications,
        })
        .from(studentParents)
        .innerJoin(students, eq(studentParents.studentId, students.id))
        .where(eq(studentParents.parentId, id))

      return { ...parent.parent, user: parent.user, children }
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to fetch parent'),
  ).mapErr(tapLogErr(databaseLogger, { parentId: id, action: 'get_parent_by_id' }))
}

export function getStudentParents(studentId: string): ResultAsync<StudentParentDetail[], DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      const results = await db
        .select({
          parent: parents,
          relationship: studentParents.relationship,
          isPrimary: studentParents.isPrimary,
        })
        .from(studentParents)
        .innerJoin(parents, eq(studentParents.parentId, parents.id))
        .where(eq(studentParents.studentId, studentId))

      return results
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to fetch student parents'),
  ).mapErr(tapLogErr(databaseLogger, { studentId, action: 'get_student_parents' }))
}

// ==================== Auto-Matching ====================

export function findParentByPhone(phone: string): ResultAsync<Parent | null, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      // Normalize phone number (remove spaces, dashes, etc.)
      const normalizedPhone = phone.replace(/[\s\-()]/g, '')

      const [parent] = await db
        .select()
        .from(parents)
        .where(
          or(
            eq(parents.phone, normalizedPhone),
            eq(parents.phone, phone),
            eq(parents.phone2, normalizedPhone),
            eq(parents.phone2, phone),
          ),
        )

      return parent || null
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to find parent by phone'),
  )
}

export function autoMatchParents(schoolId: string): ResultAsync<AutoMatchResult, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      const results = {
        matched: 0,
        created: 0,
        suggestions: [] as Array<{
          studentId: string
          studentName: string
          phone: string
          existingParent?: typeof parents.$inferSelect
        }>,
      }

      // Get students without parents
      const studentsWithoutParents = await db
        .select({
          student: students,
        })
        .from(students)
        .leftJoin(studentParents, eq(studentParents.studentId, students.id))
        .where(and(eq(students.schoolId, schoolId), eq(students.status, 'active'), isNull(studentParents.id)))
        .groupBy(students.id)

      for (const { student } of studentsWithoutParents) {
        // Check emergency phone for potential parent match
        if (student.emergencyPhone) {
          const checkResult = await findParentByPhone(student.emergencyPhone)
          if (checkResult.isOk()) {
            const existingParent = checkResult.value

            results.suggestions.push({
              studentId: student.id,
              studentName: `${student.firstName} ${student.lastName}`,
              phone: student.emergencyPhone,
              existingParent: existingParent || undefined,
            })
          }
        }
      }

      return results
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to auto-match parents'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, action: 'auto_match_parents' }))
}

// ==================== CRUD Operations ====================

export function createParent(data: CreateParentInput): ResultAsync<Parent, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      // Check if parent with same phone exists
      const checkResult = await findParentByPhone(data.phone)
      if (checkResult.isOk() && checkResult.value) {
        throw new DatabaseError('CONFLICT', `Parent with phone ${data.phone} already exists`)
      }
      if (checkResult.isErr()) {
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
        throw new DatabaseError('INTERNAL_ERROR', 'Failed to create parent')
      }

      return parent
    })(),
    (e) => {
      console.error('CREATE PARENT ERROR:', e)
      return DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to create parent')
    },
  ).mapErr(tapLogErr(databaseLogger, { action: 'create_parent' }))
}

export function updateParent(id: string, data: Partial<CreateParentInput>): ResultAsync<Parent, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      const [parent] = await db
        .update(parents)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(parents.id, id))
        .returning()

      if (!parent)
        throw new DatabaseError('NOT_FOUND', 'Parent not found')

      return parent
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to update parent'),
  ).mapErr(tapLogErr(databaseLogger, { parentId: id, action: 'update_parent' }))
}

export function deleteParent(id: string): ResultAsync<void, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      // Check if parent has linked children
      const [link] = await db.select().from(studentParents).where(eq(studentParents.parentId, id))

      if (link) {
        throw new DatabaseError('CONFLICT', 'Cannot delete parent with linked children. Unlink children first.')
      }

      const result = await db.delete(parents).where(eq(parents.id, id))
      if (result.rowCount === 0) {
        // We consider idempotent delete as success usually, but if we want to be strict:
        // throw new DatabaseError('NOT_FOUND', 'Parent not found')
      }
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to delete parent'),
  ).mapErr(tapLogErr(databaseLogger, { parentId: id, action: 'delete_parent' }))
}

// ==================== Parent-Student Linking ====================

export function linkParentToStudent(data: LinkParentInput): ResultAsync<typeof studentParents.$inferSelect, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      // Check if link already exists
      const [existing] = await db
        .select()
        .from(studentParents)
        .where(and(eq(studentParents.studentId, data.studentId), eq(studentParents.parentId, data.parentId)))

      if (existing) {
        throw new DatabaseError('CONFLICT', 'Parent is already linked to this student')
      }

      // If setting as primary, unset other primaries
      if (data.isPrimary) {
        await db.update(studentParents).set({ isPrimary: false }).where(eq(studentParents.studentId, data.studentId))
      }

      const [link] = await db
        .insert(studentParents)
        .values({
          id: crypto.randomUUID(),
          ...data,
        })
        .returning()

      if (!link)
        throw new DatabaseError('INTERNAL_ERROR', 'Failed to link parent')

      return link
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to link parent'),
  ).mapErr(tapLogErr(databaseLogger, { studentId: data.studentId, parentId: data.parentId, action: 'link_parent' }))
}

export function unlinkParentFromStudent(studentId: string, parentId: string): ResultAsync<void, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      await db
        .delete(studentParents)
        .where(and(eq(studentParents.studentId, studentId), eq(studentParents.parentId, parentId)))
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to unlink parent'),
  ).mapErr(tapLogErr(databaseLogger, { studentId, parentId, action: 'unlink_parent' }))
}

export function updateParentLink(
  studentId: string,
  parentId: string,
  data: Partial<Omit<LinkParentInput, 'studentId' | 'parentId'>>,
): ResultAsync<typeof studentParents.$inferSelect, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      // If setting as primary, unset other primaries
      if (data.isPrimary) {
        await db.update(studentParents).set({ isPrimary: false }).where(eq(studentParents.studentId, studentId))
      }

      const [link] = await db
        .update(studentParents)
        .set(data)
        .where(and(eq(studentParents.studentId, studentId), eq(studentParents.parentId, parentId)))
        .returning()

      if (!link)
        throw new DatabaseError('NOT_FOUND', 'Link not found')

      return link
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to update parent link'),
  ).mapErr(tapLogErr(databaseLogger, { studentId, parentId, action: 'update_parent_link' }))
}

// ==================== Invitation System ====================

// Hash token for secure storage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function sendParentInvitation(parentId: string, schoolId: string): ResultAsync<InvitationSendResult, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()

      // Get parent info first
      const [existingParent] = await db
        .select()
        .from(parents)
        .where(eq(parents.id, parentId))

      if (!existingParent) {
        throw new DatabaseError('NOT_FOUND', 'Parent introuvable')
      }

      if (!existingParent.email) {
        throw new DatabaseError('VALIDATION_ERROR', 'Le parent n\'a pas d\'adresse email')
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex')
      const hashedToken = hashToken(token) // Store hashed version for security
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

      // Update parent with invitation info
      const [parent] = await db
        .update(parents)
        .set({
          invitationStatus: 'sent',
          invitationToken: hashedToken, // Store hashed token
          invitationSentAt: new Date(),
          invitationExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(parents.id, parentId))
        .returning()

      if (!parent) {
        throw new DatabaseError('INTERNAL_ERROR', 'Échec de la mise à jour du parent')
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
        throw new DatabaseError('VALIDATION_ERROR', 'Aucun enfant lié au parent')
      }

      // Get school name - import schools table
      const { schools } = await import('../drizzle/core-schema')
      const [school] = await db
        .select({ name: schools.name })
        .from(schools)
        .where(eq(schools.id, schoolId))

      const schoolName = school?.name || 'École'
      const studentNames = children.map((c: { firstName: string, lastName: string }) => `${c.firstName} ${c.lastName}`)
      const parentName = `${parent.firstName} ${parent.lastName}`

      // Send email invitation
      const { sendParentInvitationEmail } = await import('../services/email')
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
        // Update status to failed
        await db
          .update(parents)
          .set({ invitationStatus: 'expired', updatedAt: new Date() })
          .where(eq(parents.id, parentId))

        throw new DatabaseError('INTERNAL_ERROR', `Échec de l'envoi de l'invitation: ${emailResult.error}`)
      }

      // Return plain token (for testing/debugging only)
      return { parent, token, emailSent: true }
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to send parent invitation'),
  ).mapErr(tapLogErr(databaseLogger, { parentId, schoolId, action: 'send_parent_invitation' }))
}

export function acceptParentInvitation(token: string, userId: string): ResultAsync<typeof parents.$inferSelect, DatabaseError> {
  return ResultAsync.fromPromise(
    (async () => {
      const db = getDb()
      // Hash the incoming token to compare with stored hash
      const hashedToken = hashToken(token)
      const [parent] = await db
        .select()
        .from(parents)
        .where(and(eq(parents.invitationToken, hashedToken), eq(parents.invitationStatus, 'sent')))

      if (!parent) {
        throw new DatabaseError('NOT_FOUND', 'Invalid or expired invitation')
      }

      if (parent.invitationExpiresAt && new Date() > parent.invitationExpiresAt) {
        await db.update(parents).set({ invitationStatus: 'expired', updatedAt: new Date() }).where(eq(parents.id, parent.id))
        throw new DatabaseError('VALIDATION_ERROR', 'Invitation has expired')
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
        throw new DatabaseError('INTERNAL_ERROR', 'Failed to update parent')
      }

      return updated
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to accept invitation'),
  ).mapErr(tapLogErr(databaseLogger, { userId, action: 'accept_parent_invitation' }))
}

// ==================== Bulk Operations ====================

export function bulkImportParents(
  parentsData: Array<CreateParentInput & { studentMatricule?: string, relationship?: Relationship }>,
): ResultAsync<{ success: number, errors: Array<{ row: number, error: string }> }, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
    const results = { success: 0, errors: [] as Array<{ row: number, error: string }> }

    for (let i = 0; i < parentsData.length; i++) {
      try {
        const item = parentsData[i]
        if (!item)
          continue
        const { studentMatricule, relationship, ...parentData } = item

        // Check if parent exists
        const phoneResult = await findParentByPhone(parentData.phone)

        let parent
        if (phoneResult.isOk() && phoneResult.value) {
          parent = phoneResult.value
        }
        else {
          const createResult = await createParent(parentData)
          if (createResult.isErr())
            throw createResult.error
          parent = createResult.value
        }

        // Link to student if matricule provided
        if (studentMatricule && parent) {
          const [student] = await db.select().from(students).where(eq(students.matricule, studentMatricule))

          if (student) {
            const linkResult = await linkParentToStudent({
              studentId: student.id,
              parentId: parent.id,
              relationship: relationship || 'guardian',
            })
            // Ignore conflict if link already exists
            if (linkResult.isErr() && linkResult.error.type !== 'CONFLICT') {
              throw linkResult.error
            }
          }
        }

        results.success++
      }
      catch (error) {
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to bulk import parents')).mapErr(tapLogErr(databaseLogger, { parentsCount: parentsData.length, action: 'bulk_import_parents' }))
}
