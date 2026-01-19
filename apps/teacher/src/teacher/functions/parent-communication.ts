import {
  getMessageDeliveryStatus,
  getMessageTemplates,
  getStudentParents,
  getTeacherMessageCountToday,
  getTeacherParentContacts,
  getTeacherSentMessages,
  getTeacherUnreadMessageCount,
  searchParentsForMessaging,
  sendBulkMessages,
} from '@repo/data-ops/queries/parent-communication'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// ============================================
// PARENT CONTACTS
// ============================================

/**
 * Get parents of a specific student
 */
export const getStudentParentsFn = createServerFn()
  .inputValidator(
    z.object({
      studentId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const parents = await getStudentParents(data.studentId)

    return {
      parents: parents.map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        email: p.email,
        relationship: p.relationship,
        isPrimary: p.isPrimary,
        preferredContact: p.preferredContact,
        isVerified: p.isVerified,
      })),
    }
  })

/**
 * Get all parent contacts for teacher's classes
 */
export const getTeacherParentContactsFn = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      classId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const result = await getTeacherParentContacts({
      teacherId: data.teacherId,
      schoolId: data.schoolId,
      schoolYearId: data.schoolYearId,
      classId: data.classId,
    })

    return result
  })

/**
 * Search parents for messaging
 */
export const searchParentsForMessagingFn = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      query: z.string(),
      classId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const results = await searchParentsForMessaging({
      teacherId: data.teacherId,
      schoolId: data.schoolId,
      schoolYearId: data.schoolYearId,
      query: data.query,
      classId: data.classId,
    })

    return { results }
  })

// ============================================
// MESSAGE TEMPLATES
// ============================================

/**
 * Get message templates
 */
export const getMessageTemplatesFn = createServerFn()
  .inputValidator(
    z.object({
      schoolId: z.string(),
      category: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const templates = await getMessageTemplates(data.schoolId, data.category)

    return { templates }
  })

// ============================================
// MESSAGE HISTORY
// ============================================

/**
 * Get sent messages by teacher
 */
export const getTeacherSentMessagesFn = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      category: z.string().optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const result = await getTeacherSentMessages({
      teacherId: data.teacherId,
      schoolId: data.schoolId,
      startDate: data.startDate,
      endDate: data.endDate,
      category: data.category,
      page: data.page,
      pageSize: data.pageSize,
    })

    return result
  })

/**
 * Get message delivery status
 */
export const getMessageDeliveryStatusFn = createServerFn()
  .inputValidator(
    z.object({
      messageId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const status = await getMessageDeliveryStatus(data.messageId)

    return { status }
  })

// ============================================
// BULK MESSAGING
// ============================================

/**
 * Send bulk messages to multiple parents
 */
export const sendBulkMessagesFn = createServerFn()
  .inputValidator(
    z.object({
      schoolId: z.string(),
      teacherId: z.string(),
      recipientIds: z.array(z.string()),
      subject: z.string(),
      content: z.string(),
      category: z.string(),
      priority: z.enum(['normal', 'high', 'urgent']),
      studentId: z.string().optional(),
      classId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const result = await sendBulkMessages({
      schoolId: data.schoolId,
      teacherId: data.teacherId,
      recipientIds: data.recipientIds,
      subject: data.subject,
      content: data.content,
      category: data.category,
      priority: data.priority,
      studentId: data.studentId,
      classId: data.classId,
    })

    return result
  })

/**
 * Get count of messages sent by teacher today
 */
export const getTeacherMessageCountTodayFn = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const count = await getTeacherMessageCountToday(data.teacherId)

    return { count }
  })

// ============================================
// UNREAD MESSAGE COUNT
// ============================================

/**
 * Get unread message count for teacher
 */
export const getTeacherUnreadMessageCountFn = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const count = await getTeacherUnreadMessageCount(data.teacherId)

    return { count }
  })
