import './setup'
import { nanoid } from 'nanoid'
import { beforeEach, describe, expect, test } from 'vitest'

import {
  autoMatchParents,
  createParent,
  deleteParent,
  findParentByPhone,
  getParentById,
  getParents,
  linkParentToStudent,
  updateParent,
} from '../queries/parents'
import { createSchoolYearTemplate } from '../queries/programs'
import { createSchoolYear } from '../queries/school-admin/school-years'
import { createSchool } from '../queries/schools'
import { createStudent } from '../queries/students'

describe('parents queries', () => {
  let testSchoolId: string
  let testStudentId: string
  const testParentIds: string[] = []

  beforeEach(async () => {
    // Create test school
    const school = await createSchool({
      name: 'Test School for Parents',
      code: `TSP-${Date.now()}`,
      email: `parents-test-${Date.now()}@test.com`,
      phone: '+2250101010101',
      status: 'active',
    })
    testSchoolId = school.id

    // Create school year
    const yearTemplate = await createSchoolYearTemplate({
      name: `Test Year Template ${Date.now()}`,
      isActive: true,
    })

    const year = await createSchoolYear({
      schoolId: testSchoolId,
      schoolYearTemplateId: yearTemplate.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    })


    // Create test student
    const studentResult = await createStudent({
      schoolId: testSchoolId,
      firstName: 'Test',
      lastName: 'Student',
      dob: '2010-01-01',
      gender: 'M',
      matricule: `ST-${Date.now()}`,
      emergencyPhone: '0700000001', // For auto-match
    })
    
    if (studentResult.isErr()) throw studentResult.error
    testStudentId = studentResult.value.id
  })

  const createTestParent = async (data: any = {}) => {
    const parentData = {
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: `07${Date.now().toString().slice(-8)}`,
      email: `parent-${Date.now()}@test.com`,
      ...data,
    }
    const result = await createParent(parentData)
    if (result.isErr()) throw result.error
    const parent = result.value
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

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('CONFLICT')
      }
    })
  })

  describe('getParents', () => {
    test('should return parents for a school', async () => {
      await createTestParent()
      // Note: getParents is school-scoped via students link usually, 
      // but current implementation filters by schoolId on studentParents join.
      // So unconnected parents might NOT show up unless we link them or they are global users?
      // Let's check getParents implementation.
      // It joins studentParents and students filtering by schoolId. 
      // So we MUST link parent to a student in this school to see them.
      
      const parent = await createTestParent()
      await linkParentToStudent({
        studentId: testStudentId,
        parentId: parent.id,
        relationship: 'father',
      })

      const result = await getParents(testSchoolId, {})
      if (result.isErr()) throw result.error
      const parents = result.value.data

      expect(parents.length).toBeGreaterThan(0)
      expect(parents[0].parent.firstName).toBeDefined()
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

      const result = await getParentById(parent.id)
      if (result.isErr()) throw result.error
      const data = result.value

      expect(data).toBeDefined()
      expect(data.parent.id).toBe(parent.id)
      expect(data.children).toHaveLength(1)
      expect(data.children[0].student.id).toBe(testStudentId)
    })
  })

  describe('updateParent', () => {
    test('should update parent details', async () => {
      const parent = await createTestParent()
      const newEmail = `updated-${Date.now()}@test.com`

      const result = await updateParent(parent.id, { email: newEmail })
      if (result.isErr()) throw result.error
      const updated = result.value

      expect(updated.email).toBe(newEmail)
    })
  })

  describe('autoMatchParents', () => {
    test('should suggest match based on student emergency phone', async () => {
      // Student has emergencyPhone '0700000001' locally created in beforeEach
      // Create parent with same phone
      const phone = '0700000001'
      
      // Ensure no parent with this phone exists first (cleanup issues?)
      // We rely on unique/random data usually, but here fixed number.
      // Let's create parent with THIS phone.
      const parentResult = await createParent({
        firstName: 'Emergency',
        lastName: 'Contact',
        phone,
      })
      
      // If it fails (conflict), we try to verify if it's found.
      let parentId
      if (parentResult.isErr()) {
         const existing = await findParentByPhone(phone)
         if (existing.isErr() || !existing.value) throw new Error('Parent conflict state unclear')
         parentId = existing.value.id
      } else {
         parentId = parentResult.value.id
         testParentIds.push(parentId)
      }

      // Run auto-match
      const matchResult = await autoMatchParents(testSchoolId)
      if (matchResult.isErr()) throw matchResult.error
      const suggestions = matchResult.value.suggestions

      expect(suggestions).toBeDefined()
      const match = suggestions.find((s: any) => s.studentId === testStudentId)
      expect(match).toBeDefined()
      expect(match?.existingParent?.id).toBe(parentId)
    })
  })
})
