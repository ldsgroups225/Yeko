import { z } from 'zod'

export const startSessionSchema = z.object({
  timetableSessionId: z.string().min(1),
  teacherId: z.string().min(1),
  date: z.string(), // ISO date string
  topic: z.string().max(500).optional(),
  chapterId: z.string().optional(),
})

export type StartSessionInput = z.infer<typeof startSessionSchema>

export const participationGradeSchema = z.object({
  studentId: z.string().min(1),
  grade: z.number().min(0).max(20),
  comment: z.string().max(1000).optional(),
})

export type ParticipationGrade = z.infer<typeof participationGradeSchema>

export const completeSessionSchema = z.object({
  sessionId: z.string().min(1),
  teacherId: z.string().min(1).optional(), // For authorization
  studentsPresent: z.number().int().min(0),
  studentsAbsent: z.number().int().min(0),
  attendanceRecords: z.record(z.string(), z.enum(['present', 'absent', 'late'])).optional(), // studentId -> status
  participationGrades: z.array(participationGradeSchema).optional(),
  notes: z.string().max(5000).optional(),
  homework: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.string(),
  }).nullable().optional(),
  lessonCompleted: z.boolean().default(true),
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
