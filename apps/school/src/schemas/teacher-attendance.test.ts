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

  describe('valid data validation', () => {
    test('should validate valid teacher attendance data', () => {
      const result = teacherAttendanceSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data structure', () => {
      const result = teacherAttendanceSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.teacherId).toBe('teacher-123')
        expect(result.data.date).toBe('2025-12-08')
        expect(result.data.status).toBe('present')
      }
    })
  })

  describe('teacher status validation', () => {
    test('should validate all status types', () => {
      for (const status of teacherAttendanceStatuses) {
        const result = teacherAttendanceSchema.safeParse({ ...validData, status })
        expect(result.success).toBe(true)
      }
    })

    test('should accept present status', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status: 'present' })
      expect(result.success).toBe(true)
    })

    test('should accept late status with arrivalTime', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        status: 'late',
        arrivalTime: '08:45',
      })
      expect(result.success).toBe(true)
    })

    test('should accept absent status', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status: 'absent' })
      expect(result.success).toBe(true)
    })

    test('should accept excused status', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status: 'excused' })
      expect(result.success).toBe(true)
    })

    test('should accept on_leave status', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status: 'on_leave' })
      expect(result.success).toBe(true)
    })

    test('should reject invalid status', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status: 'unknown' })
      expect(result.success).toBe(false)
    })

    test('should reject empty status', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status: '' as unknown as 'present' })
      expect(result.success).toBe(false)
    })

    test('should reject null status', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status: null as unknown as 'present' })
      expect(result.success).toBe(false)
    })
  })

  describe('teacher ID validation', () => {
    test('should reject empty teacherId', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, teacherId: '' })
      expect(result.success).toBe(false)
    })

    test('should accept whitespace-only teacherId (schema min(1) allows it)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, teacherId: '   ' })
      expect(result.success).toBe(true)
    })

    test('should accept teacherId with special characters', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, teacherId: 'teacher_123-abc' })
      expect(result.success).toBe(true)
    })

    test('should accept numeric teacherId', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, teacherId: '123456' })
      expect(result.success).toBe(true)
    })

    test('should accept UUID format teacherId', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        teacherId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('date validation', () => {
    test('should validate correct date format (YYYY-MM-DD)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, date: '2025-12-08' })
      expect(result.success).toBe(true)
    })

    test('should validate dates in different months', () => {
      const dates = ['2025-01-15', '2025-06-30', '2025-12-31', '2025-03-01']
      for (const date of dates) {
        const result = teacherAttendanceSchema.safeParse({ ...validData, date })
        expect(result.success).toBe(true)
      }
    })

    test('should reject invalid date format (DD-MM-YYYY)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, date: '08-12-2025' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid date format (MM/DD/YYYY)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, date: '12/08/2025' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid date format (YYYY/MM/DD)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, date: '2025/12/08' })
      expect(result.success).toBe(false)
    })

    test('should reject random string as date', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, date: 'not-a-date' })
      expect(result.success).toBe(false)
    })

    test('should reject numeric string as date', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, date: '20251208' })
      expect(result.success).toBe(false)
    })

    test('should reject empty date', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, date: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('arrivalTime validation', () => {
    test('should validate optional arrivalTime', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: '08:30' })
      expect(result.success).toBe(true)
    })

    test('should validate valid arrival times', () => {
      const times = ['00:00', '06:00', '07:30', '08:15', '12:30', '23:59']
      for (const time of times) {
        const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: time })
        expect(result.success).toBe(true)
      }
    })

    test('should reject invalid arrivalTime format (single digit hour)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: '8:30' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid arrivalTime format (single digit minute)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: '08:5' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid arrivalTime format (AM/PM)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: '8:30 AM' })
      expect(result.success).toBe(false)
    })

    test('should accept times outside normal range (schema validates format only)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: '24:00' })
      expect(result.success).toBe(true)
    })

    test('should accept invalid time format (schema validates format only)', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: '25:00' })
      expect(result.success).toBe(true)
    })

    test('should accept null arrivalTime', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, arrivalTime: null })
      expect(result.success).toBe(true)
    })

    test('should accept undefined arrivalTime', () => {
      const result = teacherAttendanceSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('departureTime validation', () => {
    test('should validate optional departureTime', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, departureTime: '17:00' })
      expect(result.success).toBe(true)
    })

    test('should validate valid departure times', () => {
      const times = ['00:00', '12:00', '15:30', '18:00', '23:59']
      for (const time of times) {
        const result = teacherAttendanceSchema.safeParse({ ...validData, departureTime: time })
        expect(result.success).toBe(true)
      }
    })

    test('should accept departureTime after arrivalTime', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        status: 'present',
        arrivalTime: '08:00',
        departureTime: '16:00',
      })
      expect(result.success).toBe(true)
    })

    test('should accept same arrivalTime and departureTime (short day)', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        status: 'present',
        arrivalTime: '08:00',
        departureTime: '08:00',
      })
      expect(result.success).toBe(true)
    })

    test('should reject invalid departureTime format', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, departureTime: '5:00 PM' })
      expect(result.success).toBe(false)
    })

    test('should accept null departureTime', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, departureTime: null })
      expect(result.success).toBe(true)
    })
  })

  describe('working hours validation', () => {
    test('should handle typical school day', () => {
      const result = teacherAttendanceSchema.safeParse({
        teacherId: 'teacher-123',
        date: '2025-12-08',
        status: 'present',
        arrivalTime: '07:30',
        departureTime: '16:30',
      })
      expect(result.success).toBe(true)
    })

    test('should handle half day (morning only)', () => {
      const result = teacherAttendanceSchema.safeParse({
        teacherId: 'teacher-123',
        date: '2025-12-08',
        status: 'present',
        arrivalTime: '07:30',
        departureTime: '12:00',
      })
      expect(result.success).toBe(true)
    })

    test('should handle half day (afternoon only)', () => {
      const result = teacherAttendanceSchema.safeParse({
        teacherId: 'teacher-123',
        date: '2025-12-08',
        status: 'present',
        arrivalTime: '12:30',
        departureTime: '17:00',
      })
      expect(result.success).toBe(true)
    })

    test('should handle early morning arrival', () => {
      const result = teacherAttendanceSchema.safeParse({
        teacherId: 'teacher-123',
        date: '2025-12-08',
        status: 'present',
        arrivalTime: '05:00',
        departureTime: '14:00',
      })
      expect(result.success).toBe(true)
    })

    test('should handle late evening departure', () => {
      const result = teacherAttendanceSchema.safeParse({
        teacherId: 'teacher-123',
        date: '2025-12-08',
        status: 'present',
        arrivalTime: '11:00',
        departureTime: '23:59',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('leave type validation', () => {
    test('should accept on_leave status', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status: 'on_leave' })
      expect(result.success).toBe(true)
    })

    test('should accept on_leave with reason', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        status: 'on_leave',
        reason: 'Annual leave',
      })
      expect(result.success).toBe(true)
    })

    test('should accept absent status with reason', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reason: 'Sick leave',
      })
      expect(result.success).toBe(true)
    })

    test('should accept excused status with reason', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        status: 'excused',
        reason: 'Medical appointment approved by principal',
      })
      expect(result.success).toBe(true)
    })

    test('should accept late status with reason', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        status: 'late',
        arrivalTime: '08:45',
        reason: 'Traffic delay',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('reason validation', () => {
    test('should validate optional reason', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reason: 'Doctor appointment',
      })
      expect(result.success).toBe(true)
    })

    test('should accept reason with special characters', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reason: 'Family emergency - daughter\'s hospital visit',
      })
      expect(result.success).toBe(true)
    })

    test('should reject reason exceeding max length (501 chars)', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        reason: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })

    test('should accept reason at max length (500 chars)', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        reason: 'a'.repeat(500),
      })
      expect(result.success).toBe(true)
    })

    test('should accept null reason', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, reason: null })
      expect(result.success).toBe(true)
    })

    test('should accept undefined reason', () => {
      const result = teacherAttendanceSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('notes validation', () => {
    test('should validate optional notes', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        notes: 'Covered for absent colleague in period 3',
      })
      expect(result.success).toBe(true)
    })

    test('should accept notes with special characters', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        notes: 'Workshop attendance - "Teaching Methods" @ Room 101',
      })
      expect(result.success).toBe(true)
    })

    test('should reject notes exceeding max length (1001 chars)', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        notes: 'a'.repeat(1001),
      })
      expect(result.success).toBe(false)
    })

    test('should accept notes at max length (1000 chars)', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        notes: 'a'.repeat(1000),
      })
      expect(result.success).toBe(true)
    })

    test('should accept null notes', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, notes: null })
      expect(result.success).toBe(true)
    })
  })

  describe('null handling for all optional fields', () => {
    test('should allow null for all optional fields', () => {
      const result = teacherAttendanceSchema.safeParse({
        ...validData,
        arrivalTime: null,
        departureTime: null,
        reason: null,
        notes: null,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle full attendance record with all fields', () => {
      const result = teacherAttendanceSchema.safeParse({
        teacherId: 'teacher-123',
        date: '2025-12-08',
        status: 'late',
        arrivalTime: '08:45',
        departureTime: '17:15',
        reason: 'Heavy traffic on main road',
        notes: 'Student homeroom covered by department head',
      })
      expect(result.success).toBe(true)
    })

    test('should handle on_leave with detailed reason', () => {
      const result = teacherAttendanceSchema.safeParse({
        teacherId: 'teacher-123',
        date: '2025-12-08',
        status: 'on_leave',
        reason: 'Annual leave approved by administration (Request #456)',
      })
      expect(result.success).toBe(true)
    })

    test('should handle present status with no arrival/departure times', () => {
      const result = teacherAttendanceSchema.safeParse({
        teacherId: 'teacher-123',
        date: '2025-12-08',
        status: 'present',
      })
      expect(result.success).toBe(true)
    })

    test('should handle midnight boundary times', () => {
      const result = teacherAttendanceSchema.safeParse({
        teacherId: 'teacher-123',
        date: '2025-12-08',
        status: 'present',
        arrivalTime: '23:50',
        departureTime: '00:30',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('error message details', () => {
    test('should provide error path for missing teacherId', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, teacherId: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const teacherIdError = result.error.issues.find(issue => issue.path.includes('teacherId'))
        expect(teacherIdError).toBeDefined()
      }
    })

    test('should provide error message for invalid date', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, date: 'invalid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const dateError = result.error.issues.find(issue => issue.path.includes('date'))
        expect(dateError).toBeDefined()
      }
    })

    test('should provide error message for invalid status', () => {
      const result = teacherAttendanceSchema.safeParse({ ...validData, status: 'invalid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const statusError = result.error.issues.find(issue => issue.path.includes('status'))
        expect(statusError).toBeDefined()
      }
    })
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

  describe('valid data validation', () => {
    test('should validate valid bulk attendance data', () => {
      const result = bulkTeacherAttendanceSchema.safeParse(validBulkData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data structure', () => {
      const result = bulkTeacherAttendanceSchema.safeParse(validBulkData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.date).toBe('2025-12-08')
        expect(result.data.entries).toHaveLength(3)
      }
    })
  })

  describe('date validation', () => {
    test('should validate date format', () => {
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

    test('should reject empty date', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        ...validBulkData,
        date: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('entries validation', () => {
    test('should validate with all entry types', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries: [
          { teacherId: 'teacher-1', status: 'present' as const },
          { teacherId: 'teacher-2', status: 'late' as const, arrivalTime: '08:15' },
          { teacherId: 'teacher-3', status: 'absent' as const, reason: 'Sick leave' },
          { teacherId: 'teacher-4', status: 'excused' as const, reason: 'Approved absence' },
          { teacherId: 'teacher-5', status: 'on_leave' as const },
        ],
      })
      expect(result.success).toBe(true)
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
        entries: [{ teacherId: 'teacher-1', status: 'invalid' as unknown as 'present' }],
      })
      expect(result.success).toBe(false)
    })

    test('should validate entry with all optional fields', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries: [
          {
            teacherId: 'teacher-1',
            status: 'late' as const,
            arrivalTime: '08:30',
            reason: 'Traffic delay',
          },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should accept empty entries array', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries: [],
      })
      expect(result.success).toBe(true)
    })

    test('should validate multiple entries with different statuses', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries: [
          { teacherId: 'teacher-1', status: 'present' as const },
          { teacherId: 'teacher-2', status: 'late' as const },
          { teacherId: 'teacher-3', status: 'absent' as const },
          { teacherId: 'teacher-4', status: 'excused' as const },
          { teacherId: 'teacher-5', status: 'on_leave' as const },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should validate entry with arrivalTime for late status', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries: [
          { teacherId: 'teacher-1', status: 'late' as const, arrivalTime: '08:45' },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should accept entry with reason for absent status', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries: [
          { teacherId: 'teacher-1', status: 'absent' as const, reason: 'Medical emergency' },
        ],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle bulk attendance for large staff', () => {
      const statuses: Array<'present' | 'absent' | 'late'> = ['present', 'absent', 'late']
      const entries = Array.from({ length: 50 }, (_, i) => ({
        teacherId: `teacher-${i + 1}`,
        status: statuses[i % 3],
        ...(i % 3 === 2 && { arrivalTime: '08:30' }),
      }))

      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.entries).toHaveLength(50)
      }
    })

    test('should handle all teachers present', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries: [
          { teacherId: 'teacher-1', status: 'present' as const },
          { teacherId: 'teacher-2', status: 'present' as const },
          { teacherId: 'teacher-3', status: 'present' as const },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should handle mixed attendance scenarios', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries: [
          { teacherId: 'teacher-1', status: 'present' as const },
          { teacherId: 'teacher-2', status: 'late' as const, arrivalTime: '08:20', reason: 'Traffic' },
          { teacherId: 'teacher-3', status: 'absent' as const, reason: 'Sick leave' },
          { teacherId: 'teacher-4', status: 'excused' as const, reason: 'Professional development' },
          { teacherId: 'teacher-5', status: 'on_leave' as const, reason: 'Annual leave' },
        ],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('error handling', () => {
    test('should provide error path for invalid entry', () => {
      const result = bulkTeacherAttendanceSchema.safeParse({
        date: '2025-12-08',
        entries: [{ teacherId: '', status: 'present' }],
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const entryError = result.error.issues.find(issue =>
          issue.path.includes('entries') && issue.path.includes('teacherId'),
        )
        expect(entryError).toBeDefined()
      }
    })
  })
})
