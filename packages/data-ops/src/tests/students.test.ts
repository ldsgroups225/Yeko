import { beforeEach, describe, expect, test } from 'vitest'
import { createSchoolYearTemplate } from '../queries/programs'
import { createSchoolYear } from '../queries/school-admin/school-years'
import { createSchool } from '../queries/schools'
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
  updateStudentStatus,
} from '../queries/students'
import './setup'

describe('students Queries', () => {
  let testSchoolId: string
  let testSchoolYearId: string
  const testIds: string[] = []

  beforeEach(async () => {
    // Setup School
    const school = (await createSchool({
      name: `TEST__ School for Students ${Date.now()}`,
      code: `TSS-${Date.now()}`,
      email: `TEST__students-test-${Date.now()}@test.com`,
      phone: `+225${Date.now().toString().slice(-8)}`,
      status: 'active',
    }))._unsafeUnwrap()
    testSchoolId = school.id
    testIds.push(school.id)

    // Setup School Year
    const yearTemplate = (await createSchoolYearTemplate({
      name: `TEST__ Year Template ${Date.now()}`,
      isActive: true,
    }))._unsafeUnwrap()

    const schoolYear = (await createSchoolYear({
      schoolId: testSchoolId,
      schoolYearTemplateId: yearTemplate.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    }))._unsafeUnwrap()
    testSchoolYearId = schoolYear.id
  })

  test('should create student with valid data', async () => {
    const matricule = `ST-${Date.now()}`
    const student = (await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ Jean',
      lastName: 'TEST__ Dupont',
      dob: '2015-01-01',
      gender: 'M',
      matricule,
      admissionDate: '2023-09-01',
      address: 'Abidjan Cocody',
      nationality: 'Ivorian',
    }))._unsafeUnwrap()

    expect(student).toBeDefined()
    expect(student.id).toBeDefined()
    expect(student.schoolId).toBe(testSchoolId)
    expect(student.firstName).toBe('TEST__ Jean')
    expect(student.matricule).toBe(matricule)
    expect(student.status).toBe('active')
  })

  test('should fail with duplicate matricule', async () => {
    const matricule = `ST-DUP-${Date.now()}`

    // Create first student
    await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ Student 1',
      lastName: 'TEST__ One',
      dob: '2015-01-01',
      matricule,
    })

    // Try to create second student with same matricule
    const result = await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ Student 2',
      lastName: 'TEST__ Two',
      dob: '2015-01-01',
      matricule,
    })

    if (result.isErr()) {
      expect(result.error.type).toBe('CONFLICT')
    }
    else {
      expect.fail('Should have returned an error')
    }
  })

  test('should auto-generate matricule if not provided', async () => {
    const student = (await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ Auto',
      lastName: 'TEST__ Matricule',
      dob: '2015-01-01',
    }))._unsafeUnwrap()

    expect(student.matricule).toBeDefined()
    expect(student.matricule.length).toBeGreaterThan(0)
  })

  test('should get students with filters', async () => {
    // Create a few students
    await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ Alice',
      lastName: 'TEST__ A',
      dob: '2015-01-01',
      gender: 'F',
    })

    await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ Bob',
      lastName: 'TEST__ B',
      dob: '2015-01-01',
      gender: 'M',
    })

    // Filter by gender F
    const resultF = (await getStudents({
      schoolId: testSchoolId,
      gender: 'F',
    }))._unsafeUnwrap()

    expect(resultF.data).toHaveLength(1)
    expect(resultF.data[0]?.student.firstName).toBe('TEST__ Alice')

    // Filter by search
    const resultSearch = (await getStudents({
      schoolId: testSchoolId,
      search: 'Bob',
    }))._unsafeUnwrap()

    expect(resultSearch.data).toHaveLength(1)
    expect(resultSearch.data[0]?.student.firstName).toBe('TEST__ Bob')
  })

  test('should get student by ID with details', async () => {
    const created = (await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ Detailed',
      lastName: 'TEST__ Student',
      dob: '2015-01-01',
    }))._unsafeUnwrap()

    const found = (await getStudentById(created.id))._unsafeUnwrap()

    expect(found).toBeDefined()
    expect(found.id).toBe(created.id)
    expect(found.parents).toBeDefined() // Helper ensures empty list is returned
    expect(found.enrollmentHistory).toBeDefined()
  })

  test('should update student details', async () => {
    const created = (await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ ToUpdate',
      lastName: 'TEST__ Student',
      dob: '2015-01-01',
    }))._unsafeUnwrap()

    const updated = (await updateStudent(created.id, {
      firstName: 'TEST__ Updated',
      address: 'New Address',
    }))._unsafeUnwrap()

    expect(updated.firstName).toBe('TEST__ Updated')
    expect(updated.address).toBe('New Address')
    expect(updated.lastName).toBe('TEST__ Student') // Should remain unchanged
  })

  test('should update student status', async () => {
    const created = (await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ Status',
      lastName: 'TEST__ Changer',
      dob: '2015-01-01',
    }))._unsafeUnwrap()

    const updated = (await updateStudentStatus(created.id, 'withdrawn', 'Moving away'))._unsafeUnwrap()

    expect(updated.status).toBe('withdrawn')
    expect(updated.withdrawalReason).toBe('Moving away')
    expect(updated.withdrawalDate).toBeDefined()
  })

  test('should delete student', async () => {
    const created = (await createStudent({
      schoolId: testSchoolId,
      schoolYearId: testSchoolYearId,
      firstName: 'TEST__ ToDelete',
      lastName: 'TEST__ Student',
      dob: '2015-01-01',
    }))._unsafeUnwrap()

    await deleteStudent(created.id)

    const result = await getStudentById(created.id)
    if (result.isErr()) {
      expect(result.error.type).toBe('NOT_FOUND')
    }
    else {
      expect.fail('Should have returned an error')
    }
  })
})
