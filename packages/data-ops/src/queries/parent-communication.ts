/**
 * Parent Communication Queries
 * Queries for parent contacts, messaging, and bulk communication
 */
import { and, asc, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { getDb } from '../database/setup'
import { grades, subjects } from '../drizzle/core-schema'
import {
  classes,
  enrollments,
  messageTemplates,
  parents,
  studentParents,
  students,
  teacherMessages,
} from '../drizzle/school-schema'

// ============================================
// PARENT CONTACTS
// ============================================

/**
 * Get parents of a specific student
 */
export async function getStudentParents(studentId: string) {
  const db = getDb()

  const result = await db
    .select({
      id: parents.id,
      firstName: parents.firstName,
      lastName: parents.lastName,
      phone: parents.phone,
      email: parents.email,
      relationship: studentParents.relationship,
      isPrimary: studentParents.isPrimary,
      preferredContact: parents.preferredContact,
      isVerified: parents.isVerified,
      createdAt: parents.createdAt,
    })
    .from(studentParents)
    .innerJoin(parents, eq(studentParents.parentId, parents.id))
    .where(eq(studentParents.studentId, studentId))
    .orderBy(desc(studentParents.isPrimary), asc(parents.firstName))

  return result
}

/**
 * Get all parent contacts for students in teacher's classes
 */
export async function getTeacherParentContacts(params: {
  teacherId: string
  schoolId: string
  schoolYearId: string
  classId?: string
}) {
  const db = getDb()

  const conditions: any[] = [
    eq(students.schoolId, params.schoolId),
    eq(enrollments.schoolYearId, params.schoolYearId),
    eq(enrollments.status, 'confirmed'),
  ]

  if (params.classId) {
    conditions.push(eq(enrollments.classId, params.classId))
  }

  const result = await db
    .select({
      studentId: students.id,
      studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      studentMatricule: students.matricule,
      classId: classes.id,
      className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
      parentId: parents.id,
      parentName: sql<string>`${parents.firstName} || ' ' || ${parents.lastName}`,
      parentPhone: parents.phone,
      parentEmail: parents.email,
      parentRelationship: studentParents.relationship,
      isPrimary: studentParents.isPrimary,
      preferredContact: parents.preferredContact,
    })
    .from(students)
    .innerJoin(enrollments, eq(enrollments.studentId, students.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .innerJoin(classSubjects, eq(classSubjects.classId, enrollments.classId))
    .innerJoin(studentParents, eq(studentParents.studentId, students.id))
    .innerJoin(parents, eq(studentParents.parentId, parents.id))
    .where(
      and(
        ...conditions,
        eq(classSubjects.teacherId, params.teacherId),
      ),
    )
    .orderBy(asc(students.lastName), asc(students.firstName), desc(studentParents.isPrimary))

  // Deduplicate by parent and organize by student
  const studentParentMap = new Map<string, typeof result[0 & typeof result[number]][]>()

  for (const row of result) {
    if (!studentParentMap.has(row.studentId)) {
      studentParentMap.set(row.studentId, [])
    }
    studentParentMap.get(row.studentId)!.push(row)
  }

  return {
    contacts: Array.from(studentParentMap.entries()).map(([studentId, parents]) => ({
      student: {
        id: studentId,
        name: parents[0]!.studentName,
        matricule: parents[0]!.studentMatricule,
        class: {
          id: parents[0]!.classId,
          name: parents[0]!.className,
        },
      },
      parents: parents.map(p => ({
        id: p.parentId,
        name: p.parentName,
        phone: p.parentPhone,
        email: p.parentEmail,
        relationship: p.parentRelationship,
        isPrimary: p.isPrimary,
        preferredContact: p.preferredContact,
      })),
    })),
    total: studentParentMap.size,
  }
}

/**
 * Search parents for messaging
 */
export async function searchParentsForMessaging(params: {
  teacherId: string
  schoolId: string
  schoolYearId: string
  query: string
  classId?: string
}) {
  const db = getDb()

  const searchQuery = `%${params.query}%`
  const conditions: any[] = [
    eq(students.schoolId, params.schoolId),
    eq(enrollments.schoolYearId, params.schoolYearId),
    eq(enrollments.status, 'confirmed'),
    sql`(${students.firstName} || ' ' || ${students.lastName} ILIKE ${searchQuery} OR ${parents.firstName} || ' ' || ${parents.lastName} ILIKE ${searchQuery})`,
  ]

  if (params.classId) {
    conditions.push(eq(enrollments.classId, params.classId))
  }

  const result = await db
    .select({
      studentId: students.id,
      studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
      parentId: parents.id,
      parentName: sql<string>`${parents.firstName} || ' ' || ${parents.lastName}`,
      parentPhone: parents.phone,
      parentEmail: parents.email,
      relationship: studentParents.relationship,
    })
    .from(students)
    .innerJoin(enrollments, eq(enrollments.studentId, students.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .innerJoin(classSubjects, eq(classSubjects.classId, enrollments.classId))
    .innerJoin(studentParents, eq(studentParents.studentId, students.id))
    .innerJoin(parents, eq(studentParents.parentId, parents.id))
    .where(
      and(
        ...conditions,
        eq(classSubjects.teacherId, params.teacherId),
      ),
    )
    .limit(50)

  // Deduplicate by parent
  const parentMap = new Map<string, typeof result[0]>()

  for (const row of result) {
    if (!parentMap.has(row.parentId)) {
      parentMap.set(row.parentId, row)
    }
  }

  return Array.from(parentMap.values())
}

// ============================================
// MESSAGE TEMPLATES
// ============================================

/**
 * Get message templates for a school
 */
export async function getMessageTemplates(schoolId: string, category?: string) {
  const db = getDb()

  const conditions = [
    eq(messageTemplates.schoolId, schoolId),
    eq(messageTemplates.isActive, true),
  ]

  if (category) {
    conditions.push(eq(messageTemplates.category, category as any))
  }

  return db
    .select({
      id: messageTemplates.id,
      name: messageTemplates.name,
      category: messageTemplates.category,
      subject: messageTemplates.subject,
      content: messageTemplates.content,
      placeholders: messageTemplates.placeholders,
    })
    .from(messageTemplates)
    .where(and(...conditions))
    .orderBy(asc(messageTemplates.name))
}

/**
 * Get message template by ID
 */
export async function getMessageTemplateById(templateId: string) {
  const db = getDb()

  const result = await db
    .select({
      id: messageTemplates.id,
      name: messageTemplates.name,
      category: messageTemplates.category,
      subject: messageTemplates.subject,
      content: messageTemplates.content,
      placeholders: messageTemplates.placeholders,
    })
    .from(messageTemplates)
    .where(eq(messageTemplates.id, templateId))
    .limit(1)

  return result[0] ?? null
}

// ============================================
// MESSAGE HISTORY
// ============================================

/**
 * Get sent messages by teacher
 */
export async function getTeacherSentMessages(params: {
  teacherId: string
  schoolId: string
  startDate?: string
  endDate?: string
  category?: string
  page?: number
  pageSize?: number
}) {
  const db = getDb()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20

  const conditions: any[] = [
    eq(teacherMessages.senderType, 'teacher'),
    eq(teacherMessages.senderId, params.teacherId),
  ]

  if (params.startDate) {
    conditions.push(gte(teacherMessages.createdAt, params.startDate))
  }
  if (params.endDate) {
    conditions.push(lte(teacherMessages.createdAt, params.endDate))
  }

  const [messages, countResult] = await Promise.all([
    db
      .select({
        id: teacherMessages.id,
        studentId: teacherMessages.studentId,
        studentName: sql<string | null>`${students.firstName} || ' ' || ${students.lastName}`,
        classId: teacherMessages.classId,
        className: sql<string | null>`${grades.name} || ' ' || ${classes.section}`,
        subject: teacherMessages.subject,
        content: teacherMessages.content,
        category: teacherMessages.category,
        priority: teacherMessages.priority,
        createdAt: teacherMessages.createdAt,
        status: teacherMessages.status,
      })
      .from(teacherMessages)
      .leftJoin(students, eq(teacherMessages.studentId, students.id))
      .leftJoin(classes, eq(teacherMessages.classId, classes.id))
      .leftJoin(grades, eq(classes.gradeId, grades.id))
      .where(and(...conditions))
      .orderBy(desc(teacherMessages.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(teacherMessages)
      .where(and(...conditions)),
  ])

  return {
    messages,
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}

/**
 * Get message delivery status
 */
export async function getMessageDeliveryStatus(messageId: string) {
  const db = getDb()

  const message = await db
    .select({
      id: teacherMessages.id,
      status: teacherMessages.status,
      sentAt: teacherMessages.createdAt,
      deliveredAt: teacherMessages.updatedAt,
      recipientType: teacherMessages.recipientType,
      recipientId: teacherMessages.recipientId,
    })
    .from(teacherMessages)
    .where(eq(teacherMessages.id, messageId))
    .limit(1)

  return message[0] ?? null
}

// ============================================
// BULK MESSAGING
// ============================================

/**
 * Send bulk messages to multiple parents
 */
export async function sendBulkMessages(params: {
  schoolId: string
  teacherId: string
  recipientIds: string[]
  subject: string
  content: string
  category: string
  priority: 'normal' | 'high' | 'urgent'
  studentId?: string
  classId?: string
}) {
  const db = getDb()

  if (params.recipientIds.length === 0) {
    return { success: true, count: 0 }
  }

  const messages = params.recipientIds.map(recipientId => ({
    id: nanoid(),
    schoolId: params.schoolId,
    senderType: 'teacher' as const,
    senderId: params.teacherId,
    recipientType: 'parent' as const,
    recipientId,
    studentId: params.studentId,
    classId: params.classId,
    subject: params.subject,
    content: params.content,
    category: params.category as any,
    priority: params.priority,
    status: 'sent',
  }))

  await db.insert(teacherMessages).values(messages)

  return { success: true, count: messages.length }
}

/**
 * Get count of messages sent by teacher today
 */
export async function getTeacherMessageCountToday(teacherId: string): Promise<number> {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]!

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teacherMessages)
    .where(
      and(
        eq(teacherMessages.senderType, 'teacher'),
        eq(teacherMessages.senderId, teacherId),
        sql`DATE(${teacherMessages.createdAt}) = ${today}`,
      ),
    )

  return result[0]?.count ?? 0
}

// ============================================
// UNREAD MESSAGE COUNT
// ============================================

/**
 * Get unread message count for teacher
 */
export async function getTeacherUnreadMessageCount(teacherId: string): Promise<number> {
  const db = getDb()

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teacherMessages)
    .where(
      and(
        eq(teacherMessages.recipientType, 'teacher'),
        eq(teacherMessages.recipientId, teacherId),
        eq(teacherMessages.isRead, false),
        eq(teacherMessages.isArchived, false),
      ),
    )

  return result[0]?.count ?? 0
}
