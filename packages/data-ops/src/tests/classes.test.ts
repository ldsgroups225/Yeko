import { nanoid } from "nanoid"
import { beforeEach, describe, expect, test } from 'vitest'
import {
  createClass,
  deleteClass,
  getClassById,
  getClasses,
  updateClass,
} from '../queries/classes'
import { createClassroom } from '../queries/classrooms'
import { createSchool } from '../queries/schools'

describe('classes queries', () => {
  let testSchoolId: string
  let testSchoolYearId: string
  let testGradeId: string
  let testSeriesId: string
  let testClassroomId: string
  let testClassIds: string[] = []

  beforeEach(async () => {
    // Clean up existing test classes
    for (const id of testClassIds) {
      try {
        await deleteClass(id)
      }
      catch {
        // Ignore errors during cleanup
      }
    }
    testClassIds = []

    // Create test school
    const school = await createSchool({
      name: 'Test School for Classes',
      code: `TSC-${Date.now()}`,
      email: 'classes@test.com',
      phone: '+237123456789',
      status: 'active',
    })
    testSchoolId = school.id

    // Create test classroom
    const classroom = await createClassroom({
      id: nanoid(),
      schoolId: testSchoolId,
      name: 'Test Classroom',
      code: `TC-${Date.now()}`,
      type: 'regular',
      capacity: 40,
      status: 'active',
    })
    if (!classroom) {
      throw new Error('Failed to create classroom for test')
    }
    testClassroomId = classroom.id

    // Note: In a real test environment, we would create or use existing
    // school year, grade, and series records. For now, we'll use placeholder IDs
    // that should exist in the test database.
    testSchoolYearId = 'test-school-year-id'
    testGradeId = 'test-grade-id'
    testSeriesId = 'test-series-id'
  })

  describe('getClasses', () => {
    test('should return classes for a school', async () => {
      // Create test class
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'A',
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      testClassIds.push(testClass.id)

      const result = await getClasses({ schoolId: testSchoolId })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should filter by school year', async () => {
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'B',
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      testClassIds.push(testClass.id)

      const result = await getClasses({
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
      })

      expect(result.every((c: any) => c.class.schoolYearId === testSchoolYearId)).toBe(true)
    })

    test('should filter by grade', async () => {
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'C',
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      testClassIds.push(testClass.id)

      const result = await getClasses({
        schoolId: testSchoolId,
        gradeId: testGradeId,
      })

      expect(result.every((c: any) => c.class.gradeId === testGradeId)).toBe(true)
    })

    test('should filter by series', async () => {
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
        section: 'D',
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      testClassIds.push(testClass.id)

      const result = await getClasses({
        schoolId: testSchoolId,
        seriesId: testSeriesId,
      })

      expect(result.every((c: any) => c.class.seriesId === testSeriesId)).toBe(true)
    })

    test('should include student and subject counts', async () => {
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'E',
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      testClassIds.push(testClass.id)

      const result = await getClasses({ schoolId: testSchoolId })

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('studentsCount')
        expect(result[0]).toHaveProperty('subjectsCount')
        expect(typeof result[0]?.studentsCount).toBe('number')
        expect(typeof result[0]?.subjectsCount).toBe('number')
      }
    })
  })

  describe('getClassById', () => {
    test('should return class with details', async () => {
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'F',
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      testClassIds.push(testClass.id)

      const result = await getClassById(testClass.id)

      expect(result).toBeDefined()
      expect(result?.class.id).toBe(testClass.id)
      expect(result?.class.section).toBe('F')
    })

    test('should return undefined for non-existent class', async () => {
      const result = await getClassById('00000000-0000-0000-0000-000000000000')

      expect(result).toBeUndefined()
    })

    test('should include gender counts', async () => {
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'G',
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      testClassIds.push(testClass.id)

      const result = await getClassById(testClass.id)

      expect(result).toHaveProperty('boysCount')
      expect(result).toHaveProperty('girlsCount')
    })
  })

  describe('createClass', () => {
    test('should create a class with valid data', async () => {
      const classData = {
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: `H-${Date.now()}`,
        status: 'active' as const,
      }

      const newClass = await createClass(classData)
      if (!newClass) {
        throw new Error('Failed to create new class')
      }
      expect(newClass).toBeDefined()
      expect(newClass.id).toBe(classData.id)
      expect(newClass.section).toBe(classData.section)
      testClassIds.push(newClass.id)
    })

    test('should reject duplicate grade/series/section combination', async () => {
      const section = `DUP-${Date.now()}`

      const class1 = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section,
        status: 'active',
      })
      if (!class1) {
        throw new Error('Failed to create class1 for test')
      }
      testClassIds.push(class1.id)

      await expect(
        createClass({
          id: nanoid(),
          schoolId: testSchoolId,
          schoolYearId: testSchoolYearId,
          gradeId: testGradeId,
          section,
          status: 'active',
        }),
      ).rejects.toThrow('Class with this grade, series, and section already exists')
    })

    test('should validate classroom availability', async () => {
      // Create first class with classroom
      const class1 = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        classroomId: testClassroomId,
        section: `CR1-${Date.now()}`,
        status: 'active',
      })
      if (!class1) {
        throw new Error('Failed to create class1 for test')
      }
      testClassIds.push(class1.id)

      // Try to create second class with same classroom
      await expect(
        createClass({
          id: nanoid(),
          schoolId: testSchoolId,
          schoolYearId: testSchoolYearId,
          gradeId: testGradeId,
          classroomId: testClassroomId,
          section: `CR2-${Date.now()}`,
          status: 'active',
        }),
      ).rejects.toThrow('Classroom is already assigned')
    })

    test('should allow class without classroom', async () => {
      const newClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: `NC-${Date.now()}`,
        status: 'active',
      })
      if (!newClass) {
        throw new Error('Failed to create new class')
      }
      expect(newClass).toBeDefined()
      expect(newClass.classroomId).toBeNull()
      testClassIds.push(newClass.id)
    })
  })

  describe('updateClass', () => {
    test('should update class fields', async () => {
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'I',
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      testClassIds.push(testClass.id)

      const updated = await updateClass(testClass.id, {
        section: 'I-Updated',
        status: 'archived',
      })
      if (!updated) {
        throw new Error('Failed to update class')
      }
      expect(updated.section).toBe('I-Updated')
      expect(updated.status).toBe('archived')
    })

    test('should update classroom assignment', async () => {
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'J',
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      testClassIds.push(testClass.id)

      const updated = await updateClass(testClass.id, {
        classroomId: testClassroomId,
      })
      if (!updated) {
        throw new Error('Failed to update class')
      }
      expect(updated.classroomId).toBe(testClassroomId)
    })
  })

  describe('deleteClass', () => {
    test('should delete class without enrollments', async () => {
      const testClass = await createClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: `DEL-${Date.now()}`,
        status: 'active',
      })
      if (!testClass) {
        throw new Error('Failed to create test class')
      }
      await deleteClass(testClass.id)

      const result = await getClassById(testClass.id)
      expect(result).toBeUndefined()
    })

    // Note: Test for rejecting deletion of class with enrolled students
    // requires creating enrollment records, which depends on students table
  })
})
