import type { SchoolStatus, SubjectCategory } from '../drizzle/core-schema'
import { beforeEach, describe, expect, test } from 'vitest'
import {
  bulkCreateSeries,
  bulkCreateSubjects,
  bulkUpdateGradesOrder,
  createGrade,
  createSerie,
  createSubject,
  createTrack,
  deleteGrade,
  deleteSerie,
  deleteSubject,
  deleteTrack,
  getCatalogStats,
  getEducationLevels,
  getGradeById,
  getGrades,
  getSerieById,
  getSeries,
  getSubjectById,
  getSubjects,
  getTracks,
  updateGrade,
  updateSerie,
  updateSubject,
} from '../queries/catalogs'
import {
  bulkCreateChapters,
  bulkUpdateChaptersOrder,
  cloneProgramTemplate,
  createProgramTemplate,
  createProgramTemplateChapter,
  createSchoolYearTemplate,
  deleteProgramTemplate,
  deleteProgramTemplateChapter,
  deleteSchoolYearTemplate,
  getProgramStats,
  getProgramTemplateById,
  getProgramTemplateChapterById,
  getProgramTemplateChapters,
  getProgramTemplates,
  getProgramVersions,
  getSchoolYearTemplateById,
  getSchoolYearTemplates,
  publishProgram,
  restoreProgramVersion,
  updateProgramTemplate,
  updateProgramTemplateChapter,
  updateSchoolYearTemplate,
} from '../queries/programs'
import {
  createSchool,
  deleteSchool,
  getSchoolById,
  getSchools,
  getSchoolsByStatus,
  searchSchools,
  updateSchool,
} from '../queries/schools'

describe('query Functions Tests - Schools', () => {
  let testSchoolIds: string[] = []

  beforeEach(async () => {
    // Clean up any existing test schools
    for (const id of testSchoolIds) {
      try {
        await deleteSchool(id)
      }
      catch {
        // Ignore errors during cleanup
      }
    }
    testSchoolIds = []

    // Create test data
    const school1 = (await createSchool({
      name: 'Test Primary School',
      code: `TPS-${Date.now()}`,
      email: 'primary@test.com',
      phone: '+237123456789',
      address: '123 Test Street',
      status: 'active',
      logoUrl: 'https://example.com/logo.png',
      settings: {
        maxStudents: 500,
        academicYear: '2024-2025',
      },
    }))._unsafeUnwrap()
    testSchoolIds.push(school1.id)

    const school2 = (await createSchool({
      name: 'Test Secondary School',
      code: `TSS-${Date.now()}`,
      email: 'secondary@test.com',
      phone: '+237987654321',
      address: '456 Test Avenue',
      status: 'inactive',
      settings: {
        maxStudents: 1000,
        academicYear: '2024-2025',
      },
    }))._unsafeUnwrap()
    testSchoolIds.push(school2.id)

    const school3 = (await createSchool({
      name: 'Test High School',
      code: `THS-${Date.now()}`,
      email: 'high@test.com',
      phone: '+237555555555',
      address: '789 Test Boulevard',
      status: 'suspended',
    }))._unsafeUnwrap()
    testSchoolIds.push(school3.id)
  })

  describe('create Operations', () => {
    test('should create school with all fields', async () => {
      const schoolData = {
        name: 'Complete Test School',
        code: `CTS-${Date.now()}`,
        email: 'complete@test.com',
        phone: '+237111111111',
        address: '100 Complete Street',
        status: 'active' as SchoolStatus,
        logoUrl: 'https://example.com/logo.png',
        settings: {
          maxStudents: 750,
          academicYear: '2024-2025',
          timezone: 'Africa/Douala',
        },
      }

      const school = (await createSchool(schoolData))._unsafeUnwrap()

      expect(school).toBeDefined()
      expect(school.id).toBeDefined()
      expect(school.name).toBe(schoolData.name)
      expect(school.code).toBe(schoolData.code)
      expect(school.email).toBe(schoolData.email)
      expect(school.phone).toBe(schoolData.phone)
      expect(school.address).toBe(schoolData.address)
      expect(school.status).toBe(schoolData.status)
      expect(school.logoUrl).toBe(schoolData.logoUrl)
      expect(school.settings).toStrictEqual(schoolData.settings)
      expect(school.createdAt).toBeInstanceOf(Date)
      expect(school.updatedAt).toBeInstanceOf(Date)
      testSchoolIds.push(school.id)
    })

    test('should create school with minimal fields', async () => {
      const schoolData = {
        name: 'Minimal School',
        code: `MS-${Date.now()}`,
      }

      const school = (await createSchool(schoolData))._unsafeUnwrap()

      expect(school).toBeDefined()
      expect(school.id).toBeDefined()
      expect(school.name).toBe(schoolData.name)
      expect(school.code).toBe(schoolData.code)
      expect(school.email).toBeNull()
      expect(school.phone).toBeNull()
      expect(school.address).toBeNull()
      expect(school.status).toBe('active') // default value
      expect(school.logoUrl).toBeNull()
      expect(school.settings).toBeNull()
      testSchoolIds.push(school.id)
    })

    test('should reject duplicate school code', async () => {
      const duplicateCode = `DUP-${Date.now()}`

      await createSchool({
        name: 'First School',
        code: duplicateCode,
      })

      expect((await createSchool({
        name: 'Second School',
        code: duplicateCode,
      })).isErr()).toBe(true)
    })
  })

  describe('read Operations', () => {
    test('should get all schools with pagination', async () => {
      const result = (await getSchools({ page: 1, limit: 10 }))._unsafeUnwrap()

      expect(result.schools).toBeDefined()
      expect(result.schools.length).toBeGreaterThan(0)
      expect(result.pagination).toBeDefined()
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.total).toBeGreaterThanOrEqual(3)
      expect(result.pagination.totalPages).toBeGreaterThanOrEqual(1)
    })

    test('should get schools with search filter by name', async () => {
      const result = (await getSchools({ search: 'Test Primary School' }))._unsafeUnwrap()

      expect(result.schools.length).toBeGreaterThanOrEqual(1)
      expect(result.schools.some((school: any) => school.name.includes('Test Primary School'))).toBe(true)
    })

    test('should get schools with search filter by code', async () => {
      // Create a school with known code for searching
      const searchSchool = (await createSchool({
        name: 'Search Test School',
        code: 'SEARCH-123',
        email: 'search@test.com',
        phone: '+237123456789',
        address: '123 Search Street',
        status: 'active',
      }))._unsafeUnwrap()
      testSchoolIds.push(searchSchool.id)

      const result = (await getSchools({ search: 'SEARCH-123' }))._unsafeUnwrap()

      expect(result.schools).toHaveLength(1)
      expect(result.schools[0]?.code).toBe('SEARCH-123')
    })

    test('should get schools with search filter by email', async () => {
      const result = (await getSchools({ search: 'primary@test.com' }))._unsafeUnwrap()

      expect(result.schools.length).toBeGreaterThanOrEqual(1)
      expect(result.schools.some((school: any) => school.email === 'primary@test.com')).toBe(true)
    })

    test('should get schools with status filter (active)', async () => {
      const result = (await getSchools({ status: 'active' }))._unsafeUnwrap()

      expect(result.schools.length).toBeGreaterThanOrEqual(1)
      expect(result.schools.every((school: any) => school.status === 'active')).toBe(true)
    })

    test('should get schools with status filter (inactive)', async () => {
      const result = (await getSchools({ status: 'inactive' }))._unsafeUnwrap()

      expect(result.schools.length).toBeGreaterThanOrEqual(1)
      expect(result.schools.every((school: any) => school.status === 'inactive')).toBe(true)
    })

    test('should get schools with multiple status filters', async () => {
      const result = (await getSchools({ status: ['active', 'inactive'] }))._unsafeUnwrap()

      expect(result.schools.length).toBeGreaterThanOrEqual(2)
      expect(result.schools.every((school: any) =>
        school.status === 'active' || school.status === 'inactive',
      )).toBe(true)
    })

    test('should get schools sorted by name (asc)', async () => {
      const result = (await getSchools({ sortBy: 'name', sortOrder: 'asc' }))._unsafeUnwrap()

      expect(result.schools.length).toBeGreaterThanOrEqual(3)

      // Check if sorted correctly
      for (let i = 1; i < result.schools.length; i++) {
        expect(result.schools[i]!.name >= result.schools[i - 1]!.name).toBe(true)
      }
    })

    test('should get schools sorted by name (desc)', async () => {
      const result = (await getSchools({ sortBy: 'name', sortOrder: 'desc' }))._unsafeUnwrap()

      expect(result.schools.length).toBeGreaterThanOrEqual(3)

      // Check if sorted correctly
      for (let i = 1; i < result.schools.length; i++) {
        expect(result.schools[i]!.name <= result.schools[i - 1]!.name).toBe(true)
      }
    })

    test('should get schools sorted by creation date', async () => {
      const result = (await getSchools({ sortBy: 'createdAt', sortOrder: 'desc' }))._unsafeUnwrap()

      expect(result.schools.length).toBeGreaterThanOrEqual(3)

      // Check if sorted correctly (newest first)
      for (let i = 1; i < result.schools.length; i++) {
        expect(result.schools[i]?.createdAt.getTime()).toBeLessThanOrEqual(
          result.schools[i - 1]!.createdAt.getTime(),
        )
      }
    })

    test('should get single school by ID', async () => {
      const [firstSchool] = testSchoolIds
      const school = (await getSchoolById(firstSchool!))._unsafeUnwrap()

      expect(school).toBeDefined()
      expect(school!.id).toBe(firstSchool)
      expect(school!.name).toBeDefined()
      expect(school!.code).toBeDefined()
    })

    test('should return null for non-existent school', async () => {
      const school = (await getSchoolById('00000000-0000-0000-0000-000000000000'))._unsafeUnwrap()

      expect(school).toBeNull()
    })

    test('should get schools with empty result set', async () => {
      const result = (await getSchools({ search: 'NonExistentSchool' }))._unsafeUnwrap()

      expect(result.schools).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.totalPages).toBe(0)
    })

    test('should handle pagination with various page sizes', async () => {
      // Test page size 1
      const page1 = (await getSchools({ page: 1, limit: 1 }))._unsafeUnwrap()
      expect(page1.schools).toHaveLength(1)
      expect(page1.pagination.page).toBe(1)
      expect(page1.pagination.limit).toBe(1)

      // Test page size 2
      const page2 = (await getSchools({ page: 1, limit: 2 }))._unsafeUnwrap()
      expect(page2.schools).toHaveLength(2)
      expect(page2.pagination.limit).toBe(2)

      // Test second page
      const secondPage = (await getSchools({ page: 2, limit: 1 }))._unsafeUnwrap()
      expect(secondPage.schools.length).toBeGreaterThanOrEqual(0)
      expect(secondPage.pagination.page).toBe(2)
    })

    test('should get schools by status helper function', async () => {
      const activeSchools = (await getSchoolsByStatus('active'))._unsafeUnwrap()

      expect(activeSchools.length).toBeGreaterThanOrEqual(1)
      expect(activeSchools.every(school => school.status === 'active')).toBe(true)

      // Should be sorted by creation date (newest first)
      for (let i = 1; i < activeSchools.length; i++) {
        expect(activeSchools[i]?.createdAt.getTime()).toBeLessThanOrEqual(
          activeSchools[i - 1]!.createdAt.getTime(),
        )
      }
    })

    test('should get schools by status with limit', async () => {
      const activeSchools = (await getSchoolsByStatus('active', 1))._unsafeUnwrap()

      expect(activeSchools.length).toBeLessThanOrEqual(1)
    })

    test('should search schools by multiple criteria', async () => {
      // Search by name
      const nameResults = (await searchSchools('Primary'))._unsafeUnwrap()
      expect(nameResults.length).toBeGreaterThanOrEqual(1)
      expect(nameResults[0]?.name).toContain('Primary')

      // Search by email
      const emailResults = (await searchSchools('primary@test.com'))._unsafeUnwrap()
      expect(emailResults.length).toBeGreaterThanOrEqual(1)
      expect(emailResults[0]?.email).toBe('primary@test.com')

      // Search by phone
      const phoneResults = (await searchSchools('+237123456789'))._unsafeUnwrap()
      expect(phoneResults.length).toBeGreaterThanOrEqual(1)
      expect(phoneResults[0]?.phone).toBe('+237123456789')
    })

    test('should limit search results', async () => {
      const results = (await searchSchools('Test', 2))._unsafeUnwrap()

      expect(results.length).toBeLessThanOrEqual(2)
    })
  })

  describe('update Operations', () => {
    test('should update school name', async () => {
      const schoolId = testSchoolIds[0]!
      const originalUpdatedAt = (await getSchoolById(schoolId))._unsafeUnwrap()!.updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      const updatedSchool = (await updateSchool(schoolId, { name: 'Updated School Name' }))._unsafeUnwrap()

      expect(updatedSchool.name).toBe('Updated School Name')
      expect(updatedSchool.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    test('should update school status', async () => {
      const [schoolId] = testSchoolIds

      const updatedSchool = (await updateSchool(schoolId!, { status: 'inactive' }))._unsafeUnwrap()

      expect(updatedSchool.status).toBe('inactive')
    })

    test('should update school settings', async () => {
      const [schoolId] = testSchoolIds
      const newSettings = {
        maxStudents: 800,
        academicYear: '2025-2026',
        timezone: 'Africa/Douala',
      }

      const updatedSchool = (await updateSchool(schoolId!, { settings: newSettings }))._unsafeUnwrap()

      expect(updatedSchool.settings).toStrictEqual(newSettings)
    })

    test('should update school logo', async () => {
      const [schoolId] = testSchoolIds
      const newLogo = 'https://example.com/new-logo.png'

      const updatedSchool = (await updateSchool(schoolId!, { logoUrl: newLogo }))._unsafeUnwrap()

      expect(updatedSchool.logoUrl).toBe(newLogo)
    })

    test('should update multiple fields at once', async () => {
      const [schoolId] = testSchoolIds
      const updateData = {
        name: 'Completely Updated School',
        email: 'updated@test.com',
        phone: '+237999999999',
        status: 'active' as SchoolStatus,
        address: '999 Updated Street',
      }

      const updatedSchool = (await updateSchool(schoolId!, updateData))._unsafeUnwrap()

      expect(updatedSchool.name).toBe(updateData.name)
      expect(updatedSchool.email).toBe(updateData.email)
      expect(updatedSchool.phone).toBe(updateData.phone)
      expect(updatedSchool.status).toBe(updateData.status)
      expect(updatedSchool.address).toBe(updateData.address)
    })

    test('should fail to update non-existent school', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      expect((await updateSchool(nonExistentId, { name: 'Should not work' })).isErr()).toBe(true)
    })

    test('should verify updated_at timestamp changes', async () => {
      const [schoolId] = testSchoolIds
      const originalSchool = (await getSchoolById(schoolId!))._unsafeUnwrap()!

      // Wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      const updatedSchool = (await updateSchool(schoolId!, { address: 'Updated Address' }))._unsafeUnwrap()

      expect(updatedSchool.updatedAt.getTime()).toBeGreaterThan(originalSchool.updatedAt.getTime())
    })
  })

  describe('delete Operations', () => {
    test('should delete existing school', async () => {
      const testSchool = (await createSchool({
        name: 'School to Delete',
        code: `DEL-${Date.now()}`,
      }))._unsafeUnwrap()

      // Verify school exists
      let school = (await getSchoolById(testSchool.id))._unsafeUnwrap()
      expect(school).toBeDefined()

      // Delete school
      await deleteSchool(testSchool.id)

      // Verify school is deleted
      school = (await getSchoolById(testSchool.id))._unsafeUnwrap()
      expect(school).toBeNull()
    })

    test('should not throw when deleting non-existent school', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      // Should not throw error
      await expect(deleteSchool(nonExistentId)).resolves.not.toThrow()
    })

    test('should verify school is removed from database', async () => {
      const testSchool = (await createSchool({
        name: 'Another School to Delete',
        code: `DEL2-${Date.now()}`,
      }))._unsafeUnwrap()

      // Get all schools before deletion
      const beforeResult = (await getSchools({ limit: 100 }))._unsafeUnwrap()
      const beforeCount = beforeResult.pagination.total

      // Delete school
      await (await deleteSchool(testSchool.id))._unsafeUnwrap()

      // Get all schools after deletion
      const afterResult = (await getSchools({ limit: 100 }))._unsafeUnwrap()
      const afterCount = afterResult.pagination.total

      expect(afterCount).toBe(beforeCount - 1)
    })
  })

  describe('pagination & Performance', () => {
    test('should handle pagination with large dataset', async () => {
      // Create additional schools for pagination testing
      const additionalSchoolIds: string[] = []

      for (let i = 0; i < 25; i++) {
        const school = (await createSchool({
          name: `Pagination Test School ${i}`,
          code: `PTS-${i}-${Date.now()}`,
        }))._unsafeUnwrap()
        additionalSchoolIds.push(school.id)
      }

      try {
        // Test first page
        const page1 = (await getSchools({ page: 1, limit: 10 }))._unsafeUnwrap()
        expect(page1.schools).toHaveLength(10)
        expect(page1.pagination.page).toBe(1)
        expect(page1.pagination.totalPages).toBeGreaterThanOrEqual(3)

        // Test second page
        const page2 = (await getSchools({ page: 2, limit: 10 }))._unsafeUnwrap()
        expect(page2.schools).toHaveLength(10)
        expect(page2.pagination.page).toBe(2)

        // Test third page
        const page3 = (await getSchools({ page: 3, limit: 10 }))._unsafeUnwrap()
        expect(page3.schools.length).toBeGreaterThanOrEqual(5) // At least our original 3 schools
        expect(page3.pagination.page).toBe(3)

        // Test total count accuracy
        const totalExpected = additionalSchoolIds.length + testSchoolIds.length
        expect(page1.pagination.total).toBeGreaterThanOrEqual(totalExpected)
      }
      finally {
        // Clean up additional schools
        for (const id of additionalSchoolIds) {
          await (await deleteSchool(id))._unsafeUnwrap()
        }
      }
    })

    test('should handle offset calculation correctly', async () => {
      const page1 = (await getSchools({ page: 1, limit: 2 }))._unsafeUnwrap()
      const page2 = (await getSchools({ page: 2, limit: 2 }))._unsafeUnwrap()

      // Verify different results
      expect(page1.schools[0]?.id).not.toBe(page2.schools[0]?.id)
      expect(page1.pagination.page).toBe(1)
      expect(page2.pagination.page).toBe(2)
      expect(page1.pagination.limit).toBe(page2.pagination.limit)
    })

    test('should handle query performance with many records', async () => {
      const startTime = Date.now()

      // Create performance test schools
      const perfSchoolIds: string[] = []

      for (let i = 0; i < 50; i++) {
        const school = (await createSchool({
          name: `Perf Test School ${i}`,
          code: `PERF-${i}-${Date.now()}`,
          status: i % 2 === 0 ? 'active' : 'inactive',
        }))._unsafeUnwrap()
        perfSchoolIds.push(school.id)
      }

      try {
        // Test search performance
        const searchStart = Date.now()
        const searchResults = (await getSchools({
          search: 'Perf Test',
          limit: 20,
          sortBy: 'name',
          sortOrder: 'asc',
        }))._unsafeUnwrap()
        const searchTime = Date.now() - searchStart

        expect(searchResults.schools.length).toBeGreaterThan(0)
        expect(searchTime).toBeLessThan(1000) // Should complete in less than 1 second

        // Test filter performance
        const filterStart = Date.now()
        const filterResults = (await getSchools({
          status: 'active',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }))._unsafeUnwrap()
        const filterTime = Date.now() - filterStart

        expect(filterResults.schools.length).toBeGreaterThan(0)
        expect(filterTime).toBeLessThan(500) // Should complete in less than 500ms

        // Test pagination performance
        const paginationStart = Date.now()
        await getSchools({ page: 1, limit: 10 })
        await getSchools({ page: 2, limit: 10 })
        await getSchools({ page: 3, limit: 10 })
        const paginationTime = Date.now() - paginationStart

        expect(paginationTime).toBeLessThan(1000) // All pages should load in less than 1 second

        const totalTime = Date.now() - startTime
        console.warn(`Performance test completed in ${totalTime}ms`)
      }
      finally {
        // Clean up performance test schools
        for (const id of perfSchoolIds) {
          await (await deleteSchool(id))._unsafeUnwrap()
        }
      }
    })
  })
})

describe('query Functions Tests - Catalogs', () => {
  let testTrackIds: string[] = []
  let testGradeIds: string[] = []
  let testSeriesIds: string[] = []
  let testSubjectIds: string[] = []

  beforeEach(async () => {
    // Clean up existing test data
    try {
      for (const id of testGradeIds)
        await (await deleteGrade(id))._unsafeUnwrap()
      for (const id of testSeriesIds)
        await (await deleteSerie(id))._unsafeUnwrap()
      for (const id of testSubjectIds)
        await (await deleteSubject(id))._unsafeUnwrap()
      for (const id of testTrackIds)
        await (await deleteTrack(id))._unsafeUnwrap()
    }
    catch {
      // Ignore errors during cleanup
    }
    testTrackIds = []
    testGradeIds = []
    testSeriesIds = []
    testSubjectIds = []

    // Create test data
    const levels = (await getEducationLevels())._unsafeUnwrap()
    const levelId = levels[0]?.id
    if (levelId === undefined) {
      throw new Error('No education levels found in database. Seed data might be missing.')
    }

    const track1 = (await createTrack({
      name: 'TEST__ Science Track',
      code: `TEST__ST-${Date.now()}`,
      educationLevelId: levelId,
    }))._unsafeUnwrap()
    testTrackIds.push(track1.id)

    const track2 = (await createTrack({
      name: 'TEST__ Literature Track',
      code: `TEST__LT-${Date.now()}`,
      educationLevelId: levelId,
    }))._unsafeUnwrap()
    testTrackIds.push(track2.id)

    // Create grades for track 1
    const grade1 = (await createGrade({
      name: 'TEST__ 6th Grade',
      code: `TEST__G6-${Date.now()}`,
      order: 1,
      trackId: track1.id,
    }))._unsafeUnwrap()
    testGradeIds.push(grade1.id)

    const grade2 = (await createGrade({
      name: 'TEST__ 5th Grade',
      code: `TEST__G5-${Date.now()}`,
      order: 2,
      trackId: track1.id,
    }))._unsafeUnwrap()
    testGradeIds.push(grade2.id)

    // Create series for track 1
    const serie1 = (await createSerie({
      name: 'TEST__ Science Series A',
      code: `TEST__SSA-${Date.now()}`,
      trackId: track1.id,
    }))._unsafeUnwrap()
    testSeriesIds.push(serie1.id)

    const serie2 = (await createSerie({
      name: 'TEST__ Science Series B',
      code: `TEST__SSB-${Date.now()}`,
      trackId: track1.id,
    }))._unsafeUnwrap()
    testSeriesIds.push(serie2.id)

    // Create subjects
    const subject1 = (await createSubject({
      name: 'TEST__ Mathematics',
      shortName: 'TEST__MATH',
      category: 'Scientifique',
    }))._unsafeUnwrap()
    testSubjectIds.push(subject1.id)

    const subject2 = (await createSubject({
      name: 'TEST__ Physics',
      shortName: 'TEST__PHY',
      category: 'Scientifique',
    }))._unsafeUnwrap()
    testSubjectIds.push(subject2.id)

    const subject3 = (await createSubject({
      name: 'TEST__ Literature',
      shortName: 'TEST__LIT',
      category: 'Littéraire',
    }))._unsafeUnwrap()
    testSubjectIds.push(subject3.id)

    const subject4 = (await createSubject({
      name: 'TEST__ History',
      shortName: 'TEST__HIST',
      category: 'Littéraire',
    }))._unsafeUnwrap()
    testSubjectIds.push(subject4.id)
  })

  describe('create Operations', () => {
    test('should create grade with all fields', async () => {
      const gradeData = {
        name: '4th Grade',
        code: `G4-${Date.now()}`,
        order: 3,
        trackId: testTrackIds[0]!,
      }

      const grade = (await createGrade(gradeData))._unsafeUnwrap()

      expect(grade).toBeDefined()
      expect(grade.id).toBeDefined()
      expect(grade.name).toBe(gradeData.name)
      expect(grade.code).toBe(gradeData.code)
      expect(grade.order).toBe(gradeData.order)
      expect(grade.trackId).toBe(gradeData.trackId)
      expect(grade.createdAt).toBeInstanceOf(Date)
      expect(grade.updatedAt).toBeInstanceOf(Date)
      testGradeIds.push(grade.id)
    })

    test('should create grade with duplicate code per track', async () => {
      const code = `DUP-${Date.now()}`

      const gradeA = (await createGrade({
        name: 'Grade A',
        code,
        order: 1,
        trackId: testTrackIds[0]!,
      }))._unsafeUnwrap()

      // Note: Currently, duplicate grade codes within the same track are allowed
      // This test verifies the current behavior - the application allows it
      const gradeB = (await createGrade({
        name: 'Grade B',
        code,
        order: 2,
        trackId: testTrackIds[0]!,
      }))._unsafeUnwrap()

      expect(gradeA.code).toBe(code)
      expect(gradeB.code).toBe(code)
      expect(gradeA.id).not.toBe(gradeB.id)
    })

    test('should create series with unique code', async () => {
      const seriesData = {
        name: 'Science Series C',
        code: `SSC-${Date.now()}`,
        trackId: testTrackIds[0]!,
      }

      const serie = (await createSerie(seriesData))._unsafeUnwrap()

      expect(serie).toBeDefined()
      expect(serie.id).toBeDefined()
      expect(serie.name).toBe(seriesData.name)
      expect(serie.code).toBe(seriesData.code)
      expect(serie.trackId).toBe(seriesData.trackId)
      expect(serie.createdAt).toBeInstanceOf(Date)
      expect(serie.updatedAt).toBeInstanceOf(Date)
      testSeriesIds.push(serie.id)
    })

    test('should create subject with category', async () => {
      const subjectData = {
        name: 'Chemistry',
        shortName: 'CHEM',
        category: 'Scientifique' as SubjectCategory,
      }

      const subject = (await createSubject(subjectData))._unsafeUnwrap()

      expect(subject).toBeDefined()
      expect(subject.id).toBeDefined()
      expect(subject.name).toBe(subjectData.name)
      expect(subject.shortName).toBe(subjectData.shortName)
      expect(subject.category).toBe(subjectData.category)
      expect(subject.createdAt).toBeInstanceOf(Date)
      expect(subject.updatedAt).toBeInstanceOf(Date)
      testSubjectIds.push(subject.id)
    })

    test('should create track with education level', async () => {
      const trackData = {
        name: 'Technical Track',
        code: `TT-${Date.now()}`,
        educationLevelId: 2,
      }

      const track = (await createTrack(trackData))._unsafeUnwrap()

      expect(track).toBeDefined()
      expect(track.id).toBeDefined()
      expect(track.name).toBe(trackData.name)
      expect(track.code).toBe(trackData.code)
      expect(track.educationLevelId).toBe(trackData.educationLevelId)
      expect(track.createdAt).toBeInstanceOf(Date)
      expect(track.updatedAt).toBeInstanceOf(Date)
      testTrackIds.push(track.id)
    })
  })

  describe('read Operations', () => {
    test('should get all grades grouped by track', async () => {
      const grades = (await getGrades())._unsafeUnwrap()

      expect(grades).toBeDefined()
      expect(grades.length).toBeGreaterThan(0)

      // Check if grades are sorted by order
      for (let i = 1; i < grades.length; i++) {
        expect(grades[i]!.order).toBeGreaterThanOrEqual(grades[i - 1]!.order)
      }
    })

    test('should get grades sorted by order', async () => {
      const grades = (await getGrades({ trackId: testTrackIds[0]! }))._unsafeUnwrap()

      expect(grades).toBeDefined()
      expect(grades.length).toBeGreaterThanOrEqual(2)

      // Verify sorting by order
      for (let i = 1; i < grades.length; i++) {
        expect(grades[i]!.order).toBeGreaterThan(grades[i - 1]!.order)
      }
    })

    test('should get grades by track', async () => {
      const track1Grades = (await getGrades({ trackId: testTrackIds[0]! }))._unsafeUnwrap()
      const track2Grades = (await getGrades({ trackId: testTrackIds[1] }))._unsafeUnwrap()

      expect(track1Grades.length).toBeGreaterThanOrEqual(2)
      expect(track2Grades).toHaveLength(0) // No grades created for track 2

      expect(track1Grades.every(grade => grade.trackId === testTrackIds[0]!)).toBe(true)
    })

    test('should get series by track', async () => {
      const track1Series = (await getSeries({ trackId: testTrackIds[0]! }))._unsafeUnwrap()
      const track2Series = (await getSeries({ trackId: testTrackIds[1] }))._unsafeUnwrap()

      expect(track1Series.length).toBeGreaterThanOrEqual(2)
      expect(track2Series).toHaveLength(0) // No series created for track 2

      expect(track1Series.every(serie => serie.trackId === testTrackIds[0]!)).toBe(true)
    })

    test('should get subjects by category', async () => {
      const scientificSubjects = (await getSubjects({ category: 'Scientifique' }))._unsafeUnwrap()
      const literarySubjects = (await getSubjects({ category: 'Littéraire' }))._unsafeUnwrap()

      expect(scientificSubjects.subjects.length).toBeGreaterThanOrEqual(2)
      expect(literarySubjects.subjects.length).toBeGreaterThanOrEqual(2)

      expect(scientificSubjects.subjects.every(subject => subject.category === 'Scientifique')).toBe(true)
      expect(literarySubjects.subjects.every(subject => subject.category === 'Littéraire')).toBe(true)
    })

    test('should get subjects by search', async () => {
      const searchResults = (await getSubjects({ search: 'Math' }))._unsafeUnwrap()

      expect(searchResults.subjects.length).toBeGreaterThanOrEqual(1)
      expect(searchResults.subjects[0]?.name).toContain('Math')
    })

    test('should get subjects across all categories', async () => {
      const allSubjects = (await getSubjects())._unsafeUnwrap()

      expect(allSubjects.subjects.length).toBeGreaterThanOrEqual(4)
      expect(allSubjects.pagination.total).toBeGreaterThanOrEqual(4)
      expect(allSubjects.pagination.page).toBe(1)
      expect(allSubjects.pagination.limit).toBe(20)
    })

    test('should get tracks by education level', async () => {
      const educationLevels = (await getEducationLevels())._unsafeUnwrap()
      const levelId = educationLevels[0]?.id
      expect(levelId).toBeDefined()

      const tracks = (await getTracks({ educationLevelId: levelId! }))._unsafeUnwrap()

      expect(tracks.length).toBeGreaterThanOrEqual(2)
      expect(tracks.every(track => track.educationLevelId === levelId)).toBe(true)
    })

    test('should get education levels', async () => {
      const educationLevels = (await getEducationLevels())._unsafeUnwrap()

      expect(educationLevels).toBeDefined()
      expect(educationLevels.length).toBeGreaterThan(0)

      // Check if education levels are sorted by order
      for (let i = 1; i < educationLevels.length; i++) {
        expect(educationLevels[i]!.order).toBeGreaterThan(educationLevels[i - 1]!.order)
      }
    })
  })

  describe('update Operations', () => {
    test('should update grade order (reordering)', async () => {
      const [gradeId1, gradeId2] = [testGradeIds[0]!, testGradeIds[1]!]

      // Swap orders
      await (await updateGrade(gradeId1, { order: 2 }))._unsafeUnwrap()
      await (await updateGrade(gradeId2, { order: 1 }))._unsafeUnwrap()

      const updatedGrade1 = (await getGradeById(gradeId1))._unsafeUnwrap()
      const updatedGrade2 = (await getGradeById(gradeId2))._unsafeUnwrap()

      expect(updatedGrade1!.order).toBe(2)
      expect(updatedGrade2!.order).toBe(1)
    })

    test('should update series name', async () => {
      const seriesId = testSeriesIds[0]!

      const updatedSeries = (await updateSerie(seriesId, { name: 'Updated Series Name' }))._unsafeUnwrap()

      expect(updatedSeries.name).toBe('Updated Series Name')
    })

    test('should update subject category', async () => {
      const subjectId = testSubjectIds[0]!

      const updatedSubject = (await updateSubject(subjectId, { category: 'Autre' }))._unsafeUnwrap()

      expect(updatedSubject.category).toBe('Autre')
    })

    test('should throw error when updating non-existent subject', async () => {
      const nonExistentId = 'non-existent-subject-id'

      expect((await updateSubject(nonExistentId, { category: 'Autre' })).isErr()).toBe(true)
    })

    test('should throw error when updating non-existent grade', async () => {
      const nonExistentId = 'non-existent-grade-id'

      expect((await updateGrade(nonExistentId, { order: 10 })).isErr()).toBe(true)
    })

    test('should throw error when updating non-existent serie', async () => {
      const nonExistentId = 'non-existent-serie-id'

      expect((await updateSerie(nonExistentId, { name: 'Updated Name' })).isErr()).toBe(true)
    })

    test('should bulk update grades order', async () => {
      const [gradeId1, gradeId2] = [testGradeIds[0]!, testGradeIds[1]!]

      await (await bulkUpdateGradesOrder([
        { id: gradeId1, order: 10 },
        { id: gradeId2, order: 20 },
      ]))._unsafeUnwrap()

      const updatedGrade1 = (await getGradeById(gradeId1))._unsafeUnwrap()
      const updatedGrade2 = (await getGradeById(gradeId2))._unsafeUnwrap()

      expect(updatedGrade1!.order).toBe(10)
      expect(updatedGrade2!.order).toBe(20)
    })
  })

  describe('delete Operations', () => {
    test('should delete grade', async () => {
      const testGrade = (await createGrade({
        name: 'Grade to Delete',
        code: `DEL-${Date.now()}`,
        order: 99,
        trackId: testTrackIds[0]!,
      }))._unsafeUnwrap()

      // Verify grade exists
      let grade = (await getGradeById(testGrade.id))._unsafeUnwrap()
      expect(grade).toBeDefined()

      // Delete grade
      await (await deleteGrade(testGrade.id))._unsafeUnwrap()

      // Verify grade is deleted
      grade = (await getGradeById(testGrade.id))._unsafeUnwrap()
      expect(grade).toBeNull()
    })

    test('should delete series', async () => {
      const testSerie = (await createSerie({
        name: 'Series to Delete',
        code: `DEL-${Date.now()}`,
        trackId: testTrackIds[0]!,
      }))._unsafeUnwrap()

      // Verify series exists
      let serie = (await getSerieById(testSerie.id))._unsafeUnwrap()
      expect(serie).toBeDefined()

      // Delete series
      await (await deleteSerie(testSerie.id))._unsafeUnwrap()

      // Verify series is deleted
      serie = (await getSerieById(testSerie.id))._unsafeUnwrap()
      expect(serie).toBeNull()
    })

    test('should delete subject', async () => {
      const testSubject = (await createSubject({
        name: 'Subject to Delete',
        shortName: 'DEL',
        category: 'Scientifique',
      }))._unsafeUnwrap()

      // Verify subject exists
      let subject = (await getSubjectById(testSubject.id))._unsafeUnwrap()
      expect(subject).toBeDefined()

      // Delete subject
      await (await deleteSubject(testSubject.id))._unsafeUnwrap()

      // Verify subject is deleted
      subject = (await getSubjectById(testSubject.id))._unsafeUnwrap()
      expect(subject).toBeNull()
    })
  })

  describe('bulk Operations', () => {
    test('should bulk create series', async () => {
      const seriesData = [
        {
          name: 'Bulk Series A',
          code: `BSA-${Date.now()}`,
          trackId: testTrackIds[0]!,
        },
        {
          name: 'Bulk Series B',
          code: `BSB-${Date.now()}`,
          trackId: testTrackIds[0]!,
        },
        {
          name: 'Bulk Series C',
          code: `BSC-${Date.now()}`,
          trackId: testTrackIds[0]!,
        },
      ]

      const newSeries = (await bulkCreateSeries(seriesData))._unsafeUnwrap()

      expect(newSeries).toHaveLength(3)
      expect(newSeries[0]!.name).toBe('Bulk Series A')
      expect(newSeries[1]!.name).toBe('Bulk Series B')
      expect(newSeries[2]!.name).toBe('Bulk Series C')

      // Add to cleanup
      testSeriesIds.push(...newSeries.map(s => s.id))
    })

    test('should bulk create subjects', async () => {
      const subjectsData = [
        {
          name: 'Bulk Subject A',
          shortName: 'BSA',
          category: 'Scientifique' as SubjectCategory,
        },
        {
          name: 'Bulk Subject B',
          shortName: 'BSB',
          category: 'Littéraire' as SubjectCategory,
        },
        {
          name: 'Bulk Subject C',
          shortName: 'BSC',
          category: 'Scientifique' as SubjectCategory,
        },
      ]

      const newSubjects = (await bulkCreateSubjects(subjectsData))._unsafeUnwrap()

      expect(newSubjects).toHaveLength(3)
      expect(newSubjects[0]!.name).toBe('Bulk Subject A')
      expect(newSubjects[1]!.name).toBe('Bulk Subject B')
      expect(newSubjects[2]!.name).toBe('Bulk Subject C')

      // Add to cleanup
      testSubjectIds.push(...newSubjects.map(s => s.id))
    })

    test('should handle empty bulk operations', async () => {
      const emptySeries = (await bulkCreateSeries([]))._unsafeUnwrap()
      const emptySubjects = (await bulkCreateSubjects([]))._unsafeUnwrap()

      expect(emptySeries).toHaveLength(0)
      expect(emptySubjects).toHaveLength(0)
    })

    test('should handle bulk update grades order transaction', async () => {
      // Create additional grades for testing
      const extraGrades: string[] = []
      for (let i = 0; i < 3; i++) {
        const grade = (await createGrade({
          name: `Extra Grade ${i}`,
          code: `EG${i}-${Date.now()}`,
          order: i + 10,
          trackId: testTrackIds[0]!,
        }))._unsafeUnwrap()
        extraGrades.push(grade.id)
      }

      try {
        // Reorder all grades
        const allGrades = (await getGrades({ trackId: testTrackIds[0]! }))._unsafeUnwrap()
        const reorderData = allGrades.map((grade, index) => ({
          id: grade.id,
          order: index + 1,
        }))

        await (await bulkUpdateGradesOrder(reorderData))._unsafeUnwrap()

        // Verify all orders are correct
        const reorderedGrades = (await getGrades({ trackId: testTrackIds[0]! }))._unsafeUnwrap()
        expect(reorderedGrades.length).toBeGreaterThan(0)

        for (let i = 0; i < reorderedGrades.length; i++) {
          expect(reorderedGrades[i]!.order).toBe(i + 1)
        }
      }
      finally {
        // Clean up extra grades
        for (const id of extraGrades) {
          await (await deleteGrade(id))._unsafeUnwrap()
        }
      }
    })
  })

  describe('catalog Stats', () => {
    test('should get catalog statistics', async () => {
      const stats = (await getCatalogStats())._unsafeUnwrap()

      expect(stats).toBeDefined()
      expect(typeof stats.educationLevels).toBe('number')
      expect(typeof stats.tracks).toBe('number')
      expect(typeof stats.grades).toBe('number')
      expect(typeof stats.series).toBe('number')
      expect(typeof stats.subjects).toBe('number')

      expect(stats.educationLevels).toBeGreaterThan(0)
      expect(stats.tracks).toBeGreaterThanOrEqual(2) // Our test tracks
      expect(stats.grades).toBeGreaterThanOrEqual(2) // Our test grades
      expect(stats.series).toBeGreaterThanOrEqual(2) // Our test series
      expect(stats.subjects).toBeGreaterThanOrEqual(4) // Our test subjects
    })
  })

  describe('subject Pagination and Search', () => {
    test('should paginate subjects correctly', async () => {
      // Create additional subjects for pagination
      const additionalSubjects: string[] = []
      for (let i = 0; i < 15; i++) {
        const subject = (await createSubject({
          name: `Pagination Subject ${i}`,
          shortName: `PS${i}`,
          category: 'Scientifique',
        }))._unsafeUnwrap()
        additionalSubjects.push(subject.id)
      }

      try {
        // Test first page
        const page1 = (await getSubjects({ page: 1, limit: 5 }))._unsafeUnwrap()
        expect(page1.subjects).toHaveLength(5)
        expect(page1.pagination.page).toBe(1)
        expect(page1.pagination.limit).toBe(5)

        // Test second page
        const page2 = (await getSubjects({ page: 2, limit: 5 }))._unsafeUnwrap()
        expect(page2.subjects).toHaveLength(5)
        expect(page2.pagination.page).toBe(2)

        // Verify different results
        const page1Ids = page1.subjects.map(s => s.id)
        const page2Ids = page2.subjects.map(s => s.id)
        const intersection = page1Ids.filter(id => page2Ids.includes(id))
        expect(intersection).toHaveLength(0)

        // Test total pages calculation
        const totalPages = Math.ceil((additionalSubjects.length + 4) / 5) // 4 existing + new subjects
        expect(page1.pagination.totalPages).toBeGreaterThanOrEqual(totalPages)
      }
      finally {
        // Clean up additional subjects
        for (const id of additionalSubjects) {
          await (await deleteSubject(id))._unsafeUnwrap()
        }
      }
    })

    test('should search subjects by name and short name', async () => {
      // Create specific subjects for search testing
      const searchSubject1 = (await createSubject({
        name: 'Advanced Mathematics',
        shortName: 'ADV MATH',
        category: 'Scientifique',
      }))._unsafeUnwrap()
      const searchSubject2 = (await createSubject({
        name: 'Basic Mathematics',
        shortName: 'BASIC',
        category: 'Scientifique',
      }))._unsafeUnwrap()

      testSubjectIds.push(searchSubject1.id, searchSubject2.id)

      // Search by name
      const nameResults = (await getSubjects({ search: 'Mathematics' }))._unsafeUnwrap()
      expect(nameResults.subjects.length).toBeGreaterThanOrEqual(3) // Original + 2 new

      // Search by short name
      const shortNameResults = (await getSubjects({ search: 'MATH' }))._unsafeUnwrap()
      expect(shortNameResults.subjects.length).toBeGreaterThanOrEqual(2) // Original + 1 new

      // Search by case insensitive
      const caseInsensitiveResults = (await getSubjects({ search: 'math' }))._unsafeUnwrap()
      expect(caseInsensitiveResults.subjects.length).toBeGreaterThan(0)

      // Search with no results
      const noResults = (await getSubjects({ search: 'NonExistentSubjectXYZ' }))._unsafeUnwrap()
      expect(noResults.subjects).toHaveLength(0)
      expect(noResults.pagination.total).toBe(0)
    })

    test('should combine category and search filters', async () => {
      const results = (await getSubjects({
        category: 'Scientifique',
        search: 'Math',
      }))._unsafeUnwrap()

      expect(results.subjects.length).toBeGreaterThanOrEqual(1)
      expect(results.subjects.every(subject =>
        subject.category === 'Scientifique'
        && (subject.name.includes('Math') || subject.shortName?.includes('Math')),
      )).toBe(true)
    })
  })
})

describe('query Functions Tests - Program Templates', () => {
  let testSchoolYearIds: string[] = []
  let testSubjectIds: string[] = []
  let testGradeIds: string[] = []
  let testProgramIds: string[] = []
  let testChapterIds: string[] = []

  beforeEach(async () => {
    // Clean up existing test data
    for (const id of [...testSchoolYearIds, ...testSubjectIds, ...testGradeIds, ...testProgramIds, ...testChapterIds]) {
      try {
        await (await deleteProgramTemplate(id))._unsafeUnwrap()
        await (await deleteProgramTemplateChapter(id))._unsafeUnwrap()
        await (await deleteGrade(id))._unsafeUnwrap()
        await (await deleteSubject(id))._unsafeUnwrap()
        await (await deleteSchoolYearTemplate(id))._unsafeUnwrap()
      }
      catch {
        // Ignore errors during cleanup
      }
    }
    testSchoolYearIds = []
    testSubjectIds = []
    testGradeIds = []
    testProgramIds = []
    testChapterIds = []

    // Create test data
    const schoolYear1 = (await createSchoolYearTemplate({
      name: `TEST__ 2024-2025 School Year ${Date.now()}`,
      isActive: true,
    }))._unsafeUnwrap()
    testSchoolYearIds.push(schoolYear1.id)

    const schoolYear2 = (await createSchoolYearTemplate({
      name: `TEST__ 2025-2026 School Year ${Date.now()}`,
      isActive: false,
    }))._unsafeUnwrap()
    testSchoolYearIds.push(schoolYear2.id)

    const testSubject = (await createSubject({
      name: `TEST__ Test Subject for Programs ${Date.now()}`,
      shortName: 'TEST__TSP',
      category: 'Scientifique',
    }))._unsafeUnwrap()
    testSubjectIds.push(testSubject.id)

    // Create a track first
    const testTrack = (await createTrack({
      name: `TEST__ Test Track for Programs ${Date.now()}`,
      code: `TEST__TTP-${Date.now()}`,
      educationLevelId: 2, // Secondary
    }))._unsafeUnwrap()

    const testGrade = (await createGrade({
      name: `TEST__ Test Grade for Programs ${Date.now()}`,
      code: `TEST__TGP-${Date.now()}`,
      order: 1,
      trackId: testTrack.id,
    }))._unsafeUnwrap()
    testGradeIds.push(testGrade.id)

    // Create test programs
    const program1 = (await createProgramTemplate({
      name: 'TEST__ Mathematics Program 2024',
      schoolYearTemplateId: schoolYear1.id,
      subjectId: testSubject.id,
      gradeId: testGrade.id,
      status: 'draft',
    }))._unsafeUnwrap()
    testProgramIds.push(program1.id)

    const program2 = (await createProgramTemplate({
      name: 'TEST__ Physics Program 2024',
      schoolYearTemplateId: schoolYear1.id,
      subjectId: testSubject.id,
      gradeId: testGrade.id,
      status: 'published',
    }))._unsafeUnwrap()
    testProgramIds.push(program2.id)

    const program3 = (await createProgramTemplate({
      name: 'TEST__ Mathematics Program 2025',
      schoolYearTemplateId: schoolYear2.id,
      subjectId: testSubject.id,
      gradeId: testGrade.id,
      status: 'archived',
    }))._unsafeUnwrap()
    testProgramIds.push(program3.id)

    // Create test chapters
    const chapter1 = (await createProgramTemplateChapter({
      title: 'TEST__ Introduction to Algebra',
      objectives: 'Understand basic algebraic concepts',
      order: 1,
      durationHours: 10,
      programTemplateId: program1.id,
    }))._unsafeUnwrap()
    testChapterIds.push(chapter1.id)

    const chapter2 = (await createProgramTemplateChapter({
      title: 'TEST__ Advanced Algebra',
      objectives: 'Master complex algebraic operations',
      order: 2,
      durationHours: 15,
      programTemplateId: program1.id,
    }))._unsafeUnwrap()
    testChapterIds.push(chapter2.id)

    const chapter3 = (await createProgramTemplateChapter({
      title: 'TEST__ Basic Physics',
      objectives: 'Introduction to physics principles',
      order: 1,
      durationHours: 8,
      programTemplateId: program2.id,
    }))._unsafeUnwrap()
    testChapterIds.push(chapter3.id)
  })

  describe('school Year Templates', () => {
    test('should create school year template', async () => {
      const schoolYearData = {
        name: `TEST__ School Year ${Date.now()}`,
        isActive: true,
      }

      const schoolYear = (await createSchoolYearTemplate(schoolYearData))._unsafeUnwrap()

      expect(schoolYear).toBeDefined()
      expect(schoolYear.id).toBeDefined()
      expect(schoolYear.name).toBe(schoolYearData.name)
      expect(schoolYear.isActive).toBe(schoolYearData.isActive)
      expect(schoolYear.createdAt).toBeInstanceOf(Date)
      expect(schoolYear.updatedAt).toBeInstanceOf(Date)
      testSchoolYearIds.push(schoolYear.id)
    })

    test('should get all school year templates', async () => {
      const schoolYears = (await getSchoolYearTemplates())._unsafeUnwrap()

      expect(schoolYears).toBeDefined()
      expect(schoolYears.length).toBeGreaterThan(0)

      // Should be sorted by isActive (desc) then name (desc)
      expect(schoolYears[0]!.isActive).toBe(true)
    })

    test('should get school year template by ID', async () => {
      const schoolYearId = testSchoolYearIds[0]!
      const schoolYear = (await getSchoolYearTemplateById(schoolYearId))._unsafeUnwrap()

      expect(schoolYear).toBeDefined()
      expect(schoolYear!.id).toBe(schoolYearId)
      expect(schoolYear!.name).toBeDefined()
    })

    test('should return null for non-existent school year', async () => {
      const schoolYear = (await getSchoolYearTemplateById('00000000-0000-0000-0000-000000000000'))._unsafeUnwrap()

      expect(schoolYear).toBeNull()
    })

    test('should update school year template', async () => {
      const schoolYearId = testSchoolYearIds[0]!

      const updatedSchoolYear = (await updateSchoolYearTemplate(schoolYearId, {
        name: 'TEST__ Updated School Year Name',
        isActive: false,
      }))._unsafeUnwrap()

      expect(updatedSchoolYear.name).toBe('TEST__ Updated School Year Name')
      expect(updatedSchoolYear.isActive).toBe(false)
    })

    test('should delete school year template', async () => {
      const testSchoolYear = (await createSchoolYearTemplate({
        name: 'TEST__ School Year to Delete',
        isActive: false,
      }))._unsafeUnwrap()

      // Verify school year exists
      let schoolYear = (await getSchoolYearTemplateById(testSchoolYear.id))._unsafeUnwrap()
      expect(schoolYear).toBeDefined()

      // Delete school year
      await (await deleteSchoolYearTemplate(testSchoolYear.id))._unsafeUnwrap()

      // Verify school year is deleted
      schoolYear = (await getSchoolYearTemplateById(testSchoolYear.id))._unsafeUnwrap()
      expect(schoolYear).toBeNull()
    })
  })

  describe('program Templates CRUD', () => {
    test('should create program template with all fields', async () => {
      const programData = {
        name: 'TEST__ Complete Test Program',
        schoolYearTemplateId: testSchoolYearIds[0]!,
        subjectId: testSubjectIds[0]!,
        gradeId: testGradeIds[0]!,
        status: 'draft' as const,
      }

      const program = (await createProgramTemplate(programData))._unsafeUnwrap()

      expect(program).toBeDefined()
      expect(program.id).toBeDefined()
      expect(program.name).toBe(programData.name)
      expect(program.schoolYearTemplateId).toBe(programData.schoolYearTemplateId)
      expect(program.subjectId).toBe(programData.subjectId)
      expect(program.gradeId).toBe(programData.gradeId)
      expect(program.status).toBe(programData.status)
      expect(program.createdAt).toBeInstanceOf(Date)
      expect(program.updatedAt).toBeInstanceOf(Date)
      testProgramIds.push(program.id)
    })

    test('should get program templates with relations', async () => {
      const result = (await getProgramTemplates())._unsafeUnwrap()

      expect(result.programs).toBeDefined()
      expect(result.programs.length).toBeGreaterThan(0)
      expect(result.pagination).toBeDefined()

      const programWithRelations = result.programs.find((p: any) => p.id === testProgramIds[0]!)
      expect(programWithRelations).toBeDefined()
      expect(programWithRelations!.schoolYearTemplate).toBeDefined()
      expect(programWithRelations!.subject).toBeDefined()
      expect(programWithRelations!.grade).toBeDefined()
    })

    test('should get programs by school year', async () => {
      const schoolYearId = testSchoolYearIds[0]!
      const result = (await getProgramTemplates({ schoolYearTemplateId: schoolYearId }))._unsafeUnwrap()

      expect(result.programs.length).toBeGreaterThanOrEqual(2)
      expect(result.programs.every((p: any) => p.schoolYearTemplateId === schoolYearId)).toBe(true)
    })

    test('should get programs by subject', async () => {
      const subjectId = testSubjectIds[0]!
      const result = (await getProgramTemplates({ subjectId }))._unsafeUnwrap()

      expect(result.programs.length).toBeGreaterThanOrEqual(3)
      expect(result.programs.every((p: any) => p.subjectId === testSubjectIds[0])).toBe(true)
    })

    test('should get programs by grade', async () => {
      const gradeId = testGradeIds[0]!
      const result = (await getProgramTemplates({ gradeId }))._unsafeUnwrap()

      expect(result.programs.length).toBeGreaterThanOrEqual(3)
      expect(result.programs.every((p: any) => p.gradeId === gradeId)).toBe(true)
    })

    test('should get programs by status', async () => {
      const draftResult = (await getProgramTemplates({ status: 'draft' }))._unsafeUnwrap()
      const publishedResult = (await getProgramTemplates({ status: 'published' }))._unsafeUnwrap()
      const archivedResult = (await getProgramTemplates({ status: 'archived' }))._unsafeUnwrap()

      expect(draftResult.programs.length).toBeGreaterThanOrEqual(1)
      expect(publishedResult.programs.length).toBeGreaterThanOrEqual(1)
      expect(archivedResult.programs.length).toBeGreaterThanOrEqual(1)

      expect(draftResult.programs.every((p: any) => p.status === 'draft')).toBe(true)
      expect(publishedResult.programs.every((p: any) => p.status === 'published')).toBe(true)
      expect(archivedResult.programs.every((p: any) => p.status === 'archived')).toBe(true)
    })

    test('should search programs by name', async () => {
      const result = (await getProgramTemplates({ search: 'Mathematics' }))._unsafeUnwrap()

      expect(result.programs.length).toBeGreaterThanOrEqual(2)
      expect(result.programs.every((p: any) => p.name.includes('Mathematics'))).toBe(true)
    })

    test('should get single program with relations by ID', async () => {
      const programId = testProgramIds[0]!
      const program = (await getProgramTemplateById(programId))._unsafeUnwrap()

      expect(program).toBeDefined()
      expect(program!.id).toBe(programId)
      expect(program!.schoolYearTemplate).toBeDefined()
      expect(program!.subject).toBeDefined()
      expect(program!.grade).toBeDefined()
    })

    test('should update program template', async () => {
      const programId = testProgramIds[0]!

      const updatedProgram = (await updateProgramTemplate(programId, {
        name: 'TEST__ Updated Program Name',
        status: 'published',
      }))._unsafeUnwrap()

      expect(updatedProgram.name).toBe('TEST__ Updated Program Name')
      expect(updatedProgram.status).toBe('published')
    })

    test('should delete program template with chapters', async () => {
      const testProgram = (await createProgramTemplate({
        name: 'TEST__ Program to Delete',
        schoolYearTemplateId: testSchoolYearIds[0]!,
        subjectId: testSubjectIds[0]!,
        gradeId: testGradeIds[0]!,
        status: 'draft',
      }))._unsafeUnwrap()

      // Create a chapter for the program
      await createProgramTemplateChapter({
        title: 'TEST__ Chapter to Delete',
        order: 1,
        programTemplateId: testProgram.id,
      })

      // Verify program exists
      let program = (await getProgramTemplateById(testProgram.id))._unsafeUnwrap()
      expect(program).toBeDefined()

      // Delete program (should also delete chapters)
      await deleteProgramTemplate(testProgram.id)

      // Verify program is deleted
      program = (await getProgramTemplateById(testProgram.id))._unsafeUnwrap()
      expect(program).toBeNull()
    })

    test('should clone program template', async () => {
      const sourceProgramId = testProgramIds[0]!
      const targetSchoolYearId = testSchoolYearIds[0]!

      const clonedProgram = (await cloneProgramTemplate(
        sourceProgramId!,
        targetSchoolYearId,
        'TEST__ Cloned Mathematics Program',
      ))._unsafeUnwrap()

      expect(clonedProgram).toBeDefined()
      expect(clonedProgram.id).not.toBe(sourceProgramId!)
      expect(clonedProgram.name).toBe('TEST__ Cloned Mathematics Program')
      expect(clonedProgram.schoolYearTemplateId).toBe(targetSchoolYearId)
      expect(clonedProgram.subjectId).toBeDefined()
      expect(clonedProgram.gradeId).toBeDefined()

      // Verify chapters were cloned
      const clonedChapters = (await getProgramTemplateChapters(clonedProgram.id))._unsafeUnwrap()
      expect(clonedChapters.length).toBeGreaterThanOrEqual(2) // Original had 2 chapters

      testProgramIds.push(clonedProgram.id)
    })
  })

  describe('program Template Chapters', () => {
    test('should create program template chapter', async () => {
      const chapterData = {
        title: 'New Test Chapter',
        objectives: 'Learn new concepts',
        order: 3,
        durationHours: 12,
        programTemplateId: testProgramIds[0]!,
      }

      const chapter = (await createProgramTemplateChapter(chapterData))._unsafeUnwrap()

      expect(chapter).toBeDefined()
      expect(chapter.id).toBeDefined()
      expect(chapter.title).toBe(chapterData.title)
      expect(chapter.objectives).toBe(chapterData.objectives)
      expect(chapter.order).toBe(chapterData.order)
      expect(chapter.durationHours).toBe(chapterData.durationHours)
      expect(chapter.programTemplateId).toBe(chapterData.programTemplateId)
      expect(chapter.createdAt).toBeInstanceOf(Date)
      expect(chapter.updatedAt).toBeInstanceOf(Date)
      testChapterIds.push(chapter.id)
    })

    test('should get chapters for program template', async () => {
      const programId = testProgramIds[0]!
      const chapters = (await getProgramTemplateChapters(programId))._unsafeUnwrap()

      expect(chapters).toBeDefined()
      expect(chapters.length).toBeGreaterThanOrEqual(2)

      // Should be sorted by order
      for (let i = 1; i < chapters.length; i++) {
        expect(chapters[i]!.order).toBeGreaterThan(chapters[i - 1]!.order)
      }
    })

    test('should get chapter by ID', async () => {
      const chapterId = testChapterIds[0]!
      const chapter = (await getProgramTemplateChapterById(chapterId))._unsafeUnwrap()

      expect(chapter).toBeDefined()
      expect(chapter!.id).toBe(chapterId)
      expect(chapter!.title).toBeDefined()
    })

    test('should update program template chapter', async () => {
      const chapterId = testChapterIds[0]!

      const updatedChapter = (await updateProgramTemplateChapter(chapterId, {
        title: 'Updated Chapter Title',
        order: 99,
        durationHours: 25,
      }))._unsafeUnwrap()

      expect(updatedChapter.title).toBe('Updated Chapter Title')
      expect(updatedChapter.order).toBe(99)
      expect(updatedChapter.durationHours).toBe(25)
    })

    test('should delete program template chapter', async () => {
      const testChapter = (await createProgramTemplateChapter({
        title: 'TEST__ Chapter to Delete',
        order: 99,
        programTemplateId: testProgramIds[0]!,
      }))._unsafeUnwrap()

      // Verify chapter exists
      let chapter = (await getProgramTemplateChapterById(testChapter.id))._unsafeUnwrap()
      expect(chapter).toBeDefined()

      // Delete chapter
      await deleteProgramTemplateChapter(testChapter.id)

      // Verify chapter is deleted
      chapter = (await getProgramTemplateChapterById(testChapter.id))._unsafeUnwrap()
      expect(chapter).toBeNull()
    })

    test('should bulk create chapters from CSV-like data', async () => {
      const chaptersData = [
        {
          title: 'Chapter 1',
          objectives: 'Objectives 1',
          order: 1,
          durationHours: 5,
        },
        {
          title: 'Chapter 2',
          objectives: 'Objectives 2',
          order: 2,
          durationHours: 10,
        },
        {
          title: 'Chapter 3',
          objectives: 'Objectives 3',
          order: 3,
          durationHours: 8,
        },
      ]

      const newChapters = (await bulkCreateChapters(testProgramIds[0]!, chaptersData))._unsafeUnwrap()

      expect(newChapters).toHaveLength(3)
      expect(newChapters[0]!.title).toBe('Chapter 1')
      expect(newChapters[1]!.title).toBe('Chapter 2')
      expect(newChapters[2]!.title).toBe('Chapter 3')
      expect(newChapters.every((c: any) => c.programTemplateId === testProgramIds[0]!)).toBe(true)

      // Add to cleanup
      testChapterIds.push(...newChapters.map((c: any) => c.id))
    })

    test('should bulk update chapters order', async () => {
      const programId = testProgramIds[0]!
      const chapters = (await getProgramTemplateChapters(programId))._unsafeUnwrap()

      if (chapters.length >= 2) {
        const [chapterId1, chapterId2] = [chapters[0]!.id, chapters[1]!.id]

        // Swap orders
        await bulkUpdateChaptersOrder([
          { id: chapterId1, order: 20 },
          { id: chapterId2, order: 10 },
        ])

        const updatedChapter1 = (await getProgramTemplateChapterById(chapterId1))._unsafeUnwrap()
        const updatedChapter2 = (await getProgramTemplateChapterById(chapterId2))._unsafeUnwrap()

        expect(updatedChapter1!.order).toBe(20)
        expect(updatedChapter2!.order).toBe(10)
      }
    })

    test('should handle empty bulk operations', async () => {
      const emptyChapters = (await bulkCreateChapters(testProgramIds[0]!, []))._unsafeUnwrap()

      expect(emptyChapters).toHaveLength(0)

      // Should not throw error
      await bulkUpdateChaptersOrder([])
    })
  })

  describe('program Versioning', () => {
    test('should publish program creating version snapshot', async () => {
      const programId = testProgramIds[0]!

      // Verify initial status
      const initialProgram = (await getProgramTemplateById(programId))._unsafeUnwrap()
      expect(initialProgram!.status).toBe('draft')

      // Publish program
      const publishResult = (await publishProgram(programId))._unsafeUnwrap()

      expect(publishResult.success).toBe(true)
      expect(publishResult.version).toBe(1)

      // Verify status changed to published
      const updatedProgram = (await getProgramTemplateById(programId))._unsafeUnwrap()
      expect(updatedProgram!.status).toBe('published')

      // Verify version was created
      const versions = (await getProgramVersions(programId))._unsafeUnwrap()
      expect(versions).toHaveLength(1)
      expect(versions[0]!.versionNumber).toBe(1)
      expect(versions[0]!.snapshotData).toBeDefined()
    })

    test('should publish multiple versions incrementally', async () => {
      // Create a new program for versioning test
      const testProgram = (await createProgramTemplate({
        name: 'TEST__ Versioning Test Program',
        schoolYearTemplateId: testSchoolYearIds[0]!,
        subjectId: testSubjectIds[0]!,
        gradeId: testGradeIds[0]!,
        status: 'draft',
      }))._unsafeUnwrap()

      testProgramIds.push(testProgram.id)

      // First publish
      const result1 = (await publishProgram(testProgram.id))._unsafeUnwrap()
      expect(result1.version).toBe(1)

      // Update program
      await updateProgramTemplate(testProgram.id, { name: 'TEST__ Updated Versioning Program' })

      // Second publish
      const result2 = (await publishProgram(testProgram.id))._unsafeUnwrap()
      expect(result2.version).toBe(2)

      // Verify versions
      const versions = (await getProgramVersions(testProgram.id))._unsafeUnwrap()
      expect(versions).toHaveLength(2)
      expect(versions[0]!.versionNumber).toBe(2) // Latest first
      expect(versions[1]!.versionNumber).toBe(1)
    })

    test('should get program versions sorted by version number', async () => {
      const programId = testProgramIds[0]!

      // Create multiple versions
      await publishProgram(programId)
      await updateProgramTemplate(programId, { name: 'TEST__ Updated for v2' })
      await publishProgram(programId)

      const versions = (await getProgramVersions(programId))._unsafeUnwrap()

      expect(versions.length).toBeGreaterThanOrEqual(2)

      // Should be sorted by version number (desc)
      for (let i = 1; i < versions.length; i++) {
        expect(versions[i]!.versionNumber).toBeLessThan(versions[i - 1]!.versionNumber)
      }
    })

    test('should restore program from version', async () => {
      // Create program with initial data
      const testProgram = (await createProgramTemplate({
        name: 'TEST__ Original Program Name',
        schoolYearTemplateId: testSchoolYearIds[0]!,
        subjectId: testSubjectIds[0]!,
        gradeId: testGradeIds[0]!,
        status: 'draft',
      }))._unsafeUnwrap()

      // Add initial chapters
      await bulkCreateChapters(testProgram.id, [
        { title: 'Original Chapter 1', order: 1, durationHours: 5 },
        { title: 'Original Chapter 2', order: 2, durationHours: 10 },
      ])

      // Publish to create version
      await publishProgram(testProgram.id)

      // Update program
      await updateProgramTemplate(testProgram.id, { name: 'TEST__ Modified Program Name' })
      const chapters = (await getProgramTemplateChapters(testProgram.id))._unsafeUnwrap()
      if (chapters.length > 0) {
        await deleteProgramTemplateChapter(chapters[0]!.id)
      }
      await bulkCreateChapters(testProgram.id, [
        { title: 'New Chapter', order: 1, durationHours: 15 },
      ])

      // Get version to restore
      const versions = (await getProgramVersions(testProgram.id))._unsafeUnwrap()
      const firstVersion = versions[0]!

      // Restore from version
      const restoreResult = (await restoreProgramVersion(firstVersion!.id))._unsafeUnwrap()

      expect(restoreResult.success).toBe(true)

      // Verify restoration
      const restoredProgram = (await getProgramTemplateById(testProgram.id))._unsafeUnwrap()
      expect(restoredProgram!.name).toBe('TEST__ Original Program Name')
      expect(restoredProgram!.status).toBe('draft') // Should revert to draft

      const restoredChapters = (await getProgramTemplateChapters(testProgram.id))._unsafeUnwrap()
      expect(restoredChapters).toHaveLength(2) // Should have original 2 chapters
      expect(restoredChapters.some((c: any) => c.title === 'Original Chapter 1')).toBe(true)
      expect(restoredChapters.some((c: any) => c.title === 'Original Chapter 2')).toBe(true)

      testProgramIds.push(testProgram.id)
    })
  })

  describe('program Statistics', () => {
    test('should get program statistics', async () => {
      const stats = (await getProgramStats())._unsafeUnwrap()

      expect(stats).toBeDefined()
      expect(typeof stats.programs).toBe('number')
      expect(typeof stats.chapters).toBe('number')
      expect(typeof stats.schoolYears).toBe('number')

      expect(stats.programs).toBeGreaterThanOrEqual(3) // Our test programs
      expect(stats.chapters).toBeGreaterThanOrEqual(3) // Our test chapters
      expect(stats.schoolYears).toBeGreaterThanOrEqual(2) // Our test school years
    })
  })

  describe('program Pagination and Search', () => {
    test('should paginate program templates correctly', async () => {
      // Create additional programs for pagination
      const additionalPrograms: string[] = []
      for (let i = 0; i < 10; i++) {
        const program = (await createProgramTemplate({
          name: `TEST__ Pagination Program ${i}`,
          schoolYearTemplateId: testSchoolYearIds[0]!,
          subjectId: testSubjectIds[0]!,
          gradeId: testGradeIds[0]!,
          status: 'draft',
        }))._unsafeUnwrap()
        additionalPrograms.push(program.id)
      }

      try {
        // Test first page
        const page1 = (await getProgramTemplates({ page: 1, limit: 5 }))._unsafeUnwrap()
        expect(page1.programs).toHaveLength(5)
        expect(page1.pagination.page).toBe(1)
        expect(page1.pagination.limit).toBe(5)

        // Test second page
        const page2 = (await getProgramTemplates({ page: 2, limit: 5 }))._unsafeUnwrap()
        expect(page2.programs).toHaveLength(5)
        expect(page2.pagination.page).toBe(2)

        // Verify different results
        const page1Ids = page1.programs.map((p: any) => p.id)
        const page2Ids = page2.programs.map((p: any) => p.id)
        const intersection = page1Ids.filter((id: string) => page2Ids.includes(id))
        expect(intersection).toHaveLength(0)
      }
      finally {
        // Clean up additional programs
        for (const id of additionalPrograms) {
          await deleteProgramTemplate(id)
        }
      }
    })

    test('should combine multiple filters', async () => {
      const [schoolYearId, subjectId] = [testSchoolYearIds[0]!, testSubjectIds[0]!]
      const result = (await getProgramTemplates({
        schoolYearTemplateId: schoolYearId,
        subjectId,
        status: 'draft',
        search: 'Mathematics',
      }))._unsafeUnwrap()

      expect(result.programs.length).toBeGreaterThanOrEqual(1)
      expect(result.programs.every((p: any) =>
        p.schoolYearTemplateId === testSchoolYearIds[0]
        && p.subjectId === subjectId
        && p.gradeId === testGradeIds[0]
        && p.status === 'draft'
        && p.name.includes('Mathematics'),
      )).toBe(true)
    })

    test('should handle search with no results', async () => {
      const result = (await getProgramTemplates({ search: 'NonExistentProgramXYZ' }))._unsafeUnwrap()

      expect(result.programs).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })
  })
})
