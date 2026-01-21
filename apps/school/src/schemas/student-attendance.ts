import { z } from 'zod'

export const studentAttendanceStatuses = ['present', 'late', 'absent', 'excused'] as const
export type StudentAttendanceStatus = (typeof studentAttendanceStatuses)[number]

export const absenceReasonCategories = ['illness', 'family', 'transport', 'weather', 'other', 'unexcused'] as const
export type AbsenceReasonCategory = (typeof absenceReasonCategories)[number]

export const studentAttendanceSchema = z.object({
  studentId: z.string().trim().min(1, 'Student is required'),
  classId: z.string().trim().min(1, 'Class is required'),
  classSessionId: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  status: z.enum(studentAttendanceStatuses),
  arrivalTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format').optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
  reasonCategory: z.enum(absenceReasonCategories).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const bulkStudentAttendanceSchema = z.object({
  classId: z.string().trim().min(1),
  classSessionId: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  entries: z.array(z.object({
    studentId: z.string().trim().min(1),
    status: z.enum(studentAttendanceStatuses),
    arrivalTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    reason: z.string().optional().nullable(),
    reasonCategory: z.enum(absenceReasonCategories).optional().nullable(),
  })),
})

export const excuseAbsenceSchema = z.object({
  attendanceId: z.string().min(1),
  reason: z.string().trim().min(1, 'Reason is required'),
  reasonCategory: z.enum(absenceReasonCategories),
})

export type StudentAttendanceInput = z.infer<typeof studentAttendanceSchema>
export type BulkStudentAttendanceInput = z.infer<typeof bulkStudentAttendanceSchema>
export type ExcuseAbsenceInput = z.infer<typeof excuseAbsenceSchema>
