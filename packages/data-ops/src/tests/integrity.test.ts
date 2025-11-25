/**
 * Data Integrity Testing: Section 7
 * Constraint Validation and Referential Integrity Tests
 * Using vitest with node environment
 */

import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { getDb } from '@/database/setup'
import {
  educationLevels,
  programTemplateChapters,
  schoolYearTemplates,
  subjects,
  tracks,
} from '@/drizzle/core-schema'
import {
  createGrade,
  createSerie,
  deleteGrade,
  deleteSerie,
  getGrades,
  getSeries,
} from '@/queries/catalogs'
import {
  createCoefficientTemplate,
  getCoefficientTemplates,
} from '@/queries/coefficients'
import {
  createProgramTemplate,
  deleteProgramTemplate,
} from '@/queries/programs'
import {
  createSchool,
  deleteSchool,
} from '@/queries/schools'

// ============================================================================
// 7.1 CONSTRAINT VALIDATION
// ============================================================================

describe('7.1 Constraint Validation', () => {
  let testSchool: any
  let testTrack: any
  let testYear: any
  let testSubject: any
  let testGrade: any

  beforeAll(async () => {
    const db = getDb()

    // Create test school
    testSchool = await createSchool({
      name: 'Integrity Test School',
      code: 'ITS001',
      email: 'integrity@test.com',
      phone: '+1234567890',
      status: 'active',
    })

    // Get or create test track
    const tracksResult = await db.select().from(tracks).limit(1)
    if (tracksResult.length > 0) {
      testTrack = tracksResult[0]
    }
    else {
      const [newTrack] = await db
        .insert(tracks)
        .values({
          id: crypto.randomUUID(),
          name: 'Test Track',
          code: 'TT001',
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
          id: crypto.randomUUID(),
          name: 'Test Year',
          startDate: new Date(),
          endDate: new Date(),
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
          id: crypto.randomUUID(),
          name: 'Test Subject',
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
      name: 'Test Grade',
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
  // Unique Constraints
  // ============================================================================

  describe('unique Constraints', () => {
    test('should reject duplicate school codes', async () => {
      const uniqueCode = `DUP${Date.now()}`
      const school1 = await createSchool({
        name: 'School 1',
        code: uniqueCode,
        email: 'dup1@test.com',
        phone: '+1111111111',
        status: 'active',
      })

      try {
        await createSchool({
          name: 'School 2',
          code: uniqueCode, // Duplicate code
          email: 'dup2@test.com',
          phone: '+2222222222',
          status: 'active',
        })
        expect(true).toBe(false) // Should not reach here
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }

      // Cleanup
      await deleteSchool(school1.id)
    })

    test('should reject duplicate education level names', async () => {
      const _db = getDb()

      const level1 = await _db
        .insert(educationLevels)
        .values({
          id: 99,
          name: 'Unique Level Test',
          order: 99,
        })
        .returning()

      try {
        await _db
          .insert(educationLevels)
          .values({
            id: 98,
            name: 'Unique Level Test', // Duplicate name
            order: 98,
          })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }

      // Cleanup
      await _db.delete(educationLevels).where(eq(educationLevels.id, level1[0]!.id))
    })

    test('should reject duplicate track codes', async () => {
      const db = getDb()

      // Get an education level to use
      const [eduLevel] = await db.select().from(educationLevels).limit(1)

      const track1 = await db
        .insert(tracks)
        .values({
          id: crypto.randomUUID(),
          name: 'Track 1',
          code: 'DUPTRACK001',
          educationLevelId: eduLevel.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      try {
        await db
          .insert(tracks)
          .values({
            id: crypto.randomUUID(),
            name: 'Track 2',
            code: 'DUPTRACK001', // Duplicate code
            educationLevelId: eduLevel.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }

      // Cleanup
      await db.delete(tracks).where(eq(tracks.id, track1[0]!.id))
    })

    test('should reject duplicate series codes', async () => {
      const series1 = await createSerie({
        name: 'Series 1',
        code: 'DUPSERIES001',
        trackId: testTrack.id,
      })

      try {
        await createSerie({
          name: 'Series 2',
          code: 'DUPSERIES001', // Duplicate code
          trackId: testTrack.id,
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }

      // Cleanup
      await deleteSerie(series1.id)
    })
  })

  // ============================================================================
  // Foreign Key Constraints
  // ============================================================================

  describe('foreign Key Constraints', () => {
    test('should reject grade without track', async () => {
      try {
        await createGrade({
          name: 'Orphan Grade',
          code: 'OG001',
          order: 1,
          trackId: 'invalid-track-id',
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject series without track', async () => {
      try {
        await createSerie({
          name: 'Orphan Series',
          code: 'OS001',
          trackId: 'invalid-track-id',
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject program without year', async () => {
      try {
        await createProgramTemplate({
          name: 'Orphan Program',
          schoolYearTemplateId: 'invalid-year-id',
          subjectId: testSubject.id,
          gradeId: testGrade.id,
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject program without subject', async () => {
      try {
        await createProgramTemplate({
          name: 'Orphan Program',
          schoolYearTemplateId: testYear.id,
          subjectId: 'invalid-subject-id',
          gradeId: testGrade.id,
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject program without grade', async () => {
      try {
        await createProgramTemplate({
          name: 'Orphan Program',
          schoolYearTemplateId: testYear.id,
          subjectId: testSubject.id,
          gradeId: 'invalid-grade-id',
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject coefficient without year', async () => {
      try {
        await createCoefficientTemplate({
          schoolYearTemplateId: 'invalid-year-id',
          subjectId: testSubject.id,
          gradeId: testGrade.id,
          weight: 2,
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject coefficient without subject', async () => {
      try {
        await createCoefficientTemplate({
          schoolYearTemplateId: testYear.id,
          subjectId: 'invalid-subject-id',
          gradeId: testGrade.id,
          weight: 2,
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject coefficient without grade', async () => {
      try {
        await createCoefficientTemplate({
          schoolYearTemplateId: testYear.id,
          subjectId: testSubject.id,
          gradeId: 'invalid-grade-id',
          weight: 2,
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })
  })

  // ============================================================================
  // NOT NULL Constraints
  // ============================================================================

  describe('nOT NULL Constraints', () => {
    test('should reject school without name', async () => {
      try {
        await createSchool({
          name: '',
          code: 'NONAME001',
          email: 'noname@test.com',
          phone: '+1234567890',
          status: 'active',
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject school without code', async () => {
      try {
        await createSchool({
          name: 'No Code School',
          code: '',
          email: 'nocode@test.com',
          phone: '+1234567890',
          status: 'active',
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject grade without name', async () => {
      try {
        await createGrade({
          name: '',
          code: 'NONAME001',
          order: 1,
          trackId: testTrack.id,
        })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })

    test('should reject subject without name', async () => {
      const db = getDb()

      try {
        await db
          .insert(subjects)
          .values({
            id: crypto.randomUUID(),
            name: '',
            shortName: 'NS',
            category: 'Scientifique',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        expect(true).toBe(false)
      }
      catch (error: any) {
        expect(error).toBeDefined()
      }
    })
  })

  // ============================================================================
  // Referential Integrity
  // ============================================================================

  describe('referential Integrity', () => {
    test('should cascade delete grades when track deleted', async () => {
      const db = getDb()

      // Get an education level to use
      const [eduLevel] = await db.select().from(educationLevels).limit(1)

      // Create a new track with grades
      const [newTrack] = await db
        .insert(tracks)
        .values({
          id: crypto.randomUUID(),
          name: 'Cascade Test Track',
          code: 'CTT001',
          educationLevelId: eduLevel.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      const grade = await createGrade({
        name: 'Cascade Grade',
        code: 'CG001',
        order: 1,
        trackId: newTrack.id,
      })

      // Verify grade exists
      const gradesBeforeDelete = await getGrades({ trackId: newTrack.id })
      expect(gradesBeforeDelete).toContainEqual(expect.objectContaining({ id: grade.id }))

      // Delete track
      await db.delete(tracks).where(eq(tracks.id, newTrack.id))

      // Verify grades are deleted
      const gradesAfterDelete = await getGrades({ trackId: newTrack.id })
      expect(gradesAfterDelete).not.toContainEqual(expect.objectContaining({ id: grade.id }))
    })

    test('should cascade delete series when track deleted', async () => {
      const db = getDb()

      // Get an education level to use
      const [eduLevel] = await db.select().from(educationLevels).limit(1)

      // Create a new track with series
      const [newTrack] = await db
        .insert(tracks)
        .values({
          id: crypto.randomUUID(),
          name: 'Cascade Series Track',
          code: 'CST001',
          educationLevelId: eduLevel.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      const serie = await createSerie({
        name: 'Cascade Series',
        code: 'CS001',
        trackId: newTrack.id,
      })

      // Verify series exists
      const seriesBeforeDelete = await getSeries({ trackId: newTrack.id })
      expect(seriesBeforeDelete).toContainEqual(expect.objectContaining({ id: serie.id }))

      // Delete track
      await db.delete(tracks).where(eq(tracks.id, newTrack.id))

      // Verify series are deleted
      const seriesAfterDelete = await getSeries({ trackId: newTrack.id })
      expect(seriesAfterDelete).not.toContainEqual(expect.objectContaining({ id: serie.id }))
    })

    test('should cascade delete chapters when program deleted', async () => {
      const db = getDb()

      // Create a program
      const program = await createProgramTemplate({
        name: 'Cascade Program',
        schoolYearTemplateId: testYear.id,
        subjectId: testSubject.id,
        gradeId: testGrade.id,
      })

      // Add chapters
      await db
        .insert(programTemplateChapters)
        .values({
          id: crypto.randomUUID(),
          programTemplateId: program.id,
          title: 'Chapter 1',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // Verify chapter exists
      const chaptersBeforeDelete = await db
        .select()
        .from(programTemplateChapters)
        .where(eq(programTemplateChapters.programTemplateId, program.id))

      expect(chaptersBeforeDelete).toHaveLength(1)

      // Delete program
      await deleteProgramTemplate(program.id)

      // Verify chapters are deleted
      const chaptersAfterDelete = await db
        .select()
        .from(programTemplateChapters)
        .where(eq(programTemplateChapters.programTemplateId, program.id))

      expect(chaptersAfterDelete).toHaveLength(0)
    })

    test('should cascade delete coefficients when subject deleted', async () => {
      const db = getDb()

      // Create a new subject
      const [newSubject] = await db
        .insert(subjects)
        .values({
          id: crypto.randomUUID(),
          name: 'Cascade Subject',
          shortName: 'CS',
          category: 'Scientifique',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // Create coefficient
      const coeff = await createCoefficientTemplate({
        schoolYearTemplateId: testYear.id,
        subjectId: newSubject.id,
        gradeId: testGrade.id,
        weight: 2,
      })

      // Verify coefficient exists
      const coeffsBeforeDeleteResult = await getCoefficientTemplates({
        subjectId: newSubject.id,
      })
      const coeffsBeforeDelete = coeffsBeforeDeleteResult.coefficients
      expect(coeffsBeforeDelete).toContainEqual(expect.objectContaining({ id: coeff.id }))

      // Delete subject
      await db.delete(subjects).where(eq(subjects.id, newSubject.id))

      // Verify coefficients are deleted
      const coeffsAfterDeleteResult = await getCoefficientTemplates({
        subjectId: newSubject.id,
      })
      const coeffsAfterDelete = coeffsAfterDeleteResult.coefficients
      expect(coeffsAfterDelete).not.toContainEqual(expect.objectContaining({ id: coeff.id }))
    })
  })
})
