import { describe, expect, test } from 'vitest'

import {
  amountSchema,
  bulkCreateFeeStructuresSchema,
  createFeeStructureSchema,
  updateFeeStructureSchema,
} from '../fee-structure'

describe('amountSchema', () => {
  describe('valid amount validation', () => {
    test('should validate valid positive amounts', () => {
      const validAmounts = ['0.01', '1', '100', '999.99', '1000', '12345.67']
      for (const amount of validAmounts) {
        const result = amountSchema.safeParse(amount)
        expect(result.success).toBe(true)
      }
    })

    test('should validate amounts with one decimal place', () => {
      const amounts = ['0.1', '1.5', '10.5', '100.5', '999.9']
      for (const amount of amounts) {
        const result = amountSchema.safeParse(amount)
        expect(result.success).toBe(true)
      }
    })

    test('should validate amounts with two decimal places', () => {
      const amounts = ['0.01', '1.00', '10.50', '100.99', '999.99']
      for (const amount of amounts) {
        const result = amountSchema.safeParse(amount)
        expect(result.success).toBe(true)
      }
    })

    test('should parse and return correct numeric value', () => {
      const result = amountSchema.safeParse('150.50')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('150.50')
      }
    })
  })

  describe('invalid amount rejection', () => {
    test('should reject zero amount', () => {
      const result = amountSchema.safeParse('0')
      expect(result.success).toBe(false)
    })

    test('should reject negative amounts', () => {
      const amounts = ['-1', '-10.50', '-0.01']
      for (const amount of amounts) {
        const result = amountSchema.safeParse(amount)
        expect(result.success).toBe(false)
      }
    })

    test('should reject amounts with more than two decimal places', () => {
      const amounts = ['0.001', '1.123', '10.999']
      for (const amount of amounts) {
        const result = amountSchema.safeParse(amount)
        expect(result.success).toBe(false)
      }
    })

    test('should reject empty string', () => {
      const result = amountSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    test('should reject non-numeric strings', () => {
      const invalidAmounts = ['abc', '12abc', 'abc123', ' ']
      for (const amount of invalidAmounts) {
        const result = amountSchema.safeParse(amount)
        expect(result.success).toBe(false)
      }
    })

    test('should reject amounts with comma separator', () => {
      const result = amountSchema.safeParse('1,000.00')
      expect(result.success).toBe(false)
    })

    test('should reject amounts with currency symbol', () => {
      const amounts = ['$100', '100€', 'XOF500']
      for (const amount of amounts) {
        const result = amountSchema.safeParse(amount)
        expect(result.success).toBe(false)
      }
    })

    test('should reject scientific notation', () => {
      const result = amountSchema.safeParse('1.5e3')
      expect(result.success).toBe(false)
    })

    test('should reject fractions', () => {
      const result = amountSchema.safeParse('1/2')
      expect(result.success).toBe(false)
    })
  })
})

describe('createFeeStructureSchema', () => {
  const validData = {
    schoolYearId: 'year-2025',
    feeTypeId: 'fee-type-123',
    amount: '150000',
  }

  describe('valid data validation', () => {
    test('should validate valid fee structure data', () => {
      const result = createFeeStructureSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data structure', () => {
      const result = createFeeStructureSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.schoolYearId).toBe('year-2025')
        expect(result.data.feeTypeId).toBe('fee-type-123')
        expect(result.data.amount).toBe('150000')
        expect(result.data.currency).toBe('XOF')
      }
    })

    test('should default currency to XOF', () => {
      const result = createFeeStructureSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.currency).toBe('XOF')
      }
    })
  })

  describe('fee type validation', () => {
    test('should reject empty schoolYearId', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, schoolYearId: '' })
      expect(result.success).toBe(false)
    })

    test('should reject whitespace-only schoolYearId', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, schoolYearId: '   ' })
      expect(result.success).toBe(false)
    })

    test('should accept valid schoolYearId', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, schoolYearId: '2024-2025' })
      expect(result.success).toBe(true)
    })

    test('should reject empty feeTypeId', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, feeTypeId: '' })
      expect(result.success).toBe(false)
    })

    test('should accept valid feeTypeId', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, feeTypeId: 'tuition-fee' })
      expect(result.success).toBe(true)
    })
  })

  describe('amount validation', () => {
    test('should validate valid amount', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, amount: '150000' })
      expect(result.success).toBe(true)
    })

    test('should validate decimal amount', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, amount: '150000.50' })
      expect(result.success).toBe(true)
    })

    test('should reject invalid amount format', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, amount: 'invalid' })
      expect(result.success).toBe(false)
    })

    test('should reject zero amount', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, amount: '0' })
      expect(result.success).toBe(false)
    })

    test('should reject negative amount', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, amount: '-100' })
      expect(result.success).toBe(false)
    })
  })

  describe('gradeId validation', () => {
    test('should validate optional gradeId', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, gradeId: 'grade-123' })
      expect(result.success).toBe(true)
    })

    test('should accept null gradeId', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, gradeId: null })
      expect(result.success).toBe(true)
    })

    test('should accept undefined gradeId', () => {
      const result = createFeeStructureSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('seriesId validation', () => {
    test('should validate optional seriesId', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, seriesId: 'series-123' })
      expect(result.success).toBe(true)
    })

    test('should accept null seriesId', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, seriesId: null })
      expect(result.success).toBe(true)
    })
  })

  describe('newStudentAmount validation', () => {
    test('should validate optional newStudentAmount', () => {
      const result = createFeeStructureSchema.safeParse({
        ...validData,
        newStudentAmount: '175000',
      })
      expect(result.success).toBe(true)
    })

    test('should accept null newStudentAmount', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, newStudentAmount: null })
      expect(result.success).toBe(true)
    })

    test('should validate different new student amount', () => {
      const result = createFeeStructureSchema.safeParse({
        ...validData,
        amount: '150000',
        newStudentAmount: '175000',
      })
      expect(result.success).toBe(true)
    })

    test('should reject invalid newStudentAmount format', () => {
      const result = createFeeStructureSchema.safeParse({
        ...validData,
        newStudentAmount: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('currency validation', () => {
    test('should accept XOF currency', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, currency: 'XOF' })
      expect(result.success).toBe(true)
    })

    test('should accept other currency codes', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, currency: 'USD' })
      expect(result.success).toBe(true)
    })

    test('should default to XOF when currency not provided', () => {
      const result = createFeeStructureSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.currency).toBe('XOF')
      }
    })
  })

  describe('effectiveDate validation', () => {
    test('should validate optional effectiveDate', () => {
      const result = createFeeStructureSchema.safeParse({
        ...validData,
        effectiveDate: '2025-01-01',
      })
      expect(result.success).toBe(true)
    })

    test('should reject invalid effectiveDate format', () => {
      const result = createFeeStructureSchema.safeParse({
        ...validData,
        effectiveDate: '01-01-2025',
      })
      expect(result.success).toBe(false)
    })

    test('should accept null effectiveDate', () => {
      const result = createFeeStructureSchema.safeParse({ ...validData, effectiveDate: null })
      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle minimal required fields', () => {
      const result = createFeeStructureSchema.safeParse({
        schoolYearId: 'year-2025',
        feeTypeId: 'tuition',
        amount: '100000',
      })
      expect(result.success).toBe(true)
    })

    test('should handle full fee structure with all fields', () => {
      const result = createFeeStructureSchema.safeParse({
        schoolYearId: 'year-2025',
        feeTypeId: 'tuition',
        gradeId: 'grade-6',
        seriesId: 'science',
        amount: '150000',
        currency: 'XOF',
        newStudentAmount: '175000',
        effectiveDate: '2025-01-01',
      })
      expect(result.success).toBe(true)
    })

    test('should handle different fee types', () => {
      const feeTypes = ['tuition', 'registration', 'exam', 'transport', 'uniform', 'books', 'meals', 'activities', 'other']
      for (const feeTypeId of feeTypes) {
        const result = createFeeStructureSchema.safeParse({
          ...validData,
          feeTypeId,
        })
        expect(result.success).toBe(true)
      }
    })

    test('should handle various amount ranges', () => {
      const amounts = ['100', '1000', '10000', '100000', '500000', '1000000']
      for (const amount of amounts) {
        const result = createFeeStructureSchema.safeParse({ ...validData, amount })
        expect(result.success).toBe(true)
      }
    })
  })
})

describe('updateFeeStructureSchema', () => {
  const validData = {
    id: 'fee-structure-123',
    amount: '175000',
  }

  describe('valid data validation', () => {
    test('should validate valid update data', () => {
      const result = updateFeeStructureSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data', () => {
      const result = updateFeeStructureSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('fee-structure-123')
        expect(result.data.amount).toBe('175000')
      }
    })
  })

  describe('id validation', () => {
    test('should reject empty id', () => {
      const result = updateFeeStructureSchema.safeParse({ ...validData, id: '' })
      expect(result.success).toBe(false)
    })

    test('should accept valid UUID format', () => {
      const result = updateFeeStructureSchema.safeParse({
        ...validData,
        id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('partial update validation', () => {
    test('should allow partial update with only id', () => {
      const result = updateFeeStructureSchema.safeParse({ id: 'fee-structure-123' })
      expect(result.success).toBe(true)
    })

    test('should allow update with only amount', () => {
      const result = updateFeeStructureSchema.safeParse({ id: 'fee-structure-123', amount: '200000' })
      expect(result.success).toBe(true)
    })

    test('should allow update with only feeTypeId', () => {
      const result = updateFeeStructureSchema.safeParse({
        id: 'fee-structure-123',
        feeTypeId: 'updated-fee-type',
      })
      expect(result.success).toBe(true)
    })

    test('should allow update with only gradeId', () => {
      const result = updateFeeStructureSchema.safeParse({
        id: 'fee-structure-123',
        gradeId: 'grade-7',
      })
      expect(result.success).toBe(true)
    })

    test('should allow update with only seriesId', () => {
      const result = updateFeeStructureSchema.safeParse({
        id: 'fee-structure-123',
        seriesId: 'arts',
      })
      expect(result.success).toBe(true)
    })

    test('should allow update with only newStudentAmount', () => {
      const result = updateFeeStructureSchema.safeParse({
        id: 'fee-structure-123',
        newStudentAmount: '200000',
      })
      expect(result.success).toBe(true)
    })

    test('should allow update with only effectiveDate', () => {
      const result = updateFeeStructureSchema.safeParse({
        id: 'fee-structure-123',
        effectiveDate: '2025-02-01',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle full update with all fields', () => {
      const result = updateFeeStructureSchema.safeParse({
        id: 'fee-structure-123',
        schoolYearId: 'year-2025',
        feeTypeId: 'tuition',
        gradeId: 'grade-8',
        seriesId: 'commerce',
        amount: '200000',
        currency: 'XOF',
        newStudentAmount: '225000',
        effectiveDate: '2025-02-01',
      })
      expect(result.success).toBe(true)
    })

    test('should handle null values for optional fields', () => {
      const result = updateFeeStructureSchema.safeParse({
        id: 'fee-structure-123',
        gradeId: null,
        seriesId: null,
        newStudentAmount: null,
        effectiveDate: null,
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('bulkCreateFeeStructuresSchema', () => {
  const validData = {
    schoolYearId: 'year-2025',
    feeTypeId: 'tuition',
    structures: [
      { gradeId: 'grade-6', amount: '150000' },
      { gradeId: 'grade-7', amount: '160000' },
      { gradeId: 'grade-8', amount: '170000' },
    ],
  }

  describe('valid data validation', () => {
    test('should validate valid bulk fee structure data', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data structure', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.schoolYearId).toBe('year-2025')
        expect(result.data.feeTypeId).toBe('tuition')
        expect(result.data.structures).toHaveLength(3)
      }
    })
  })

  describe('schoolYearId validation', () => {
    test('should reject empty schoolYearId', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({ ...validData, schoolYearId: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('feeTypeId validation', () => {
    test('should reject empty feeTypeId', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({ ...validData, feeTypeId: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('structures validation', () => {
    test('should validate structures with gradeId and amount', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        ...validData,
        structures: [{ gradeId: 'grade-6', amount: '150000' }],
      })
      expect(result.success).toBe(true)
    })

    test('should validate structures with seriesId', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        ...validData,
        structures: [{ gradeId: 'grade-6', seriesId: 'science', amount: '160000' }],
      })
      expect(result.success).toBe(true)
    })

    test('should validate structures with newStudentAmount', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        ...validData,
        structures: [
          { gradeId: 'grade-6', amount: '150000', newStudentAmount: '175000' },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should reject empty structures array', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        ...validData,
        structures: [],
      })
      expect(result.success).toBe(false)
    })

    test('should reject structure with empty gradeId', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        ...validData,
        structures: [{ gradeId: '', amount: '150000' }],
      })
      expect(result.success).toBe(false)
    })

    test('should reject structure with invalid amount', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        ...validData,
        structures: [{ gradeId: 'grade-6', amount: 'invalid' }],
      })
      expect(result.success).toBe(false)
    })

    test('should reject structure with zero amount', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        ...validData,
        structures: [{ gradeId: 'grade-6', amount: '0' }],
      })
      expect(result.success).toBe(false)
    })

    test('should validate multiple structures with different amounts', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        schoolYearId: 'year-2025',
        feeTypeId: 'tuition',
        structures: [
          { gradeId: 'grade-6', amount: '150000' },
          { gradeId: 'grade-7', amount: '160000' },
          { gradeId: 'grade-8', amount: '170000' },
          { gradeId: 'grade-9', amount: '180000' },
          { gradeId: 'grade-10', amount: '190000' },
        ],
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.structures).toHaveLength(5)
      }
    })

    test('should validate structures with optional seriesId as null', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        ...validData,
        structures: [
          { gradeId: 'grade-6', seriesId: null, amount: '150000' },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should validate structures with optional newStudentAmount as null', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        ...validData,
        structures: [
          { gradeId: 'grade-6', amount: '150000', newStudentAmount: null },
        ],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle bulk create for all grades', () => {
      const structures = [
        { gradeId: 'grade-1', amount: '100000' },
        { gradeId: 'grade-2', amount: '110000' },
        { gradeId: 'grade-3', amount: '120000' },
        { gradeId: 'grade-4', amount: '130000' },
        { gradeId: 'grade-5', amount: '140000' },
        { gradeId: 'grade-6', amount: '150000' },
        { gradeId: 'grade-7', amount: '160000' },
        { gradeId: 'grade-8', amount: '170000' },
        { gradeId: 'grade-9', amount: '180000' },
        { gradeId: 'grade-10', amount: '190000' },
        { gradeId: 'grade-11', amount: '200000' },
        { gradeId: 'grade-12', amount: '210000' },
      ]

      const result = bulkCreateFeeStructuresSchema.safeParse({
        schoolYearId: 'year-2025',
        feeTypeId: 'tuition',
        structures,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.structures).toHaveLength(12)
      }
    })

    test('should handle bulk create with series-specific amounts', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        schoolYearId: 'year-2025',
        feeTypeId: 'tuition',
        structures: [
          { gradeId: 'grade-9', seriesId: 'science', amount: '200000' },
          { gradeId: 'grade-9', seriesId: 'arts', amount: '180000' },
          { gradeId: 'grade-9', seriesId: 'commerce', amount: '190000' },
        ],
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.structures).toHaveLength(3)
      }
    })

    test('should handle bulk create with new student premiums', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        schoolYearId: 'year-2025',
        feeTypeId: 'tuition',
        structures: [
          { gradeId: 'grade-6', amount: '150000', newStudentAmount: '175000' },
          { gradeId: 'grade-7', amount: '160000', newStudentAmount: '185000' },
          { gradeId: 'grade-8', amount: '170000', newStudentAmount: '195000' },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should handle bulk create with single structure', () => {
      const result = bulkCreateFeeStructuresSchema.safeParse({
        schoolYearId: 'year-2025',
        feeTypeId: 'registration',
        structures: [{ gradeId: 'grade-6', amount: '50000' }],
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.structures).toHaveLength(1)
      }
    })
  })
})
