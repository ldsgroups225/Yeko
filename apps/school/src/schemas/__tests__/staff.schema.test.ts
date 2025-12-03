import { describe, expect, test } from 'vitest'
import { staffPositions, staffSchema } from '../staff'

describe('staff Schema Validation', () => {
  describe('userId field', () => {
    test('should require userId', () => {
      const result = staffSchema.safeParse({
        position: 'accountant',
        status: 'active',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('userId')
      }
    })

    test('should reject empty userId', () => {
      const result = staffSchema.safeParse({
        userId: '',
        position: 'accountant',
        status: 'active',
      })

      expect(result.success).toBe(false)
    })

    test('should accept valid userId', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('position field', () => {
    test('should accept all valid positions', () => {
      staffPositions.forEach((position) => {
        const result = staffSchema.safeParse({
          userId: 'user123',
          position,
          status: 'active',
        })
        expect(result.success).toBe(true)
      })
    })

    test('should accept "academic_coordinator"', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'academic_coordinator',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept "discipline_officer"', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'discipline_officer',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept "accountant"', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept "cashier"', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'cashier',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept "registrar"', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'registrar',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept "other"', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'other',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should reject invalid position', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'invalid_position',
        status: 'active',
      })

      expect(result.success).toBe(false)
    })

    test('should require position field', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        status: 'active',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('department field', () => {
    test('should accept optional department', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        department: 'Finance',
        status: 'active',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.department).toBe('Finance')
      }
    })

    test('should accept null department', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        department: null,
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should work without department', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('hireDate field', () => {
    test('should accept valid past date', () => {
      const pastDate = new Date('2020-01-15')
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        hireDate: pastDate,
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept today as hire date', () => {
      const today = new Date()
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        hireDate: today,
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should reject future date', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        hireDate: futureDate,
        status: 'active',
      })

      expect(result.success).toBe(false)
    })

    test('should accept null hireDate', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        hireDate: null,
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should work without hireDate', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('status field', () => {
    test('should accept "active" status', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        status: 'active',
      })

      expect(result.success).toBe(true)
    })

    test('should accept "inactive" status', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        status: 'inactive',
      })

      expect(result.success).toBe(true)
    })

    test('should accept "on_leave" status', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        status: 'on_leave',
      })

      expect(result.success).toBe(true)
    })

    test('should reject invalid status', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
        status: 'invalid',
      })

      expect(result.success).toBe(false)
    })

    test('should default to "active" when not provided', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'accountant',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('active')
      }
    })
  })

  describe('complete valid staff', () => {
    test('should accept staff with all fields', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'academic_coordinator',
        department: 'Academic Affairs',
        hireDate: new Date('2020-09-01'),
        status: 'active',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userId).toBe('user123')
        expect(result.data.position).toBe('academic_coordinator')
        expect(result.data.department).toBe('Academic Affairs')
        expect(result.data.status).toBe('active')
      }
    })

    test('should accept staff with minimal required fields', () => {
      const result = staffSchema.safeParse({
        userId: 'user123',
        position: 'cashier',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('active')
      }
    })
  })
})

describe('staff Positions Constant', () => {
  test('should contain all expected positions', () => {
    const expectedPositions = [
      'academic_coordinator',
      'discipline_officer',
      'accountant',
      'cashier',
      'registrar',
      'other',
    ]

    expect(staffPositions).toStrictEqual(expectedPositions)
  })

  test('should have exactly 6 positions', () => {
    expect(staffPositions).toHaveLength(6)
  })
})
