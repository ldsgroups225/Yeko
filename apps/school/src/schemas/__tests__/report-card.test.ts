import { describe, expect, test } from 'vitest'

import {
  bulkGenerateReportCardsSchema,
  bulkSendReportCardsSchema,
  createReportCardTemplateSchema,
  createTeacherCommentSchema,
  generateReportCardSchema,
  getReportCardsSchema,
  reportCardTemplateConfigSchema,
  sendReportCardSchema,
  updateHomeroomCommentSchema,
  updateReportCardTemplateSchema,
  updateTeacherCommentSchema,
} from '../report-card'

describe('report Card Schemas', () => {
  describe('reportCardTemplateConfigSchema', () => {
    test('should validate valid config', () => {
      const validConfig = {
        showRank: true,
        showAttendance: true,
        showConduct: false,
        showComments: true,
        sections: ['grades', 'comments', 'attendance'],
        gradingScale: [
          { min: 0, max: 9, label: 'Insuffisant' },
          { min: 10, max: 14, label: 'Passable' },
          { min: 15, max: 20, label: 'Bien' },
        ],
      }

      const result = reportCardTemplateConfigSchema.safeParse(validConfig)
      expect(result.success).toBe(true)
    })

    test('should accept empty config', () => {
      const result = reportCardTemplateConfigSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('createReportCardTemplateSchema', () => {
    test('should validate valid template data', () => {
      const validData = {
        schoolId: 'school-123',
        name: 'Bulletin Standard',
        isDefault: true,
        primaryColor: '#1e40af',
        fontFamily: 'DM Sans',
      }

      const result = createReportCardTemplateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject missing schoolId', () => {
      const invalidData = {
        name: 'Bulletin Standard',
      }

      const result = createReportCardTemplateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid color format', () => {
      const invalidData = {
        schoolId: 'school-123',
        name: 'Bulletin',
        primaryColor: 'invalid-color',
      }

      const result = createReportCardTemplateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept valid hex colors', () => {
      const validData = {
        schoolId: 'school-123',
        name: 'Bulletin',
        primaryColor: '#FF5733',
      }

      const result = createReportCardTemplateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('updateReportCardTemplateSchema', () => {
    test('should validate partial update', () => {
      const validData = {
        id: 'template-123',
        name: 'Updated Name',
      }

      const result = updateReportCardTemplateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should require id', () => {
      const invalidData = {
        name: 'Updated Name',
      }

      const result = updateReportCardTemplateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('getReportCardsSchema', () => {
    test('should validate valid query params', () => {
      const validData = {
        classId: 'class-123',
        termId: 'term-123',
        status: 'generated',
      }

      const result = getReportCardsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid status', () => {
      const invalidData = {
        classId: 'class-123',
        termId: 'term-123',
        status: 'invalid-status',
      }

      const result = getReportCardsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should accept all valid statuses', () => {
      const statuses = ['draft', 'generated', 'sent', 'delivered', 'viewed']

      for (const status of statuses) {
        const result = getReportCardsSchema.safeParse({
          classId: 'class-123',
          termId: 'term-123',
          status,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('generateReportCardSchema', () => {
    test('should validate valid generation data', () => {
      const validData = {
        studentId: 'student-123',
        classId: 'class-123',
        termId: 'term-123',
        schoolYearId: 'year-123',
        templateId: 'template-123',
        homeroomComment: 'Excellent travail ce trimestre.',
      }

      const result = generateReportCardSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject missing required fields', () => {
      const invalidData = {
        studentId: 'student-123',
        // Missing classId, termId, schoolYearId
      }

      const result = generateReportCardSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject comment exceeding max length', () => {
      const invalidData = {
        studentId: 'student-123',
        classId: 'class-123',
        termId: 'term-123',
        schoolYearId: 'year-123',
        homeroomComment: 'a'.repeat(1001),
      }

      const result = generateReportCardSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('bulkGenerateReportCardsSchema', () => {
    test('should validate bulk generation data', () => {
      const validData = {
        classId: 'class-123',
        termId: 'term-123',
        schoolYearId: 'year-123',
        studentIds: ['student-1', 'student-2', 'student-3'],
      }

      const result = bulkGenerateReportCardsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should accept empty studentIds array', () => {
      const validData = {
        classId: 'class-123',
        termId: 'term-123',
        schoolYearId: 'year-123',
        studentIds: [],
      }

      const result = bulkGenerateReportCardsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('sendReportCardSchema', () => {
    test('should validate email delivery', () => {
      const validData = {
        reportCardId: 'rc-123',
        deliveryMethod: 'email',
        recipientEmail: 'parent@example.com',
      }

      const result = sendReportCardSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should validate SMS delivery', () => {
      const validData = {
        reportCardId: 'rc-123',
        deliveryMethod: 'sms',
        recipientPhone: '+2250701020304',
      }

      const result = sendReportCardSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid delivery method', () => {
      const invalidData = {
        reportCardId: 'rc-123',
        deliveryMethod: 'pigeon',
      }

      const result = sendReportCardSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid email format', () => {
      const invalidData = {
        reportCardId: 'rc-123',
        deliveryMethod: 'email',
        recipientEmail: 'invalid-email',
      }

      const result = sendReportCardSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('bulkSendReportCardsSchema', () => {
    test('should validate bulk send data', () => {
      const validData = {
        reportCardIds: ['rc-1', 'rc-2', 'rc-3'],
        deliveryMethod: 'email',
      }

      const result = bulkSendReportCardsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject empty reportCardIds array', () => {
      const invalidData = {
        reportCardIds: [],
        deliveryMethod: 'email',
      }

      const result = bulkSendReportCardsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('updateHomeroomCommentSchema', () => {
    test('should validate valid comment update', () => {
      const validData = {
        reportCardId: 'rc-123',
        homeroomComment: 'Très bon trimestre.',
      }

      const result = updateHomeroomCommentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject comment exceeding max length', () => {
      const invalidData = {
        reportCardId: 'rc-123',
        homeroomComment: 'a'.repeat(1001),
      }

      const result = updateHomeroomCommentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createTeacherCommentSchema', () => {
    test('should validate valid teacher comment', () => {
      const validData = {
        reportCardId: 'rc-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        comment: 'Bon travail en mathématiques.',
      }

      const result = createTeacherCommentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject empty comment', () => {
      const invalidData = {
        reportCardId: 'rc-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        comment: '',
      }

      const result = createTeacherCommentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject comment exceeding max length', () => {
      const invalidData = {
        reportCardId: 'rc-123',
        subjectId: 'subject-123',
        teacherId: 'teacher-123',
        comment: 'a'.repeat(501),
      }

      const result = createTeacherCommentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('updateTeacherCommentSchema', () => {
    test('should validate valid update', () => {
      const validData = {
        id: 'comment-123',
        comment: 'Updated comment.',
      }

      const result = updateTeacherCommentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
