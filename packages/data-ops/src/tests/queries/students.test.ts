import { beforeEach, describe, expect, test, vi } from 'vitest'
import { DatabaseError } from '../../errors'
import { getStudentById, getStudents } from '../../queries/students'
import {
  createMockDbClient,
  expectDatabaseErrorType,
  expectResultError,
  expectResultSuccess,
  mockDatabaseError,
} from '../utils/result-test-utils'

vi.mock('../../database/setup', () => ({
  getDb: vi.fn(),
}))

vi.mock('@repo/logger', () => ({
  databaseLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
  tapLogErr: vi.fn((error: unknown) => error),
}))

describe('students queries', () => {
  const mockDb = createMockDbClient()

  beforeEach(async () => {
    vi.clearAllMocks()
    const { getDb } = await import('../../database/setup')
    vi.mocked(getDb).mockReturnValue(mockDb as unknown as ReturnType<typeof getDb>)
  })

  describe('getStudents', () => {
    test('should return students with pagination', async () => {
      const mockStudents = [
        {
          student: { id: '1', firstName: 'John', lastName: 'Doe', schoolId: 'school-1' },
          currentClass: { id: 'class-1', section: 'A', gradeName: 'Grade 1', seriesName: null },
          parentsCount: 2,
          enrollmentStatus: 'confirmed',
        },
      ]

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              leftJoin: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    groupBy: vi.fn().mockReturnValue({
                      orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                          offset: vi.fn().mockResolvedValue(mockStudents),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      })

      const result = await getStudents({ schoolId: 'school-1' })

      const data = await expectResultSuccess(result)
      expect(data.data).toHaveLength(1)
      expect(data.data[0]?.student.firstName).toBe('John')
      expect(data.total).toBe(1)
    })

    test('should handle database errors with proper error type', async () => {
      mockDb.select.mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const result = getStudents({ schoolId: 'school-1' })

      await expectDatabaseErrorType(result, 'INTERNAL_ERROR')
    })

    test('should apply filters correctly', async () => {
      const mockStudents: unknown[] = []

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 0 }]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              leftJoin: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    groupBy: vi.fn().mockReturnValue({
                      orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                          offset: vi.fn().mockResolvedValue(mockStudents),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      })

      const result = await getStudents({
        schoolId: 'school-1',
        status: 'active',
        gender: 'M',
        search: 'John',
      })

      const data = await expectResultSuccess(result)
      expect(data.data).toEqual([])
    })
  })

  describe('getStudentById', () => {
    test('should return student by id with all details', async () => {
      const mockStudent = {
        student: { id: '1', firstName: 'John', lastName: 'Doe' },
        currentEnrollment: { id: 'enr-1', classId: 'class-1', status: 'confirmed' },
        currentClass: { id: 'class-1', section: 'A', gradeName: 'Grade 1', seriesName: null },
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              leftJoin: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockResolvedValue([mockStudent]),
                }),
              }),
            }),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      })

      const result = await getStudentById('1')

      const data = await expectResultSuccess(result)
      expect(data.firstName).toBe('John')
    })

    test('should return NOT_FOUND error when student does not exist', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              leftJoin: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        }),
      })

      const result = getStudentById('non-existent-id')

      await expectDatabaseErrorType(result, 'NOT_FOUND')
    })

    test('should handle database connection errors', async () => {
      mockDb.select.mockImplementation(() => {
        throw new Error('Connection timeout')
      })

      const result = getStudentById('1')

      const error = await expectResultError(result)
      expect(error).toBeInstanceOf(DatabaseError)
      expect(error.type).toBe('INTERNAL_ERROR')
    })
  })

  describe('error handling patterns', () => {
    test('should wrap errors in DatabaseError with correct type', async () => {
      const dbError = mockDatabaseError('INTERNAL_ERROR', 'Test error', { foo: 'bar' })

      mockDb.select.mockImplementation(() => {
        throw dbError
      })

      const result = getStudents({ schoolId: 'school-1' })

      const error = await expectResultError(result)
      expect(error).toBeInstanceOf(DatabaseError)
      expect(error.message).toContain('Failed to fetch students')
    })

    test('should preserve error context in DatabaseError', async () => {
      const originalError = new Error('Original database error')

      mockDb.select.mockImplementation(() => {
        throw originalError
      })

      const result = getStudents({ schoolId: 'school-1' })

      const error = await expectResultError(result)
      expect(error.originalError).toBe(originalError)
    })
  })
})
