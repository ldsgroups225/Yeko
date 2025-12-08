import { z } from 'zod'

export const messageSenderTypes = ['teacher', 'parent'] as const

export const messageSchema = z.object({
  schoolId: z.string().min(1),
  recipientId: z.string().min(1),
  studentId: z.string().optional(),
  classId: z.string().optional(),
  subject: z.string().max(200).optional(),
  content: z.string().min(1).max(5000),
  replyToId: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number(),
  })).default([]),
})

export type MessageInput = z.infer<typeof messageSchema>

export const messageFilterSchema = z.object({
  teacherId: z.string().min(1),
  folder: z.enum(['inbox', 'sent', 'archived']).default('inbox'),
  isRead: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
})

export type MessageFilterInput = z.infer<typeof messageFilterSchema>
