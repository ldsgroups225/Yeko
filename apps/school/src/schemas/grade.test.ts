import { describe, expect } from 'vitest'

import {
  bulkGradesSchema,
  createGradeSchema,
  gradeStatuses,
  gradeTypes,
  gradeValueSchema,
  rejectGradesSchema,
  submitGradesSchema,
  updateGradeSchema,
  validateGradesSchema,
} from './grade'

describe('gradeValueSchema', () => {
  test('should accept valid grades (0-20)', () => {
    expect(gradeValueSchema.safeParse(0).success).toBe(true)
    expect(gradeValueSchema.safeParse(10).success).toBe(true)
    expect(gradeValueSchema.safeParse(20).success).toBe(true)
    expect(gradeValueSchema.safeParse(15.5).success).toBe(true)
  })

  test('should accept quarter point values', () => {
    expect(gradeValueSchema.safeParse(10.25).success).toBe(true)
    expect(gradeValueSchema.safeParse(10.5).success).toBe(true)
    expect(gradeValueSchema.safeParse(10.75).success).toBe(true)
  })

  test('should reject values below 0', () => {
    const result = gradeValueSchema.safeParse(-1)
    expect(result.success).toBe(false)
  })

  test('should reject values above 20', () => {
    const result = gradeValueSchema.safeParse(21)
    expect(result.success).toBe(false)
  })

  test('should reject non-quarter point values', () => {
    expect(gradeValueSchema.safeParse(10.1).success).toBe(false)
    expect(gradeValueSchema.safeParse(10.33).success).toBe(false)
    expect(gradeValueSchema.safeParse(10.6).success).toBe(false)
  })

  test('should reject NaN and Infinity', () => {
    expect(gradeValueSchema.safeParse(Number.NaN).success).toBe(false)
    expect(gradeValueSchema.safeParse(Number.POSITIVE_INFINITY).success).toBe(false)
  })
})

describe('createGradeSchema', () => {
  const validGrade = {
    studentId: 'student-1',
    classId: 'class-1',
    subjectId: 'subject-1',
    termId: 'term-1',
    value: 15,
    type: 'test' as const,
    weight: 2,
  }

  test('should accept valid grade data', () => {
    const result = createGradeSchema.safeParse(validGrade)
    expect(result.success).toBe(true)
  })

  test('should accept all grade types', () => {
    gradeTypes.forEach((type) => {
      const result = createGradeSchema.safeParse({ ...validGrade, type })
      expect(result.success).toBe(true)
    })
  })

  test('should reject invalid grade type', () => {
    const result = createGradeSchema.safeParse({ ...validGrade, type: 'invalid' })
    expect(result.success).toBe(false)
  })

  test('should require studentId', () => {
    const { studentId: _, ...withoutStudent } = validGrade
    const result = createGradeSchema.safeParse(withoutStudent)
    expect(result.success).toBe(false)
  })

  test('should require classId', () => {
    const { classId: _, ...withoutClass } = validGrade
    const result = createGradeSchema.safeParse(withoutClass)
    expect(result.success).toBe(false)
  })

  test('should require subjectId', () => {
    const { subjectId: _, ...withoutSubject } = validGrade
    const result = createGradeSchema.safeParse(withoutSubject)
    expect(result.success).toBe(false)
  })

  test('should require termId', () => {
    const { termId: _, ...withoutTerm } = validGrade
    const result = createGradeSchema.safeParse(withoutTerm)
    expect(result.success).toBe(false)
  })

  test('should default weight to 1', () => {
    const { weight: _, ...withoutWeight } = validGrade
    const result = createGradeSchema.safeParse(withoutWeight)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.weight).toBe(1)
    }
  })

  test('should reject weight below 1', () => {
    const result = createGradeSchema.safeParse({ ...validGrade, weight: 0 })
    expect(result.success).toBe(false)
  })

  test('should reject weight above 10', () => {
    const result = createGradeSchema.safeParse({ ...validGrade, weight: 11 })
    expect(result.success).toBe(false)
  })

  test('should accept optional description', () => {
    const result = createGradeSchema.safeParse({
      ...validGrade,
      description: 'Chapitre 3 - Équations',
    })
    expect(result.success).toBe(true)
  })

  test('should reject description over 200 characters', () => {
    const result = createGradeSchema.safeParse({
      ...validGrade,
      description: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  test('should accept valid date format', () => {
    const result = createGradeSchema.safeParse({
      ...validGrade,
      gradeDate: '2025-12-07',
    })
    expect(result.success).toBe(true)
  })

  test('should reject invalid date format', () => {
    const result = createGradeSchema.safeParse({
      ...validGrade,
      gradeDate: '07/12/2025',
    })
    expect(result.success).toBe(false)
  })
})

describe('bulkGradesSchema', () => {
  const validBulkGrades = {
    classId: 'class-1',
    subjectId: 'subject-1',
    termId: 'term-1',
    type: 'test' as const,
    weight: 2,
    grades: [
      { studentId: 'student-1', value: 15 },
      { studentId: 'student-2', value: 12.5 },
    ],
  }

  test('should accept valid bulk grades', () => {
    const result = bulkGradesSchema.safeParse(validBulkGrades)
    expect(result.success).toBe(true)
  })

  test('should require at least one grade', () => {
    const result = bulkGradesSchema.safeParse({
      ...validBulkGrades,
      grades: [],
    })
    expect(result.success).toBe(false)
  })

  test('should validate each grade value', () => {
    const result = bulkGradesSchema.safeParse({
      ...validBulkGrades,
      grades: [
        { studentId: 'student-1', value: 25 }, // Invalid: > 20
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe('updateGradeSchema', () => {
  test('should require id', () => {
    const result = updateGradeSchema.safeParse({ value: 15 })
    expect(result.success).toBe(false)
  })

  test('should accept partial updates', () => {
    const result = updateGradeSchema.safeParse({
      id: 'grade-1',
      value: 16,
    })
    expect(result.success).toBe(true)
  })

  test('should validate value if provided', () => {
    const result = updateGradeSchema.safeParse({
      id: 'grade-1',
      value: 25,
    })
    expect(result.success).toBe(false)
  })
})

describe('submitGradesSchema', () => {
  test('should require at least one grade ID', () => {
    const result = submitGradesSchema.safeParse({ gradeIds: [] })
    expect(result.success).toBe(false)
  })

  test('should accept array of grade IDs', () => {
    const result = submitGradesSchema.safeParse({
      gradeIds: ['grade-1', 'grade-2'],
    })
    expect(result.success).toBe(true)
  })
})

describe('validateGradesSchema', () => {
  test('should require at least one grade ID', () => {
    const result = validateGradesSchema.safeParse({ gradeIds: [] })
    expect(result.success).toBe(false)
  })

  test('should accept optional comment', () => {
    const result = validateGradesSchema.safeParse({
      gradeIds: ['grade-1'],
      comment: 'Approved',
    })
    expect(result.success).toBe(true)
  })

  test('should reject comment over 500 characters', () => {
    const result = validateGradesSchema.safeParse({
      gradeIds: ['grade-1'],
      comment: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe('rejectGradesSchema', () => {
  test('should require reason', () => {
    const result = rejectGradesSchema.safeParse({
      gradeIds: ['grade-1'],
    })
    expect(result.success).toBe(false)
  })

  test('should require reason with at least 10 characters', () => {
    const result = rejectGradesSchema.safeParse({
      gradeIds: ['grade-1'],
      reason: 'Too short',
    })
    expect(result.success).toBe(false)
  })

  test('should accept valid rejection', () => {
    const result = rejectGradesSchema.safeParse({
      gradeIds: ['grade-1'],
      reason: 'Les notes semblent incorrectes, veuillez vérifier.',
    })
    expect(result.success).toBe(true)
  })

  test('should reject reason over 500 characters', () => {
    const result = rejectGradesSchema.safeParse({
      gradeIds: ['grade-1'],
      reason: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe('grade enums', () => {
  test('should have all grade types', () => {
    expect(gradeTypes).toContain('quiz')
    expect(gradeTypes).toContain('test')
    expect(gradeTypes).toContain('exam')
    expect(gradeTypes).toContain('participation')
    expect(gradeTypes).toContain('homework')
    expect(gradeTypes).toContain('project')
    expect(gradeTypes).toHaveLength(6)
  })

  test('should have all grade statuses', () => {
    expect(gradeStatuses).toContain('draft')
    expect(gradeStatuses).toContain('submitted')
    expect(gradeStatuses).toContain('validated')
    expect(gradeStatuses).toContain('rejected')
    expect(gradeStatuses).toHaveLength(4)
  })
})
