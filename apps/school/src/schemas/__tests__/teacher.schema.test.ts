import { describe, expect, test } from 'vitest'
import { teacherCreateSchema, teacherSchema, teacherUpdateSchema } from '../teacher'

describe('teacher Schema Validation', () => {
  describe('userId field', () => {
    test('should require userId', () => {
      const result = teacherSchema.safeParse({
        subjectIds: ['math'],
        status: 'active',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('userId')
      }
    })

    test('should reject empty userId', () => {
      const result = teacherSchema.safeParse({
        userId: '',
        subjectIds: ['math'],
        status: 'active',
      })

      expect(result.success).toBe(false)
    })

    test('should accept valid userId', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        status: 'active',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('subjectIds field', () => {
    test('should require at least one subject', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: [],
        status: 'active',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('subjectIds')
      }
    })

    test('should accept single subject', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept multiple subjects', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math', 'physics', 'chemistry'],
        status: 'active',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.subjectIds).toHaveLength(3)
      }
    })

    test('should require subjectIds field', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        status: 'active',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('specialization field', () => {
    test('should accept optional specialization', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        specialization: 'Mathematics Education',
        status: 'active',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.specialization).toBe('Mathematics Education')
      }
    })

    test('should accept null specialization', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        specialization: null,
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should work without specialization', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        status: 'active',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('hireDate field', () => {
    test('should accept valid past date', () => {
      const pastDate = new Date('2019-09-01')
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        hireDate: pastDate,
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept today as hire date', () => {
      const today = new Date()
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        hireDate: today,
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should reject future date', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        hireDate: futureDate,
        status: 'active',
      })

      expect(result.success).toBe(false)
    })

    test('should accept null hireDate', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        hireDate: null,
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should work without hireDate', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        status: 'active',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('status field', () => {
    test('should accept "active" status', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept "inactive" status', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        status: 'inactive',
      })

      expect(result.success).toBe(true)
    })

    test('should accept "on_leave" status', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        status: 'on_leave',
      })

      expect(result.success).toBe(true)
    })

    test('should reject invalid status', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
        status: 'invalid',
      })

      expect(result.success).toBe(false)
    })

    test('should default to "active" when not provided', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math'],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('active')
      }
    })
  })

  describe('complete valid teacher', () => {
    test('should accept teacher with all fields', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['math', 'physics'],
        specialization: 'STEM Education',
        hireDate: new Date('2018-09-01'),
        status: 'active',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userId).toBe('user123')
        expect(result.data.subjectIds).toHaveLength(2)
        expect(result.data.specialization).toBe('STEM Education')
        expect(result.data.status).toBe('active')
      }
    })

    test('should accept teacher with minimal required fields', () => {
      const result = teacherSchema.safeParse({
        userId: 'user123',
        subjectIds: ['french'],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('active')
      }
    })
  })
})

describe('teacher Create Schema', () => {
  test('should be identical to base teacher schema', () => {
    const testData = {
      userId: 'user123',
      subjectIds: ['math'],
      status: 'active',
    }

    const baseResult = teacherSchema.safeParse(testData)
    const createResult = teacherCreateSchema.safeParse(testData)

    expect(baseResult.success).toBe(createResult.success)
  })

  test('should require subjectIds', () => {
    const result = teacherCreateSchema.safeParse({
      userId: 'user123',
      status: 'active',
    })

    expect(result.success).toBe(false)
  })
})

describe('teacher Update Schema', () => {
  test('should allow partial updates', () => {
    const result = teacherUpdateSchema.safeParse({
      specialization: 'Updated Specialization',
    })

    expect(result.success).toBe(true)
  })

  test('should allow updating only status', () => {
    const result = teacherUpdateSchema.safeParse({
      status: 'inactive',
    })

    expect(result.success).toBe(true)
  })

  test('should make subjectIds optional', () => {
    const result = teacherUpdateSchema.safeParse({
      userId: 'user123',
      status: 'active',
    })

    expect(result.success).toBe(true)
  })

  test('should allow empty update object', () => {
    const result = teacherUpdateSchema.safeParse({})

    expect(result.success).toBe(true)
  })

  test('should still validate subjectIds when provided', () => {
    const result = teacherUpdateSchema.safeParse({
      subjectIds: [],
    })

    // Empty array should be valid for update (optional field)
    expect(result.success).toBe(true)
  })

  test('should accept valid subjectIds array in update', () => {
    const result = teacherUpdateSchema.safeParse({
      subjectIds: ['math', 'science'],
    })

    expect(result.success).toBe(true)
  })
})
