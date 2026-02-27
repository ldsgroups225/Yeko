import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getNotesTrend } from '../../queries/teacher-notes'
import { createMockDbClient } from '../utils/result-test-utils'

// Mock getDb
vi.mock('../../database/setup', () => ({
  getDb: vi.fn(),
}))

// Mock Drizzle ORM to intercept sql.raw calls
vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual<typeof import('drizzle-orm')>('drizzle-orm')
  return {
    ...actual,
    sql: Object.assign(
      (strings: TemplateStringsArray, ...params: any[]) => actual.sql(strings, ...params),
      {
        ...actual.sql,
        // If the fix is working, raw() should NOT be called with user input.
        // We can spy on it to ensure it doesn't receive dangerous strings.
        raw: vi.fn((str: string) => {
          // Fail if any known SQL injection pattern is detected in raw SQL construction
          if (typeof str === 'string' && (str.includes('DROP TABLE') || str.includes('OR 1=1'))) {
            throw new Error('SECURITY REGRESSION: Raw SQL injection attempted in sql.raw()')
          }
          return actual.sql.raw(str)
        }),
      },
    ),
  }
})

describe('teacher Notes Queries Security', () => {
  let mockDb: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { getDb } = await import('../../database/setup')
    mockDb = createMockDbClient()

    // Setup mock chain for Drizzle query builder
    const groupByMock = vi.fn().mockReturnValue([])
    const whereMock = vi.fn().mockReturnValue({ groupBy: groupByMock })
    const fromMock = vi.fn().mockReturnValue({ where: whereMock })
    const selectMock = vi.fn().mockReturnValue({ from: fromMock })
    mockDb.select = selectMock

    vi.mocked(getDb).mockReturnValue(mockDb)
  })

  test('getNotesTrend should be safe against SQL injection in months parameter', async () => {
    const studentId = 'student-123'
    // Malicious payload that would trigger the mock error if passed to sql.raw()
    const maliciousInput = '6); DROP TABLE students; --' as any

    // The function should execute without triggering the security regression error in sql.raw
    // It might fail later in the mock chain or return empty, but it must NOT throw the security error.
    await expect(getNotesTrend({ studentId, months: maliciousInput })).resolves.not.toThrow(/SECURITY REGRESSION/)
  })
})
