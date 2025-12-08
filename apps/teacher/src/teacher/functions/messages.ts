import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { messageFilterSchema, messageSchema } from '@/schemas/message'

// Get teacher messages
export const getTeacherMessages = createServerFn()
  .inputValidator(messageFilterSchema)
  .handler(async ({ data: _data }) => {
    // TODO: Implement with actual database queries
    return {
      messages: [] as Array<{
        id: string
        senderType: 'teacher' | 'parent'
        senderName: string
        recipientName: string
        studentName: string | null
        subject: string | null
        preview: string
        isRead: boolean
        isStarred: boolean
        createdAt: string
        threadId: string | null
      }>,
      total: 0,
      page: 1,
      pageSize: 20,
    }
  })

// Send message
export const sendMessage = createServerFn()
  .inputValidator(
    messageSchema.extend({
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data: _data }) => {
    // TODO: Implement with actual database operations
    // 1. Create message record
    // 2. Create notification for parent
    return {
      success: true,
      messageId: 'mock-message-id',
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
  .handler(async ({ data: _data }) => {
    // TODO: Implement with actual database queries
    return {
      message: null as {
        id: string
        senderType: 'teacher' | 'parent'
        senderName: string
        recipientName: string
        studentName: string | null
        className: string | null
        subject: string | null
        content: string
        attachments: Array<{ name: string, url: string, type: string, size: number }>
        isRead: boolean
        readAt: string | null
        createdAt: string
        threadId: string | null
        thread: Array<{
          id: string
          senderType: 'teacher' | 'parent'
          senderName: string
          content: string
          createdAt: string
        }>
      } | null,
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
  .handler(async ({ data: _data }) => {
    // TODO: Implement with actual database operations
    return {
      success: true,
    }
  })

// Get message templates
export const getMessageTemplates = createServerFn()
  .inputValidator(
    z.object({
      schoolId: z.string(),
      category: z.string().optional(),
    }),
  )
  .handler(async ({ data: _data }) => {
    // TODO: Implement with actual database queries
    return {
      templates: [] as Array<{
        id: string
        name: string
        category: string
        subject: string | null
        content: string
        placeholders: string[]
      }>,
    }
  })

// Search parents to message
export const searchParents = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      query: z.string().min(2),
      classId: z.string().optional(),
    }),
  )
  .handler(async ({ data: _data }) => {
    // TODO: Implement with actual database queries
    // Only return parents of students in teacher's classes
    return {
      parents: [] as Array<{
        id: string
        name: string
        phone: string | null
        studentName: string
        className: string
      }>,
    }
  })
