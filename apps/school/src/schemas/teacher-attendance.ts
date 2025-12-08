import { z } from 'zod'

export const teacherAttendanceStatuses = ['present', 'late', 'absent', 'excused', 'on_leave'] as const
export type TeacherAttendanceStatus = (typeof teacherAttendanceStatuses)[number]

export const teacherAttendanceSchema = z.object({
  teacherId: z.string().min(1, 'Teacher is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  status: z.enum(teacherAttendanceStatuses),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional().nullable(),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const bulkTeacherAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  entries: z.array(z.object({
    teacherId: z.string().min(1),
    status: z.enum(teacherAttendanceStatuses),
    arrivalTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    reason: z.string().optional().nullable(),
  })),
})

export type TeacherAttendanceInput = z.infer<typeof teacherAttendanceSchema>
export type BulkTeacherAttendanceInput = z.infer<typeof bulkTeacherAttendanceSchema>
