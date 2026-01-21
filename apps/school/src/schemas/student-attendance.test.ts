import { describe, expect, test } from 'vitest'

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

  describe('valid data validation', () => {
    test('should validate valid student attendance data', () => {
      const result = studentAttendanceSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data structure', () => {
      const result = studentAttendanceSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.studentId).toBe('student-123')
        expect(result.data.classId).toBe('class-456')
        expect(result.data.date).toBe('2025-12-08')
        expect(result.data.status).toBe('present')
      }
    })
  })

  describe('attendance status validation', () => {
    test('should validate all status types', () => {
      for (const status of studentAttendanceStatuses) {
        const result = studentAttendanceSchema.safeParse({ ...validData, status })
        expect(result.success).toBe(true)
      }
    })

    test('should accept present status', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, status: 'present' })
      expect(result.success).toBe(true)
    })

    test('should accept late status with arrivalTime', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'late',
        arrivalTime: '08:45',
      })
      expect(result.success).toBe(true)
    })

    test('should accept absent status', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, status: 'absent' })
      expect(result.success).toBe(true)
    })

    test('should accept excused status', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, status: 'excused' })
      expect(result.success).toBe(true)
    })

    test('should reject invalid status', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, status: 'unknown' })
      expect(result.success).toBe(false)
    })

    test('should reject empty status', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, status: '' as unknown as 'present' })
      expect(result.success).toBe(false)
    })

    test('should reject null status', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, status: null as unknown as 'present' })
      expect(result.success).toBe(false)
    })
  })

  describe('date validation', () => {
    test('should validate correct date format (YYYY-MM-DD)', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, date: '2025-12-08' })
      expect(result.success).toBe(true)
    })

    test('should validate dates in different months', () => {
      const dates = ['2025-01-15', '2025-06-30', '2025-12-31', '2025-03-01']
      for (const date of dates) {
        const result = studentAttendanceSchema.safeParse({ ...validData, date })
        expect(result.success).toBe(true)
      }
    })

    test('should reject invalid date format (DD-MM-YYYY)', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, date: '08-12-2025' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid date format (MM/DD/YYYY)', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, date: '12/08/2025' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid date format (YYYY/MM/DD)', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, date: '2025/12/08' })
      expect(result.success).toBe(false)
    })

    test('should reject random string as date', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, date: 'not-a-date' })
      expect(result.success).toBe(false)
    })

    test('should reject numeric string as date', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, date: '20251208' })
      expect(result.success).toBe(false)
    })

    test('should reject empty date', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, date: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('session linking validation', () => {
    test('should validate optional classSessionId', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        classSessionId: 'session-789',
      })
      expect(result.success).toBe(true)
    })

    test('should accept null classSessionId', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        classSessionId: null,
      })
      expect(result.success).toBe(true)
    })

    test('should accept undefined classSessionId', () => {
      const result = studentAttendanceSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('student ID validation', () => {
    test('should reject empty studentId', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, studentId: '' })
      expect(result.success).toBe(false)
    })

    test('should reject whitespace-only studentId', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, studentId: '   ' })
      expect(result.success).toBe(false)
    })

    test('should accept studentId with special characters', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, studentId: 'student_123-abc' })
      expect(result.success).toBe(true)
    })

    test('should accept numeric studentId', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, studentId: '123456' })
      expect(result.success).toBe(true)
    })
  })

  describe('class ID validation', () => {
    test('should reject empty classId', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, classId: '' })
      expect(result.success).toBe(false)
    })

    test('should reject whitespace-only classId', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, classId: '   ' })
      expect(result.success).toBe(false)
    })
  })

  describe('arrivalTime validation', () => {
    test('should validate optional arrivalTime', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, arrivalTime: '08:30' })
      expect(result.success).toBe(true)
    })

    test('should validate valid arrival times', () => {
      const times = ['00:00', '07:00', '08:15', '12:30', '23:59']
      for (const time of times) {
        const result = studentAttendanceSchema.safeParse({ ...validData, arrivalTime: time })
        expect(result.success).toBe(true)
      }
    })

    test('should reject invalid arrivalTime format (single digit hour)', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, arrivalTime: '8:30' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid arrivalTime format (single digit minute)', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, arrivalTime: '08:5' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid arrivalTime format (AM/PM)', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, arrivalTime: '8:30 AM' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid arrivalTime (24:00)', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, arrivalTime: '24:00' })
      expect(result.success).toBe(false)
    })

    test('should accept null arrivalTime', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, arrivalTime: null })
      expect(result.success).toBe(true)
    })
  })

  describe('reason validation', () => {
    test('should validate optional reason', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reason: 'Doctor appointment',
      })
      expect(result.success).toBe(true)
    })

    test('should accept reason with special characters', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reason: 'Student wasn\'t feeling well (fever)',
      })
      expect(result.success).toBe(true)
    })

    test('should reject reason exceeding max length (501 chars)', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        reason: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })

    test('should accept reason at max length (500 chars)', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        reason: 'a'.repeat(500),
      })
      expect(result.success).toBe(true)
    })

    test('should accept null reason', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, reason: null })
      expect(result.success).toBe(true)
    })
  })

  describe('reasonCategory validation', () => {
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

    test('should accept illness category', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reasonCategory: 'illness',
      })
      expect(result.success).toBe(true)
    })

    test('should accept family category', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reasonCategory: 'family',
      })
      expect(result.success).toBe(true)
    })

    test('should accept transport category', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reasonCategory: 'transport',
      })
      expect(result.success).toBe(true)
    })

    test('should accept unexcused category', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reasonCategory: 'unexcused',
      })
      expect(result.success).toBe(true)
    })

    test('should reject invalid reasonCategory', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
        reasonCategory: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    test('should accept null reasonCategory', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, reasonCategory: null })
      expect(result.success).toBe(true)
    })
  })

  describe('notes validation', () => {
    test('should validate optional notes', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        notes: 'Additional observation about student behavior',
      })
      expect(result.success).toBe(true)
    })

    test('should reject notes exceeding max length (1001 chars)', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        notes: 'a'.repeat(1001),
      })
      expect(result.success).toBe(false)
    })

    test('should accept notes at max length (1000 chars)', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        notes: 'a'.repeat(1000),
      })
      expect(result.success).toBe(true)
    })

    test('should accept null notes', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, notes: null })
      expect(result.success).toBe(true)
    })
  })

  describe('null handling for all optional fields', () => {
    test('should allow null for all optional fields', () => {
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

    test('should allow undefined for all optional fields', () => {
      const result = studentAttendanceSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle late arrival with excused status', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'excused',
        arrivalTime: '10:30',
        reason: 'Medical appointment',
      })
      expect(result.success).toBe(true)
    })

    test('should handle late arrival without arrivalTime', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'late',
      })
      expect(result.success).toBe(true)
    })

    test('should handle full attendance record with all fields', () => {
      const result = studentAttendanceSchema.safeParse({
        studentId: 'student-123',
        classId: 'class-456',
        classSessionId: 'session-789',
        date: '2025-12-08',
        status: 'late',
        arrivalTime: '08:45',
        reason: 'Traffic jam',
        reasonCategory: 'transport',
        notes: 'Student arrived with parent, apologized for being late',
      })
      expect(result.success).toBe(true)
    })

    test('should reject status that requires reason without reason', () => {
      const result = studentAttendanceSchema.safeParse({
        ...validData,
        status: 'absent',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('error message details', () => {
    test('should provide error message for missing studentId', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, studentId: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const studentIdError = result.error.issues.find(issue => issue.path.includes('studentId'))
        expect(studentIdError).toBeDefined()
      }
    })

    test('should provide error message for missing classId', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, classId: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const classIdError = result.error.issues.find(issue => issue.path.includes('classId'))
        expect(classIdError).toBeDefined()
      }
    })

    test('should provide error message for invalid date', () => {
      const result = studentAttendanceSchema.safeParse({ ...validData, date: 'invalid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const dateError = result.error.issues.find(issue => issue.path.includes('date'))
        expect(dateError).toBeDefined()
      }
    })
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

  describe('valid data validation', () => {
    test('should validate valid bulk attendance data', () => {
      const result = bulkStudentAttendanceSchema.safeParse(validBulkData)
      expect(result.success).toBe(true)
    })

    test('should validate bulk data with multiple entries', () => {
      const result = bulkStudentAttendanceSchema.safeParse({
        ...validBulkData,
        entries: [
          { studentId: 'student-1', status: 'present' as const },
          { studentId: 'student-2', status: 'present' as const },
          { studentId: 'student-3', status: 'absent' as const },
          { studentId: 'student-4', status: 'excused' as const },
        ],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('classId validation', () => {
    test('should validate classId', () => {
      const result = bulkStudentAttendanceSchema.safeParse(validBulkData)
      expect(result.success).toBe(true)
    })

    test('should reject empty classId', () => {
      const result = bulkStudentAttendanceSchema.safeParse({
        ...validBulkData,
        classId: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('date validation', () => {
    test('should validate date format', () => {
      const result = bulkStudentAttendanceSchema.safeParse(validBulkData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid date format', () => {
      const result = bulkStudentAttendanceSchema.safeParse({
        ...validBulkData,
        date: 'invalid-date',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('entries validation', () => {
    test('should validate with optional classSessionId', () => {
      const result = bulkStudentAttendanceSchema.safeParse({
        ...validBulkData,
        classSessionId: 'session-123',
      })
      expect(result.success).toBe(true)
    })

    test('should reject entry with empty studentId', () => {
      const result = bulkStudentAttendanceSchema.safeParse({
        ...validBulkData,
        entries: [{ studentId: '', status: 'present' }],
      })
      expect(result.success).toBe(false)
    })

    test('should reject entry with invalid status', () => {
      const result = bulkStudentAttendanceSchema.safeParse({
        ...validBulkData,
        entries: [{ studentId: 'student-1', status: 'invalid' as unknown as 'present' }],
      })
      expect(result.success).toBe(false)
    })

    test('should validate entry with all optional fields', () => {
      const result = bulkStudentAttendanceSchema.safeParse({
        ...validBulkData,
        entries: [
          {
            studentId: 'student-1',
            status: 'late' as const,
            arrivalTime: '08:30',
            reason: 'Bus delay',
            reasonCategory: 'transport',
          },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should accept empty entries array', () => {
      const result = bulkStudentAttendanceSchema.safeParse({
        classId: 'class-456',
        date: '2025-12-08',
        entries: [],
      })
      expect(result.success).toBe(true)
    })

    test('should validate multiple entries with different statuses', () => {
      const result = bulkStudentAttendanceSchema.safeParse({
        classId: 'class-456',
        date: '2025-12-08',
        entries: [
          { studentId: 'student-1', status: 'present' as const },
          { studentId: 'student-2', status: 'late' as const },
          { studentId: 'student-3', status: 'absent' as const },
          { studentId: 'student-4', status: 'excused' as const },
        ],
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('excuseAbsenceSchema', () => {
  const validData = {
    attendanceId: 'attendance-123',
    reason: 'Doctor appointment',
    reasonCategory: 'illness' as const,
  }

  describe('valid data validation', () => {
    test('should validate valid excuse data', () => {
      const result = excuseAbsenceSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data', () => {
      const result = excuseAbsenceSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.attendanceId).toBe('attendance-123')
        expect(result.data.reason).toBe('Doctor appointment')
        expect(result.data.reasonCategory).toBe('illness')
      }
    })
  })

  describe('attendanceId validation', () => {
    test('should reject empty attendanceId', () => {
      const result = excuseAbsenceSchema.safeParse({ ...validData, attendanceId: '' })
      expect(result.success).toBe(false)
    })

    test('should accept attendanceId with UUID format', () => {
      const result = excuseAbsenceSchema.safeParse({
        ...validData,
        attendanceId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('reason validation', () => {
    test('should reject empty reason', () => {
      const result = excuseAbsenceSchema.safeParse({ ...validData, reason: '' })
      expect(result.success).toBe(false)
    })

    test('should reject whitespace-only reason', () => {
      const result = excuseAbsenceSchema.safeParse({ ...validData, reason: '   ' })
      expect(result.success).toBe(false)
    })

    test('should accept detailed reason', () => {
      const result = excuseAbsenceSchema.safeParse({
        ...validData,
        reason: 'Student had high fever and was taken to the hospital',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('reasonCategory validation', () => {
    test('should validate all reason categories', () => {
      for (const category of absenceReasonCategories) {
        const result = excuseAbsenceSchema.safeParse({ ...validData, reasonCategory: category })
        expect(result.success).toBe(true)
      }
    })

    test('should reject invalid reasonCategory', () => {
      const result = excuseAbsenceSchema.safeParse({ ...validData, reasonCategory: 'invalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('edge cases', () => {
    test('should handle excuse with family category', () => {
      const result = excuseAbsenceSchema.safeParse({
        ...validData,
        reason: 'Family funeral',
        reasonCategory: 'family',
      })
      expect(result.success).toBe(true)
    })

    test('should handle excuse with other category', () => {
      const result = excuseAbsenceSchema.safeParse({
        ...validData,
        reason: 'Religious observance',
        reasonCategory: 'other',
      })
      expect(result.success).toBe(true)
    })
  })
})
