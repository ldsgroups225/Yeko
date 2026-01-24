import { describe, expect, test } from 'vitest'
import { userCreateSchema, userSchema, userUpdateSchema } from '../user'

describe('user Schema Validation', () => {
  describe('name field', () => {
    test('should reject names shorter than 2 characters', () => {
      const result = userSchema.safeParse({
        name: 'A',
        email: 'test@example.com',
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('name')
      }
    })

    test('should reject names longer than 100 characters', () => {
      const longName = 'A'.repeat(101)
      const result = userSchema.safeParse({
        name: longName,
        email: 'test@example.com',
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(false)
    })

    test('should accept valid names', () => {
      const validNames = ['John Doe', 'Marie-Claire', 'Jean-Baptiste Kouassi']

      validNames.forEach((name) => {
        const result = userSchema.safeParse({
          name,
          email: 'test@example.com',
          status: 'active',
          roleIds: ['role1'],
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('email field', () => {
    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
        'double@@domain.com',
      ]

      invalidEmails.forEach((email) => {
        const result = userSchema.safeParse({
          name: 'Test User',
          email,
          status: 'active',
          roleIds: ['role1'],
        })
        expect(result.success).toBe(false)
      })
    })

    test('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@school.ci',
        'admin+test@domain.co.uk',
        'user123@test-domain.com',
      ]

      validEmails.forEach((email) => {
        const result = userSchema.safeParse({
          name: 'Test User',
          email,
          status: 'active',
          roleIds: ['role1'],
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('phone field', () => {
    test('should accept optional phone number', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+225 01 02 03 04',
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.phone).toBe('+225 01 02 03 04')
      }
    })

    test('should accept null phone', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        phone: null,
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
    })

    test('should work without phone', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
    })
  })

  describe('avatarUrl field', () => {
    test('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'just-text',
        'missing-protocol.com',
      ]

      invalidUrls.forEach((avatarUrl) => {
        const result = userSchema.safeParse({
          name: 'Test User',
          email: 'test@example.com',
          avatarUrl,
          status: 'active',
          roleIds: ['role1'],
        })
        expect(result.success).toBe(false)
      })
    })

    test('should accept valid URLs', () => {
      const validUrls = [
        'https://example.com/avatar.jpg',
        'http://cdn.example.com/images/user.png',
        'https://storage.googleapis.com/bucket/avatar.webp',
      ]

      validUrls.forEach((avatarUrl) => {
        const result = userSchema.safeParse({
          name: 'Test User',
          email: 'test@example.com',
          avatarUrl,
          status: 'active',
          roleIds: ['role1'],
        })
        expect(result.success).toBe(true)
      })
    })

    test('should accept null avatarUrl', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        avatarUrl: null,
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
    })

    test('should work without avatarUrl', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
    })
  })

  describe('status field', () => {
    test('should accept "active" status', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('active')
      }
    })

    test('should accept "inactive" status', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'inactive',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
    })

    test('should accept "suspended" status', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'suspended',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
    })

    test('should reject invalid status', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'invalid',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(false)
    })

    test('should require status field', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(false)
    })
  })

  describe('roleIds field', () => {
    test('should accept empty role list', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'active',
        roleIds: [],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.roleIds).toHaveLength(0)
      }
    })

    test('should accept single role', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
    })

    test('should accept multiple roles', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'active',
        roleIds: ['role1', 'role2', 'role3'],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.roleIds).toHaveLength(3)
      }
    })

    test('should accept missing roleIds field (default to empty array)', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'active',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.roleIds).toStrictEqual([])
      }
    })
  })

  describe('complete valid user', () => {
    test('should accept user with all fields', () => {
      const result = userSchema.safeParse({
        name: 'Jean-Baptiste Kouassi',
        email: 'jb.kouassi@school.ci',
        phone: '+225 07 08 09 10',
        avatarUrl: 'https://example.com/avatar.jpg',
        status: 'active',
        roleIds: ['teacher', 'coordinator'],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Jean-Baptiste Kouassi')
        expect(result.data.email).toBe('jb.kouassi@school.ci')
        expect(result.data.phone).toBe('+225 07 08 09 10')
        expect(result.data.status).toBe('active')
        expect(result.data.roleIds).toHaveLength(2)
      }
    })

    test('should accept user with minimal required fields', () => {
      const result = userSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        status: 'active',
        roleIds: ['role1'],
      })

      expect(result.success).toBe(true)
    })
  })
})

describe('user Create Schema', () => {
  test('should be identical to base user schema', () => {
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      status: 'active',
      roleIds: ['role1'],
    }

    const baseResult = userSchema.safeParse(testData)
    const createResult = userCreateSchema.safeParse(testData)

    expect(baseResult.success).toBe(createResult.success)
  })
})

describe('user Update Schema', () => {
  test('should allow partial updates', () => {
    const result = userUpdateSchema.safeParse({
      name: 'Updated Name',
    })

    expect(result.success).toBe(true)
  })

  test('should allow updating only email', () => {
    const result = userUpdateSchema.safeParse({
      email: 'newemail@example.com',
    })

    expect(result.success).toBe(true)
  })

  test('should allow updating only status', () => {
    const result = userUpdateSchema.safeParse({
      status: 'inactive',
    })

    expect(result.success).toBe(true)
  })

  test('should make roleIds optional', () => {
    const result = userUpdateSchema.safeParse({
      name: 'Updated Name',
      email: 'test@example.com',
      status: 'active',
    })

    expect(result.success).toBe(true)
  })

  test('should allow empty update object', () => {
    const result = userUpdateSchema.safeParse({})

    expect(result.success).toBe(true)
  })

  test('should still validate fields when provided', () => {
    const result = userUpdateSchema.safeParse({
      email: 'invalid-email',
    })

    expect(result.success).toBe(false)
  })
})
