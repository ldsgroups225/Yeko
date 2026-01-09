import { describe, expect, test } from 'vitest'

import {
  createClassSessionSchema,
  getClassesBehindSchema,
  getClassSessionsSchema,
  getProgressOverviewSchema,
  getProgressSchema,
  markChapterCompleteSchema,
  markSessionCompletedSchema,
  recalculateProgressSchema,
  unmarkChapterCompleteSchema,
  updateClassSessionSchema,
} from '../curriculum-progress'

describe('curriculum-progress Schemas', () => {
  describe('getClassSessionsSchema', () => {
    test('should validate valid query params', () => {
      const validData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        startDate: '2024-09-01',
        endDate: '2024-12-31',
        status: 'completed' as const,
      }

      const result = getClassSessionsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require classId', () => {
      const invalidData = {
        subjectId: 'subject-123',
      }

      const result = getClassSessionsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject empty classId', () => {
      const invalidData = {
        classId: '',
      }

      const result = getClassSessionsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept minimal required fields', () => {
      const validData = {
        classId: 'class-123',
      }

      const result = getClassSessionsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid date format', () => {
      const invalidData = {
        classId: 'class-123',
        startDate: '01-09-2024', // Invalid format
      }

      const result = getClassSessionsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createClassSessionSchema', () => {
    test('should validate valid session data', () => {
      const validData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        chapterId: 'chapter-123',
        timetableSessionId: 'session-123',
        date: '2024-09-15',
        startTime: '08:00',
        endTime: '09:00',
        topic: 'Introduction to Algebra',
        objectives: 'Learn basic algebraic concepts',
        homework: 'Complete exercises 1-10',
        notes: 'Students showed good understanding',
      }

      const result = createClassSessionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require classId, subjectId, teacherId, date, startTime, endTime', () => {
      const invalidData = {
        topic: 'Some topic',
      }

      const result = createClassSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid date format', () => {
      const invalidData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        date: '15-09-2024', // Invalid format
        startTime: '08:00',
        endTime: '09:00',
      }

      const result = createClassSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid time format', () => {
      const invalidData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        date: '2024-09-15',
        startTime: '8:00', // Invalid: should be 08:00
        endTime: '09:00',
      }

      const result = createClassSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject time with invalid hours', () => {
      const invalidData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        date: '2024-09-15',
        startTime: '25:00', // Invalid hour
        endTime: '09:00',
      }

      const result = createClassSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject time with invalid minutes', () => {
      const invalidData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        date: '2024-09-15',
        startTime: '08:60', // Invalid minutes
        endTime: '09:00',
      }

      const result = createClassSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject topic exceeding max length', () => {
      const invalidData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        date: '2024-09-15',
        startTime: '08:00',
        endTime: '09:00',
        topic: 'a'.repeat(201), // Exceeds 200 char limit
      }

      const result = createClassSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept valid time formats', () => {
      const validTimes = ['00:00', '08:30', '12:00', '23:59', '14:45']

      for (const time of validTimes) {
        const validData = {
          classId: 'class-123',
          subjectId: 'subject-123',
          teacherId: 'teacher-123',
          date: '2024-09-15',
          startTime: time,
          endTime: '23:59',
        }

        const result = createClassSessionSchema.safeParse(validData)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('updateClassSessionSchema', () => {
    test('should validate partial update', () => {
      const validData = {
        id: 'session-123',
        topic: 'Updated topic',
        status: 'completed' as const,
      }

      const result = updateClassSessionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require id', () => {
      const invalidData = {
        topic: 'Updated topic',
      }

      const result = updateClassSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept null for optional fields', () => {
      const validData = {
        id: 'session-123',
        chapterId: null,
        topic: null,
        objectives: null,
        homework: null,
        notes: null,
      }

      const result = updateClassSessionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should validate attendance numbers', () => {
      const validData = {
        id: 'session-123',
        studentsPresent: 25,
        studentsAbsent: 3,
      }

      const result = updateClassSessionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject negative attendance numbers', () => {
      const invalidData = {
        id: 'session-123',
        studentsPresent: -1,
      }

      const result = updateClassSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should validate status enum', () => {
      const statuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'] as const

      for (const status of statuses) {
        const validData = {
          id: 'session-123',
          status,
        }

        const result = updateClassSessionSchema.safeParse(validData)
        expect(result.success).toBe(true)
      }
    })

    test('should reject invalid status', () => {
      const invalidData = {
        id: 'session-123',
        status: 'invalid_status',
      }

      const result = updateClassSessionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('markSessionCompletedSchema', () => {
    test('should validate valid completion data', () => {
      const validData = {
        id: 'session-123',
        chapterId: 'chapter-123',
        studentsPresent: 28,
        studentsAbsent: 2,
        notes: 'Good session',
      }

      const result = markSessionCompletedSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require id', () => {
      const invalidData = {
        chapterId: 'chapter-123',
      }

      const result = markSessionCompletedSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept minimal required fields', () => {
      const validData = {
        id: 'session-123',
      }

      const result = markSessionCompletedSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('markChapterCompleteSchema', () => {
    test('should validate valid chapter completion data', () => {
      const validData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        chapterId: 'chapter-123',
        teacherId: 'teacher-123',
        classSessionId: 'session-123',
        notes: 'Chapter completed successfully',
      }

      const result = markChapterCompleteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require classId, subjectId, chapterId, teacherId', () => {
      const invalidData = {
        notes: 'Some notes',
      }

      const result = markChapterCompleteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject empty required fields', () => {
      const invalidData = {
        classId: '',
        subjectId: 'subject-123',
        chapterId: 'chapter-123',
        teacherId: 'teacher-123',
      }

      const result = markChapterCompleteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('unmarkChapterCompleteSchema', () => {
    test('should validate valid unmark data', () => {
      const validData = {
        classId: 'class-123',
        chapterId: 'chapter-123',
      }

      const result = unmarkChapterCompleteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require both classId and chapterId', () => {
      const invalidData = {
        classId: 'class-123',
      }

      const result = unmarkChapterCompleteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('getProgressSchema', () => {
    test('should validate valid progress query', () => {
      const validData = {
        classId: 'class-123',
        termId: 'term-123',
        subjectId: 'subject-123',
      }

      const result = getProgressSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require classId and termId', () => {
      const invalidData = {
        subjectId: 'subject-123',
      }

      const result = getProgressSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept without optional subjectId', () => {
      const validData = {
        classId: 'class-123',
        termId: 'term-123',
      }

      const result = getProgressSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('getProgressOverviewSchema', () => {
    test('should validate valid overview query', () => {
      const validData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
        termId: 'term-123',
      }

      const result = getProgressOverviewSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require schoolId and schoolYearId', () => {
      const invalidData = {
        termId: 'term-123',
      }

      const result = getProgressOverviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept without optional termId', () => {
      const validData = {
        schoolId: 'school-123',
        schoolYearId: 'year-123',
      }

      const result = getProgressOverviewSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('getClassesBehindSchema', () => {
    test('should validate valid query with threshold', () => {
      const validData = {
        schoolId: 'school-123',
        termId: 'term-123',
        threshold: -15,
      }

      const result = getClassesBehindSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require schoolId and termId', () => {
      const invalidData = {
        threshold: -10,
      }

      const result = getClassesBehindSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept without optional threshold', () => {
      const validData = {
        schoolId: 'school-123',
        termId: 'term-123',
      }

      const result = getClassesBehindSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('recalculateProgressSchema', () => {
    test('should validate valid recalculation params', () => {
      const validData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        termId: 'term-123',
        programTemplateId: 'program-123',
        termStartDate: '2024-09-01',
        termEndDate: '2024-12-15',
      }

      const result = recalculateProgressSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require all fields', () => {
      const invalidData = {
        classId: 'class-123',
        subjectId: 'subject-123',
      }

      const result = recalculateProgressSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid date formats', () => {
      const invalidData = {
        classId: 'class-123',
        subjectId: 'subject-123',
        termId: 'term-123',
        programTemplateId: 'program-123',
        termStartDate: '01/09/2024', // Invalid format
        termEndDate: '2024-12-15',
      }

      const result = recalculateProgressSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('status Validation', () => {
    test('should accept all valid class session statuses', () => {
      const statuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'] as const

      for (const status of statuses) {
        const validData = {
          classId: 'class-123',
          status,
        }

        const result = getClassSessionsSchema.safeParse(validData)
        expect(result.success).toBe(true)
      }
    })
  })
})
