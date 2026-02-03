import { nanoid } from 'nanoid'
import { beforeEach, describe, expect, test } from 'vitest'
import {
  addSubjectsToSchool,
  getAvailableCoreSubjects,
  getSchoolSubjects,
} from '../queries/school-subjects'
import { createSchool } from '../queries/schools'

describe('school subjects queries', () => {
  let testSchoolId: string

  beforeEach(async () => {
    // Create test school
    const school = (await createSchool({
      name: `Test School Subjects ${nanoid()}`,
      code: `TSS-${Date.now()}`,
      status: 'active',
    }))._unsafeUnwrap()
    testSchoolId = school.id
  })

  describe('getSchoolSubjects', () => {
    test('should return empty list when no active school year', async () => {
      const result = (await getSchoolSubjects({ schoolId: testSchoolId }))._unsafeUnwrap()
      expect(result.subjects).toBeDefined()
      expect(Array.isArray(result.subjects)).toBe(true)
      expect(result.subjects).toHaveLength(0)
    })

    test('should return pagination info', async () => {
      const result = (await getSchoolSubjects({ schoolId: testSchoolId }))._unsafeUnwrap()
      expect(result.pagination).toBeDefined()
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(100)
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.totalPages).toBe(0)
    })

    test('should respect page and limit parameters', async () => {
      const result = (await getSchoolSubjects({
        schoolId: testSchoolId,
        page: 2,
        limit: 10,
      }))._unsafeUnwrap()
      expect(result.pagination.page).toBe(2)
      expect(result.pagination.limit).toBe(10)
    })
  })

  describe('getAvailableCoreSubjects', () => {
    test('should return empty array when no active school year', async () => {
      const result = (await getAvailableCoreSubjects({ schoolId: testSchoolId }))._unsafeUnwrap()
      expect(result).toStrictEqual([])
    })
  })

  describe('addSubjectsToSchool', () => {
    test('should return empty array when no subjects provided', async () => {
      const result = (await addSubjectsToSchool({
        schoolId: testSchoolId,
        subjectIds: [],
      }))._unsafeUnwrap()
      expect(result).toStrictEqual([])
    })

    test('should throw error when no active school year', async () => {
      expect((await addSubjectsToSchool({
        schoolId: testSchoolId,
        subjectIds: ['subject-1'],
      })).isErr()).toBe(true)
    })
  })
})
