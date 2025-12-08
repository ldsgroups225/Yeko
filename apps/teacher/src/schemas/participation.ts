import { z } from 'zod'

export const participationGradeSchema = z.object({
  studentId: z.string().min(1),
  classSessionId: z.string().min(1),
  grade: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

export type ParticipationGradeInput = z.infer<typeof participationGradeSchema>

export const bulkParticipationSchema = z.object({
  classSessionId: z.string().min(1),
  teacherId: z.string().min(1),
  grades: z.array(z.object({
    studentId: z.string().min(1),
    grade: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
  })),
})

export type BulkParticipationInput = z.infer<typeof bulkParticipationSchema>
