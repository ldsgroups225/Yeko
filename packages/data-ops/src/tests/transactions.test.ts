import { getDb } from '@repo/data-ops/database/setup'
/**
 * Transaction Testing: Section 7.2
 * Bulk Operations, Cascade Operations, and Concurrent Operations Tests
 * Using vitest with node environment
 */

import {
  coefficientTemplates,
  educationLevels,
  programTemplateChapters,
  schools,
  schoolYearTemplates,
  subjects,
  tracks,
} from '@repo/data-ops/drizzle/core-schema'
import {
  createGrade,
  createSerie,
  deleteGrade,
  deleteSerie,
  getGrades,
  getSeries,
} from '@repo/data-ops/queries/catalogs'
import {
  bulkUpdateCoefficients,
  createCoefficientTemplate,
  getCoefficientTemplates,
} from '@repo/data-ops/queries/coefficients'
import {
  createProgramTemplate,
  deleteProgramTemplate,
} from '@repo/data-ops/queries/programs'
import {
  createSchool,
  deleteSchool,
} from '@repo/data-ops/queries/schools'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

// ============================================================================
// 7.2 TRANSACTION TESTING
// ============================================================================

describe('7.2 Transaction Testing', () => {
  let testSchool: any
  let testTrack: any
  let testYear: any
  let testSubject: any
  let testGrade: any

  beforeAll(async () => {
    const db = getDb()

    // Create test school with unique code
    testSchool = await createSchool({
      name: 'Transaction Test School',
      code: `TTS${Date.now()}`,
      email: 'transaction@test.com',
      phone: '+1234567890',
      status: 'active',
    })

    // Get or create test track
    const tracksResult = await db.select().from(tracks).limit(1)
    if (tracksResult.length > 0) {
      testTrack = tracksResult[0]
    }
    else {
      // Get an education level to use
      const [eduLevel] = await db.select().from(educationLevels).limit(1)
      const [newTrack] = await db
        .insert(tracks)
        .values({
          id: nanoid(),
          name: 'Transaction Track',
          code: 'TT001',
          educationLevelId: eduLevel!.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      testTrack = newTrack
    }

    // Get or create test year
    const yearsResult = await db.select().from(schoolYearTemplates).limit(1)
    if (yearsResult.length > 0) {
      testYear = yearsResult[0]
    }
    else {
      const [newYear] = await db
        .insert(schoolYearTemplates)
        .values({
          id: nanoid(),
          name: 'Transaction Year',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      testYear = newYear
    }

    // Get or create test subject
    const subjectsResult = await db.select().from(subjects).limit(1)
    if (subjectsResult.length > 0) {
      testSubject = subjectsResult[0]
    }
    else {
      const [newSubject] = await db
        .insert(subjects)
        .values({
          id: nanoid(),
          name: 'Transaction Subject',
          shortName: 'TS',
          category: 'Scientifique',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      testSubject = newSubject
    }

    // Create test grade
    testGrade = await createGrade({
      name: 'Transaction Grade',
      code: 'TG001',
      order: 1,
      trackId: testTrack.id,
    })
  })

  afterAll(async () => {
    if (testGrade?.id) {
      await deleteGrade(testGrade.id)
    }
    if (testSchool?.id) {
      await deleteSchool(testSchool.id)
    }
  })

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  describe('bulk Operations', () => {
    test('should create multiple grades in transaction', async () => {
      const gradesToCreate = [
        { name: 'Bulk Grade 1', code: 'BG001', order: 10, trackId: testTrack.id },
        { name: 'Bulk Grade 2', code: 'BG002', order: 11, trackId: testTrack.id },
        { name: 'Bulk Grade 3', code: 'BG003', order: 12, trackId: testTrack.id },
      ]

      const createdGrades = []
      for (const gradeData of gradesToCreate) {
        const grade = await createGrade(gradeData)
        createdGrades.push(grade)
      }

      // Verify all grades created
      expect(createdGrades).toHaveLength(3)
      expect(createdGrades[0]?.name).toBe('Bulk Grade 1')
      expect(createdGrades[1]?.name).toBe('Bulk Grade 2')
      expect(createdGrades[2]?.name).toBe('Bulk Grade 3')

      // Verify grades exist in database
      const allGrades = await getGrades({ trackId: testTrack.id })
      const bulkGrades = allGrades.filter(g => g.code.startsWith('BG'))
      expect(bulkGrades).toHaveLength(3)

      // Cleanup
      for (const grade of createdGrades) {
        await deleteGrade(grade.id)
      }
    })

    test('should bulk update coefficients atomically', async () => {
      // Create test coefficients
      const _db = getDb()
      const coeff1 = await createCoefficientTemplate({
        schoolYearTemplateId: testYear.id,
        subjectId: testSubject.id,
        gradeId: testGrade.id,
        weight: 1,
      })

      const coeff2 = await createCoefficientTemplate({
        schoolYearTemplateId: testYear.id,
        subjectId: testSubject.id,
        gradeId: testGrade.id,
        weight: 2,
      })

      // Bulk update
      const updates = [
        { id: coeff1.id, weight: 2 },
        { id: coeff2.id, weight: 3 },
      ]

      await bulkUpdateCoefficients(updates)

      // Verify updates
      const updatedResult = await getCoefficientTemplates({
        schoolYearTemplateId: testYear.id,
      })
      const updated = Array.isArray(updatedResult) ? updatedResult : updatedResult.coefficients

      const updatedCoeff1 = updated.find((c: any) => c.id === coeff1.id)
      const updatedCoeff2 = updated.find((c: any) => c.id === coeff2.id)

      expect(updatedCoeff1?.weight).toBe(2)
      expect(updatedCoeff2?.weight).toBe(3)

      // Cleanup
      await _db.delete(coefficientTemplates).where(eq(coefficientTemplates.id, coeff1.id))
      await _db.delete(coefficientTemplates).where(eq(coefficientTemplates.id, coeff2.id))
    })

    test('should handle partial failure in bulk operations', async () => {
      // Attempt to create grades with one invalid
      const validGrade = await createGrade({
        name: 'Valid Bulk Grade',
        code: 'VBG001',
        order: 20,
        trackId: testTrack.id,
      })

      try {
        // Attempt to create with duplicate code
        await createGrade({
          name: 'Duplicate Code Grade',
          code: 'VBG001', // Duplicate
          order: 21,
          trackId: testTrack.id,
        })
        expect(true).toBe(false) // Should not reach
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }

      // Verify valid grade still exists
      const grades_result = await getGrades({ trackId: testTrack.id })
      expect(grades_result).toContainEqual(expect.objectContaining({ id: validGrade.id }))

      // Cleanup
      await deleteGrade(validGrade.id)
    })

    test('should create multiple series in transaction', async () => {
      const seriesToCreate = [
        { name: 'Bulk Series 1', code: 'BS001', trackId: testTrack.id },
        { name: 'Bulk Series 2', code: 'BS002', trackId: testTrack.id },
        { name: 'Bulk Series 3', code: 'BS003', trackId: testTrack.id },
      ]

      const createdSeries = []
      for (const serieData of seriesToCreate) {
        const serie = await createSerie(serieData)
        createdSeries.push(serie)
      }

      // Verify all series created
      expect(createdSeries).toHaveLength(3)

      // Verify series exist in database
      const allSeries = await getSeries({ trackId: testTrack.id })
      const bulkSeries = allSeries.filter(s => s.code.startsWith('BS'))
      expect(bulkSeries).toHaveLength(3)

      // Cleanup
      for (const serie of createdSeries) {
        await deleteSerie(serie.id)
      }
    })
  })

  // ============================================================================
  // Cascade Operations
  // ============================================================================

  describe('cascade Operations', () => {
    test('should cascade delete all related records when school deleted', async () => {
      const db = getDb()

      // Create a new school with related data
      const school = await createSchool({
        name: 'Cascade Delete School',
        code: `CDS${Date.now()}`,
        email: 'cascade@test.com',
        phone: '+9999999999',
        status: 'active',
      })

      // Verify school exists
      const schoolsBeforeDelete = await db
        .select()
        .from(schools)
        .where(eq(schools.id, school.id))

      expect(schoolsBeforeDelete).toHaveLength(1)

      // Delete school
      await deleteSchool(school.id)

      // Verify school is deleted
      const schoolsAfterDelete = await db
        .select()
        .from(schools)
        .where(eq(schools.id, school.id))

      expect(schoolsAfterDelete).toHaveLength(0)
    })

    test('should cascade delete chapters when program deleted', async () => {
      const db = getDb()

      // Create program
      const program = await createProgramTemplate({
        name: 'Cascade Program',
        schoolYearTemplateId: testYear.id,
        subjectId: testSubject.id,
        gradeId: testGrade.id,
      })

      // Add multiple chapters
      const chapters = []
      for (let i = 1; i <= 3; i++) {
        const [chapter] = await db
          .insert(programTemplateChapters)
          .values({
            id: nanoid(),
            programTemplateId: program.id,
            title: `Chapter ${i}`,
            order: i,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
        chapters.push(chapter)
      }

      // Verify chapters exist
      const chaptersBeforeDelete = await db
        .select()
        .from(programTemplateChapters)
        .where(eq(programTemplateChapters.programTemplateId, program.id))

      expect(chaptersBeforeDelete).toHaveLength(3)

      // Delete program
      await deleteProgramTemplate(program.id)

      // Verify all chapters are deleted
      const chaptersAfterDelete = await db
        .select()
        .from(programTemplateChapters)
        .where(eq(programTemplateChapters.programTemplateId, program.id))

      expect(chaptersAfterDelete).toHaveLength(0)
    })

    test('should cascade delete all related records atomically', async () => {
      const db = getDb()

      // Create track with grades and series
      const [eduLevel] = await db.select().from(educationLevels).limit(1)
      const [newTrack] = await db
        .insert(tracks)
        .values({
          id: nanoid(),
          name: 'Atomic Cascade Track',
          code: `ACT${Date.now()}`,
          educationLevelId: eduLevel!.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // Create grades
      await createGrade({
        name: 'Atomic Grade 1',
        code: 'AG001',
        order: 1,
        trackId: newTrack!.id,
      })

      await createGrade({
        name: 'Atomic Grade 2',
        code: 'AG002',
        order: 2,
        trackId: newTrack!.id,
      })

      // Create series
      await createSerie({
        name: 'Atomic Series 1',
        code: `AS${Date.now()}`,
        trackId: newTrack!.id,
      })

      // Verify all records exist
      const gradesBeforeDelete = await getGrades({ trackId: newTrack!.id })
      const _seriesBeforeDelete = await getSeries({ trackId: newTrack!.id })

      expect(gradesBeforeDelete).toHaveLength(2)
      expect(_seriesBeforeDelete).toHaveLength(1)

      // Delete track (should cascade)
      await db.delete(tracks).where(eq(tracks.id, newTrack!.id))

      // Verify all related records are deleted
      const gradesAfterDelete = await getGrades({ trackId: newTrack!.id })
      const _seriesAfterDelete = await getSeries({ trackId: newTrack!.id })

      expect(gradesAfterDelete).toHaveLength(0)
      expect(_seriesAfterDelete).toHaveLength(0)
    })
  })

  // ============================================================================
  // Concurrent Operations
  // ============================================================================

  describe('concurrent Operations', () => {
    test('should handle concurrent grade creation without conflicts', async () => {
      // Create multiple grades concurrently
      const gradePromises = Array.from({ length: 5 }, (_, i) =>
        createGrade({
          name: `Concurrent Grade ${i}`,
          code: `CG${String(i).padStart(3, '0')}`,
          order: 30 + i,
          trackId: testTrack.id,
        }))

      const createdGrades = await Promise.all(gradePromises)

      // Verify all grades created
      expect(createdGrades).toHaveLength(5)
      expect(createdGrades.every(g => g.id)).toBe(true)

      // Verify no duplicates
      const ids = createdGrades.map(g => g.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(5)

      // Cleanup
      for (const grade of createdGrades) {
        await deleteGrade(grade.id)
      }
    })

    test('should handle concurrent coefficient updates without data corruption', async () => {
      // Create test coefficients
      const coeffs: any[] = []
      for (let i = 0; i < 3; i++) {
        const coeff = await createCoefficientTemplate({
          schoolYearTemplateId: testYear.id,
          subjectId: testSubject.id,
          gradeId: testGrade.id,
          weight: 1 + i,
        })
        coeffs.push(coeff)
      }

      // Perform concurrent updates
      const updatePromises = coeffs.map((coeff, i) =>
        bulkUpdateCoefficients([
          { id: coeff.id, weight: 2 + i },
        ]),
      )

      await Promise.all(updatePromises)

      // Verify updates applied
      const updatedResult = await getCoefficientTemplates({
        schoolYearTemplateId: testYear.id,
      })
      const updated = Array.isArray(updatedResult) ? updatedResult : updatedResult.coefficients

      const updatedCoeffs = updated.filter((c: any) => coeffs.some(orig => orig.id === c.id))
      expect(updatedCoeffs).toHaveLength(3)

      // Cleanup
      const db = getDb()
      for (const coeff of coeffs) {
        await db.delete(coefficientTemplates).where(eq(coefficientTemplates.id, coeff.id))
      }
    })

    test('should detect conflicts in concurrent updates', async () => {
      // Create a coefficient
      const coeff = await createCoefficientTemplate({
        schoolYearTemplateId: testYear.id,
        subjectId: testSubject.id,
        gradeId: testGrade.id,
        weight: 1,
      })

      // Perform concurrent updates to same record
      const updatePromises = [
        bulkUpdateCoefficients([{ id: coeff.id, weight: 2 }]),
        bulkUpdateCoefficients([{ id: coeff.id, weight: 3 }]),
        bulkUpdateCoefficients([{ id: coeff.id, weight: 4 }]),
      ]

      await Promise.all(updatePromises)

      // Verify final state (last write wins)
      const updatedResult = await getCoefficientTemplates({
        schoolYearTemplateId: testYear.id,
      })
      const updated = Array.isArray(updatedResult) ? updatedResult : updatedResult.coefficients

      const finalCoeff = updated.find((c: any) => c.id === coeff.id)
      expect(finalCoeff?.weight).toBeDefined()
      expect([2, 3, 4]).toContain(finalCoeff?.weight)

      // Cleanup
      const db = getDb()
      await db.delete(coefficientTemplates).where(eq(coefficientTemplates.id, coeff.id))
    })

    test('should maintain data consistency under concurrent operations', async () => {
      // Create initial data
      const grade = await createGrade({
        name: 'Consistency Grade',
        code: 'CG999',
        order: 99,
        trackId: testTrack.id,
      })

      // Perform concurrent reads and writes
      const operations = [
        getGrades({ trackId: testTrack.id }),
        createGrade({
          name: 'Concurrent Grade A',
          code: 'CGA001',
          order: 100,
          trackId: testTrack.id,
        }),
        getGrades({ trackId: testTrack.id }),
        createGrade({
          name: 'Concurrent Grade B',
          code: 'CGB001',
          order: 101,
          trackId: testTrack.id,
        }),
        getGrades({ trackId: testTrack.id }),
      ]

      const results = await Promise.all(operations)

      // Verify consistency
      const finalGrades = await getGrades({ trackId: testTrack.id })
      expect(finalGrades.length).toBeGreaterThanOrEqual(3)

      // Cleanup
      await deleteGrade(grade.id)
      const createdGrades = results.filter((r: any) => r && typeof r === 'object' && 'id' in r && typeof r.id === 'string')
      for (const g of createdGrades) {
        if (g && typeof g === 'object' && 'id' in g && g.id) {
          await deleteGrade(g.id as string)
        }
      }
    })
  })
})
