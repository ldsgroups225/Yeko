import { Result as R } from '@praha/byethrow'
import { nanoid } from 'nanoid'
import { beforeEach, describe, expect, test } from 'vitest'
import {
  checkClassroomAvailability,
  createClassroom,
  deleteClassroom,
  getClassroomById,
  getClassrooms,
  updateClassroom,
} from '../queries/classrooms'
import { createSchool, deleteSchool } from '../queries/schools'

describe('classrooms queries', () => {
  let testSchoolId: string
  let testClassroomIds: string[] = []

  beforeEach(async () => {
    // Clean up existing test classrooms
    for (const id of testClassroomIds) {
      try {
        await deleteClassroom(id)
      }
      catch {
        // Ignore errors during cleanup
      }
    }
    testClassroomIds = []

    // Create test school if not exists
    const school = R.unwrap(await createSchool({
      name: 'TEST__ School for Classrooms',
      code: `TSC-${Date.now()}`,
      email: 'TEST__classrooms@test.com',
      phone: '+237123456789',
      status: 'active',
    }))
    testSchoolId = school.id

    // Create test classrooms
    const classroom1 = R.unwrap(await createClassroom({
      id: nanoid(),
      schoolId: testSchoolId,
      name: 'TEST__ Room 101',
      code: 'R101',
      type: 'regular',
      capacity: 30,
      floor: 'Ground',
      building: 'Main',
      status: 'active',
      equipment: {
        projector: true,
        whiteboard: true,
        ac: true,
      },
    }))
    if (!classroom1)
      throw new Error('Failed to create classroom1')
    testClassroomIds.push(classroom1.id)

    const classroom2 = R.unwrap(await createClassroom({
      id: nanoid(),
      schoolId: testSchoolId,
      name: 'Science Lab',
      code: 'LAB01',
      type: 'lab',
      capacity: 25,
      floor: '1st',
      building: 'Science Block',
      status: 'active',
      equipment: {
        projector: true,
        computers: 20,
        smartboard: true,
      },
    }))
    if (!classroom2)
      throw new Error('Failed to create classroom2')
    testClassroomIds.push(classroom2.id)

    const classroom3 = R.unwrap(await createClassroom({
      id: nanoid(),
      schoolId: testSchoolId,
      name: 'Gymnasium',
      code: 'GYM01',
      type: 'gym',
      capacity: 100,
      floor: 'Ground',
      building: 'Sports Complex',
      status: 'maintenance',
    }))
    if (!classroom3)
      throw new Error('Failed to create classroom3')
    testClassroomIds.push(classroom3.id)
  })

  describe('getClassrooms', () => {
    test('should return classrooms for a school', async () => {
      const result = R.unwrap(await getClassrooms({ schoolId: testSchoolId }))

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThanOrEqual(3)
      expect(result.every((c: any) => c.schoolId === testSchoolId)).toBe(true)
    })

    test('should filter by type', async () => {
      const result = R.unwrap(await getClassrooms({ schoolId: testSchoolId, type: 'lab' }))

      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result.every((c: any) => c.type === 'lab')).toBe(true)
    })

    test('should filter by status', async () => {
      const activeResult = R.unwrap(await getClassrooms({ schoolId: testSchoolId, status: 'active' }))
      const maintenanceResult = R.unwrap(await getClassrooms({ schoolId: testSchoolId, status: 'maintenance' }))

      expect(activeResult.length).toBeGreaterThanOrEqual(2)
      expect(maintenanceResult.length).toBeGreaterThanOrEqual(1)
      expect(activeResult.every((c: any) => c.status === 'active')).toBe(true)
      expect(maintenanceResult.every((c: any) => c.status === 'maintenance')).toBe(true)
    })

    test('should search by name or code', async () => {
      const nameResult = R.unwrap(await getClassrooms({ schoolId: testSchoolId, search: 'Science' }))
      const codeResult = R.unwrap(await getClassrooms({ schoolId: testSchoolId, search: 'R101' }))

      expect(nameResult.length).toBeGreaterThanOrEqual(1)
      expect(nameResult[0]?.name).toContain('Science')

      expect(codeResult.length).toBeGreaterThanOrEqual(1)
      expect(codeResult[0]?.code).toBe('R101')
    })

    test('should include assigned classes count', async () => {
      const result = R.unwrap(await getClassrooms({ schoolId: testSchoolId }))

      expect(result[0]).toHaveProperty('assignedClassesCount')
      expect(typeof result[0]?.assignedClassesCount).toBe('number')
    })
  })

  describe('getClassroomById', () => {
    test('should return classroom with details', async () => {
      const classroomId = testClassroomIds[0]!
      const result = R.unwrap(await getClassroomById(classroomId))

      expect(result).toBeDefined()
      expect(result?.classroom.id).toBe(classroomId)
      expect(result?.classroom.name).toBe('TEST__ Room 101')
      expect(result?.classroom.equipment).toHaveProperty('projector')
    })

    test('should return undefined for non-existent classroom', async () => {
      const result = R.unwrap(await getClassroomById('00000000-0000-0000-0000-000000000000'))

      expect(result).toBeNull()
    })
  })

  describe('createClassroom', () => {
    test('should create a classroom with valid data', async () => {
      const classroomData = {
        id: nanoid(),
        schoolId: testSchoolId,
        name: 'New Classroom',
        code: `NC-${Date.now()}`,
        type: 'regular' as const,
        capacity: 35,
        floor: '2nd',
        building: 'Main',
        status: 'active' as const,
      }

      const classroom = R.unwrap(await createClassroom(classroomData))
      if (!classroom)
        throw new Error('Failed to create classroom')
      expect(classroom).toBeDefined()
      expect(classroom.id).toBe(classroomData.id)
      expect(classroom.name).toBe(classroomData.name)
      expect(classroom.code).toBe(classroomData.code)
      expect(classroom.capacity).toBe(classroomData.capacity)
      testClassroomIds.push(classroom.id)
    })

    test('should reject duplicate codes within same school', async () => {
      const duplicateCode = `DUP-${Date.now()}`

      await createClassroom({
        id: nanoid(),
        schoolId: testSchoolId,
        name: 'First Classroom',
        code: duplicateCode,
        type: 'regular',
        capacity: 30,
        status: 'active',
      })

      expect(R.unwrap(await createClassroom({
        id: nanoid(),
        schoolId: testSchoolId,
        name: 'Second Classroom',
        code: duplicateCode,
        type: 'regular',
        capacity: 30,
        status: 'active',
      }))).toBe(true)
    })

    test('should allow same code in different schools', async () => {
      const sharedCode = `SHARED-${Date.now()}`

      // Create another school
      const school2 = R.unwrap(await createSchool({
        name: 'Second Test School',
        code: `STS-${Date.now()}`,
        status: 'active',
      }))

      const classroom1 = R.unwrap(await createClassroom({
        id: nanoid(),
        schoolId: testSchoolId,
        name: 'Classroom in School 1',
        code: sharedCode,
        type: 'regular',
        capacity: 30,
        status: 'active',
      }))
      if (!classroom1)
        throw new Error('Failed to create classroom1')
      testClassroomIds.push(classroom1.id)

      const classroom2 = R.unwrap(await createClassroom({
        id: nanoid(),
        schoolId: school2.id,
        name: 'Classroom in School 2',
        code: sharedCode,
        type: 'regular',
        capacity: 30,
        status: 'active',
      }))
      if (!classroom2)
        throw new Error('Failed to create classroom2')
      expect(classroom1.code).toBe(sharedCode)
      expect(classroom2.code).toBe(sharedCode)
      expect(classroom1.schoolId).not.toBe(classroom2.schoolId)

      // Cleanup
      await deleteClassroom(classroom2.id)
      await deleteSchool(school2.id)
    })
  })

  describe('updateClassroom', () => {
    test('should update classroom fields', async () => {
      const classroomId = testClassroomIds[0]!

      const updated = R.unwrap(await updateClassroom(classroomId, {
        name: 'Updated Room 101',
        capacity: 40,
        status: 'maintenance',
      }))
      if (!updated)
        throw new Error('Failed to update classroom')
      expect(updated.name).toBe('Updated Room 101')
      expect(updated.capacity).toBe(40)
      expect(updated.status).toBe('maintenance')
    })

    test('should update equipment', async () => {
      const classroomId = testClassroomIds[0]!

      const updated = R.unwrap(await updateClassroom(classroomId, {
        equipment: {
          projector: true,
          computers: 10,
          smartboard: true,
          ac: false,
        },
      }))
      if (!updated)
        throw new Error('Failed to update classroom')
      expect(updated.equipment).toHaveProperty('computers', 10)
      expect(updated.equipment).toHaveProperty('smartboard', true)
    })
  })

  describe('deleteClassroom', () => {
    test('should delete unassigned classroom', async () => {
      const classroom = R.unwrap(await createClassroom({
        id: nanoid(),
        schoolId: testSchoolId,
        name: 'Classroom to Delete',
        code: `DEL-${Date.now()}`,
        type: 'regular',
        capacity: 30,
        status: 'active',
      }))
      if (!classroom)
        throw new Error('Failed to create classroom')
      await deleteClassroom(classroom.id)

      const result = R.unwrap(await getClassroomById(classroom.id))
      expect(result).toBeNull()
    })

    // Note: Test for rejecting deletion of assigned classroom requires
    // creating a class first, which depends on other tables
  })

  describe('checkClassroomAvailability', () => {
    test('should return available for unassigned classroom', async () => {
      const classroomId = testClassroomIds[0]!
      const schoolYearId = 'test-school-year-id'

      const result = await checkClassroomAvailability(classroomId, schoolYearId)

      expect(R.isSuccess(result)).toBe(true)
      if (R.isSuccess(result)) {
        expect(R.unwrap(result).available).toBe(true)
        expect(R.unwrap(result).assignedTo).toBeUndefined()
      }
    })

    // Note: Test for unavailable classroom requires creating a class
    // which depends on school years and grades tables
  })
})
