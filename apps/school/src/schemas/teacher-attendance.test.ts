import { describe, expect, test } from 'vitest'

import {
  bulkTeacherAttendanceSchema,
  teacherAttendanceSchema,
  teacherAttendanceStatuses,
} from './teacher-attendance'

describe('teacherAttendanceSchema', () => {
  const validData = {
    teacherId: 'teacher-123',
    date: '2025-12-08',
    status: 'present' as const,
  }

  test('should validate valid teacher attendance data', () => {
    const result = teacherAttendanceSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('should validate all status types', () => {
    for (const status of teacherAttendanceStatuses) {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status })
      expect(result.success).toBe(true)
    }
  })

  test('should reject empty teacherId', () => {
    const result = teacherAttendanceSchema.safeParse({ ...validData, teacherId: '' })
    expect(result.success).toBe(false)
  })

  test('should reject invalid date format', () => {
    const result = teacherAttendanceSchema.safeParse({ ...validData, date: '08-12-2025' })
    expect(result.success).toBe(false)
  })

  test('should reject invalid status', () => {
    const result = teacherAttendanceSchema.safeParse({ ...validData, status: 'invalid' })
    expect(result.success).toBe(false)
  })

  test('should validate optional arrivalTime', () => {
    const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: '08:30' })
    expect(result.success).toBe(true)
  })

  test('should reject invalid arrivalTime format', () => {
    const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: '8:30' })
    expect(result.success).toBe(false)
  })

  test('should validate optional departureTime', () => {
    const result = teacherAttendanceSchema.safeParse({ ...validData, departureTime: '17:00' })
    expect(result.success).toBe(true)
  })

  test('should allow null for optional fields', () => {
    const result = teacherAttendanceSchema.safeParse({
      ...validData,
      arrivalTime: null,
      departureTime: null,
      reason: null,
      notes: null,
    })
    expect(result.success).toBe(true)
  })

  test('should reject reason exceeding max length', () => {
    const result = teacherAttendanceSchema.safeParse({
      ...validData,
      reason: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  test('should reject notes exceeding max length', () => {
    const result = teacherAttendanceSchema.safeParse({
      ...validData,
      notes: 'a'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })
})

describe('bulkTeacherAttendanceSchema', () => {
  const validBulkData = {
    date: '2025-12-08',
    entries: [
      { teacherId: 'teacher-1', status: 'present' as const },
      { teacherId: 'teacher-2', status: 'late' as const, arrivalTime: '08:15' },
      { teacherId: 'teacher-3', status: 'absent' as const, reason: 'Sick leave' },
    ],
  }

  test('should validate valid bulk attendance data', () => {
    const result = bulkTeacherAttendanceSchema.safeParse(validBulkData)
    expect(result.success).toBe(true)
  })

  test('should reject invalid date format', () => {
    const result = bulkTeacherAttendanceSchema.safeParse({
      ...validBulkData,
      date: 'invalid-date',
    })
    expect(result.success).toBe(false)
  })

  test('should reject empty entries array', () => {
    const result = bulkTeacherAttendanceSchema.safeParse({
      date: '2025-12-08',
      entries: [],
    })
    expect(result.success).toBe(true) // Empty array is valid
  })

  test('should reject entry with empty teacherId', () => {
    const result = bulkTeacherAttendanceSchema.safeParse({
      date: '2025-12-08',
      entries: [{ teacherId: '', status: 'present' }],
    })
    expect(result.success).toBe(false)
  })

  test('should reject entry with invalid status', () => {
    const result = bulkTeacherAttendanceSchema.safeParse({
      date: '2025-12-08',
      entries: [{ teacherId: 'teacher-1', status: 'invalid' }],
    })
    expect(result.success).toBe(false)
  })
})
