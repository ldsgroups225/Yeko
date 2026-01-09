import { describe, expect, test } from 'vitest'

import {
  createTimetableSessionSchema,
  detectConflictsSchema,
  getTimetableByClassroomSchema,
  getTimetableByClassSchema,
  getTimetableByTeacherSchema,
  importTimetableSchema,
  timeSchema,
  updateTimetableSessionSchema,
} from '../timetable'

describe('timetable Schemas', () => {
  describe('timeSchema', () => {
    test('should validate valid time formats', () => {
      const validTimes = ['00:00', '08:30', '12:00', '23:59', '14:45']

      for (const time of validTimes) {
        const result = timeSchema.safeParse(time)
        expect(result.success).toBe(true)
      }
    })

    test('should reject invalid time formats', () => {
      const invalidTimes = ['24:00', '8:30', '12:60', '25:00', 'invalid', '12:5']

      for (const time of invalidTimes) {
        const result = timeSchema.safeParse(time)
        expect(result.success).toBe(false)
      }
    })
  })

  describe('getTimetableByClassSchema', () => {
    test('should validate valid query params', () => {
      const validData = {
        classId: 'class-123',
        schoolYearId: 'year-123',
      }

      const result = getTimetableByClassSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject missing classId', () => {
      const invalidData = {
        schoolYearId: 'year-123',
      }

      const result = getTimetableByClassSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject empty classId', () => {
      const invalidData = {
        classId: '',
        schoolYearId: 'year-123',
      }

      const result = getTimetableByClassSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('getTimetableByTeacherSchema', () => {
    test('should validate valid query params', () => {
      const validData = {
        teacherId: 'teacher-123',
        schoolYearId: 'year-123',
      }

      const result = getTimetableByTeacherSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('getTimetableByClassroomSchema', () => {
    test('should validate valid query params', () => {
      const validData = {
        classroomId: 'room-123',
        schoolYearId: 'year-123',
      }

      const result = getTimetableByClassroomSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('createTimetableSessionSchema', () => {
    test('should validate valid session data', () => {
      const validData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        classroomId: 'room-123',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        notes: 'Regular class',
        color: '#3b82f6',
      }

      const result = createTimetableSessionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid day of week', () => {
      const invalidData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        dayOfWeek: 8, // Invalid: must be 1-7
        startTime: '08:00',
        endTime: '09:00',
      }

      const result = createTimetableSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject day of week less than 1', () => {
      const invalidData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '09:00',
      }

      const result = createTimetableSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject end time before start time', () => {
      const invalidData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '09:00', // Before start time
      }

      const result = createTimetableSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject equal start and end time', () => {
      const invalidData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '09:00',
      }

      const result = createTimetableSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid color format', () => {
      const invalidData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        color: 'red', // Invalid: must be hex
      }

      const result = createTimetableSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept valid date formats for effective dates', () => {
      const validData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        effectiveFrom: '2024-09-01',
        effectiveUntil: '2025-06-30',
      }

      const result = createTimetableSessionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid date formats', () => {
      const invalidData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        effectiveFrom: '01-09-2024', // Invalid format
      }

      const result = createTimetableSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('updateTimetableSessionSchema', () => {
    test('should validate partial update', () => {
      const validData = {
        id: 'session-123',
        startTime: '09:00',
        endTime: '10:00',
      }

      const result = updateTimetableSessionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require id', () => {
      const invalidData = {
        startTime: '09:00',
      }

      const result = updateTimetableSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept null for optional fields', () => {
      const validData = {
        id: 'session-123',
        classroomId: null,
        notes: null,
        color: null,
      }

      const result = updateTimetableSessionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('importTimetableSchema', () => {
    test('should validate valid import data', () => {
      const validData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        sessions: [
          {
            classId: 'class-123',
            subjectId: 'subject-123',
            teacherId: 'teacher-123',
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '09:00',
          },
          {
            classId: 'class-123',
            subjectId: 'subject-456',
            teacherId: 'teacher-456',
            dayOfWeek: 2,
            startTime: '09:00',
            endTime: '10:00',
          },
        ],
        replaceExisting: true,
      }

      const result = importTimetableSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject empty sessions array', () => {
      const invalidData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        sessions: [],
      }

      const result = importTimetableSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('detectConflictsSchema', () => {
    test('should validate valid conflict detection params', () => {
      const validData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        teacherId: 'teacher-123',
        classroomId: 'room-123',
        classId: 'class-123',
        excludeSessionId: 'session-123',
      }

      const result = detectConflictsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should accept minimal required fields', () => {
      const validData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        dayOfWeek: 3,
        startTime: '14:00',
        endTime: '15:00',
      }

      const result = detectConflictsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('day of Week Validation', () => {
    test('should accept all valid days (1-7)', () => {
      for (let day = 1; day <= 7; day++) {
        const validData = {
          schoolId: 'school-123',
          schoolYearId: 'year-123',
          classId: 'class-123',
          subjectId: 'subject-123',
          teacherId: 'teacher-123',
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '09:00',
        }

        const result = createTimetableSessionSchema.safeParse(validData)
        expect(result.success).toBe(true)
      }
    })
  })
})
