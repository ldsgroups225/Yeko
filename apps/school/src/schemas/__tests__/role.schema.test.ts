import { describe, expect, test } from 'vitest'
import { generateSlug, roleSchema } from '../role'

describe('role Schema Validation', () => {
  describe('name field', () => {
    test('should reject names shorter than 2 characters', () => {
      const result = roleSchema.safeParse({
        name: 'A',
        slug: 'a',
        permissions: {},
        scope: 'school',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('name')
        expect(result.error.issues[0]?.message).toContain('2')
      }
    })

    test('should reject names longer than 50 characters', () => {
      const longName = 'A'.repeat(51)
      const result = roleSchema.safeParse({
        name: longName,
        slug: 'test',
        permissions: {},
        scope: 'school',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('name')
        expect(result.error.issues[0]?.message).toContain('50')
      }
    })

    test('should accept valid names', () => {
      const result = roleSchema.safeParse({
        name: 'Administrator',
        slug: 'administrator',
        permissions: {},
        scope: 'school',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Administrator')
      }
    })
  })

  describe('slug field', () => {
    test('should reject uppercase characters', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'TestRole',
        permissions: {},
        scope: 'school',
      })

      expect(result.success).toBe(false)
    })

    test('should reject special characters', () => {
      const invalidSlugs = ['test@role', 'test role', 'test_role', 'test.role']

      invalidSlugs.forEach((slug) => {
        const result = roleSchema.safeParse({
          name: 'Test',
          slug,
          permissions: {},
          scope: 'school',
        })
        expect(result.success).toBe(false)
      })
    })

    test('should accept valid slugs with hyphens and numbers', () => {
      const validSlugs = ['admin', 'test-role', 'role123', 'my-role-2024']

      validSlugs.forEach((slug) => {
        const result = roleSchema.safeParse({
          name: 'Test',
          slug,
          permissions: {},
          scope: 'school',
        })
        expect(result.success).toBe(true)
      })
    })

    test('should reject slugs shorter than 2 characters', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'a',
        permissions: {},
        scope: 'school',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('permissions field', () => {
    test('should accept empty permissions object', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {},
        scope: 'school',
      })

      expect(result.success).toBe(true)
    })

    test('should accept valid permissions structure', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {
          users: ['view', 'create'],
          teachers: ['view', 'edit', 'delete'],
        },
        scope: 'school',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.permissions.users).toStrictEqual(['view', 'create'])
        expect(result.data.permissions.teachers).toStrictEqual(['view', 'edit', 'delete'])
      }
    })

    test('should accept permissions with multiple resources', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {
          users: ['view'],
          teachers: ['view', 'create'],
          staff: ['view', 'edit'],
          students: ['view', 'create', 'edit', 'delete'],
        },
        scope: 'school',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('scope field', () => {
    test('should accept "school" scope', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {},
        scope: 'school',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.scope).toBe('school')
      }
    })

    test('should accept "system" scope', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {},
        scope: 'system',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.scope).toBe('system')
      }
    })

    test('should reject invalid scope', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {},
        scope: 'invalid',
      })

      expect(result.success).toBe(false)
    })

    test('should default to "school" scope when not provided', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {},
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.scope).toBe('school')
      }
    })
  })

  describe('description field', () => {
    test('should accept optional description', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {},
        description: 'This is a test role',
        scope: 'school',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('This is a test role')
      }
    })

    test('should accept null description', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {},
        description: null,
        scope: 'school',
      })

      expect(result.success).toBe(true)
    })

    test('should work without description', () => {
      const result = roleSchema.safeParse({
        name: 'Test',
        slug: 'test',
        permissions: {},
        scope: 'school',
      })

      expect(result.success).toBe(true)
    })
  })
})

describe('generateSlug utility', () => {
  describe('basic transformations', () => {
    test('should convert to lowercase', () => {
      expect(generateSlug('Admin Role')).toBe('admin-role')
      expect(generateSlug('TEACHER')).toBe('teacher')
      expect(generateSlug('MixedCase')).toBe('mixedcase')
    })

    test('should replace spaces with hyphens', () => {
      expect(generateSlug('my new role')).toBe('my-new-role')
      expect(generateSlug('test   role')).toBe('test-role')
      expect(generateSlug('multiple   spaces   here')).toBe('multiple-spaces-here')
    })

    test('should remove duplicate hyphens', () => {
      expect(generateSlug('test--role')).toBe('test-role')
      expect(generateSlug('test---role')).toBe('test-role')
      expect(generateSlug('test----role')).toBe('test-role')
    })

    test('should trim whitespace', () => {
      expect(generateSlug('  admin  ')).toBe('admin')
      expect(generateSlug('\tteacher\n')).toBe('teacher')
      expect(generateSlug('   test role   ')).toBe('test-role')
    })
  })

  describe('accent removal (French)', () => {
    test('should remove common French accents', () => {
      expect(generateSlug('Élève')).toBe('eleve')
      expect(generateSlug('Français')).toBe('francais')
      expect(generateSlug('Côte d\'Ivoire')).toBe('cote-divoire')
    })

    test('should handle various accent types', () => {
      expect(generateSlug('àéèêëïîôùû')).toBe('aeeeeiiouu')
      expect(generateSlug('ÀÉÈÊËÏÎÔÙÛ')).toBe('aeeeeiiouu')
    })

    test('should handle cedilla', () => {
      expect(generateSlug('Français')).toBe('francais')
      expect(generateSlug('garçon')).toBe('garcon')
    })
  })

  describe('special character removal', () => {
    test('should remove common special characters', () => {
      expect(generateSlug('Test@Role!')).toBe('testrole')
      expect(generateSlug('Role#123$')).toBe('role123')
      expect(generateSlug('test&role')).toBe('testrole')
    })

    test('should remove punctuation', () => {
      expect(generateSlug('test.role')).toBe('testrole')
      expect(generateSlug('test,role')).toBe('testrole')
      expect(generateSlug('test;role')).toBe('testrole')
      expect(generateSlug('test:role')).toBe('testrole')
    })

    test('should remove brackets and parentheses', () => {
      expect(generateSlug('test(role)')).toBe('testrole')
      expect(generateSlug('test[role]')).toBe('testrole')
      expect(generateSlug('test{role}')).toBe('testrole')
    })
  })

  describe('edge cases', () => {
    test('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    test('should handle string with only spaces', () => {
      expect(generateSlug('   ')).toBe('')
    })

    test('should handle string with only special characters', () => {
      expect(generateSlug('@#$%')).toBe('')
    })

    test('should preserve numbers', () => {
      expect(generateSlug('role123')).toBe('role123')
      expect(generateSlug('2024 admin')).toBe('2024-admin')
    })
  })

  describe('real-world examples', () => {
    test('should handle complex French role names', () => {
      expect(generateSlug('Directeur Général')).toBe('directeur-general')
      expect(generateSlug('Enseignant Primaire 1ère Année')).toBe('enseignant-primaire-1ere-annee')
      expect(generateSlug('Secrétaire Académique')).toBe('secretaire-academique')
    })

    test('should handle role names with special formatting', () => {
      expect(generateSlug('Admin (Super IconUser)')).toBe('admin-super-user')
      expect(generateSlug('Teacher - Grade 1')).toBe('teacher-grade-1')
      expect(generateSlug('Staff: Finance')).toBe('staff-finance')
    })

    test('should handle mixed language content', () => {
      expect(generateSlug('Admin Côte d\'Ivoire 2024')).toBe('admin-cote-divoire-2024')
    })
  })
})
