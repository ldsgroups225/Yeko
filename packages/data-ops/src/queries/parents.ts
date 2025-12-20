import type { Parent, ParentInsert } from '../drizzle/school-schema'
import crypto from 'node:crypto'
import { and, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { parents, studentParents, students, users } from '../drizzle/school-schema'

const nanoid = () => crypto.randomUUID()

// ==================== Types ====================

export interface ParentFilters {
  search?: string
  invitationStatus?: string
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
  relationship: 'father' | 'mother' | 'guardian' | 'grandparent' | 'sibling' | 'other'
  isPrimary?: boolean
  canPickup?: boolean
  receiveNotifications?: boolean
  notes?: string
}

// ==================== Queries ====================

export async function getParents(schoolId: string, filters: ParentFilters) {
  const db = getDb()
  const { search, invitationStatus, hasChildren, page = 1, limit = 20 } = filters

  const conditions = []

  if (search) {
    conditions.push(
      or(
        ilike(parents.firstName, `%${search}%`),
        ilike(parents.lastName, `%${search}%`),
        ilike(parents.phone, `%${search}%`),
        ilike(parents.email, `%${search}%`),
      ),
    )
  }

  if (invitationStatus) {
    conditions.push(eq(parents.invitationStatus, invitationStatus as any))
  }

  const query = db
    .select({
      parent: parents,
      childrenCount: sql<number>`COUNT(DISTINCT ${studentParents.studentId})`.as('children_count'),
      hasUser: sql<boolean>`${parents.userId} IS NOT NULL`.as('has_user'),
    })
    .from(parents)
    .leftJoin(studentParents, eq(studentParents.parentId, parents.id))
    .leftJoin(students, eq(studentParents.studentId, students.id))
    .where(and(eq(students.schoolId, schoolId), ...conditions))
    .groupBy(parents.id)

  const offset = (page - 1) * limit
  let data = await query.limit(limit).offset(offset)

  // Filter by children count in application layer if needed
  if (hasChildren !== undefined) {
    data = data.filter((p: { childrenCount: number }) => (hasChildren ? p.childrenCount > 0 : p.childrenCount === 0))
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${parents.id})` })
    .from(parents)
    .leftJoin(studentParents, eq(studentParents.parentId, parents.id))
    .leftJoin(students, eq(studentParents.studentId, students.id))
    .where(eq(students.schoolId, schoolId))

  return {
    data,
    total: Number(countResult[0]?.count || 0),
    page,
    totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
  }
}

export async function getParentById(id: string) {
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
    return null

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

  return { ...parent, children }
}

// ==================== Auto-Matching ====================

export async function findParentByPhone(phone: string) {
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
}

export async function autoMatchParents(schoolId: string) {
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
      const existingParent = await findParentByPhone(student.emergencyPhone)

      results.suggestions.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        phone: student.emergencyPhone,
        existingParent: existingParent || undefined,
      })
    }
  }

  return results
}

// ==================== CRUD Operations ====================

export async function createParent(data: CreateParentInput): Promise<Parent> {
  const db = getDb()
  // Check if parent with same phone exists
  const existing = await findParentByPhone(data.phone)
  if (existing) {
    throw new Error(`Parent with phone ${data.phone} already exists`)
  }

  const [parent] = await db
    .insert(parents)
    .values({
      id: nanoid(),
      ...data,
      invitationStatus: 'pending',
    } as ParentInsert)
    .returning()

  if (!parent) {
    throw new Error('Failed to create parent')
  }

  return parent
}

export async function updateParent(id: string, data: Partial<CreateParentInput>) {
  const db = getDb()
  const [parent] = await db
    .update(parents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(parents.id, id))
    .returning()

  return parent
}

export async function deleteParent(id: string) {
  const db = getDb()
  // Check if parent has linked children
  const [link] = await db.select().from(studentParents).where(eq(studentParents.parentId, id))

  if (link) {
    throw new Error('Cannot delete parent with linked children. Unlink children first.')
  }

  await db.delete(parents).where(eq(parents.id, id))
}

// ==================== Parent-Student Linking ====================

export async function linkParentToStudent(data: LinkParentInput) {
  const db = getDb()
  // Check if link already exists
  const [existing] = await db
    .select()
    .from(studentParents)
    .where(and(eq(studentParents.studentId, data.studentId), eq(studentParents.parentId, data.parentId)))

  if (existing) {
    throw new Error('Parent is already linked to this student')
  }

  // If setting as primary, unset other primaries
  if (data.isPrimary) {
    await db.update(studentParents).set({ isPrimary: false }).where(eq(studentParents.studentId, data.studentId))
  }

  const [link] = await db
    .insert(studentParents)
    .values({
      id: nanoid(),
      ...data,
    })
    .returning()

  return link
}

export async function unlinkParentFromStudent(studentId: string, parentId: string) {
  const db = getDb()
  await db
    .delete(studentParents)
    .where(and(eq(studentParents.studentId, studentId), eq(studentParents.parentId, parentId)))
}

export async function updateParentLink(
  studentId: string,
  parentId: string,
  data: Partial<Omit<LinkParentInput, 'studentId' | 'parentId'>>,
) {
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

  return link
}

// ==================== Invitation System ====================

// Hash token for secure storage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function sendParentInvitation(parentId: string, schoolId: string) {
  const db = getDb()

  // Get parent info first
  const [existingParent] = await db
    .select()
    .from(parents)
    .where(eq(parents.id, parentId))

  if (!existingParent) {
    throw new Error('Parent introuvable')
  }

  if (!existingParent.email) {
    throw new Error('Le parent n\'a pas d\'adresse email')
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
    throw new Error('Échec de la mise à jour du parent')
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
    throw new Error('Aucun enfant lié au parent')
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

    throw new Error(`Échec de l'envoi de l'invitation: ${emailResult.error}`)
  }

  // Return plain token (for testing/debugging only)
  return { parent, token, emailSent: true }
}

export async function acceptParentInvitation(token: string, userId: string) {
  const db = getDb()
  // Hash the incoming token to compare with stored hash
  const hashedToken = hashToken(token)
  const [parent] = await db
    .select()
    .from(parents)
    .where(and(eq(parents.invitationToken, hashedToken), eq(parents.invitationStatus, 'sent')))

  if (!parent) {
    throw new Error('Invalid or expired invitation')
  }

  if (parent.invitationExpiresAt && new Date() > parent.invitationExpiresAt) {
    await db.update(parents).set({ invitationStatus: 'expired', updatedAt: new Date() }).where(eq(parents.id, parent.id))
    throw new Error('Invitation has expired')
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

  return updated
}

// ==================== Bulk Operations ====================

export async function bulkImportParents(
  parentsData: Array<CreateParentInput & { studentMatricule?: string, relationship?: string }>,
): Promise<{ success: number, errors: Array<{ row: number, error: string }> }> {
  const db = getDb()
  const results = { success: 0, errors: [] as Array<{ row: number, error: string }> }

  for (let i = 0; i < parentsData.length; i++) {
    try {
      const item = parentsData[i]
      if (!item)
        continue
      const { studentMatricule, relationship, ...parentData } = item

      // Check if parent exists
      let parent = await findParentByPhone(parentData.phone)

      if (!parent) {
        parent = await createParent(parentData)
      }

      // Link to student if matricule provided
      if (studentMatricule && parent) {
        const [student] = await db.select().from(students).where(eq(students.matricule, studentMatricule))

        if (student) {
          try {
            await linkParentToStudent({
              studentId: student.id,
              parentId: parent.id,
              relationship: (relationship as any) || 'guardian',
            })
          }
          catch {
            // Link might already exist, ignore
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
}
