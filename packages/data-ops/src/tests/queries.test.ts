import type { SchoolStatus, SubjectCategory } from '../drizzle/core-schema'
import { Result as R } from '@praha/byethrow'
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
    const school1 = R.unwrap(await createSchool({
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
    }))
    testSchoolIds.push(school1.id)

    const school2 = R.unwrap(await createSchool({
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
    }))
    testSchoolIds.push(school2.id)

    const school3 = R.unwrap(await createSchool({
      name: 'Test High School',
      code: `THS-${Date.now()}`,
      email: 'high@test.com',
      phone: '+237555555555',
      address: '789 Test Boulevard',
      status: 'suspended',
    }))
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

      const school = R.unwrap(await createSchool(schoolData))

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

      const school = R.unwrap(await createSchool(schoolData))

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

      expect(R.unwrap(await createSchool({
        name: 'Second School',
        code: duplicateCode,
      }))).toBe(true)
    })
  })

  describe('read Operations', () => {
    test('should get all schools with pagination', async () => {
      const result = R.unwrap(await getSchools({ page: 1, limit: 10 }))

      expect(result.schools).toBeDefined()
      expect(result.schools.length).toBeGreaterThan(0)
      expect(result.pagination).toBeDefined()
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.total).toBeGreaterThanOrEqual(3)
      expect(result.pagination.totalPages).toBeGreaterThanOrEqual(1)
    })

    test('should get schools with search filter by name', async () => {
      const result = R.unwrap(await getSchools({ search: 'Test Primary School' }))

      expect(result.schools.length).toBeGreaterThanOrEqual(1)
      expect(result.schools.some((school: any) => school.name.includes('Test Primary School'))).toBe(true)
    })

    test('should get schools with search filter by code', async () => {
      // Create a school with known code for searching
      const searchSchool = R.unwrap(await createSchool({
        name: 'Search Test School',
        code: 'SEARCH-123',
        email: 'search@test.com',
        phone: '+237123456789',
        address: '123 Search Street',
        status: 'active',
      }))
      testSchoolIds.push(searchSchool.id)

      const result = R.unwrap(await getSchools({ search: 'SEARCH-123' }))

      expect(result.schools).toHaveLength(1)
      expect(result.schools[0]?.code).toBe('SEARCH-123')
    })

    test('should get schools with search filter by email', async () => {
      const result = R.unwrap(await getSchools({ search: 'primary@test.com' }))

      expect(result.schools.length).toBeGreaterThanOrEqual(1)
      expect(result.schools.some((school: any) => school.email === 'primary@test.com')).toBe(true)
    })

    test('should get schools with status filter (active)', async () => {
      const result = R.unwrap(await getSchools({ status: 'active' }))

      expect(result.schools.length).toBeGreaterThanOrEqual(1)
      expect(result.schools.every((school: any) => school.status === 'active')).toBe(true)
    })

    test('should get schools with status filter (inactive)', async () => {
      const result = R.unwrap(await getSchools({ status: 'inactive' }))

      expect(result.schools.length).toBeGreaterThanOrEqual(1)
      expect(result.schools.every((school: any) => school.status === 'inactive')).toBe(true)
    })

    test('should get schools with multiple status filters', async () => {
      const result = R.unwrap(await getSchools({ status: ['active', 'inactive'] }))

      expect(result.schools.length).toBeGreaterThanOrEqual(2)
      expect(result.schools.every((school: any) =>
        school.status === 'active' || school.status === 'inactive',
      )).toBe(true)
    })

    test('should get schools sorted by name (asc)', async () => {
      const result = R.unwrap(await getSchools({ sortBy: 'name', sortOrder: 'asc' }))

      expect(result.schools.length).toBeGreaterThanOrEqual(3)

      // Check if sorted correctly
      for (let i = 1; i < result.schools.length; i++) {
        expect(result.schools[i]!.name >= result.schools[i - 1]!.name).toBe(true)
      }
    })

    test('should get schools sorted by name (desc)', async () => {
      const result = R.unwrap(await getSchools({ sortBy: 'name', sortOrder: 'desc' }))

      expect(result.schools.length).toBeGreaterThanOrEqual(3)

      // Check if sorted correctly
      for (let i = 1; i < result.schools.length; i++) {
        expect(result.schools[i]!.name <= result.schools[i - 1]!.name).toBe(true)
      }
    })

    test('should get schools sorted by creation date', async () => {
      const result = R.unwrap(await getSchools({ sortBy: 'createdAt', sortOrder: 'desc' }))

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
      const school = R.unwrap(await getSchoolById(firstSchool!))

      expect(school).toBeDefined()
      expect(school!.id).toBe(firstSchool)
      expect(school!.name).toBeDefined()
      expect(school!.code).toBeDefined()
    })

    test('should return null for non-existent school', async () => {
      const school = R.unwrap(await getSchoolById('00000000-0000-0000-0000-000000000000'))

      expect(school).toBeNull()
    })

    test('should get schools with empty result set', async () => {
      const result = R.unwrap(await getSchools({ search: 'NonExistentSchool' }))

      expect(result.schools).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.totalPages).toBe(0)
    })

    test('should handle pagination with various page sizes', async () => {
      // Test page size 1
      const page1 = R.unwrap(await getSchools({ page: 1, limit: 1 }))
      expect(page1.schools).toHaveLength(1)
      expect(page1.pagination.page).toBe(1)
      expect(page1.pagination.limit).toBe(1)

      // Test page size 2
      const page2 = R.unwrap(await getSchools({ page: 1, limit: 2 }))
      expect(page2.schools).toHaveLength(2)
      expect(page2.pagination.limit).toBe(2)

      // Test second page
      const secondPage = R.unwrap(await getSchools({ page: 2, limit: 1 }))
      expect(secondPage.schools.length).toBeGreaterThanOrEqual(0)
      expect(secondPage.pagination.page).toBe(2)
    })

    test('should get schools by status helper function', async () => {
      const activeSchools = R.unwrap(await getSchoolsByStatus('active'))

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
      const activeSchools = R.unwrap(await getSchoolsByStatus('active', 1))

      expect(activeSchools.length).toBeLessThanOrEqual(1)
    })

    test('should search schools by multiple criteria', async () => {
      // Search by name
      const nameResults = R.unwrap(await searchSchools('Primary'))
      expect(nameResults.length).toBeGreaterThanOrEqual(1)
      expect(nameResults[0]?.name).toContain('Primary')

      // Search by email
      const emailResults = R.unwrap(await searchSchools('primary@test.com'))
      expect(emailResults.length).toBeGreaterThanOrEqual(1)
      expect(emailResults[0]?.email).toBe('primary@test.com')

      // Search by phone
      const phoneResults = R.unwrap(await searchSchools('+237123456789'))
      expect(phoneResults.length).toBeGreaterThanOrEqual(1)
      expect(phoneResults[0]?.phone).toBe('+237123456789')
    })

    test('should limit search results', async () => {
      const results = R.unwrap(await searchSchools('Test', 2))

      expect(results.length).toBeLessThanOrEqual(2)
    })
  })

  describe('update Operations', () => {
    test('should update school name', async () => {
      const schoolId = testSchoolIds[0]!
      const originalUpdatedAt = R.unwrap(await getSchoolById(schoolId))!.updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      const updatedSchool = R.unwrap(await updateSchool(schoolId, { name: 'Updated School Name' }))

      expect(updatedSchool.name).toBe('Updated School Name')
      expect(updatedSchool.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    test('should update school status', async () => {
      const [schoolId] = testSchoolIds

      const updatedSchool = R.unwrap(await updateSchool(schoolId!, { status: 'inactive' }))

      expect(updatedSchool.status).toBe('inactive')
    })

    test('should update school settings', async () => {
      const [schoolId] = testSchoolIds
      const newSettings = {
        maxStudents: 800,
        academicYear: '2025-2026',
        timezone: 'Africa/Douala',
      }

      const updatedSchool = R.unwrap(await updateSchool(schoolId!, { settings: newSettings }))

      expect(updatedSchool.settings).toStrictEqual(newSettings)
    })

    test('should update school logo', async () => {
      const [schoolId] = testSchoolIds
      const newLogo = 'https://example.com/new-logo.png'

      const updatedSchool = R.unwrap(await updateSchool(schoolId!, { logoUrl: newLogo }))

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

      const updatedSchool = R.unwrap(await updateSchool(schoolId!, updateData))

      expect(updatedSchool.name).toBe(updateData.name)
      expect(updatedSchool.email).toBe(updateData.email)
      expect(updatedSchool.phone).toBe(updateData.phone)
      expect(updatedSchool.status).toBe(updateData.status)
      expect(updatedSchool.address).toBe(updateData.address)
    })

    test('should fail to update non-existent school', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      expect(R.isFailure(await updateSchool(nonExistentId, { name: 'Should not work' }))).toBe(true)
    })

    test('should verify updated_at timestamp changes', async () => {
      const [schoolId] = testSchoolIds
      const originalSchool = R.unwrap(await getSchoolById(schoolId!))!

      // Wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      const updatedSchool = R.unwrap(await updateSchool(schoolId!, { address: 'Updated Address' }))

      expect(updatedSchool.updatedAt.getTime()).toBeGreaterThan(originalSchool.updatedAt.getTime())
    })
  })

  describe('delete Operations', () => {
    test('should delete existing school', async () => {
      const testSchool = R.unwrap(await createSchool({
        name: 'School to Delete',
        code: `DEL-${Date.now()}`,
      }))

      // Verify school exists
      let school = R.unwrap(await getSchoolById(testSchool.id))
      expect(school).toBeDefined()

      // Delete school
      await deleteSchool(testSchool.id)

      // Verify school is deleted
      school = R.unwrap(await getSchoolById(testSchool.id))
      expect(school).toBeNull()
    })

    test('should not throw when deleting non-existent school', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      // Should not throw error
      await expect(deleteSchool(nonExistentId)).resolves.not.toThrow()
    })

    test('should verify school is removed from database', async () => {
      const testSchool = R.unwrap(await createSchool({
        name: 'Another School to Delete',
        code: `DEL2-${Date.now()}`,
      }))

      // Get all schools before deletion
      const beforeResult = R.unwrap(await getSchools({ limit: 100 }))
      const beforeCount = beforeResult.pagination.total

      // Delete school
      await R.unwrap(await deleteSchool(testSchool.id))

      // Get all schools after deletion
      const afterResult = R.unwrap(await getSchools({ limit: 100 }))
      const afterCount = afterResult.pagination.total

      expect(afterCount).toBe(beforeCount - 1)
    })
  })

  describe('pagination & Performance', () => {
    test('should handle pagination with large dataset', async () => {
      // Create additional schools for pagination testing
      const additionalSchoolIds: string[] = []

      for (let i = 0; i < 25; i++) {
        const school = R.unwrap(await createSchool({
          name: `Pagination Test School ${i}`,
          code: `PTS-${i}-${Date.now()}`,
        }))
        additionalSchoolIds.push(school.id)
      }

      try {
        // Test first page
        const page1 = R.unwrap(await getSchools({ page: 1, limit: 10 }))
        expect(page1.schools).toHaveLength(10)
        expect(page1.pagination.page).toBe(1)
        expect(page1.pagination.totalPages).toBeGreaterThanOrEqual(3)

        // Test second page
        const page2 = R.unwrap(await getSchools({ page: 2, limit: 10 }))
        expect(page2.schools).toHaveLength(10)
        expect(page2.pagination.page).toBe(2)

        // Test third page
        const page3 = R.unwrap(await getSchools({ page: 3, limit: 10 }))
        expect(page3.schools.length).toBeGreaterThanOrEqual(5) // At least our original 3 schools
        expect(page3.pagination.page).toBe(3)

        // Test total count accuracy
        const totalExpected = additionalSchoolIds.length + testSchoolIds.length
        expect(page1.pagination.total).toBeGreaterThanOrEqual(totalExpected)
      }
      finally {
        // Clean up additional schools
        for (const id of additionalSchoolIds) {
          await R.unwrap(await deleteSchool(id))
        }
      }
    })

    test('should handle offset calculation correctly', async () => {
      const page1 = R.unwrap(await getSchools({ page: 1, limit: 2 }))
      const page2 = R.unwrap(await getSchools({ page: 2, limit: 2 }))

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
        const school = R.unwrap(await createSchool({
          name: `Perf Test School ${i}`,
          code: `PERF-${i}-${Date.now()}`,
          status: i % 2 === 0 ? 'active' : 'inactive',
        }))
        perfSchoolIds.push(school.id)
      }

      try {
        // Test search performance
        const searchStart = Date.now()
        const searchResults = R.unwrap(await getSchools({
          search: 'Perf Test',
          limit: 20,
          sortBy: 'name',
          sortOrder: 'asc',
        }))
        const searchTime = Date.now() - searchStart

        expect(searchResults.schools.length).toBeGreaterThan(0)
        expect(searchTime).toBeLessThan(1000) // Should complete in less than 1 second

        // Test filter performance
        const filterStart = Date.now()
        const filterResults = R.unwrap(await getSchools({
          status: 'active',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }))
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
          await R.unwrap(await deleteSchool(id))
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
        await R.unwrap(await deleteGrade(id))
      for (const id of testSeriesIds)
        await R.unwrap(await deleteSerie(id))
      for (const id of testSubjectIds)
        await R.unwrap(await deleteSubject(id))
      for (const id of testTrackIds)
        await R.unwrap(await deleteTrack(id))
    }
    catch {
      // Ignore errors during cleanup
    }
    testTrackIds = []
    testGradeIds = []
    testSeriesIds = []
    testSubjectIds = []

    // Create test data
    const levels = R.unwrap(await getEducationLevels())
    const levelId = levels[0]?.id
    if (levelId === undefined) {
      throw new Error('No education levels found in database. Seed data might be missing.')
    }

    const track1 = R.unwrap(await createTrack({
      name: 'TEST__ Science Track',
      code: `TEST__ST-${Date.now()}`,
      educationLevelId: levelId,
    }))
    testTrackIds.push(track1.id)

    const track2 = R.unwrap(await createTrack({
      name: 'TEST__ Literature Track',
      code: `TEST__LT-${Date.now()}`,
      educationLevelId: levelId,
    }))
    testTrackIds.push(track2.id)

    // Create grades for track 1
    const grade1 = R.unwrap(await createGrade({
      name: 'TEST__ 6th Grade',
      code: `TEST__G6-${Date.now()}`,
      order: 1,
      trackId: track1.id,
    }))
    testGradeIds.push(grade1.id)

    const grade2 = R.unwrap(await createGrade({
      name: 'TEST__ 5th Grade',
      code: `TEST__G5-${Date.now()}`,
      order: 2,
      trackId: track1.id,
    }))
    testGradeIds.push(grade2.id)

    // Create series for track 1
    const serie1 = R.unwrap(await createSerie({
      name: 'TEST__ Science Series A',
      code: `TEST__SSA-${Date.now()}`,
      trackId: track1.id,
    }))
    testSeriesIds.push(serie1.id)

    const serie2 = R.unwrap(await createSerie({
      name: 'TEST__ Science Series B',
      code: `TEST__SSB-${Date.now()}`,
      trackId: track1.id,
    }))
    testSeriesIds.push(serie2.id)

    // Create subjects
    const subject1 = R.unwrap(await createSubject({
      name: 'TEST__ Mathematics',
      shortName: 'TEST__MATH',
      category: 'Scientifique',
    }))
    testSubjectIds.push(subject1.id)

    const subject2 = R.unwrap(await createSubject({
      name: 'TEST__ Physics',
      shortName: 'TEST__PHY',
      category: 'Scientifique',
    }))
    testSubjectIds.push(subject2.id)

    const subject3 = R.unwrap(await createSubject({
      name: 'TEST__ Literature',
      shortName: 'TEST__LIT',
      category: 'Littéraire',
    }))
    testSubjectIds.push(subject3.id)

    const subject4 = R.unwrap(await createSubject({
      name: 'TEST__ History',
      shortName: 'TEST__HIST',
      category: 'Littéraire',
    }))
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

      const grade = R.unwrap(await createGrade(gradeData))

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

      const gradeA = R.unwrap(await createGrade({
        name: 'Grade A',
        code,
        order: 1,
        trackId: testTrackIds[0]!,
      }))

      // Note: Currently, duplicate grade codes within the same track are allowed
      // This test verifies the current behavior - the application allows it
      const gradeB = R.unwrap(await createGrade({
        name: 'Grade B',
        code,
        order: 2,
        trackId: testTrackIds[0]!,
      }))

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

      const serie = R.unwrap(await createSerie(seriesData))

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

      const subject = R.unwrap(await createSubject(subjectData))

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

      const track = R.unwrap(await createTrack(trackData))

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
      const grades = R.unwrap(await getGrades())

      expect(grades).toBeDefined()
      expect(grades.length).toBeGreaterThan(0)

      // Check if grades are sorted by order
      for (let i = 1; i < grades.length; i++) {
        expect(grades[i]!.order).toBeGreaterThanOrEqual(grades[i - 1]!.order)
      }
    })

    test('should get grades sorted by order', async () => {
      const grades = R.unwrap(await getGrades({ trackId: testTrackIds[0]! }))

      expect(grades).toBeDefined()
      expect(grades.length).toBeGreaterThanOrEqual(2)

      // Verify sorting by order
      for (let i = 1; i < grades.length; i++) {
        expect(grades[i]!.order).toBeGreaterThan(grades[i - 1]!.order)
      }
    })

    test('should get grades by track', async () => {
      const track1Grades = R.unwrap(await getGrades({ trackId: testTrackIds[0]! }))
      const track2Grades = R.unwrap(await getGrades({ trackId: testTrackIds[1] }))

      expect(track1Grades.length).toBeGreaterThanOrEqual(2)
      expect(track2Grades).toHaveLength(0) // No grades created for track 2

      expect(track1Grades.every(grade => grade.trackId === testTrackIds[0]!)).toBe(true)
    })

    test('should get series by track', async () => {
      const track1Series = R.unwrap(await getSeries({ trackId: testTrackIds[0]! }))
      const track2Series = R.unwrap(await getSeries({ trackId: testTrackIds[1] }))

      expect(track1Series.length).toBeGreaterThanOrEqual(2)
      expect(track2Series).toHaveLength(0) // No series created for track 2

      expect(track1Series.every(serie => serie.trackId === testTrackIds[0]!)).toBe(true)
    })

    test('should get subjects by category', async () => {
      const scientificSubjects = R.unwrap(await getSubjects({ category: 'Scientifique' }))
      const literarySubjects = R.unwrap(await getSubjects({ category: 'Littéraire' }))

      expect(scientificSubjects.subjects.length).toBeGreaterThanOrEqual(2)
      expect(literarySubjects.subjects.length).toBeGreaterThanOrEqual(2)

      expect(scientificSubjects.subjects.every(subject => subject.category === 'Scientifique')).toBe(true)
      expect(literarySubjects.subjects.every(subject => subject.category === 'Littéraire')).toBe(true)
    })

    test('should get subjects by search', async () => {
      const searchResults = R.unwrap(await getSubjects({ search: 'Math' }))

      expect(searchResults.subjects.length).toBeGreaterThanOrEqual(1)
      expect(searchResults.subjects[0]?.name).toContain('Math')
    })

    test('should get subjects across all categories', async () => {
      const allSubjects = R.unwrap(await getSubjects())

      expect(allSubjects.subjects.length).toBeGreaterThanOrEqual(4)
      expect(allSubjects.pagination.total).toBeGreaterThanOrEqual(4)
      expect(allSubjects.pagination.page).toBe(1)
      expect(allSubjects.pagination.limit).toBe(20)
    })

    test('should get tracks by education level', async () => {
      const educationLevels = R.unwrap(await getEducationLevels())
      const levelId = educationLevels[0]?.id
      expect(levelId).toBeDefined()

      const tracks = R.unwrap(await getTracks({ educationLevelId: levelId! }))

      expect(tracks.length).toBeGreaterThanOrEqual(2)
      expect(tracks.every(track => track.educationLevelId === levelId)).toBe(true)
    })

    test('should get education levels', async () => {
      const educationLevels = R.unwrap(await getEducationLevels())

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
      await R.unwrap(await updateGrade(gradeId1, { order: 2 }))
      await R.unwrap(await updateGrade(gradeId2, { order: 1 }))

      const updatedGrade1 = R.unwrap(await getGradeById(gradeId1))
      const updatedGrade2 = R.unwrap(await getGradeById(gradeId2))

      expect(updatedGrade1!.order).toBe(2)
      expect(updatedGrade2!.order).toBe(1)
    })

    test('should update series name', async () => {
      const seriesId = testSeriesIds[0]!

      const updatedSeries = R.unwrap(await updateSerie(seriesId, { name: 'Updated Series Name' }))

      expect(updatedSeries.name).toBe('Updated Series Name')
    })

    test('should update subject category', async () => {
      const subjectId = testSubjectIds[0]!

      const updatedSubject = R.unwrap(await updateSubject(subjectId, { category: 'Autre' }))

      expect(updatedSubject.category).toBe('Autre')
    })

    test('should throw error when updating non-existent subject', async () => {
      const nonExistentId = 'non-existent-subject-id'

      expect(R.isFailure(await updateSubject(nonExistentId, { category: 'Autre' }))).toBe(true)
    })

    test('should throw error when updating non-existent grade', async () => {
      const nonExistentId = 'non-existent-grade-id'

      expect(R.isFailure(await updateGrade(nonExistentId, { order: 10 }))).toBe(true)
    })

    test('should throw error when updating non-existent serie', async () => {
      const nonExistentId = 'non-existent-serie-id'

      expect(R.isFailure(await updateSerie(nonExistentId, { name: 'Updated Name' }))).toBe(true)
    })

    test('should bulk update grades order', async () => {
      const [gradeId1, gradeId2] = [testGradeIds[0]!, testGradeIds[1]!]

      await R.unwrap(await bulkUpdateGradesOrder([
        { id: gradeId1, order: 10 },
        { id: gradeId2, order: 20 },
      ]))

      const updatedGrade1 = R.unwrap(await getGradeById(gradeId1))
      const updatedGrade2 = R.unwrap(await getGradeById(gradeId2))

      expect(updatedGrade1!.order).toBe(10)
      expect(updatedGrade2!.order).toBe(20)
    })
  })

  describe('delete Operations', () => {
    test('should delete grade', async () => {
      const testGrade = R.unwrap(await createGrade({
        name: 'Grade to Delete',
        code: `DEL-${Date.now()}`,
        order: 99,
        trackId: testTrackIds[0]!,
      }))

      // Verify grade exists
      let grade = R.unwrap(await getGradeById(testGrade.id))
      expect(grade).toBeDefined()

      // Delete grade
      await R.unwrap(await deleteGrade(testGrade.id))

      // Verify grade is deleted
      grade = R.unwrap(await getGradeById(testGrade.id))
      expect(grade).toBeNull()
    })

    test('should delete series', async () => {
      const testSerie = R.unwrap(await createSerie({
        name: 'Series to Delete',
        code: `DEL-${Date.now()}`,
        trackId: testTrackIds[0]!,
      }))

      // Verify series exists
      let serie = R.unwrap(await getSerieById(testSerie.id))
      expect(serie).toBeDefined()

      // Delete series
      await R.unwrap(await deleteSerie(testSerie.id))

      // Verify series is deleted
      serie = R.unwrap(await getSerieById(testSerie.id))
      expect(serie).toBeNull()
    })

    test('should delete subject', async () => {
      const testSubject = R.unwrap(await createSubject({
        name: 'Subject to Delete',
        shortName: 'DEL',
        category: 'Scientifique',
      }))

      // Verify subject exists
      let subject = R.unwrap(await getSubjectById(testSubject.id))
      expect(subject).toBeDefined()

      // Delete subject
      await R.unwrap(await deleteSubject(testSubject.id))

      // Verify subject is deleted
      subject = R.unwrap(await getSubjectById(testSubject.id))
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

      const newSeries = R.unwrap(await bulkCreateSeries(seriesData))

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

      const newSubjects = R.unwrap(await bulkCreateSubjects(subjectsData))

      expect(newSubjects).toHaveLength(3)
      expect(newSubjects[0]!.name).toBe('Bulk Subject A')
      expect(newSubjects[1]!.name).toBe('Bulk Subject B')
      expect(newSubjects[2]!.name).toBe('Bulk Subject C')

      // Add to cleanup
      testSubjectIds.push(...newSubjects.map(s => s.id))
    })

    test('should handle empty bulk operations', async () => {
      const emptySeries = R.unwrap(await bulkCreateSeries([]))
      const emptySubjects = R.unwrap(await bulkCreateSubjects([]))

      expect(emptySeries).toHaveLength(0)
      expect(emptySubjects).toHaveLength(0)
    })

    test('should handle bulk update grades order transaction', async () => {
      // Create additional grades for testing
      const extraGrades: string[] = []
      for (let i = 0; i < 3; i++) {
        const grade = R.unwrap(await createGrade({
          name: `Extra Grade ${i}`,
          code: `EG${i}-${Date.now()}`,
          order: i + 10,
          trackId: testTrackIds[0]!,
        }))
        extraGrades.push(grade.id)
      }

      try {
        // Reorder all grades
        const allGrades = R.unwrap(await getGrades({ trackId: testTrackIds[0]! }))
        const reorderData = allGrades.map((grade, index) => ({
          id: grade.id,
          order: index + 1,
        }))

        await R.unwrap(await bulkUpdateGradesOrder(reorderData))

        // Verify all orders are correct
        const reorderedGrades = R.unwrap(await getGrades({ trackId: testTrackIds[0]! }))
        expect(reorderedGrades.length).toBeGreaterThan(0)

        for (let i = 0; i < reorderedGrades.length; i++) {
          expect(reorderedGrades[i]!.order).toBe(i + 1)
        }
      }
      finally {
        // Clean up extra grades
        for (const id of extraGrades) {
          await R.unwrap(await deleteGrade(id))
        }
      }
    })
  })

  describe('catalog Stats', () => {
    test('should get catalog statistics', async () => {
      const stats = R.unwrap(await getCatalogStats())

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
        const subject = R.unwrap(await createSubject({
          name: `Pagination Subject ${i}`,
          shortName: `PS${i}`,
          category: 'Scientifique',
        }))
        additionalSubjects.push(subject.id)
      }

      try {
        // Test first page
        const page1 = R.unwrap(await getSubjects({ page: 1, limit: 5 }))
        expect(page1.subjects).toHaveLength(5)
        expect(page1.pagination.page).toBe(1)
        expect(page1.pagination.limit).toBe(5)

        // Test second page
        const page2 = R.unwrap(await getSubjects({ page: 2, limit: 5 }))
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
          await R.unwrap(await deleteSubject(id))
        }
      }
    })

    test('should search subjects by name and short name', async () => {
      // Create specific subjects for search testing
      const searchSubject1 = R.unwrap(await createSubject({
        name: 'Advanced Mathematics',
        shortName: 'ADV MATH',
        category: 'Scientifique',
      }))
      const searchSubject2 = R.unwrap(await createSubject({
        name: 'Basic Mathematics',
        shortName: 'BASIC',
        category: 'Scientifique',
      }))

      testSubjectIds.push(searchSubject1.id, searchSubject2.id)

      // Search by name
      const nameResults = R.unwrap(await getSubjects({ search: 'Mathematics' }))
      expect(nameResults.subjects.length).toBeGreaterThanOrEqual(3) // Original + 2 new

      // Search by short name
      const shortNameResults = R.unwrap(await getSubjects({ search: 'MATH' }))
      expect(shortNameResults.subjects.length).toBeGreaterThanOrEqual(2) // Original + 1 new

      // Search by case insensitive
      const caseInsensitiveResults = R.unwrap(await getSubjects({ search: 'math' }))
      expect(caseInsensitiveResults.subjects.length).toBeGreaterThan(0)

      // Search with no results
      const noResults = R.unwrap(await getSubjects({ search: 'NonExistentSubjectXYZ' }))
      expect(noResults.subjects).toHaveLength(0)
      expect(noResults.pagination.total).toBe(0)
    })

    test('should combine category and search filters', async () => {
      const results = R.unwrap(await getSubjects({
        category: 'Scientifique',
        search: 'Math',
      }))

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
        await R.unwrap(await deleteProgramTemplate(id))
        await R.unwrap(await deleteProgramTemplateChapter(id))
        await R.unwrap(await deleteGrade(id))
        await R.unwrap(await deleteSubject(id))
        await R.unwrap(await deleteSchoolYearTemplate(id))
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
    const schoolYear1 = R.unwrap(await createSchoolYearTemplate({
      name: `TEST__ 2024-2025 School Year ${Date.now()}`,
      isActive: true,
    }))
    testSchoolYearIds.push(schoolYear1.id)

    const schoolYear2 = R.unwrap(await createSchoolYearTemplate({
      name: `TEST__ 2025-2026 School Year ${Date.now()}`,
      isActive: false,
    }))
    testSchoolYearIds.push(schoolYear2.id)

    const testSubject = R.unwrap(await createSubject({
      name: `TEST__ Test Subject for Programs ${Date.now()}`,
      shortName: 'TEST__TSP',
      category: 'Scientifique',
    }))
    testSubjectIds.push(testSubject.id)

    // Create a track first
    const testTrack = R.unwrap(await createTrack({
      name: `TEST__ Test Track for Programs ${Date.now()}`,
      code: `TEST__TTP-${Date.now()}`,
      educationLevelId: 2, // Secondary
    }))

    const testGrade = R.unwrap(await createGrade({
      name: `TEST__ Test Grade for Programs ${Date.now()}`,
      code: `TEST__TGP-${Date.now()}`,
      order: 1,
      trackId: testTrack.id,
    }))
    testGradeIds.push(testGrade.id)

    // Create test programs
    const program1 = R.unwrap(await createProgramTemplate({
      name: 'TEST__ Mathematics Program 2024',
      schoolYearTemplateId: schoolYear1.id,
      subjectId: testSubject.id,
      gradeId: testGrade.id,
      status: 'draft',
    }))
    testProgramIds.push(program1.id)

    const program2 = R.unwrap(await createProgramTemplate({
      name: 'TEST__ Physics Program 2024',
      schoolYearTemplateId: schoolYear1.id,
      subjectId: testSubject.id,
      gradeId: testGrade.id,
      status: 'published',
    }))
    testProgramIds.push(program2.id)

    const program3 = R.unwrap(await createProgramTemplate({
      name: 'TEST__ Mathematics Program 2025',
      schoolYearTemplateId: schoolYear2.id,
      subjectId: testSubject.id,
      gradeId: testGrade.id,
      status: 'archived',
    }))
    testProgramIds.push(program3.id)

    // Create test chapters
    const chapter1 = R.unwrap(await createProgramTemplateChapter({
      title: 'TEST__ Introduction to Algebra',
      objectives: 'Understand basic algebraic concepts',
      order: 1,
      durationHours: 10,
      programTemplateId: program1.id,
    }))
    testChapterIds.push(chapter1.id)

    const chapter2 = R.unwrap(await createProgramTemplateChapter({
      title: 'TEST__ Advanced Algebra',
      objectives: 'Master complex algebraic operations',
      order: 2,
      durationHours: 15,
      programTemplateId: program1.id,
    }))
    testChapterIds.push(chapter2.id)

    const chapter3 = R.unwrap(await createProgramTemplateChapter({
      title: 'TEST__ Basic Physics',
      objectives: 'Introduction to physics principles',
      order: 1,
      durationHours: 8,
      programTemplateId: program2.id,
    }))
    testChapterIds.push(chapter3.id)
  })

  describe('school Year Templates', () => {
    test('should create school year template', async () => {
      const schoolYearData = {
        name: `TEST__ School Year ${Date.now()}`,
        isActive: true,
      }

      const schoolYear = R.unwrap(await createSchoolYearTemplate(schoolYearData))

      expect(schoolYear).toBeDefined()
      expect(schoolYear.id).toBeDefined()
      expect(schoolYear.name).toBe(schoolYearData.name)
      expect(schoolYear.isActive).toBe(schoolYearData.isActive)
      expect(schoolYear.createdAt).toBeInstanceOf(Date)
      expect(schoolYear.updatedAt).toBeInstanceOf(Date)
      testSchoolYearIds.push(schoolYear.id)
    })

    test('should get all school year templates', async () => {
      const schoolYears = R.unwrap(await getSchoolYearTemplates())

      expect(schoolYears).toBeDefined()
      expect(schoolYears.length).toBeGreaterThan(0)

      // Should be sorted by isActive (desc) then name (desc)
      expect(schoolYears[0]!.isActive).toBe(true)
    })

    test('should get school year template by ID', async () => {
      const schoolYearId = testSchoolYearIds[0]!
      const schoolYear = R.unwrap(await getSchoolYearTemplateById(schoolYearId))

      expect(schoolYear).toBeDefined()
      expect(schoolYear!.id).toBe(schoolYearId)
      expect(schoolYear!.name).toBeDefined()
    })

    test('should return null for non-existent school year', async () => {
      const schoolYear = R.unwrap(await getSchoolYearTemplateById('00000000-0000-0000-0000-000000000000'))

      expect(schoolYear).toBeNull()
    })

    test('should update school year template', async () => {
      const schoolYearId = testSchoolYearIds[0]!

      const updatedSchoolYear = R.unwrap(await updateSchoolYearTemplate(schoolYearId, {
        name: 'TEST__ Updated School Year Name',
        isActive: false,
      }))

      expect(updatedSchoolYear.name).toBe('TEST__ Updated School Year Name')
      expect(updatedSchoolYear.isActive).toBe(false)
    })

    test('should delete school year template', async () => {
      const testSchoolYear = R.unwrap(await createSchoolYearTemplate({
        name: 'TEST__ School Year to Delete',
        isActive: false,
      }))

      // Verify school year exists
      let schoolYear = R.unwrap(await getSchoolYearTemplateById(testSchoolYear.id))
      expect(schoolYear).toBeDefined()

      // Delete school year
      await R.unwrap(await deleteSchoolYearTemplate(testSchoolYear.id))

      // Verify school year is deleted
      schoolYear = R.unwrap(await getSchoolYearTemplateById(testSchoolYear.id))
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

      const program = R.unwrap(await createProgramTemplate(programData))

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
      const result = R.unwrap(await getProgramTemplates())

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
      const result = R.unwrap(await getProgramTemplates({ schoolYearTemplateId: schoolYearId }))

      expect(result.programs.length).toBeGreaterThanOrEqual(2)
      expect(result.programs.every((p: any) => p.schoolYearTemplateId === schoolYearId)).toBe(true)
    })

    test('should get programs by subject', async () => {
      const subjectId = testSubjectIds[0]!
      const result = R.unwrap(await getProgramTemplates({ subjectId }))

      expect(result.programs.length).toBeGreaterThanOrEqual(3)
      expect(result.programs.every((p: any) => p.subjectId === testSubjectIds[0])).toBe(true)
    })

    test('should get programs by grade', async () => {
      const gradeId = testGradeIds[0]!
      const result = R.unwrap(await getProgramTemplates({ gradeId }))

      expect(result.programs.length).toBeGreaterThanOrEqual(3)
      expect(result.programs.every((p: any) => p.gradeId === gradeId)).toBe(true)
    })

    test('should get programs by status', async () => {
      const draftResult = R.unwrap(await getProgramTemplates({ status: 'draft' }))
      const publishedResult = R.unwrap(await getProgramTemplates({ status: 'published' }))
      const archivedResult = R.unwrap(await getProgramTemplates({ status: 'archived' }))

      expect(draftResult.programs.length).toBeGreaterThanOrEqual(1)
      expect(publishedResult.programs.length).toBeGreaterThanOrEqual(1)
      expect(archivedResult.programs.length).toBeGreaterThanOrEqual(1)

      expect(draftResult.programs.every((p: any) => p.status === 'draft')).toBe(true)
      expect(publishedResult.programs.every((p: any) => p.status === 'published')).toBe(true)
      expect(archivedResult.programs.every((p: any) => p.status === 'archived')).toBe(true)
    })

    test('should search programs by name', async () => {
      const result = R.unwrap(await getProgramTemplates({ search: 'Mathematics' }))

      expect(result.programs.length).toBeGreaterThanOrEqual(2)
      expect(result.programs.every((p: any) => p.name.includes('Mathematics'))).toBe(true)
    })

    test('should get single program with relations by ID', async () => {
      const programId = testProgramIds[0]!
      const program = R.unwrap(await getProgramTemplateById(programId))

      expect(program).toBeDefined()
      expect(program!.id).toBe(programId)
      expect(program!.schoolYearTemplate).toBeDefined()
      expect(program!.subject).toBeDefined()
      expect(program!.grade).toBeDefined()
    })

    test('should update program template', async () => {
      const programId = testProgramIds[0]!

      const updatedProgram = R.unwrap(await updateProgramTemplate(programId, {
        name: 'TEST__ Updated Program Name',
        status: 'published',
      }))

      expect(updatedProgram.name).toBe('TEST__ Updated Program Name')
      expect(updatedProgram.status).toBe('published')
    })

    test('should delete program template with chapters', async () => {
      const testProgram = R.unwrap(await createProgramTemplate({
        name: 'TEST__ Program to Delete',
        schoolYearTemplateId: testSchoolYearIds[0]!,
        subjectId: testSubjectIds[0]!,
        gradeId: testGradeIds[0]!,
        status: 'draft',
      }))

      // Create a chapter for the program
      await createProgramTemplateChapter({
        title: 'TEST__ Chapter to Delete',
        order: 1,
        programTemplateId: testProgram.id,
      })

      // Verify program exists
      let program = R.unwrap(await getProgramTemplateById(testProgram.id))
      expect(program).toBeDefined()

      // Delete program (should also delete chapters)
      await deleteProgramTemplate(testProgram.id)

      // Verify program is deleted
      program = R.unwrap(await getProgramTemplateById(testProgram.id))
      expect(program).toBeNull()
    })

    test('should clone program template', async () => {
      const sourceProgramId = testProgramIds[0]!
      const targetSchoolYearId = testSchoolYearIds[0]!

      const clonedProgram = R.unwrap(await cloneProgramTemplate(
        sourceProgramId!,
        targetSchoolYearId,
        'TEST__ Cloned Mathematics Program',
      ))

      expect(clonedProgram).toBeDefined()
      expect(clonedProgram.id).not.toBe(sourceProgramId!)
      expect(clonedProgram.name).toBe('TEST__ Cloned Mathematics Program')
      expect(clonedProgram.schoolYearTemplateId).toBe(targetSchoolYearId)
      expect(clonedProgram.subjectId).toBeDefined()
      expect(clonedProgram.gradeId).toBeDefined()

      // Verify chapters were cloned
      const clonedChapters = R.unwrap(await getProgramTemplateChapters(clonedProgram.id))
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

      const chapter = R.unwrap(await createProgramTemplateChapter(chapterData))

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
      const chapters = R.unwrap(await getProgramTemplateChapters(programId))

      expect(chapters).toBeDefined()
      expect(chapters.length).toBeGreaterThanOrEqual(2)

      // Should be sorted by order
      for (let i = 1; i < chapters.length; i++) {
        expect(chapters[i]!.order).toBeGreaterThan(chapters[i - 1]!.order)
      }
    })

    test('should get chapter by ID', async () => {
      const chapterId = testChapterIds[0]!
      const chapter = R.unwrap(await getProgramTemplateChapterById(chapterId))

      expect(chapter).toBeDefined()
      expect(chapter!.id).toBe(chapterId)
      expect(chapter!.title).toBeDefined()
    })

    test('should update program template chapter', async () => {
      const chapterId = testChapterIds[0]!

      const updatedChapter = R.unwrap(await updateProgramTemplateChapter(chapterId, {
        title: 'Updated Chapter Title',
        order: 99,
        durationHours: 25,
      }))

      expect(updatedChapter.title).toBe('Updated Chapter Title')
      expect(updatedChapter.order).toBe(99)
      expect(updatedChapter.durationHours).toBe(25)
    })

    test('should delete program template chapter', async () => {
      const testChapter = R.unwrap(await createProgramTemplateChapter({
        title: 'TEST__ Chapter to Delete',
        order: 99,
        programTemplateId: testProgramIds[0]!,
      }))

      // Verify chapter exists
      let chapter = R.unwrap(await getProgramTemplateChapterById(testChapter.id))
      expect(chapter).toBeDefined()

      // Delete chapter
      await deleteProgramTemplateChapter(testChapter.id)

      // Verify chapter is deleted
      chapter = R.unwrap(await getProgramTemplateChapterById(testChapter.id))
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

      const newChapters = R.unwrap(await bulkCreateChapters(testProgramIds[0]!, chaptersData))

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
      const chapters = R.unwrap(await getProgramTemplateChapters(programId))

      if (chapters.length >= 2) {
        const [chapterId1, chapterId2] = [chapters[0]!.id, chapters[1]!.id]

        // Swap orders
        await bulkUpdateChaptersOrder([
          { id: chapterId1, order: 20 },
          { id: chapterId2, order: 10 },
        ])

        const updatedChapter1 = R.unwrap(await getProgramTemplateChapterById(chapterId1))
        const updatedChapter2 = R.unwrap(await getProgramTemplateChapterById(chapterId2))

        expect(updatedChapter1!.order).toBe(20)
        expect(updatedChapter2!.order).toBe(10)
      }
    })

    test('should handle empty bulk operations', async () => {
      const emptyChapters = R.unwrap(await bulkCreateChapters(testProgramIds[0]!, []))

      expect(emptyChapters).toHaveLength(0)

      // Should not throw error
      await bulkUpdateChaptersOrder([])
    })
  })

  describe('program Versioning', () => {
    test('should publish program creating version snapshot', async () => {
      const programId = testProgramIds[0]!

      // Verify initial status
      const initialProgram = R.unwrap(await getProgramTemplateById(programId))
      expect(initialProgram!.status).toBe('draft')

      // Publish program
      const publishResult = R.unwrap(await publishProgram(programId))

      expect(publishResult.success).toBe(true)
      expect(publishResult.version).toBe(1)

      // Verify status changed to published
      const updatedProgram = R.unwrap(await getProgramTemplateById(programId))
      expect(updatedProgram!.status).toBe('published')

      // Verify version was created
      const versions = R.unwrap(await getProgramVersions(programId))
      expect(versions).toHaveLength(1)
      expect(versions[0]!.versionNumber).toBe(1)
      expect(versions[0]!.snapshotData).toBeDefined()
    })

    test('should publish multiple versions incrementally', async () => {
      // Create a new program for versioning test
      const testProgram = R.unwrap(await createProgramTemplate({
        name: 'TEST__ Versioning Test Program',
        schoolYearTemplateId: testSchoolYearIds[0]!,
        subjectId: testSubjectIds[0]!,
        gradeId: testGradeIds[0]!,
        status: 'draft',
      }))

      testProgramIds.push(testProgram.id)

      // First publish
      const result1 = R.unwrap(await publishProgram(testProgram.id))
      expect(result1.version).toBe(1)

      // Update program
      await updateProgramTemplate(testProgram.id, { name: 'TEST__ Updated Versioning Program' })

      // Second publish
      const result2 = R.unwrap(await publishProgram(testProgram.id))
      expect(result2.version).toBe(2)

      // Verify versions
      const versions = R.unwrap(await getProgramVersions(testProgram.id))
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

      const versions = R.unwrap(await getProgramVersions(programId))

      expect(versions.length).toBeGreaterThanOrEqual(2)

      // Should be sorted by version number (desc)
      for (let i = 1; i < versions.length; i++) {
        expect(versions[i]!.versionNumber).toBeLessThan(versions[i - 1]!.versionNumber)
      }
    })

    test('should restore program from version', async () => {
      // Create program with initial data
      const testProgram = R.unwrap(await createProgramTemplate({
        name: 'TEST__ Original Program Name',
        schoolYearTemplateId: testSchoolYearIds[0]!,
        subjectId: testSubjectIds[0]!,
        gradeId: testGradeIds[0]!,
        status: 'draft',
      }))

      // Add initial chapters
      await bulkCreateChapters(testProgram.id, [
        { title: 'Original Chapter 1', order: 1, durationHours: 5 },
        { title: 'Original Chapter 2', order: 2, durationHours: 10 },
      ])

      // Publish to create version
      await publishProgram(testProgram.id)

      // Update program
      await updateProgramTemplate(testProgram.id, { name: 'TEST__ Modified Program Name' })
      const chapters = R.unwrap(await getProgramTemplateChapters(testProgram.id))
      if (chapters.length > 0) {
        await deleteProgramTemplateChapter(chapters[0]!.id)
      }
      await bulkCreateChapters(testProgram.id, [
        { title: 'New Chapter', order: 1, durationHours: 15 },
      ])

      // Get version to restore
      const versions = R.unwrap(await getProgramVersions(testProgram.id))
      const firstVersion = versions[0]!

      // Restore from version
      const restoreResult = R.unwrap(await restoreProgramVersion(firstVersion!.id))

      expect(restoreResult.success).toBe(true)

      // Verify restoration
      const restoredProgram = R.unwrap(await getProgramTemplateById(testProgram.id))
      expect(restoredProgram!.name).toBe('TEST__ Original Program Name')
      expect(restoredProgram!.status).toBe('draft') // Should revert to draft

      const restoredChapters = R.unwrap(await getProgramTemplateChapters(testProgram.id))
      expect(restoredChapters).toHaveLength(2) // Should have original 2 chapters
      expect(restoredChapters.some((c: any) => c.title === 'Original Chapter 1')).toBe(true)
      expect(restoredChapters.some((c: any) => c.title === 'Original Chapter 2')).toBe(true)

      testProgramIds.push(testProgram.id)
    })
  })

  describe('program Statistics', () => {
    test('should get program statistics', async () => {
      const stats = R.unwrap(await getProgramStats())

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
        const program = R.unwrap(await createProgramTemplate({
          name: `TEST__ Pagination Program ${i}`,
          schoolYearTemplateId: testSchoolYearIds[0]!,
          subjectId: testSubjectIds[0]!,
          gradeId: testGradeIds[0]!,
          status: 'draft',
        }))
        additionalPrograms.push(program.id)
      }

      try {
        // Test first page
        const page1 = R.unwrap(await getProgramTemplates({ page: 1, limit: 5 }))
        expect(page1.programs).toHaveLength(5)
        expect(page1.pagination.page).toBe(1)
        expect(page1.pagination.limit).toBe(5)

        // Test second page
        const page2 = R.unwrap(await getProgramTemplates({ page: 2, limit: 5 }))
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
      const result = R.unwrap(await getProgramTemplates({
        schoolYearTemplateId: schoolYearId,
        subjectId,
        status: 'draft',
        search: 'Mathematics',
      }))

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
      const result = R.unwrap(await getProgramTemplates({ search: 'NonExistentProgramXYZ' }))

      expect(result.programs).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })
  })
})
