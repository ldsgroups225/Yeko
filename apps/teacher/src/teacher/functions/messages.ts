import {
  getMessageDetailsQuery,
  getMessageTemplatesQuery,
  getTeacherMessagesQuery,
  markMessageAsRead,
  searchParentsForTeacher,
  sendTeacherMessage,
} from '@repo/data-ops/queries/teacher-app'
import { createServerFn } from '@tanstack/react-start'

import { z } from 'zod'

import { messageFilterSchema, messageSchema } from '@/schemas/message'

// Get teacher messages
export const getTeacherMessages = createServerFn()
  .inputValidator(messageFilterSchema)
  .handler(async ({ data }) => {
    const result = await getTeacherMessagesQuery({
      teacherId: data.teacherId,
      folder: data.folder,
      isRead: data.isRead,
      page: data.page,
      pageSize: data.pageSize,
    })

    if (result.isErr()) {
      return {
        messages: [],
        total: 0,
        page: data.page,
        pageSize: data.pageSize,
      }
    }

    return {
      messages: result.value.messages.map(m => ({
        id: m.id,
        senderType: m.senderType as 'teacher' | 'parent',
        senderName: m.senderType === 'teacher' ? 'You' : 'Parent', // TODO: Get actual name
        recipientName: m.recipientType === 'teacher' ? 'You' : 'Parent',
        studentName: m.studentName,
        subject: m.subject,
        preview: m.preview,
        isRead: m.isRead ?? false,
        isStarred: m.isStarred ?? false,
        createdAt: m.createdAt.toISOString(),
        threadId: m.threadId,
      })),
      total: result.value.total,
      page: result.value.page,
      pageSize: result.value.pageSize,
    }
  })

// Send message
export const sendMessage = createServerFn()
  .inputValidator(
    messageSchema.extend({
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const messageResult = await sendTeacherMessage({
      schoolId: data.schoolId,
      teacherId: data.teacherId,
      recipientId: data.recipientId,
      studentId: data.studentId,
      classId: data.classId,
      subject: data.subject,
      content: data.content,
      replyToId: data.replyToId,
      attachments: data.attachments,
    })

    if (messageResult.isErr()) {
      return {
        success: false,
        error: messageResult.error.message,
      }
    }

    return {
      success: true,
      messageId: messageResult.value.id,
    }
  })

// Get message details
export const getMessageDetails = createServerFn()
  .inputValidator(
    z.object({
      messageId: z.string(),
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const messageResult = await getMessageDetailsQuery({
      messageId: data.messageId,
      teacherId: data.teacherId,
    })

    if (messageResult.isErr() || !messageResult.value) {
      return { message: null }
    }

    const message = messageResult.value

    return {
      message: {
        id: message.id,
        senderType: message.senderType as 'teacher' | 'parent',
        senderName: message.senderType === 'teacher' ? 'You' : 'Parent',
        recipientName: message.recipientType === 'teacher' ? 'You' : 'Parent',
        studentName: message.studentName,
        className: message.className,
        subject: message.subject,
        content: message.content,
        attachments: (message.attachments ?? []) as Array<{
          name: string
          url: string
          type: string
          size: number
        }>,
        isRead: message.isRead ?? false,
        readAt: message.readAt?.toISOString() ?? null,
        createdAt: message.createdAt.toISOString(),
        threadId: message.threadId,
        thread: message.thread.map((t: any) => ({
          id: t.id,
          senderType: t.senderType as 'teacher' | 'parent',
          senderName: t.senderType === 'teacher' ? 'You' : 'Parent',
          content: t.content,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    }
  })

// Mark message as read
export const markMessageRead = createServerFn()
  .inputValidator(
    z.object({
      messageId: z.string(),
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const result = await markMessageAsRead({
      messageId: data.messageId,
      teacherId: data.teacherId,
    })

    if (result.isErr()) {
      return {
        success: false,
        error: result.error.message,
      }
    }

    return { success: true }
  })

// Get message templates
export const getMessageTemplates = createServerFn()
  .inputValidator(
    z.object({
      schoolId: z.string(),
      category: z.enum(['attendance', 'grades', 'behavior', 'general', 'reminder', 'congratulations']).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const templatesResult = await getMessageTemplatesQuery({
      schoolId: data.schoolId,
      category: data.category,
    })

    if (templatesResult.isErr()) {
      return { templates: [] }
    }

    return {
      templates: templatesResult.value.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        subject: t.subject,
        content: t.content,
        placeholders: t.placeholders ?? [],
      })),
    }
  })

// Search parents to message
export const searchParents = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      query: z.string().min(2),
      classId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const parentsResult = await searchParentsForTeacher({
      teacherId: data.teacherId,
      schoolId: data.schoolId,
      schoolYearId: data.schoolYearId,
      query: data.query,
      classId: data.classId,
    })

    if (parentsResult.isErr()) {
      return []
    }

    return parentsResult.value.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      studentName: p.studentName,
      className: p.className,
    }))
  })
