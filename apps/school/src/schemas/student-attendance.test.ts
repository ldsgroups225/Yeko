import { describe, expect } from 'vitest'

import {
  absenceReasonCategories,
  bulkStudentAttendanceSchema,
  excuseAbsenceSchema,
  studentAttendanceSchema,
  studentAttendanceStatuses,
} from './student-attendance'

describe('studentAttendanceSchema', () => {
  const validData = {
    studentId: 'student-123',
    classId: 'class-456',
    date: '2025-12-08',
    status: 'present' as const,
  }

  test('should validate valid student attendance data', () => {
    const result = studentAttendanceSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('should validate all status types', () => {
    for (const status of studentAttendanceStatuses) {
      const result = studentAttendanceSchema.safeParse({ ...validData, status })
      expect(result.success).toBe(true)
    }
  })

  test('should reject empty studentId', () => {
    const result = studentAttendanceSchema.safeParse({ ...validData, studentId: '' })
    expect(result.success).toBe(false)
  })

  test('should reject empty classId', () => {
    const result = studentAttendanceSchema.safeParse({ ...validData, classId: '' })
    expect(result.success).toBe(false)
  })

  test('should reject invalid date format', () => {
    const result = studentAttendanceSchema.safeParse({ ...validData, date: '08/12/2025' })
    expect(result.success).toBe(false)
  })

  test('should reject invalid status', () => {
    const result = studentAttendanceSchema.safeParse({ ...validData, status: 'unknown' })
    expect(result.success).toBe(false)
  })

  test('should validate optional classSessionId', () => {
    const result = studentAttendanceSchema.safeParse({
      ...validData,
      classSessionId: 'session-789',
    })
    expect(result.success).toBe(true)
  })

  test('should validate optional arrivalTime', () => {
    const result = studentAttendanceSchema.safeParse({ ...validData, arrivalTime: '08:30' })
    expect(result.success).toBe(true)
  })

  test('should reject invalid arrivalTime format', () => {
    const result = studentAttendanceSchema.safeParse({ ...validData, arrivalTime: '8:30 AM' })
    expect(result.success).toBe(false)
  })

  test('should validate all reason categories', () => {
    for (const category of absenceReasonCategories) {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reasonCategory: category,
      })
      expect(result.success).toBe(true)
    }
  })

  test('should allow null for optional fields', () => {
    const result = studentAttendanceSchema.safeParse({
      ...validData,
      classSessionId: null,
      arrivalTime: null,
      reason: null,
      reasonCategory: null,
      notes: null,
    })
    expect(result.success).toBe(true)
  })

  test('should reject reason exceeding max length', () => {
    const result = studentAttendanceSchema.safeParse({
      ...validData,
      reason: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe('bulkStudentAttendanceSchema', () => {
  const validBulkData = {
    classId: 'class-456',
    date: '2025-12-08',
    entries: [
      { studentId: 'student-1', status: 'present' as const },
      { studentId: 'student-2', status: 'late' as const, arrivalTime: '08:15' },
      { studentId: 'student-3', status: 'absent' as const, reasonCategory: 'illness' as const },
    ],
  }

  test('should validate valid bulk attendance data', () => {
    const result = bulkStudentAttendanceSchema.safeParse(validBulkData)
    expect(result.success).toBe(true)
  })

  test('should validate with optional classSessionId', () => {
    const result = bulkStudentAttendanceSchema.safeParse({
      ...validBulkData,
      classSessionId: 'session-123',
    })
    expect(result.success).toBe(true)
  })

  test('should reject invalid date format', () => {
    const result = bulkStudentAttendanceSchema.safeParse({
      ...validBulkData,
      date: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  test('should reject entry with empty studentId', () => {
    const result = bulkStudentAttendanceSchema.safeParse({
      ...validBulkData,
      entries: [{ studentId: '', status: 'present' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('excuseAbsenceSchema', () => {
  const validData = {
    attendanceId: 'attendance-123',
    reason: 'Doctor appointment',
    reasonCategory: 'illness' as const,
  }

  test('should validate valid excuse data', () => {
    const result = excuseAbsenceSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('should reject empty attendanceId', () => {
    const result = excuseAbsenceSchema.safeParse({ ...validData, attendanceId: '' })
    expect(result.success).toBe(false)
  })

  test('should reject empty reason', () => {
    const result = excuseAbsenceSchema.safeParse({ ...validData, reason: '' })
    expect(result.success).toBe(false)
  })

  test('should reject invalid reasonCategory', () => {
    const result = excuseAbsenceSchema.safeParse({ ...validData, reasonCategory: 'invalid' })
    expect(result.success).toBe(false)
  })

  test('should validate all reason categories', () => {
    for (const category of absenceReasonCategories) {
      const result = excuseAbsenceSchema.safeParse({ ...validData, reasonCategory: category })
      expect(result.success).toBe(true)
    }
  })
})
