import type { StudentFilters } from './students'

import { describe, expect, test, vi } from 'vitest'
import {

  studentsKeys,
  studentsOptions,
} from './students'

vi.mock('@tanstack/react-query', () => ({
  queryOptions: vi.fn(options => options),
}))

vi.mock('@/school/functions/students', () => ({
  exportStudents: vi.fn(),
  generateMatricule: vi.fn(),
  getStudentById: vi.fn(),
  getStudents: vi.fn(),
  getStudentStatistics: vi.fn(),
}))

describe('studentsKeys', () => {
  describe('all', () => {
    test('should return base key array', () => {
      expect(studentsKeys.all).toStrictEqual(['students'])
    })
  })

  describe('lists', () => {
    test('should return list key array', () => {
      expect(studentsKeys.lists()).toStrictEqual(['students', 'list'])
    })
  })

  describe('list', () => {
    test('should return list key with empty filters', () => {
      const filters: StudentFilters = {}
      const result = studentsKeys.list(filters)
      expect(result).toStrictEqual(['students', 'list', {}])
    })

    test('should return list key with classId filter', () => {
      const filters: StudentFilters = { classId: 'class-1' }
      const result = studentsKeys.list(filters)
      expect(result).toStrictEqual(['students', 'list', { classId: 'class-1' }])
    })

    test('should return list key with multiple filters', () => {
      const filters: StudentFilters = {
        classId: 'class-1',
        gradeId: 'grade-1',
        schoolYearId: 'year-1',
        status: 'active',
        gender: 'M',
        search: 'john',
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
      }
      const result = studentsKeys.list(filters)
      expect(result).toStrictEqual(['students', 'list', filters])
    })
  })

  describe('details', () => {
    test('should return details key array', () => {
      expect(studentsKeys.details()).toStrictEqual(['students', 'detail'])
    })
  })

  describe('detail', () => {
    test('should return single detail key with ID', () => {
      const result = studentsKeys.detail('student-1')
      expect(result).toStrictEqual(['students', 'detail', 'student-1'])
    })

    test('should handle different ID formats', () => {
      const result = studentsKeys.detail('uuid-1234-5678')
      expect(result).toStrictEqual(['students', 'detail', 'uuid-1234-5678'])
    })
  })

  describe('statistics', () => {
    test('should return statistics key array', () => {
      const result = studentsKeys.statistics()
      expect(result).toStrictEqual(['students', 'statistics'])
    })
  })

  describe('export', () => {
    test('should return export key with empty filters', () => {
      const filters: StudentFilters = {}
      const result = studentsKeys.export(filters)
      expect(result).toStrictEqual(['students', 'export', {}])
    })

    test('should return export key with filters', () => {
      const filters: StudentFilters = { classId: 'class-1', status: 'active' }
      const result = studentsKeys.export(filters)
      expect(result).toStrictEqual(['students', 'export', { classId: 'class-1', status: 'active' }])
    })
  })

  describe('matricule', () => {
    test('should return matricule key array', () => {
      const result = studentsKeys.matricule()
      expect(result).toStrictEqual(['students', 'matricule'])
    })
  })
})

describe('studentsOptions', () => {
  describe('list', () => {
    test('should create query options with correct structure for empty filters', () => {
      const filters: StudentFilters = {}
      const options = studentsOptions.list(filters)

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options.queryKey).toStrictEqual(['students', 'list', {}])
    })

    test('should create query options with correct structure for filters', () => {
      const filters: StudentFilters = {
        classId: 'class-1',
        status: 'active',
        page: 2,
        limit: 10,
      }
      const options = studentsOptions.list(filters)

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options.queryKey).toStrictEqual(['students', 'list', filters])
    })

    test('should set staleTime to 5 minutes', () => {
      const options = studentsOptions.list({})
      expect(options.staleTime).toBe(5 * 60 * 1000)
    })

    test('should set gcTime to 30 minutes', () => {
      const options = studentsOptions.list({})
      expect(options.gcTime).toBe(30 * 60 * 1000)
    })

    test('should always be enabled (no enabled check)', () => {
      const options = studentsOptions.list({})
      expect(options.enabled).toBeUndefined()
    })

    test('should include pagination params in queryKey', () => {
      const filters: StudentFilters = { page: 1, limit: 50 }
      const options = studentsOptions.list(filters)
      expect(options.queryKey).toStrictEqual(['students', 'list', { page: 1, limit: 50 }])
    })

    test('should include sorting params in queryKey', () => {
      const filters: StudentFilters = { sortBy: 'name', sortOrder: 'desc' }
      const options = studentsOptions.list(filters)
      expect(options.queryKey).toStrictEqual(['students', 'list', { sortBy: 'name', sortOrder: 'desc' }])
    })
  })

  describe('detail', () => {
    test('should create query options with correct structure', () => {
      const options = studentsOptions.detail('student-1')

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['students', 'detail', 'student-1'])
    })

    test('should set staleTime to 5 minutes', () => {
      const options = studentsOptions.detail('student-1')
      expect(options.staleTime).toBe(5 * 60 * 1000)
    })

    test('should set gcTime to 30 minutes', () => {
      const options = studentsOptions.detail('student-1')
      expect(options.gcTime).toBe(30 * 60 * 1000)
    })

    test('should enable when id is provided', () => {
      const options = studentsOptions.detail('student-1')
      expect(options.enabled).toBe(true)
    })

    test('should disable when id is empty string', () => {
      const options = studentsOptions.detail('')
      expect(options.enabled).toBe(false)
    })
  })

  describe('statistics', () => {
    test('should create query options with correct structure', () => {
      const options = studentsOptions.statistics()

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options.queryKey).toStrictEqual(['students', 'statistics'])
    })

    test('should set staleTime to 10 minutes', () => {
      const options = studentsOptions.statistics()
      expect(options.staleTime).toBe(10 * 60 * 1000)
    })

    test('should set gcTime to 30 minutes', () => {
      const options = studentsOptions.statistics()
      expect(options.gcTime).toBe(30 * 60 * 1000)
    })
  })

  describe('export', () => {
    test('should create query options with correct structure', () => {
      const filters: StudentFilters = { classId: 'class-1' }
      const options = studentsOptions.export(filters)

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['students', 'export', { classId: 'class-1' }])
    })

    test('should set staleTime to 0 for exports', () => {
      const options = studentsOptions.export({})
      expect(options.staleTime).toBe(0)
    })

    test('should set gcTime to 5 minutes', () => {
      const options = studentsOptions.export({})
      expect(options.gcTime).toBe(5 * 60 * 1000)
    })

    test('should be disabled by default (manual trigger)', () => {
      const options = studentsOptions.export({})
      expect(options.enabled).toBe(false)
    })
  })

  describe('generateMatricule', () => {
    test('should create query options with correct structure', () => {
      const options = studentsOptions.generateMatricule()

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options.queryKey).toStrictEqual(['students', 'matricule'])
    })

    test('should set staleTime to 0 for fresh generation', () => {
      const options = studentsOptions.generateMatricule()
      expect(options.staleTime).toBe(0)
    })

    test('should set gcTime to 0', () => {
      const options = studentsOptions.generateMatricule()
      expect(options.gcTime).toBe(0)
    })
  })
})

describe('studentFilters interface', () => {
  test('should allow optional classId', () => {
    const filters: StudentFilters = { classId: 'class-1' }
    expect(filters.classId).toBe('class-1')
  })

  test('should allow optional gradeId', () => {
    const filters: StudentFilters = { gradeId: 'grade-1' }
    expect(filters.gradeId).toBe('grade-1')
  })

  test('should allow optional schoolYearId', () => {
    const filters: StudentFilters = { schoolYearId: 'year-1' }
    expect(filters.schoolYearId).toBe('year-1')
  })

  test('should allow status values', () => {
    const statuses: StudentFilters['status'][] = ['active', 'graduated', 'transferred', 'withdrawn']
    statuses.forEach((status) => {
      const filters: StudentFilters = { status }
      expect(filters.status).toBe(status)
    })
  })

  test('should allow gender values', () => {
    const genders: StudentFilters['gender'][] = ['M', 'F', 'other']
    genders.forEach((gender) => {
      const filters: StudentFilters = { gender }
      expect(filters.gender).toBe(gender)
    })
  })

  test('should allow optional search', () => {
    const filters: StudentFilters = { search: 'john' }
    expect(filters.search).toBe('john')
  })

  test('should allow pagination params', () => {
    const filters: StudentFilters = { page: 1, limit: 20 }
    expect(filters.page).toBe(1)
    expect(filters.limit).toBe(20)
  })

  test('should allow sortBy values', () => {
    const sortByValues: StudentFilters['sortBy'][] = ['name', 'matricule', 'dob', 'enrollmentDate', 'createdAt']
    sortByValues.forEach((sortBy) => {
      const filters: StudentFilters = { sortBy }
      expect(filters.sortBy).toBe(sortBy)
    })
  })

  test('should allow sortOrder values', () => {
    const sortOrders: StudentFilters['sortOrder'][] = ['asc', 'desc']
    sortOrders.forEach((sortOrder) => {
      const filters: StudentFilters = { sortOrder }
      expect(filters.sortOrder).toBe(sortOrder)
    })
  })
})

describe('pagination handling', () => {
  test('should include page in query key', () => {
    const filters: StudentFilters = { page: 3 }
    const options = studentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['students', 'list', { page: 3 }])
  })

  test('should include limit in query key', () => {
    const filters: StudentFilters = { limit: 50 }
    const options = studentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['students', 'list', { limit: 50 }])
  })

  test('should include both page and limit in query key', () => {
    const filters: StudentFilters = { page: 2, limit: 25 }
    const options = studentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['students', 'list', { page: 2, limit: 25 }])
  })
})

describe('sorting handling', () => {
  test('should include sortBy in query key', () => {
    const filters: StudentFilters = { sortBy: 'matricule' }
    const options = studentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['students', 'list', { sortBy: 'matricule' }])
  })

  test('should include sortOrder in query key', () => {
    const filters: StudentFilters = { sortOrder: 'desc' }
    const options = studentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['students', 'list', { sortOrder: 'desc' }])
  })

  test('should include both sortBy and sortOrder in query key', () => {
    const filters: StudentFilters = { sortBy: 'dob', sortOrder: 'asc' }
    const options = studentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['students', 'list', { sortBy: 'dob', sortOrder: 'asc' }])
  })
})

describe('filtering and sorting integration', () => {
  test('should generate consistent query keys for same filters', () => {
    const filters: StudentFilters = {
      classId: 'class-1',
      status: 'active',
      page: 1,
      limit: 20,
    }
    const key1 = studentsKeys.list(filters)
    const key2 = studentsKeys.list(filters)
    expect(key1).toStrictEqual(key2)
  })

  test('should generate different query keys for different page', () => {
    const filters1: StudentFilters = { page: 1 }
    const filters2: StudentFilters = { page: 2 }
    const key1 = studentsKeys.list(filters1)
    const key2 = studentsKeys.list(filters2)
    expect(key1).not.toStrictEqual(key2)
  })

  test('should generate different query keys for different sort order', () => {
    const filters1: StudentFilters = { sortOrder: 'asc' }
    const filters2: StudentFilters = { sortOrder: 'desc' }
    const key1 = studentsKeys.list(filters1)
    const key2 = studentsKeys.list(filters2)
    expect(key1).not.toStrictEqual(key2)
  })
})
