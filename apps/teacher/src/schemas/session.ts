import { z } from 'zod'

export const startSessionSchema = z.object({
  timetableSessionId: z.string().min(1),
  teacherId: z.string().min(1),
  date: z.string(), // ISO date string
  topic: z.string().max(500).optional(),
  chapterId: z.string().optional(),
})

export type StartSessionInput = z.infer<typeof startSessionSchema>

export const completeSessionSchema = z.object({
  sessionId: z.string().min(1),
  teacherId: z.string().min(1).optional(), // For authorization
  studentsPresent: z.number().int().min(0),
  studentsAbsent: z.number().int().min(0),
  notes: z.string().max(5000).optional(),
  homework: z.string().max(2000).optional(),
  chapterId: z.string().optional(),
})

export type CompleteSessionInput = z.infer<typeof completeSessionSchema>

export const updateAttendanceSchema = z.object({
  sessionId: z.string().min(1),
  teacherId: z.string().min(1).optional(), // For authorization
  studentsPresent: z.number().int().min(0),
  studentsAbsent: z.number().int().min(0),
})

export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>
