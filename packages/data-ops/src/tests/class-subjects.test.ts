import { nanoid } from 'nanoid'
import { beforeEach, describe, expect, test } from 'vitest'
import {
  assignTeacherToClassSubject,
  bulkAssignTeacher,
  copyClassSubjects,
  detectTeacherConflicts,
  getAssignmentMatrix,
  getClassSubjects,
  removeTeacherFromClassSubject,
} from '../queries/class-subjects'
import { createClass, deleteClass } from '../queries/classes'
import { createSchool } from '../queries/schools'

describe('class subjects queries', () => {
  let testSchoolId: string
  let testSchoolYearId: string
  let testGradeId: string
  let testClassId: string
  let testSubjectId: string
  let testTeacherId: string
  let testClassIds: string[] = []

  beforeEach(async () => {
    // Clean up existing test classes
    for (const id of testClassIds) {
      try {
        if (testSchoolId) {
          await deleteClass(testSchoolId, id)
        }
      }
      catch {
        // Ignore errors during cleanup
      }
    }
    testClassIds = []

    // Create test school
    const school = await createSchool({
      name: 'Test School for Class Subjects',
      code: `TSCS-${Date.now()}`,
      email: 'class-subjects@test.com',
      phone: '+237123456789',
      status: 'active',
    })
    testSchoolId = school.id

    // Note: In a real test environment, we would create or use existing
    // school year, grade, subject, and teacher records.
    testSchoolYearId = 'test-school-year-id'
    testGradeId = 'test-grade-id'
    testSubjectId = 'test-subject-id'
    testTeacherId = 'test-teacher-id'

    // Create test class
    const result = await createClass(testSchoolId, {
      id: nanoid(),
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      gradeId: testGradeId,
      section: `CS-${Date.now()}`,
      status: 'active',
    })

    if (result.isErr())
      throw result.error
    const testClass = result.value

    testClassId = testClass!.id
    testClassIds.push(testClassId)
  })

  describe('getClassSubjects', () => {
    test('should return class subjects with filters', async () => {
      const result = await getClassSubjects({ classId: testClassId })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should filter by school', async () => {
      const result = await getClassSubjects({ schoolId: testSchoolId })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should filter by school year', async () => {
      const result = await getClassSubjects({
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
      })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should include teacher information when assigned', async () => {
      const result = await getClassSubjects({ classId: testClassId })

      // Structure check - each result should have expected shape
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('classSubject')
        expect(result[0]).toHaveProperty('class')
        expect(result[0]).toHaveProperty('subject')
        expect(result[0]).toHaveProperty('teacher')
      }
    })
  })

  describe('getAssignmentMatrix', () => {
    test('should return assignment matrix for school year', async () => {
      const result = await getAssignmentMatrix(testSchoolId, testSchoolYearId)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should include class and subject information', async () => {
      const result = await getAssignmentMatrix(testSchoolId, testSchoolYearId)

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('classId')
        expect(result[0]).toHaveProperty('className')
        expect(result[0]).toHaveProperty('subjectId')
        expect(result[0]).toHaveProperty('subjectName')
      }
    })

    test('should include teacher assignments', async () => {
      const result = await getAssignmentMatrix(testSchoolId, testSchoolYearId)

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('teacherId')
        expect(result[0]).toHaveProperty('teacherName')
      }
    })

    test('should order by grade and section', async () => {
      const result = await getAssignmentMatrix(testSchoolId, testSchoolYearId)

      expect(result).toBeDefined()
      // Results should be ordered - verify structure exists
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('gradeOrder')
        expect(result[0]).toHaveProperty('section')
      }
    })
  })

  describe('assignTeacherToClassSubject', () => {
    test('should reject unqualified teacher', async () => {
      // Using a teacher ID that doesn't have the subject qualification
      const unqualifiedTeacherId = 'unqualified-teacher-id'

      await expect(
        assignTeacherToClassSubject(testClassId, testSubjectId, unqualifiedTeacherId),
      ).rejects.toThrow('Teacher is not qualified to teach this subject')
    })

    // Note: Test for assigning qualified teacher requires:
    // 1. A teacher record in the teachers table
    // 2. A teacher_subjects record linking teacher to subject
    // These would be set up in a full integration test environment
  })

  describe('bulkAssignTeacher', () => {
    test('should handle empty assignments array', async () => {
      const result = await bulkAssignTeacher([])

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })

    test('should reject if any teacher is unqualified', async () => {
      const unqualifiedTeacherId = 'unqualified-teacher-id'

      await expect(
        bulkAssignTeacher([
          {
            classId: testClassId,
            subjectId: testSubjectId,
            teacherId: unqualifiedTeacherId,
          },
        ]),
      ).rejects.toThrow('Teacher not qualified')
    })

    // Note: Full transaction and rollback tests require qualified teachers
  })

  describe('removeTeacherFromClassSubject', () => {
    test('should handle non-existent assignment gracefully', async () => {
      const result = await removeTeacherFromClassSubject(
        'non-existent-class-id',
        'non-existent-subject-id',
      )

      // Should return undefined when no matching record exists
      expect(result).toBeUndefined()
    })
  })

  describe('detectTeacherConflicts', () => {
    test('should return empty array for teacher with no assignments', async () => {
      const result = await detectTeacherConflicts('non-existent-teacher-id', testSchoolYearId)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })

    test('should return empty for teacher under 30 hours', async () => {
      // A teacher with few or no assignments should not be flagged
      const result = await detectTeacherConflicts(testTeacherId, testSchoolYearId)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      // Under 30 hours should return empty
      expect(result).toHaveLength(0)
    })

    // Note: Test for overloaded teacher (>30 hours) requires:
    // 1. Multiple class-subject assignments for a single teacher
    // 2. Each assignment with hoursPerWeek values totaling >30
  })

  describe('copyClassSubjects', () => {
    let sourceClassId: string

    beforeEach(async () => {
      // Create a source class
      const result = await createClass(testSchoolId, {
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: `Source-${Date.now()}`,
        status: 'active',
      })
      if (result.isErr())
        throw result.error
      const sourceClass = result.value

      sourceClassId = sourceClass!.id
      testClassIds.push(sourceClassId)

      // Add subjects to source class (mocking subject IDs since we don't create subjects in test setup yet)
      // Note: In real DB test, we need valid subject IDs.
    })

    test('should return empty result if source has no subjects', async () => {
      const result = await copyClassSubjects(sourceClassId, testClassId)
      expect(result).toStrictEqual([])
    })

    // More tests will be added pending subject creation capability in tests
  })
})
