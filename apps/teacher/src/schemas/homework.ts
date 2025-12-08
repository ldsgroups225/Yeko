import { z } from 'zod'

export const homeworkStatuses = ['draft', 'active', 'closed', 'cancelled'] as const

export const homeworkSchema = z.object({
  schoolId: z.string().min(1),
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  classSessionId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  instructions: z.string().max(5000).optional(),
  dueDate: z.string(), // ISO date string
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:MM format
  maxPoints: z.number().int().min(0).max(1000).optional(),
  isGraded: z.boolean().default(false),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number(),
  })).default([]),
  status: z.enum(homeworkStatuses).default('active'),
})

export type HomeworkInput = z.infer<typeof homeworkSchema>

export const homeworkUpdateSchema = homeworkSchema.partial().extend({
  id: z.string().min(1),
})

export type HomeworkUpdateInput = z.infer<typeof homeworkUpdateSchema>
