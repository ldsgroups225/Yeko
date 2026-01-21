import type { GradesByClassParams, PendingFilters, StatisticsParams } from './grades'

import { describe, expect, test, vi } from 'vitest'
import {

  gradesKeys,
  gradesOptions,

} from './grades'

vi.mock('@tanstack/react-query', () => ({
  queryOptions: vi.fn(options => options),
}))

vi.mock('@/school/functions/student-grades', () => ({
  getGrade: vi.fn(),
  getGradesByClass: vi.fn(),
  getGradeStatistics: vi.fn(),
  getGradeValidationHistory: vi.fn(),
  getPendingValidations: vi.fn(),
}))

describe('gradesKeys', () => {
  describe('all', () => {
    test('should return base key array', () => {
      expect(gradesKeys.all).toStrictEqual(['grades'])
    })
  })

  describe('lists', () => {
    test('should return list key array', () => {
      expect(gradesKeys.lists()).toStrictEqual(['grades', 'list'])
    })
  })

  describe('byClass', () => {
    test('should return class-based key with all params', () => {
      const result = gradesKeys.byClass('class-1', 'subject-1', 'term-1')
      expect(result).toStrictEqual(['grades', 'list', 'class', 'class-1', 'subject-1', 'term-1'])
    })

    test('should handle different IDs', () => {
      const result = gradesKeys.byClass('cls-abc', 'sub-xyz', 'trm-123')
      expect(result).toStrictEqual(['grades', 'list', 'class', 'cls-abc', 'sub-xyz', 'trm-123'])
    })
  })

  describe('details', () => {
    test('should return details key array', () => {
      expect(gradesKeys.details()).toStrictEqual(['grades', 'detail'])
    })
  })

  describe('detail', () => {
    test('should return single detail key with ID', () => {
      const result = gradesKeys.detail('grade-1')
      expect(result).toStrictEqual(['grades', 'detail', 'grade-1'])
    })

    test('should handle different ID formats', () => {
      const result = gradesKeys.detail('uuid-1234-5678')
      expect(result).toStrictEqual(['grades', 'detail', 'uuid-1234-5678'])
    })
  })

  describe('history', () => {
    test('should return history key with grade ID', () => {
      const result = gradesKeys.history('grade-1')
      expect(result).toStrictEqual(['grades', 'history', 'grade-1'])
    })
  })

  describe('pending', () => {
    test('should return pending key with schoolId only', () => {
      const result = gradesKeys.pending('school-1')
      expect(result).toStrictEqual(['grades', 'pending', 'school-1', undefined])
    })

    test('should return pending key with filters', () => {
      const filters: PendingFilters = {
        termId: 'term-1',
        classId: 'class-1',
        subjectId: 'subject-1',
      }
      const result = gradesKeys.pending('school-1', filters)
      expect(result).toStrictEqual(['grades', 'pending', 'school-1', filters])
    })

    test('should handle partial filters', () => {
      const filters: PendingFilters = { termId: 'term-1' }
      const result = gradesKeys.pending('school-1', filters)
      expect(result).toStrictEqual(['grades', 'pending', 'school-1', filters])
    })
  })

  describe('statistics', () => {
    test('should return stats key with required params', () => {
      const result = gradesKeys.statistics('class-1', 'term-1')
      expect(result).toStrictEqual(['grades', 'stats', 'class-1', 'term-1', undefined])
    })

    test('should return stats key with optional subjectId', () => {
      const result = gradesKeys.statistics('class-1', 'term-1', 'subject-1')
      expect(result).toStrictEqual(['grades', 'stats', 'class-1', 'term-1', 'subject-1'])
    })
  })
})

describe('gradesOptions', () => {
  describe('byClass', () => {
    test('should create query options with correct structure', () => {
      const params: GradesByClassParams = {
        classId: 'class-1',
        subjectId: 'subject-1',
        termId: 'term-1',
      }
      const options = gradesOptions.byClass(params)

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['grades', 'list', 'class', 'class-1', 'subject-1', 'term-1'])
    })

    test('should set staleTime to 30 seconds', () => {
      const params: GradesByClassParams = {
        classId: 'class-1',
        subjectId: 'subject-1',
        termId: 'term-1',
      }
      const options = gradesOptions.byClass(params)
      expect(options.staleTime).toBe(30 * 1000)
    })

    test('should set gcTime to 5 minutes', () => {
      const params: GradesByClassParams = {
        classId: 'class-1',
        subjectId: 'subject-1',
        termId: 'term-1',
      }
      const options = gradesOptions.byClass(params)
      expect(options.gcTime).toBe(5 * 60 * 1000)
    })

    test('should enable when all required params are present', () => {
      const params: GradesByClassParams = {
        classId: 'class-1',
        subjectId: 'subject-1',
        termId: 'term-1',
      }
      const options = gradesOptions.byClass(params)
      expect(options.enabled).toBe(true)
    })

    test('should disable when classId is missing', () => {
      const params = {
        subjectId: 'subject-1',
        termId: 'term-1',
      } as GradesByClassParams
      const options = gradesOptions.byClass(params)
      expect(options.enabled).toBe(false)
    })

    test('should disable when subjectId is missing', () => {
      const params = {
        classId: 'class-1',
        termId: 'term-1',
      } as GradesByClassParams
      const options = gradesOptions.byClass(params)
      expect(options.enabled).toBe(false)
    })

    test('should disable when termId is missing', () => {
      const params = {
        classId: 'class-1',
        subjectId: 'subject-1',
      } as GradesByClassParams
      const options = gradesOptions.byClass(params)
      expect(options.enabled).toBe(false)
    })

    test('should include optional teacherId in queryKey', () => {
      const params: GradesByClassParams = {
        classId: 'class-1',
        subjectId: 'subject-1',
        termId: 'term-1',
        teacherId: 'teacher-1',
      }
      const options = gradesOptions.byClass(params)
      expect(options.queryKey).toStrictEqual(['grades', 'list', 'class', 'class-1', 'subject-1', 'term-1'])
    })
  })

  describe('detail', () => {
    test('should create query options with correct structure', () => {
      const options = gradesOptions.detail('grade-1')

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['grades', 'detail', 'grade-1'])
    })

    test('should set staleTime to 30 seconds', () => {
      const options = gradesOptions.detail('grade-1')
      expect(options.staleTime).toBe(30 * 1000)
    })

    test('should set gcTime to 5 minutes', () => {
      const options = gradesOptions.detail('grade-1')
      expect(options.gcTime).toBe(5 * 60 * 1000)
    })

    test('should enable when id is provided', () => {
      const options = gradesOptions.detail('grade-1')
      expect(options.enabled).toBe(true)
    })

    test('should disable when id is empty string', () => {
      const options = gradesOptions.detail('')
      expect(options.enabled).toBe(false)
    })
  })

  describe('pending', () => {
    test('should create query options with correct structure', () => {
      const options = gradesOptions.pending('school-1')

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['grades', 'pending', 'school-1', {}])
    })

    test('should set staleTime to 30 seconds', () => {
      const options = gradesOptions.pending('school-1')
      expect(options.staleTime).toBe(30 * 1000)
    })

    test('should set gcTime to 5 minutes', () => {
      const options = gradesOptions.pending('school-1')
      expect(options.gcTime).toBe(5 * 60 * 1000)
    })

    test('should enable when schoolId is provided', () => {
      const options = gradesOptions.pending('school-1')
      expect(options.enabled).toBe(true)
    })

    test('should disable when schoolId is empty string', () => {
      const options = gradesOptions.pending('')
      expect(options.enabled).toBe(false)
    })

    test('should include filters in queryKey', () => {
      const filters: PendingFilters = {
        termId: 'term-1',
        classId: 'class-1',
        subjectId: 'subject-1',
      }
      const options = gradesOptions.pending('school-1', filters)
      expect(options.queryKey).toStrictEqual(['grades', 'pending', 'school-1', filters])
    })
  })

  describe('statistics', () => {
    test('should create query options with correct structure', () => {
      const params: StatisticsParams = {
        classId: 'class-1',
        termId: 'term-1',
      }
      const options = gradesOptions.statistics(params)

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['grades', 'stats', 'class-1', 'term-1', undefined])
    })

    test('should set staleTime to 1 minute', () => {
      const params: StatisticsParams = {
        classId: 'class-1',
        termId: 'term-1',
      }
      const options = gradesOptions.statistics(params)
      expect(options.staleTime).toBe(60 * 1000)
    })

    test('should set gcTime to 10 minutes', () => {
      const params: StatisticsParams = {
        classId: 'class-1',
        termId: 'term-1',
      }
      const options = gradesOptions.statistics(params)
      expect(options.gcTime).toBe(10 * 60 * 1000)
    })

    test('should enable when classId and termId are present', () => {
      const params: StatisticsParams = {
        classId: 'class-1',
        termId: 'term-1',
      }
      const options = gradesOptions.statistics(params)
      expect(options.enabled).toBe(true)
    })

    test('should disable when classId is missing', () => {
      const params = { termId: 'term-1' } as StatisticsParams
      const options = gradesOptions.statistics(params)
      expect(options.enabled).toBe(false)
    })

    test('should disable when termId is missing', () => {
      const params = { classId: 'class-1' } as StatisticsParams
      const options = gradesOptions.statistics(params)
      expect(options.enabled).toBe(false)
    })

    test('should include optional subjectId in queryKey', () => {
      const params: StatisticsParams = {
        classId: 'class-1',
        termId: 'term-1',
        subjectId: 'subject-1',
      }
      const options = gradesOptions.statistics(params)
      expect(options.queryKey).toStrictEqual(['grades', 'stats', 'class-1', 'term-1', 'subject-1'])
    })
  })

  describe('history', () => {
    test('should create query options with correct structure', () => {
      const options = gradesOptions.history('grade-1')

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['grades', 'history', 'grade-1'])
    })

    test('should set staleTime to 1 minute', () => {
      const options = gradesOptions.history('grade-1')
      expect(options.staleTime).toBe(60 * 1000)
    })

    test('should set gcTime to 10 minutes', () => {
      const options = gradesOptions.history('grade-1')
      expect(options.gcTime).toBe(10 * 60 * 1000)
    })

    test('should enable when gradeId is provided', () => {
      const options = gradesOptions.history('grade-1')
      expect(options.enabled).toBe(true)
    })

    test('should disable when gradeId is empty string', () => {
      const options = gradesOptions.history('')
      expect(options.enabled).toBe(false)
    })
  })
})

describe('type exports', () => {
  test('should export GradesByClassParams interface', () => {
    const params: GradesByClassParams = {
      classId: 'class-1',
      subjectId: 'subject-1',
      termId: 'term-1',
      teacherId: 'teacher-1',
    }
    expect(params.classId).toBe('class-1')
  })

  test('should export PendingFilters interface', () => {
    const filters: PendingFilters = {
      termId: 'term-1',
      classId: 'class-1',
      subjectId: 'subject-1',
    }
    expect(filters.termId).toBe('term-1')
  })

  test('should export StatisticsParams interface', () => {
    const params: StatisticsParams = {
      classId: 'class-1',
      termId: 'term-1',
      subjectId: 'subject-1',
    }
    expect(params.classId).toBe('class-1')
  })
})
