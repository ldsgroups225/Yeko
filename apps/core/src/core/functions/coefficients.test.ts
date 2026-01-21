import * as dataOps from '@repo/data-ops'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  bulkCreateCoefficientsMutation,
  bulkUpdateCoefficientsMutation,
  coefficientStatsQuery,
  coefficientTemplateByIdQuery,
  coefficientTemplatesQuery,
  copyCoefficientsMutation,
  createCoefficientTemplateMutation,
  deleteCoefficientTemplateMutation,
  updateCoefficientTemplateMutation,
  validateCoefficientImportMutation,
} from './coefficients'

// Mock the data-ops package
vi.mock('@repo/data-ops', () => ({
  getCoefficientTemplates: vi.fn(),
  getCoefficientTemplateById: vi.fn(),
  createCoefficientTemplate: vi.fn(),
  updateCoefficientTemplate: vi.fn(),
  deleteCoefficientTemplate: vi.fn(),
  bulkCreateCoefficients: vi.fn(),
  bulkUpdateCoefficients: vi.fn(),
  copyCoefficientTemplates: vi.fn(),
  getCoefficientStats: vi.fn(),
}))

// Mock createServerFn to execute the handler directly with proper data handling
vi.mock('@tanstack/react-start', async () => {
  const actual = await vi.importActual('@tanstack/react-start')
  return {
    ...actual,
    createServerFn: () => {
      const chain = {
        middleware: () => chain,
        inputValidator: (validator: any) => {
          return {
            handler: (cb: any) => {
              return async (payload: any) => {
                try {
                  // Pass payload through as-is for Zod validation
                  const parsedData = validator ? validator(payload) : payload
                  return cb({ data: parsedData, context: {} })
                } catch (error) {
                  throw error
                }
              }
            },
          }
        },
        handler: (cb: any) => {
          return async (payload: any) => {
            return cb({ data: payload?.data || {}, context: {} })
          }
        },
      }
      return chain
    },
  }
})

// Mock the middleware
vi.mock('@/core/middleware/example-middleware', () => ({
  exampleMiddlewareWithContext: {},
}))

describe('coefficients Server Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('coefficientTemplatesQuery', () => {
    test('should return weight templates with filters', async () => {
      const mockCoefficients = [
        {
          id: '1',
          schoolYearTemplateId: '1',
          subjectId: '1',
          gradeId: '1',
          weight: 3,
        },
        {
          id: '2',
          schoolYearTemplateId: '1',
          subjectId: '2',
          gradeId: '1',
          weight: 2,
        },
      ]

      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue({
        coefficients: mockCoefficients as any,
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
      })

      const result = await coefficientTemplatesQuery({
        data: { page: 1, limit: 10, schoolYearTemplateId: '1', gradeId: '1' },
      })

      expect(dataOps.getCoefficientTemplates).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        schoolYearTemplateId: '1',
        gradeId: '1',
      })
      expect(result.coefficients).toHaveLength(2)
    })

    test('should handle empty results', async () => {
      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue({
        coefficients: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      })

      const result = await coefficientTemplatesQuery({
        data: { page: 1, limit: 10, schoolYearTemplateId: 'nonexistent' },
      })

      expect(result.coefficients).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })

    test('should pass pagination parameters', async () => {
      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue({
        coefficients: [],
        pagination: { total: 0, page: 2, limit: 5, totalPages: 1 },
      })

      await coefficientTemplatesQuery({
        data: { page: 2, limit: 5, schoolYearTemplateId: '1' },
      })

      expect(dataOps.getCoefficientTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 5,
        }),
      )
    })

    test('should default to page 1 with limit 10', async () => {
      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue({
        coefficients: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      })

      await coefficientTemplatesQuery({ data: { schoolYearTemplateId: '1' } })

      expect(dataOps.getCoefficientTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        }),
      )
    })

    test('should filter by subject', async () => {
      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue({
        coefficients: [{ id: '1', schoolYearTemplateId: '1', subjectId: 'math', gradeId: '1', weight: 3 }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      })

      await coefficientTemplatesQuery({
        data: { schoolYearTemplateId: '1', subjectId: 'math' },
      })

      expect(dataOps.getCoefficientTemplates).toHaveBeenCalledWith(
        expect.objectContaining({ subjectId: 'math' }),
      )
    })

    test('should combine multiple filters', async () => {
      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue({
        coefficients: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      })

      await coefficientTemplatesQuery({
        data: {
          schoolYearTemplateId: '1',
          gradeId: '1',
          subjectId: 'math',
          page: 1,
          limit: 10,
        },
      })

      expect(dataOps.getCoefficientTemplates).toHaveBeenCalledWith({
        schoolYearTemplateId: '1',
        gradeId: '1',
        subjectId: 'math',
        page: 1,
        limit: 10,
      })
    })
  })

  describe('coefficientTemplateByIdQuery', () => {
    test('should return template by ID', async () => {
      const mockTemplate = {
        id: '1',
        schoolYearTemplateId: '1',
        subjectId: '1',
        gradeId: '1',
        weight: 3,
      }

      vi.mocked(dataOps.getCoefficientTemplateById).mockResolvedValue(mockTemplate as any)

      const result = await coefficientTemplateByIdQuery({ data: { id: '1' } })

      expect(result).toEqual(mockTemplate)
      expect(dataOps.getCoefficientTemplateById).toHaveBeenCalledWith('1')
    })
  })

  describe('createCoefficientTemplateMutation', () => {
    test('should create template with valid data', async () => {
      const newTemplate = {
        schoolYearTemplateId: '1',
        subjectId: '1',
        gradeId: '1',
        weight: 3,
      }

      vi.mocked(dataOps.createCoefficientTemplate).mockResolvedValue({
        id: 'new-id',
        ...newTemplate,
        seriesId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      const result = await createCoefficientTemplateMutation({ data: newTemplate })

      expect(result.schoolYearTemplateId).toBe('1')
      expect(result.subjectId).toBe('1')
      expect(dataOps.createCoefficientTemplate).toHaveBeenCalledWith(newTemplate)
    })

    test('should throw on invalid data', async () => {
      const invalidData = {
        schoolYearTemplateId: '',
        subjectId: '',
        gradeId: '',
        weight: -1,
      }

      await expect(createCoefficientTemplateMutation({ data: invalidData })).rejects.toThrow()
    })
  })

  describe('updateCoefficientTemplateMutation', () => {
    test('should update template with valid data', async () => {
      const updateData = {
        id: '1',
        weight: 4,
      }

      vi.mocked(dataOps.updateCoefficientTemplate).mockResolvedValue({ id: '1', weight: 4 } as any)

      const result = await updateCoefficientTemplateMutation({ data: updateData })

      expect(result.weight).toBe(4)
      expect(dataOps.updateCoefficientTemplate).toHaveBeenCalledWith(updateData)
    })
  })

  describe('deleteCoefficientTemplateMutation', () => {
    test('should delete template by ID', async () => {
      vi.mocked(dataOps.deleteCoefficientTemplate).mockResolvedValue({ success: true })

      const result = await deleteCoefficientTemplateMutation({ data: { id: '1' } })

      expect(result.success).toBe(true)
      expect(dataOps.deleteCoefficientTemplate).toHaveBeenCalledWith('1')
    })
  })

  describe('bulkCreateCoefficientsMutation', () => {
    test('should create multiple coefficients', async () => {
      const newCoefficients = {
        coefficients: [
          { schoolYearTemplateId: '1', subjectId: '1', gradeId: '1', weight: 3 },
          { schoolYearTemplateId: '1', subjectId: '2', gradeId: '1', weight: 2 },
        ],
      }

      vi.mocked(dataOps.bulkCreateCoefficients).mockResolvedValue([] as any)

      const result = await bulkCreateCoefficientsMutation({ data: newCoefficients })

      expect(result.created).toBe(2)
      expect(dataOps.bulkCreateCoefficients).toHaveBeenCalledWith(newCoefficients.coefficients)
    })

    test('should handle empty array', async () => {
      vi.mocked(dataOps.bulkCreateCoefficients).mockResolvedValue({ created: 0 } as any)

      const result = await bulkCreateCoefficientsMutation({ data: { coefficients: [] } })

      expect(result.created).toBe(0)
    })
  })

  describe('bulkUpdateCoefficientsMutation', () => {
    test('should update multiple coefficients', async () => {
      const updateData = {
        coefficients: [
          { id: '1', weight: 4 },
          { id: '2', weight: 5 },
        ],
      }

      vi.mocked(dataOps.bulkUpdateCoefficients).mockResolvedValue([] as any)

      const result = await bulkUpdateCoefficientsMutation({ data: updateData })

      expect(result.updated).toBe(2)
      expect(dataOps.bulkUpdateCoefficients).toHaveBeenCalledWith(updateData.coefficients)
    })
  })

  describe('copyCoefficientsMutation', () => {
    test('should copy coefficients to new school year', async () => {
      vi.mocked(dataOps.copyCoefficientTemplates).mockResolvedValue([] as any)

      const result = await copyCoefficientsMutation({
        data: { fromSchoolYearId: '1', toSchoolYearId: '2' },
      })

      expect(result.copied).toBe(5)
      expect(dataOps.copyCoefficientTemplates).toHaveBeenCalledWith('1', '2')
    })
  })

  describe('coefficientStatsQuery', () => {
    test('should return coefficient statistics', async () => {
      const mockStats = {
        total: 1200,
        average: 2.5,
        byGrade: {},
        bySubject: {},
      }

      vi.mocked(dataOps.getCoefficientStats).mockResolvedValue({ total: 1200 } as any)

      const result = await coefficientStatsQuery()

      expect(result.total).toBe(1200)
    })

    test('should return zero stats when no coefficients exist', async () => {
      const emptyStats = {
        total: 0,
        average: 0,
        byGrade: {},
        bySubject: {},
      }

      vi.mocked(dataOps.getCoefficientStats).mockResolvedValue(emptyStats as any)

      const result = await coefficientStatsQuery()

      expect(result.total).toBe(0)
      expect(result.average).toBe(0)
    })
  })

  describe('validateCoefficientImportMutation', () => {
    test('should validate import data successfully', async () => {
      const validImportData = [
        {
          schoolYearTemplateId: '1',
          subjectId: '1',
          gradeId: '1',
          weight: 3,
        },
        {
          schoolYearTemplateId: '1',
          subjectId: '2',
          gradeId: '1',
          weight: 2,
        },
      ]

      const result = await validateCoefficientImportMutation({ data: validImportData })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should identify missing required fields', async () => {
      const invalidImportData = [
        {
          schoolYearTemplateId: '',
          subjectId: '1',
          gradeId: '1',
          weight: 3,
        },
        {
          schoolYearTemplateId: '1',
          subjectId: '',
          gradeId: '1',
          weight: 2,
        },
      ]

      const result = await validateCoefficientImportMutation({ data: invalidImportData })

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    test('should check for duplicate entries', async () => {
      const duplicateData = [
        {
          schoolYearTemplateId: '1',
          subjectId: '1',
          gradeId: '1',
          weight: 3,
        },
        {
          schoolYearTemplateId: '1',
          subjectId: '1',
          gradeId: '1',
          weight: 3,
        },
      ]

      const result = await validateCoefficientImportMutation({ data: duplicateData })

      expect(result.valid).toBe(false)
      expect(result.errors.some((e: any) => e.field === 'duplicate')).toBe(true)
    })
  })

  describe('error Handling', () => {
    test('should handle not found errors gracefully', async () => {
      vi.mocked(dataOps.getCoefficientTemplateById).mockResolvedValue(null)

      const result = await coefficientTemplateByIdQuery({ data: { id: 'nonexistent' } })
      expect(result).toBeNull()
    })

    test('should handle database connection errors', async () => {
      vi.mocked(dataOps.createCoefficientTemplate).mockRejectedValue(
        new Error('Database connection failed'),
      )

      await expect(createCoefficientTemplateMutation({
        data: {
          schoolYearTemplateId: '1',
          subjectId: '1',
          gradeId: '1',
          weight: 3,
        },
      }))
        .rejects
        .toThrow('Database connection failed')
    })

    test('should handle validation errors', async () => {
      const invalidData = {
        schoolYearTemplateId: '',
        subjectId: '',
        gradeId: '',
        weight: -1, // Invalid negative weight
      }

      await expect(createCoefficientTemplateMutation({ data: invalidData }))
        .rejects
        .toThrow()
    })

    test('should handle transaction rollback errors during bulk operations', async () => {
      const invalidBulkData = {
        coefficients: [
          {
            schoolYearTemplateId: '1',
            subjectId: '1',
            gradeId: '1',
            weight: 3,
          },
          {
            schoolYearTemplateId: 'invalid',
            subjectId: 'invalid',
            gradeId: 'invalid',
            weight: -1,
          },
        ],
      }

      vi.mocked(dataOps.bulkCreateCoefficients).mockRejectedValue(
        new Error('Transaction rolled back due to validation errors'),
      )

      await expect(bulkCreateCoefficientsMutation({ data: invalidBulkData }))
        .rejects
        .toThrow()
    })
  })
})
