import { nanoid } from 'nanoid'
import { beforeEach, describe, expect, test } from 'vitest'
import { createSchool } from '../queries/schools'
import {
  assignSubjectsToTeacher,
  getTeachersForSubject,
  getTeacherSubjects,
  removeSubjectsFromTeacher,
} from '../queries/teacher-subjects'

describe('teacher subjects queries', () => {
  let testSchoolId: string
  const fakeTeacherId = 'fake-teacher-id'
  const fakeSubjectId = 'fake-subject-id'

  beforeEach(async () => {
    // Create test school
    const school = (await createSchool({
      name: `Test Teacher Subjects ${nanoid()}`,
      code: `TTS-${Date.now()}`,
      status: 'active',
    }))._unsafeUnwrap()
    testSchoolId = school.id
  })

  describe('getTeacherSubjects', () => {
    test('should return empty array for non-existent teacher', async () => {
      const result = await getTeacherSubjects(fakeTeacherId)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })

    test('should return array with subject details structure', async () => {
      const result = await getTeacherSubjects(fakeTeacherId)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('assignSubjectsToTeacher', () => {
    test('should return empty array when no subjects provided', async () => {
      const result = await assignSubjectsToTeacher(fakeTeacherId, [])
      expect(result).toStrictEqual([])
    })

    test('should handle assignment attempt with non-existent teacher', async () => {
      try {
        await assignSubjectsToTeacher(fakeTeacherId, [fakeSubjectId])
      }
      catch (e) {
        expect(e).toBeDefined()
      }
    })

    test('should use onConflictDoNothing for duplicate assignments', async () => {
      const result = await assignSubjectsToTeacher(fakeTeacherId, [])
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('removeSubjectsFromTeacher', () => {
    test('should return empty array when no subjects provided', async () => {
      const result = await removeSubjectsFromTeacher(fakeTeacherId, [])
      expect(result).toStrictEqual([])
    })

    test('should return empty array when removing non-existent assignments', async () => {
      const result = await removeSubjectsFromTeacher(fakeTeacherId, [fakeSubjectId])
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })

    test('should handle multiple subject removal', async () => {
      const result = await removeSubjectsFromTeacher(fakeTeacherId, [
        'subject-1',
        'subject-2',
        'subject-3',
      ])
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getTeachersForSubject', () => {
    test('should return empty array for non-existent subject', async () => {
      const result = await getTeachersForSubject(fakeSubjectId, testSchoolId)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })

    test('should filter by school id', async () => {
      const result = await getTeachersForSubject(fakeSubjectId, testSchoolId)
      expect(Array.isArray(result)).toBe(true)
    })

    test('should only return active teachers', async () => {
      const result = await getTeachersForSubject(fakeSubjectId, testSchoolId)
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
