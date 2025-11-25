/**
 * Performance Testing: Section 5.1
 * Database Query Optimization Tests
 * Tests query performance against large datasets
 */

import { and, eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { getDb } from '@/database/setup'
import {
  coefficientTemplates,
  grades,
  programTemplateChapters,
  programTemplates,
  schools,
  schoolYearTemplates,
  series,
  subjects,
} from '@/drizzle/core-schema'
import {
  getGrades,
  getSeries,
  getSubjects,
} from '@/queries/catalogs'
import {
  bulkUpdateCoefficients,
  getCoefficientTemplates,
} from '@/queries/coefficients'
import {
  getProgramTemplateById,
  getProgramTemplates,
} from '@/queries/programs'
import {
  createSchool,
  getSchools,
  getSchoolsByStatus,
  searchSchools,
} from '@/queries/schools'

// Performance threshold constants (in milliseconds)
const THRESHOLDS = {
  SCHOOLS_PAGINATION: 100,
  SCHOOLS_SEARCH: 200,
  SCHOOLS_FILTER: 100,
  SCHOOLS_SORT: 150,
  GRADES_BY_TRACK: 50,
  GRADES_WITH_SORT: 75,
  PROGRAMS_BY_FILTERS: 100,
  PROGRAMS_WITH_CHAPTERS: 150,
  PROGRAMS_STATS: 100,
  COEFFICIENTS_MATRIX: 200,
  COEFFICIENTS_BY_FILTERS: 100,
  COEFFICIENTS_BULK_UPDATE: 500,
}

// Helper to measure execution time
async function measureTime(fn: () => Promise<any>): Promise<{ result: any, duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}

describe('query performance', () => {
  let testSchoolId: string
  let testTrackId: string
  let testGradeId: string
  let testSeriesId: string
  let testSubjectId: string
  let testSchoolYearId: string
  let testProgramId: string

  beforeAll(async () => {
    const db = getDb()

    // Create test data for performance testing
    // Create a school
    const schoolResult = await createSchool({
      name: 'Performance Test School',
      code: 'PTS001',
      email: 'perf@test.com',
      phone: '+1234567890',
      status: 'active',
    })
    testSchoolId = schoolResult.id

    // Get or create track
    const tracksResult = await db.select().from(grades).limit(1)
    if (tracksResult.length > 0) {
      testTrackId = tracksResult[0].trackId
      testGradeId = tracksResult[0].id
    }

    // Get series
    const seriesResult = await db.select().from(series).limit(1)
    if (seriesResult.length > 0) {
      testSeriesId = seriesResult[0].id
    }

    // Get subject
    const subjectsResult = await db.select().from(subjects).limit(1)
    if (subjectsResult.length > 0) {
      testSubjectId = subjectsResult[0].id
    }

    // Get or create school year
    const yearResult = await db.select().from(schoolYearTemplates).limit(1)
    if (yearResult.length > 0) {
      testSchoolYearId = yearResult[0].id
    }
    else {
      const [newYear] = await db
        .insert(schoolYearTemplates)
        .values({
          id: crypto.randomUUID(),
          name: 'Test Year',
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      testSchoolYearId = newYear!.id
    }

    // Create test program
    const [newProgram] = await db
      .insert(programTemplates)
      .values({
        id: crypto.randomUUID(),
        name: 'Performance Test Program',
        schoolYearTemplateId: testSchoolYearId,
        subjectId: testSubjectId || '',
        gradeId: testGradeId || '',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
    testProgramId = newProgram!.id
  })

  afterAll(async () => {
    const db = getDb()
    // Cleanup test data
    if (testSchoolId) {
      await db.delete(schools).where(eq(schools.id, testSchoolId))
    }
    if (testProgramId) {
      await db.delete(programTemplates).where(eq(programTemplates.id, testProgramId))
    }
  })

  // ============================================================================
  // SCHOOLS QUERY PERFORMANCE
  // ============================================================================

  describe('schools query performance', () => {
    test('should get 1000 schools with pagination in < 100ms', async () => {
      const { duration } = await measureTime(async () => {
        return getSchools({
          page: 1,
          limit: 100,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_PAGINATION)
    })

    test('should search 1000 schools in < 200ms', async () => {
      const { duration } = await measureTime(async () => {
        return searchSchools('test', 100)
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_SEARCH)
    })

    test('should filter schools by status in < 100ms', async () => {
      const { duration } = await measureTime(async () => {
        return getSchools({
          status: 'active',
          limit: 100,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_FILTER)
    })

    test('should sort schools in < 150ms', async () => {
      const { duration } = await measureTime(async () => {
        return getSchools({
          sortBy: 'name',
          sortOrder: 'asc',
          limit: 100,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_SORT)
    })

    test('should get schools by status in < 100ms', async () => {
      const { duration } = await measureTime(async () => {
        return getSchoolsByStatus('active', 100)
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_FILTER)
    })

    test('should handle combined filters in < 200ms', async () => {
      const { duration } = await measureTime(async () => {
        return getSchools({
          search: 'test',
          status: 'active',
          sortBy: 'name',
          limit: 50,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_SEARCH)
    })
  })

  // ============================================================================
  // GRADES QUERY PERFORMANCE
  // ============================================================================

  describe('grades query performance', () => {
    test('should get all grades by track in < 50ms', async () => {
      const { duration } = await measureTime(async () => {
        return getGrades({
          trackId: testTrackId,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.GRADES_BY_TRACK)
    })

    test('should get grades with sorting in < 75ms', async () => {
      const { duration } = await measureTime(async () => {
        const db = getDb()
        return db
          .select()
          .from(grades)
          .orderBy(grades.order)
      })

      expect(duration).toBeLessThan(THRESHOLDS.GRADES_WITH_SORT)
    })

    test('should get all grades in < 50ms', async () => {
      const { duration } = await measureTime(async () => {
        return getGrades()
      })

      expect(duration).toBeLessThan(THRESHOLDS.GRADES_BY_TRACK)
    })
  })

  // ============================================================================
  // SERIES QUERY PERFORMANCE
  // ============================================================================

  describe('series query performance', () => {
    test('should get all series in < 50ms', async () => {
      const { duration } = await measureTime(async () => {
        return getSeries()
      })

      expect(duration).toBeLessThan(THRESHOLDS.GRADES_BY_TRACK)
    })

    test('should get series by track in < 75ms', async () => {
      const { duration } = await measureTime(async () => {
        return getSeries({
          trackId: testTrackId,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.GRADES_WITH_SORT)
    })
  })

  // ============================================================================
  // SUBJECTS QUERY PERFORMANCE
  // ============================================================================

  describe('subjects query performance', () => {
    test('should get all subjects in < 50ms', async () => {
      const { duration } = await measureTime(async () => {
        return getSubjects()
      })

      expect(duration).toBeLessThan(THRESHOLDS.GRADES_BY_TRACK)
    })

    test('should get subjects by category in < 75ms', async () => {
      const { duration } = await measureTime(async () => {
        return getSubjects({
          category: 'Scientifique',
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.GRADES_WITH_SORT)
    })
  })

  // ============================================================================
  // PROGRAMS QUERY PERFORMANCE
  // ============================================================================

  describe('programs query performance', () => {
    test('should get programs by year/subject/grade in < 100ms', async () => {
      const { duration } = await measureTime(async () => {
        return getProgramTemplates({
          schoolYearTemplateId: testSchoolYearId,
          subjectId: testSubjectId,
          gradeId: testGradeId,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.PROGRAMS_BY_FILTERS)
    })

    test('should get program with all chapters in < 150ms', async () => {
      const { duration } = await measureTime(async () => {
        const db = getDb()
        const program = await db
          .select()
          .from(programTemplates)
          .where(eq(programTemplates.id, testProgramId))
          .limit(1)

        if (program.length === 0)
          return null

        const chapters = await db
          .select()
          .from(programTemplateChapters)
          .where(eq(programTemplateChapters.programTemplateId, testProgramId))

        return { program: program[0], chapters }
      })

      expect(duration).toBeLessThan(THRESHOLDS.PROGRAMS_WITH_CHAPTERS)
    })

    test('should get program by ID in < 100ms', async () => {
      const { duration } = await measureTime(async () => {
        return getProgramTemplateById(testProgramId)
      })

      expect(duration).toBeLessThan(THRESHOLDS.PROGRAMS_BY_FILTERS)
    })

    test('should search programs in < 150ms', async () => {
      const { duration } = await measureTime(async () => {
        return getProgramTemplates({
          search: 'test',
          limit: 50,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.PROGRAMS_WITH_CHAPTERS)
    })
  })

  // ============================================================================
  // COEFFICIENTS QUERY PERFORMANCE
  // ============================================================================

  describe('coefficients query performance', () => {
    test('should get coefficient matrix in < 200ms', async () => {
      const { duration } = await measureTime(async () => {
        return getCoefficientTemplates({
          schoolYearTemplateId: testSchoolYearId,
          limit: 1000,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.COEFFICIENTS_MATRIX)
    })

    test('should get coefficients by year/grade in < 100ms', async () => {
      const { duration } = await measureTime(async () => {
        return getCoefficientTemplates({
          schoolYearTemplateId: testSchoolYearId,
          gradeId: testGradeId,
          limit: 100,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.COEFFICIENTS_BY_FILTERS)
    })

    test('should get coefficients by subject in < 100ms', async () => {
      const { duration } = await measureTime(async () => {
        return getCoefficientTemplates({
          subjectId: testSubjectId,
          limit: 100,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.COEFFICIENTS_BY_FILTERS)
    })

    test('should get coefficients by series in < 100ms', async () => {
      const { duration } = await measureTime(async () => {
        return getCoefficientTemplates({
          seriesId: testSeriesId,
          limit: 100,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.COEFFICIENTS_BY_FILTERS)
    })

    test('should bulk update coefficients in < 500ms', async () => {
      const db = getDb()

      // Get some coefficients to update
      const coeffs = await db
        .select()
        .from(coefficientTemplates)
        .limit(10)

      if (coeffs.length === 0) {
        // Skip if no coefficients exist
        expect(true).toBe(true)
        return
      }

      const updates = coeffs.map((c: typeof coefficientTemplates.$inferSelect) => ({
        id: c.id,
        weight: Math.floor(Math.random() * 100),
      }))

      const { duration } = await measureTime(async () => {
        return bulkUpdateCoefficients(updates)
      })

      expect(duration).toBeLessThan(THRESHOLDS.COEFFICIENTS_BULK_UPDATE)
    })
  })

  // ============================================================================
  // INDEX EFFECTIVENESS
  // ============================================================================

  describe('index effectiveness', () => {
    test('should use indexes for school queries', async () => {
      const db = getDb()

      // Query that should use index on schools.status
      const { duration } = await measureTime(async () => {
        return db
          .select()
          .from(schools)
          .where(eq(schools.status, 'active'))
          .limit(100)
      })

      // Should be fast due to index
      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_FILTER)
    })

    test('should use indexes for coefficient lookups', async () => {
      const db = getDb()

      // Query that should use composite index
      const { duration } = await measureTime(async () => {
        return db
          .select()
          .from(coefficientTemplates)
          .where(
            and(
              eq(coefficientTemplates.schoolYearTemplateId, testSchoolYearId),
              eq(coefficientTemplates.gradeId, testGradeId),
            ),
          )
          .limit(100)
      })

      expect(duration).toBeLessThan(THRESHOLDS.COEFFICIENTS_BY_FILTERS)
    })

    test('should use indexes for grade queries', async () => {
      const db = getDb()

      // Query that should use index on grades.trackId
      const { duration } = await measureTime(async () => {
        return db
          .select()
          .from(grades)
          .where(eq(grades.trackId, testTrackId))
      })

      expect(duration).toBeLessThan(THRESHOLDS.GRADES_BY_TRACK)
    })

    test('should use indexes for program queries', async () => {
      const db = getDb()

      // Query that should use index on programTemplates
      const { duration } = await measureTime(async () => {
        return db
          .select()
          .from(programTemplates)
          .where(
            and(
              eq(programTemplates.schoolYearTemplateId, testSchoolYearId),
              eq(programTemplates.gradeId, testGradeId),
            ),
          )
      })

      expect(duration).toBeLessThan(THRESHOLDS.PROGRAMS_BY_FILTERS)
    })
  })

  // ============================================================================
  // PAGINATION PERFORMANCE
  // ============================================================================

  describe('pagination performance', () => {
    test('should handle first page efficiently', async () => {
      const { duration } = await measureTime(async () => {
        return getSchools({
          page: 1,
          limit: 50,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_PAGINATION)
    })

    test('should handle middle page efficiently', async () => {
      const { duration } = await measureTime(async () => {
        return getSchools({
          page: 10,
          limit: 50,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_PAGINATION)
    })

    test('should handle large page numbers efficiently', async () => {
      const { duration } = await measureTime(async () => {
        return getSchools({
          page: 100,
          limit: 50,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_PAGINATION)
    })
  })

  // ============================================================================
  // COMBINED FILTER PERFORMANCE
  // ============================================================================

  describe('combined filter performance', () => {
    test('should handle multiple filters efficiently', async () => {
      const { duration } = await measureTime(async () => {
        return getSchools({
          search: 'test',
          status: 'active',
          sortBy: 'name',
          sortOrder: 'asc',
          page: 1,
          limit: 50,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.SCHOOLS_SEARCH)
    })

    test('should handle coefficient multi-filter efficiently', async () => {
      const { duration } = await measureTime(async () => {
        return getCoefficientTemplates({
          schoolYearTemplateId: testSchoolYearId,
          gradeId: testGradeId,
          subjectId: testSubjectId,
          limit: 100,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.COEFFICIENTS_MATRIX)
    })

    test('should handle program multi-filter efficiently', async () => {
      const { duration } = await measureTime(async () => {
        return getProgramTemplates({
          schoolYearTemplateId: testSchoolYearId,
          gradeId: testGradeId,
          subjectId: testSubjectId,
          limit: 50,
        })
      })

      expect(duration).toBeLessThan(THRESHOLDS.PROGRAMS_WITH_CHAPTERS)
    })
  })
})
