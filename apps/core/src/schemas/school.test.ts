import { describe, expect, test } from 'vitest'
import {
  BulkUpdateSchoolsSchema,
  CreateSchoolSchema,
  GetSchoolsSchema,
  ImportSchoolsSchema,
  SchoolFiltersSchema,
  SchoolIdSchema,
  SchoolStatsSchema,
  SchoolStatusEnum,
  UpdateSchoolSchema,
} from './school'

describe('school Schema Validation', () => {
  describe('createSchoolSchema', () => {
    test('should accept valid school data', () => {
      const validSchool = {
        name: 'Test School',
        code: 'TS001',
        address: '123 Test Street',
        phone: '+1-555-0123',
        email: 'test@school.com',
        logoUrl: 'https://example.com/logo.png',
        status: 'active' as const,
        settings: { theme: 'dark', language: 'fr' },
      }

      const result = CreateSchoolSchema.safeParse(validSchool)
      expect(result.success).toBe(true)
    })

    test('should accept school with minimal required fields', () => {
      const minimalSchool = {
        name: 'Test School',
        code: 'TS001',
      }

      const result = CreateSchoolSchema.safeParse(minimalSchool)
      expect(result.success).toBe(true)
    })

    test('should reject invalid name - too short', () => {
      const invalidSchool = {
        name: 'T',
        code: 'TS001',
      }

      const result = CreateSchoolSchema.safeParse(invalidSchool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Le nom doit contenir au moins 2 caractères')
      }
    })

    test('should reject invalid name - too long', () => {
      const invalidSchool = {
        name: 'A'.repeat(101),
        code: 'TS001',
      }

      const result = CreateSchoolSchema.safeParse(invalidSchool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Le nom ne doit pas dépasser 100 caractères')
      }
    })

    test('should reject invalid code - too short', () => {
      const invalidSchool = {
        name: 'Test School',
        code: 'T',
      }

      const result = CreateSchoolSchema.safeParse(invalidSchool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Le code doit contenir au moins 2 caractères')
      }
    })

    test('should reject invalid code - invalid characters', () => {
      const invalidSchool = {
        name: 'Test School',
        code: 'ts-001', // lowercase not allowed
      }

      const result = CreateSchoolSchema.safeParse(invalidSchool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Le code ne doit contenir que des lettres majuscules, chiffres, tirets et underscores')
      }
    })

    test('should reject invalid email format', () => {
      const invalidSchool = {
        name: 'Test School',
        code: 'TS001',
        email: 'invalid-email',
      }

      const result = CreateSchoolSchema.safeParse(invalidSchool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Email invalide')
      }
    })

    test('should reject invalid phone format', () => {
      const invalidSchool = {
        name: 'Test School',
        code: 'TS001',
        phone: 'invalid-phone',
      }

      const result = CreateSchoolSchema.safeParse(invalidSchool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Le numéro de téléphone doit être valide')
      }
    })

    test('should reject invalid logo URL', () => {
      const invalidSchool = {
        name: 'Test School',
        code: 'TS001',
        logoUrl: 'not-a-url',
      }

      const result = CreateSchoolSchema.safeParse(invalidSchool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('URL ou image invalide pour le logo')
      }
    })

    test('should accept empty optional fields', () => {
      const validSchool = {
        name: 'Test School',
        code: 'TS001',
      }

      const result = CreateSchoolSchema.safeParse(validSchool)
      expect(result.success).toBe(true)
    })
  })

  describe('updateSchoolSchema', () => {
    test('should accept partial update with valid ID', () => {
      const updateData = {
        id: 'school-123',
        name: 'Updated School Name',
      }

      const result = UpdateSchoolSchema.safeParse(updateData)
      expect(result.success).toBe(true)
    })

    test('should accept update with multiple fields', () => {
      const updateData = {
        id: 'school-123',
        name: 'Updated School',
        status: 'inactive' as const,
        email: 'updated@school.com',
      }

      const result = UpdateSchoolSchema.safeParse(updateData)
      expect(result.success).toBe(true)
    })

    test('should reject update without ID', () => {
      const updateData = {
        name: 'Updated School',
      }

      const result = UpdateSchoolSchema.safeParse(updateData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Invalid input: expected string, received undefined')
      }
    })

    test('should reject invalid field values in update', () => {
      const updateData = {
        id: 'school-123',
        name: 'A'.repeat(101), // Too long
      }

      const result = UpdateSchoolSchema.safeParse(updateData)
      expect(result.success).toBe(false)
    })

    test('should accept empty update object with ID', () => {
      const updateData = {
        id: 'school-123',
      }

      const result = UpdateSchoolSchema.safeParse(updateData)
      expect(result.success).toBe(true)
    })
  })

  describe('getSchoolsSchema', () => {
    test('should accept valid pagination parameters', () => {
      const queryParams = {
        page: 1,
        limit: 20,
        search: 'test',
        status: 'active' as const,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
      }

      const result = GetSchoolsSchema.safeParse(queryParams)
      expect(result.success).toBe(true)
    })

    test('should use default values when parameters not provided', () => {
      const queryParams = {}

      const result = GetSchoolsSchema.safeParse(queryParams)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(10)
        expect(result.data.sortBy).toBe('createdAt')
        expect(result.data.sortOrder).toBe('desc')
      }
    })

    test('should reject invalid page - less than 1', () => {
      const queryParams = {
        page: 0,
      }

      const result = GetSchoolsSchema.safeParse(queryParams)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('La page doit être supérieure à 0')
      }
    })

    test('should reject invalid limit - less than 1', () => {
      const queryParams = {
        limit: 0,
      }

      const result = GetSchoolsSchema.safeParse(queryParams)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('La limite doit être supérieure à 0')
      }
    })

    test('should reject invalid limit - more than 1000', () => {
      const queryParams = {
        limit: 1001,
      }

      const result = GetSchoolsSchema.safeParse(queryParams)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('La limite ne doit pas dépasser 1000')
      }
    })

    test('should accept valid sort fields', () => {
      const validSortFields = ['name', 'code', 'createdAt', 'updatedAt'] as const

      validSortFields.forEach((sortBy) => {
        const queryParams = { sortBy }
        const result = GetSchoolsSchema.safeParse(queryParams)
        expect(result.success).toBe(true)
      })
    })

    test('should accept valid status values', () => {
      const validStatuses = ['active', 'inactive', 'suspended'] as const

      validStatuses.forEach((status) => {
        const queryParams = { status }
        const result = GetSchoolsSchema.safeParse(queryParams)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('schoolIdSchema', () => {
    test('should accept valid ID', () => {
      const idData = { id: 'school-123' }

      const result = SchoolIdSchema.safeParse(idData)
      expect(result.success).toBe(true)
    })

    test('should reject empty ID', () => {
      const idData = { id: '' }

      const result = SchoolIdSchema.safeParse(idData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('L\'ID est requis')
      }
    })

    test('should reject missing ID', () => {
      const idData = {}

      const result = SchoolIdSchema.safeParse(idData)
      expect(result.success).toBe(false)
    })
  })

  describe('bulkUpdateSchoolsSchema', () => {
    test('should accept valid bulk update data', () => {
      const bulkData = {
        schoolIds: ['school-1', 'school-2', 'school-3'],
        status: 'inactive' as const,
        reason: 'Bulk deactivation for testing',
      }

      const result = BulkUpdateSchoolsSchema.safeParse(bulkData)
      expect(result.success).toBe(true)
    })

    test('should accept bulk update without reason', () => {
      const bulkData = {
        schoolIds: ['school-1'],
        status: 'suspended' as const,
      }

      const result = BulkUpdateSchoolsSchema.safeParse(bulkData)
      expect(result.success).toBe(true)
    })

    test('should reject empty school IDs array', () => {
      const bulkData = {
        schoolIds: [],
        status: 'inactive' as const,
      }

      const result = BulkUpdateSchoolsSchema.safeParse(bulkData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Au moins une école doit être sélectionnée')
      }
    })

    test('should reject missing school IDs array', () => {
      const bulkData = {
        status: 'inactive' as const,
      }

      const result = BulkUpdateSchoolsSchema.safeParse(bulkData)
      expect(result.success).toBe(false)
    })
  })

  describe('importSchoolsSchema', () => {
    test('should accept valid import data', () => {
      const importData = {
        schools: [
          {
            name: 'Import School 1',
            code: 'IMP001',
            address: '123 Import St',
            phone: '+1-555-0001',
            email: 'import1@school.com',
          },
          {
            name: 'Import School 2',
            code: 'IMP002',
          },
        ],
        skipDuplicates: true,
        generateCodes: false,
      }

      const result = ImportSchoolsSchema.safeParse(importData)
      expect(result.success).toBe(true)
    })

    test('should accept minimal import data', () => {
      const importData = {
        schools: [
          {
            name: 'Minimal School',
            code: 'MIN001',
          },
        ],
      }

      const result = ImportSchoolsSchema.safeParse(importData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.skipDuplicates).toBe(true)
        expect(result.data.generateCodes).toBe(false)
      }
    })

    test('should reject empty schools array', () => {
      const importData = {
        schools: [],
      }

      const result = ImportSchoolsSchema.safeParse(importData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Au moins une école est requise')
      }
    })

    test('should reject invalid school data in array', () => {
      const importData = {
        schools: [
          {
            name: 'A', // Too short
            code: 'OK001',
          },
        ],
      }

      const result = ImportSchoolsSchema.safeParse(importData)
      expect(result.success).toBe(false)
    })
  })

  describe('schoolFiltersSchema', () => {
    test('should accept valid filter combination', () => {
      const filters = {
        status: 'active' as const,
        search: 'test',
        createdAfter: '2024-01-01T00:00:00Z',
        createdBefore: '2024-12-31T23:59:59Z',
        hasEmail: true,
        hasPhone: false,
      }

      const result = SchoolFiltersSchema.safeParse(filters)
      expect(result.success).toBe(true)
    })

    test('should accept empty filters', () => {
      const filters = {}

      const result = SchoolFiltersSchema.safeParse(filters)
      expect(result.success).toBe(true)
    })

    test('should accept single filter', () => {
      const filters = {
        search: 'school name',
      }

      const result = SchoolFiltersSchema.safeParse(filters)
      expect(result.success).toBe(true)
    })

    test('should reject invalid datetime format', () => {
      const filters = {
        createdAfter: 'not-a-datetime',
      }

      const result = SchoolFiltersSchema.safeParse(filters)
      expect(result.success).toBe(false)
    })
  })

  describe('schoolStatsSchema', () => {
    test('should accept valid stats request', () => {
      const statsData = {
        schoolId: 'school-123',
        metric: 'students' as const,
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-12-31T23:59:59Z',
        },
      }

      const result = SchoolStatsSchema.safeParse(statsData)
      expect(result.success).toBe(true)
    })

    test('should accept stats request without date range', () => {
      const statsData = {
        schoolId: 'school-123',
        metric: 'teachers' as const,
      }

      const result = SchoolStatsSchema.safeParse(statsData)
      expect(result.success).toBe(true)
    })

    test('should reject missing school ID', () => {
      const statsData = {
        metric: 'students' as const,
      }

      const result = SchoolStatsSchema.safeParse(statsData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid metric', () => {
      const statsData = {
        schoolId: 'school-123',
        metric: 'invalid-metric' as any,
      }

      const result = SchoolStatsSchema.safeParse(statsData)
      expect(result.success).toBe(false)
    })
  })

  describe('schoolStatusEnum', () => {
    test('should accept valid status values', () => {
      const validStatuses = ['active', 'inactive', 'suspended'] as const

      validStatuses.forEach((status) => {
        const result = SchoolStatusEnum.safeParse(status)
        expect(result.success).toBe(true)
      })
    })

    test('should reject invalid status values', () => {
      const invalidStatuses = ['pending', 'deleted', 'archived', 'unknown']

      invalidStatuses.forEach((status) => {
        const result = SchoolStatusEnum.safeParse(status)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('data Integrity Tests', () => {
    test('should maintain data consistency across schemas', () => {
      const schoolData = {
        name: 'Test School',
        code: 'TS001',
        email: 'test@school.com',
      }

      // Test that same valid data works for create and partial update
      const createResult = CreateSchoolSchema.safeParse(schoolData)
      const updateResult = UpdateSchoolSchema.safeParse({ id: 'test', ...schoolData })

      expect(createResult.success).toBe(true)
      expect(updateResult.success).toBe(true)
    })

    test('should enforce consistent field validation across schemas', () => {
      const invalidEmail = 'invalid-email'

      const createResult = CreateSchoolSchema.safeParse({
        name: 'Test',
        code: 'TEST',
        email: invalidEmail,
      })

      const updateResult = UpdateSchoolSchema.safeParse({
        id: 'test',
        email: invalidEmail,
      })

      expect(createResult.success).toBe(false)
      expect(updateResult.success).toBe(false)
    })
  })
})
