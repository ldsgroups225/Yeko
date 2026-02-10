import { Result as R } from '@praha/byethrow'
import { nanoid } from 'nanoid'
import { beforeEach, describe, expect, test } from 'vitest'
import { createGrade, createSerie, createTrack } from '../queries/catalogs'
import {
  createClass,
  deleteClass,
  getClassById,
  getClasses,
  updateClass,
} from '../queries/classes'
import { createClassroom } from '../queries/classrooms'
import { createSchoolYearTemplate } from '../queries/programs'
import { createSchoolYear } from '../queries/school-admin/school-years'
import { createSchool } from '../queries/schools'
import './setup'

describe('classes queries', () => {
  let testSchoolId: string
  let testSchoolYearId: string
  let testGradeId: string
  let testSeriesId: string
  let testTrackId: string
  let testClassroomId: string
  const testClassIds: string[] = []

  beforeEach(async () => {
    // Create test school
    const school = R.unwrap(await createSchool({
      name: 'Test School for Classes',
      code: `TSC-${Date.now()}`,
      email: 'classes@test.com',
      phone: '+237123456789',
      status: 'active',
    }))
    testSchoolId = school.id

    // Create test track
    const track = R.unwrap(await createTrack({
      name: 'Test Track',
      code: `TRK-${Date.now()}`,
      educationLevelId: 2,
    }))
    testTrackId = track.id

    const yearTemplate = R.unwrap(await createSchoolYearTemplate({
      name: `Test Year Template ${Date.now()}`,
      isActive: true,
    }))

    const yearResult = await createSchoolYear({
      schoolId: testSchoolId,
      schoolYearTemplateId: yearTemplate.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    })

    if (R.isFailure(yearResult)) {
      throw new Error(`Failed to create school year for test: ${yearResult.error.message}`)
    }

    const year = R.unwrap(yearResult)
    testSchoolYearId = year.id

    // Create test grade
    const grade = R.unwrap(await createGrade({
      name: `Test Grade ${Date.now()}`,
      code: `TG-${Date.now()}`,
      order: 1,
      trackId: testTrackId,
    }))
    testGradeId = grade.id

    // Create test series
    const serie = R.unwrap(await createSerie({
      name: `Test Series ${Date.now()}`,
      code: `TS-${Date.now()}`,
      trackId: testTrackId,
    }))
    testSeriesId = serie.id

    // Create test classroom
    const classroom = R.unwrap(await createClassroom({
      id: nanoid(),
      schoolId: testSchoolId,
      name: 'Test Classroom',
      code: `TC-${Date.now()}`,
      type: 'regular',
      capacity: 40,
      status: 'active',
    }))
    if (!classroom) {
      throw new Error('Failed to create classroom for test')
    }
    testClassroomId = classroom.id
  })

  // Helper to create class and unwrap
  const createTestClass = async (data: any) => {
    const testClass = R.unwrap(await createClass(testSchoolId, data))
    if (!testClass)
      throw new Error('Failed to create class')
    return testClass
  }

  describe('getClasses', () => {
    test('should return classes for a school', async () => {
      // Create test class
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'A',
        status: 'active',
      })
      testClassIds.push(testClass.id)

      const classes = R.unwrap(await getClasses({ schoolId: testSchoolId }))

      expect(classes).toBeDefined()
      expect(Array.isArray(classes)).toBe(true)
    })

    test('should filter by school year', async () => {
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'B',
        status: 'active',
      })
      testClassIds.push(testClass.id)

      const classes = R.unwrap(await getClasses({
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
      }))

      expect(classes.every((c: any) => c.class.schoolYearId === testSchoolYearId)).toBe(true)
    })

    test('should filter by grade', async () => {
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'C',
        status: 'active',
      })
      testClassIds.push(testClass.id)

      const classes = R.unwrap(await getClasses({
        schoolId: testSchoolId,
        gradeId: testGradeId,
      }))

      expect(classes.every((c: any) => c.class.gradeId === testGradeId)).toBe(true)
    })

    test('should filter by series', async () => {
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
        section: 'D',
        status: 'active',
      })
      testClassIds.push(testClass.id)

      const classes = R.unwrap(await getClasses({
        schoolId: testSchoolId,
        seriesId: testSeriesId,
      }))

      expect(classes.every((c: any) => c.class.seriesId === testSeriesId)).toBe(true)
    })

    test('should include student and subject counts', async () => {
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'E',
        status: 'active',
      })
      testClassIds.push(testClass.id)

      const classesResult = R.unwrap(await getClasses({ schoolId: testSchoolId }))

      if (classesResult.length > 0) {
        expect(classesResult[0]).toHaveProperty('studentsCount')
        expect(classesResult[0]).toHaveProperty('subjectsCount')
        expect(Number(classesResult[0]?.studentsCount)).toBeTypeOf('number')
        expect(Number(classesResult[0]?.subjectsCount)).toBeTypeOf('number')
      }
    })
  })

  describe('getClassById', () => {
    test('should return class with details', async () => {
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'F',
        status: 'active',
      })
      testClassIds.push(testClass.id)

      const classData = R.unwrap(await getClassById(testSchoolId, testClass.id))

      expect(classData).toBeDefined()
      expect(classData?.class.id).toBe(testClass.id)
      expect(classData?.class.section).toBe('F')
    })

    test('should return error for non-existent class', async () => {
      const result = await getClassById(testSchoolId, '00000000-0000-0000-0000-000000000000')
      expect(R.isFailure(result)).toBe(true)
    })

    test('should include gender counts', async () => {
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'G',
        status: 'active',
      })
      testClassIds.push(testClass.id)

      const classData = R.unwrap(await getClassById(testSchoolId, testClass.id))

      expect(classData).toHaveProperty('boysCount')
      expect(classData).toHaveProperty('girlsCount')
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

      const newClass = R.unwrap(await createClass(testSchoolId, classData))

      expect(newClass).toBeDefined()
      expect(newClass!.id).toBe(classData.id)
      expect(newClass!.section).toBe(classData.section)
      testClassIds.push(newClass!.id)
    })

    test('should reject duplicate grade/series/section combination', async () => {
      const section = `DUP-${Date.now()}`

      const class1 = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section,
        status: 'active',
      })
      testClassIds.push(class1.id)

      const result = await createClass(testSchoolId, {
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section,
        status: 'active',
      })

      expect(R.isFailure(result)).toBe(true)
    })

    test('should validate classroom availability', async () => {
      // Create first class with classroom
      const class1 = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        classroomId: testClassroomId,
        section: `CR1-${Date.now()}`,
        status: 'active',
      })
      testClassIds.push(class1.id)

      // Try to create second class with same classroom
      const result = await createClass(testSchoolId, {
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        classroomId: testClassroomId,
        section: `CR2-${Date.now()}`,
        status: 'active',
      })

      expect(R.isFailure(result)).toBe(true)
    })

    test('should allow class without classroom', async () => {
      const newClass = R.unwrap(await createClass(testSchoolId, {
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: `NC-${Date.now()}`,
        status: 'active',
      }))

      expect(newClass).toBeDefined()
      expect(newClass!.classroomId).toBeNull()
      testClassIds.push(newClass!.id)
    })
  })

  describe('updateClass', () => {
    test('should update class fields', async () => {
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'I',
        status: 'active',
      })
      testClassIds.push(testClass.id)

      const updated = R.unwrap(await updateClass(testSchoolId, testClass.id, {
        section: 'I-Updated',
        status: 'archived',
      }))

      expect(updated.section).toBe('I-Updated')
      expect(updated.status).toBe('archived')
    })

    test('should update classroom assignment', async () => {
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: 'J',
        status: 'active',
      })
      testClassIds.push(testClass.id)

      const updated = R.unwrap(await updateClass(testSchoolId, testClass.id, {
        classroomId: testClassroomId,
      }))

      expect(updated.classroomId).toBe(testClassroomId)
    })
  })

  describe('deleteClass', () => {
    test('should delete class without enrollments', async () => {
      const testClass = await createTestClass({
        id: nanoid(),
        schoolId: testSchoolId,
        schoolYearId: testSchoolYearId,
        gradeId: testGradeId,
        section: `DEL-${Date.now()}`,
        status: 'active',
      })

      await deleteClass(testSchoolId, testClass.id)

      const result = await getClassById(testSchoolId, testClass.id)
      expect(R.isFailure(result)).toBe(true)
    })
  })
})
