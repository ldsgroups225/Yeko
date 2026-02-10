import type { CreateParentInput } from '../queries/parents'
import { Result as R } from '@praha/byethrow'
import { beforeEach, describe, expect, test } from 'vitest'
import {
  autoMatchParents,
  createParent,
  getParentById,
  getParents,
  linkParentToStudent,
  updateParent,
} from '../queries/parents'

import { createSchoolYearTemplate } from '../queries/programs'
import { createSchoolYear } from '../queries/school-admin/school-years'
import { createSchool } from '../queries/schools'
import { createStudent } from '../queries/students'
import './setup'

describe('parents queries', () => {
  let testSchoolId: string
  let testStudentId: string
  const testParentIds: string[] = []

  beforeEach(async () => {
    // Create test school
    const school = R.unwrap(await createSchool({
      name: 'TEST__ School for Parents',
      code: `TSP-${Date.now()}`,
      email: `TEST__parents-test-${Date.now()}@test.com`,
      phone: `+225${Date.now().toString().slice(-8)}`,
      status: 'active',
    }))
    testSchoolId = school.id

    // Create school year
    const yearTemplate = R.unwrap(await createSchoolYearTemplate({
      name: `Test Year Template ${Date.now()}`,
      isActive: true,
    }))

    await createSchoolYear({
      schoolId: testSchoolId,
      schoolYearTemplateId: yearTemplate.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    })

    // Create test student
    const student = R.unwrap(await createStudent({
      schoolId: testSchoolId,
      firstName: 'TEST__Student',
      lastName: 'TEST__Student',
      dob: '2010-01-01',
      gender: 'M',
      matricule: `ST-${Date.now()}`,
      emergencyPhone: `07${Date.now().toString().slice(-8)}`, // For auto-match
    }))

    testStudentId = student.id
  })

  const createTestParent = async (data: Partial<CreateParentInput> = {}) => {
    const parentData: CreateParentInput = {
      firstName: 'TEST__Parent',
      lastName: 'TEST__Parent',
      phone: `07${Date.now().toString().slice(-8)}`,
      email: `TEST__parent-${Date.now()}@test.com`,
      ...data,
    }
    const parent = R.unwrap(await createParent(parentData))

    testParentIds.push(parent.id)
    return parent
  }

  describe('createParent', () => {
    test('should create a parent with valid data', async () => {
      const parent = await createTestParent()
      expect(parent).toBeDefined()
      expect(parent.id).toBeDefined()
      expect(parent.invitationStatus).toBe('pending')
    })

    test('should fail with duplicate phone', async () => {
      const phone = `07${Date.now()}`.slice(0, 10)
      await createTestParent({ phone })

      const result = await createParent({
        firstName: 'Other',
        lastName: 'Parent',
        phone,
      })

      expect(R.isFailure(result)).toBe(true)
    })
  })

  describe('getParents', () => {
    test('should return parents for a school', async () => {
      const parent = await createTestParent()
      await linkParentToStudent({
        studentId: testStudentId,
        parentId: parent.id,
        relationship: 'father',
      })

      const parentsResult = R.unwrap(await getParents(testSchoolId, {}))
      const parentsData = parentsResult.data

      expect(parentsData.length).toBeGreaterThan(0)
      expect(parentsData[0]?.firstName).toBeDefined()
    })
  })

  describe('getParentById', () => {
    test('should return parent with children', async () => {
      const parent = await createTestParent()
      await linkParentToStudent({
        studentId: testStudentId,
        parentId: parent.id,
        relationship: 'mother',
      })

      const data = R.unwrap(await getParentById(parent.id))
      expect(data).toBeDefined()
      expect(data.id).toBe(parent.id)
      expect(data.children).toHaveLength(1)
      expect(data.children[0]?.student.id).toBe(testStudentId)
    })
  })

  describe('updateParent', () => {
    test('should update parent details', async () => {
      const parent = await createTestParent()
      const newEmail = `updated-${Date.now()}@test.com`

      const updated = R.unwrap(await updateParent(parent.id, { email: newEmail }))
      expect(updated.email).toBe(newEmail)
    })
  })

  describe('autoMatchParents', () => {
    test('should suggest match based on student emergency phone', async () => {
      // Need to get the student's emergency phone
      const student = R.unwrap(await (await import('../queries/students')).getStudentById(testStudentId))
      const phone = student?.emergencyPhone || '0700000001'

      const parent = R.unwrap(await createParent({
        firstName: 'TEST__Emergency',
        lastName: 'TEST__Contact',
        phone,
        email: `TEST__emergency-${Date.now()}@test.com`,
      }))

      const parentId = parent.id
      testParentIds.push(parentId)

      // Run auto-match
      const matchData = R.unwrap(await autoMatchParents(testSchoolId))
      const suggestions = matchData.suggestions

      expect(suggestions).toBeDefined()
      const match = suggestions.find(s => s.studentId === testStudentId)
      expect(match).toBeDefined()
      expect(match?.existingParent?.id).toBe(parentId)
    })
  })
})
