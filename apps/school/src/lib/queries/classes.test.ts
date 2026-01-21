import type { ClassFilters } from './classes'

import { describe, expect, test, vi } from 'vitest'
import {
  classesKeys,
  classesOptions,

} from './classes'

vi.mock('@tanstack/react-query', () => ({
  queryOptions: vi.fn(options => options),
}))

vi.mock('@/school/functions/classes', () => ({
  getClassById: vi.fn(),
  getClasses: vi.fn(),
}))

describe('classesKeys', () => {
  describe('all', () => {
    test('should return base key array', () => {
      expect(classesKeys.all).toStrictEqual(['classes'])
    })
  })

  describe('lists', () => {
    test('should return list key array', () => {
      expect(classesKeys.lists()).toStrictEqual(['classes', 'list'])
    })
  })

  describe('list', () => {
    test('should return list key with empty filters', () => {
      const filters: ClassFilters = {}
      const result = classesKeys.list(filters)
      expect(result).toStrictEqual(['classes', 'list', {}])
    })

    test('should return list key with schoolYearId filter', () => {
      const filters: ClassFilters = { schoolYearId: 'year-1' }
      const result = classesKeys.list(filters)
      expect(result).toStrictEqual(['classes', 'list', { schoolYearId: 'year-1' }])
    })

    test('should return list key with multiple filters', () => {
      const filters: ClassFilters = {
        schoolYearId: 'year-1',
        gradeId: 'grade-1',
        seriesId: 'series-1',
        status: 'active',
        search: 'math',
      }
      const result = classesKeys.list(filters)
      expect(result).toStrictEqual(['classes', 'list', filters])
    })

    test('should handle partial filters', () => {
      const filters: ClassFilters = { status: 'archived' }
      const result = classesKeys.list(filters)
      expect(result).toStrictEqual(['classes', 'list', { status: 'archived' }])
    })
  })

  describe('details', () => {
    test('should return details key array', () => {
      expect(classesKeys.details()).toStrictEqual(['classes', 'detail'])
    })
  })

  describe('detail', () => {
    test('should return single detail key with ID', () => {
      const result = classesKeys.detail('class-1')
      expect(result).toStrictEqual(['classes', 'detail', 'class-1'])
    })

    test('should handle different ID formats', () => {
      const result = classesKeys.detail('uuid-1234-5678')
      expect(result).toStrictEqual(['classes', 'detail', 'uuid-1234-5678'])
    })
  })
})

describe('classesOptions', () => {
  describe('list', () => {
    test('should create query options with correct structure for empty filters', () => {
      const filters: ClassFilters = {}
      const options = classesOptions.list(filters)

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options.queryKey).toStrictEqual(['classes', 'list', {}])
    })

    test('should create query options with correct structure for filters', () => {
      const filters: ClassFilters = {
        schoolYearId: 'year-1',
        gradeId: 'grade-1',
        status: 'active',
      }
      const options = classesOptions.list(filters)

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options.queryKey).toStrictEqual(['classes', 'list', filters])
    })

    test('should set staleTime to 5 minutes', () => {
      const options = classesOptions.list({})
      expect(options.staleTime).toBe(5 * 60 * 1000)
    })

    test('should set gcTime to 30 minutes', () => {
      const options = classesOptions.list({})
      expect(options.gcTime).toBe(30 * 60 * 1000)
    })

    test('should always be enabled (no enabled check)', () => {
      const options = classesOptions.list({})
      expect(options.enabled).toBeUndefined()
    })

    test('should include search filter in queryKey', () => {
      const filters: ClassFilters = { search: 'mathematics' }
      const options = classesOptions.list(filters)
      expect(options.queryKey).toStrictEqual(['classes', 'list', { search: 'mathematics' }])
    })

    test('should include seriesId filter in queryKey', () => {
      const filters: ClassFilters = { seriesId: 'series-a' }
      const options = classesOptions.list(filters)
      expect(options.queryKey).toStrictEqual(['classes', 'list', { seriesId: 'series-a' }])
    })
  })

  describe('detail', () => {
    test('should create query options with correct structure', () => {
      const options = classesOptions.detail('class-1')

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['classes', 'detail', 'class-1'])
    })

    test('should set staleTime to 5 minutes', () => {
      const options = classesOptions.detail('class-1')
      expect(options.staleTime).toBe(5 * 60 * 1000)
    })

    test('should set gcTime to 30 minutes', () => {
      const options = classesOptions.detail('class-1')
      expect(options.gcTime).toBe(30 * 60 * 1000)
    })

    test('should enable when id is provided', () => {
      const options = classesOptions.detail('class-1')
      expect(options.enabled).toBe(true)
    })

    test('should disable when id is empty string', () => {
      const options = classesOptions.detail('')
      expect(options.enabled).toBe(false)
    })
  })
})

describe('classFilters interface', () => {
  test('should allow optional schoolYearId', () => {
    const filters: ClassFilters = { schoolYearId: 'year-1' }
    expect(filters.schoolYearId).toBe('year-1')
  })

  test('should allow optional gradeId', () => {
    const filters: ClassFilters = { gradeId: 'grade-1' }
    expect(filters.gradeId).toBe('grade-1')
  })

  test('should allow optional seriesId', () => {
    const filters: ClassFilters = { seriesId: 'series-1' }
    expect(filters.seriesId).toBe('series-1')
  })

  test('should allow optional status', () => {
    const filters: ClassFilters = { status: 'active' }
    expect(filters.status).toBe('active')
  })

  test('should allow optional search', () => {
    const filters: ClassFilters = { search: 'math' }
    expect(filters.search).toBe('math')
  })

  test('should allow empty filters', () => {
    const filters: ClassFilters = {}
    expect(filters).toStrictEqual({})
  })

  test('should allow multiple filters together', () => {
    const filters: ClassFilters = {
      schoolYearId: 'year-1',
      gradeId: 'grade-1',
      seriesId: 'series-1',
      status: 'active',
      search: 'english',
    }
    expect(filters.schoolYearId).toBe('year-1')
    expect(filters.gradeId).toBe('grade-1')
    expect(filters.seriesId).toBe('series-1')
    expect(filters.status).toBe('active')
    expect(filters.search).toBe('english')
  })
})

describe('pagination and filtering integration', () => {
  test('should generate consistent query keys for same filters', () => {
    const filters: ClassFilters = {
      schoolYearId: 'year-1',
      gradeId: 'grade-1',
    }
    const key1 = classesKeys.list(filters)
    const key2 = classesKeys.list(filters)
    expect(key1).toStrictEqual(key2)
  })

  test('should generate different query keys for different filters', () => {
    const filters1: ClassFilters = { schoolYearId: 'year-1' }
    const filters2: ClassFilters = { schoolYearId: 'year-2' }
    const key1 = classesKeys.list(filters1)
    const key2 = classesKeys.list(filters2)
    expect(key1).not.toStrictEqual(key2)
  })

  test('should maintain filter order in query key', () => {
    const filters: ClassFilters = {
      status: 'active',
      schoolYearId: 'year-1',
      search: 'math',
    }
    const options = classesOptions.list(filters)
    expect(options.queryKey[2]).toStrictEqual({
      status: 'active',
      schoolYearId: 'year-1',
      search: 'math',
    })
  })
})
