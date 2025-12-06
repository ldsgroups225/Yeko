import { z } from 'zod'

export const teacherSubjectSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  subjectId: z.string(),
  subject: z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string(),
    category: z.string().nullable(),
  }),
})

export const assignSubjectsSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  subjectIds: z.array(z.string()).min(1, 'Select at least one subject'),
})

export type TeacherSubjectItem = z.infer<typeof teacherSubjectSchema>
export type AssignSubjectsInput = z.infer<typeof assignSubjectsSchema>
