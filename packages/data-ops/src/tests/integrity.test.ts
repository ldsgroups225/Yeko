import { Result as R } from '@praha/byethrow'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { getDb } from '../database/setup'
import {
  educationLevels,
  programTemplateChapters,
  schoolYearTemplates,
  subjects,
  tracks,
} from '../drizzle/core-schema'
import {
  createGrade,
  createSerie,
  deleteGrade,
  deleteSerie,
  getGrades,
  getSeries,
} from '../queries/catalogs'
import {
  createCoefficientTemplate,
  getCoefficientTemplates,
} from '../queries/coefficients'
import {
  createProgramTemplate,
  deleteProgramTemplate,
} from '../queries/programs'
import {
  createSchool,
  deleteSchool,
} from '../queries/schools'
import './setup'

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
    testSchool = R.unwrap(await createSchool({
      name: 'Test Integrity School',
      code: `ITS-${nanoid()}`,
      email: `integrity-${nanoid()}@test.com`,
      phone: '+1234567890',
      status: 'active',
    }))
    const [eduLevel] = await db.select().from(educationLevels).limit(1)
    if (!eduLevel)
      throw new Error('No education level found')

    // Always create new track (Use "Integrity" prefix to avoid db-cleanup "TEST__" wildcard)
    const [newTrack] = await db
      .insert(tracks)
      .values({
        id: nanoid(),
        name: `Integrity Track ${nanoid()}`,
        code: `IT-${nanoid()}`,
        educationLevelId: eduLevel.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
    testTrack = newTrack

    // Always create new year
    const [newYear] = await db
      .insert(schoolYearTemplates)
      .values({
        id: nanoid(),
        name: `Test Integrity Year ${nanoid()}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
    testYear = newYear

    // Always create new subject
    const [newSubject] = await db
      .insert(subjects)
      .values({
        id: nanoid(),
        name: `Integrity Subject ${nanoid()}`,
        shortName: `IS-${nanoid().slice(0, 5)}`,
        category: 'Scientifique',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
    testSubject = newSubject

    // Create test grade
    testGrade = R.unwrap(await createGrade({
      name: 'Test Integrity Grade',
      code: `IG-${nanoid()}`,
      order: 1,
      trackId: testTrack.id,
    }))
  })

  afterAll(async () => {
    const db = getDb()
    if (testGrade?.id) {
      await deleteGrade(testGrade.id)
    }
    if (testTrack?.id) {
      await db.delete(tracks).where(eq(tracks.id, testTrack.id))
    }
    if (testYear?.id) {
      await db.delete(schoolYearTemplates).where(eq(schoolYearTemplates.id, testYear.id))
    }
    if (testSubject?.id) {
      await db.delete(subjects).where(eq(subjects.id, testSubject.id))
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
      const school1 = R.unwrap(await createSchool({
        name: 'School 1',
        code: uniqueCode,
        email: 'dup1@test.com',
        phone: '+1111111111',
        status: 'active',
      }))

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
      if (!eduLevel)
        throw new Error('No education level found')

      const track1 = await db
        .insert(tracks)
        .values({
          id: nanoid(),
          name: `Test Integrity Track 1`,
          code: `DUPTRACK-${nanoid()}`,
          educationLevelId: eduLevel.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      try {
        await db
          .insert(tracks)
          .values({
            id: nanoid(),
            name: 'Test Integrity Track 2',
            code: track1[0]!.code, // Duplicate code
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
      const series1 = R.unwrap(await createSerie({
        name: 'Test Integrity Series 1',
        code: `DUPSERIES-${nanoid()}`,
        trackId: testTrack.id,
      }))

      try {
        await createSerie({
          name: 'Test Integrity Series 2',
          code: series1.code, // Duplicate code
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
            id: nanoid(),
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
      if (!eduLevel)
        throw new Error('No education level found')
      // Create a new track with grades
      const [newTrack] = await db
        .insert(tracks)
        .values({
          id: nanoid(),
          name: 'Cascade Test Track',
          code: 'CTT001',
          educationLevelId: eduLevel.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      if (!newTrack)
        throw new Error('Failed to create newTrack')
      const grade = R.unwrap(await createGrade({
        name: 'Cascade Grade',
        code: 'CG001',
        order: 1,
        trackId: newTrack.id,
      }))

      // Verify grade exists
      const gradesBeforeDelete = R.unwrap(await getGrades({ trackId: newTrack.id }))
      expect(gradesBeforeDelete).toContainEqual(expect.objectContaining({ id: grade.id }))

      // Delete track
      await db.delete(tracks).where(eq(tracks.id, newTrack.id))

      // Verify grades are deleted
      const gradesAfterDelete = R.unwrap(await getGrades({ trackId: newTrack.id }))
      expect(gradesAfterDelete).not.toContainEqual(expect.objectContaining({ id: grade.id }))
    })

    test('should cascade delete series when track deleted', async () => {
      const db = getDb()

      // Get an education level to use
      const [eduLevel] = await db.select().from(educationLevels).limit(1)
      if (!eduLevel)
        throw new Error('No education level found')
      // Create a new track with series
      const [newTrack] = await db
        .insert(tracks)
        .values({
          id: nanoid(),
          name: 'Cascade Series Track',
          code: 'CST001',
          educationLevelId: eduLevel.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      if (!newTrack)
        throw new Error('Failed to create newTrack')
      const serie = R.unwrap(await createSerie({
        name: 'Cascade Series',
        code: 'CS001',
        trackId: newTrack.id,
      }))

      // Verify series exists
      const seriesBeforeDelete = R.unwrap(await getSeries({ trackId: newTrack.id }))
      expect(seriesBeforeDelete).toContainEqual(expect.objectContaining({ id: serie.id }))

      // Delete track
      await db.delete(tracks).where(eq(tracks.id, newTrack.id))

      // Verify series are deleted
      const seriesAfterDelete = R.unwrap(await getSeries({ trackId: newTrack.id }))
      expect(seriesAfterDelete).not.toContainEqual(expect.objectContaining({ id: serie.id }))
    })

    test('should cascade delete chapters when program deleted', async () => {
      const db = getDb()

      // Create a program
      const programResult = await createProgramTemplate({
        name: 'Cascade Program',
        schoolYearTemplateId: testYear.id,
        subjectId: testSubject.id,
        gradeId: testGrade.id,
      })
      if (R.isFailure(programResult)) {
        console.error('Failed to create program:', programResult.error)
      }
      const program = R.unwrap(programResult)

      // Add chapters
      await db
        .insert(programTemplateChapters)
        .values({
          id: nanoid(),
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
          id: nanoid(),
          name: `Test Integrity Subject ${nanoid()}`,
          shortName: `IS-${nanoid().slice(0, 5)}`,
          category: 'Scientifique',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      if (!newSubject)
        throw new Error('Failed to create newSubject')
      // Create coefficient
      const coeffResult = await createCoefficientTemplate({
        schoolYearTemplateId: testYear.id,
        subjectId: newSubject.id,
        gradeId: testGrade.id,
        weight: 2,
      })
      if (R.isFailure(coeffResult)) {
        console.error('Failed to create coefficient:', coeffResult.error)
      }
      const coeff = R.unwrap(coeffResult)

      // Verify coefficient exists
      const coeffsBeforeDeleteResult = R.unwrap(await getCoefficientTemplates({
        subjectId: newSubject.id,
      }))
      const coeffsBeforeDelete = coeffsBeforeDeleteResult.coefficients
      expect(coeffsBeforeDelete).toContainEqual(expect.objectContaining({ id: coeff.id }))

      // Delete subject
      await db.delete(subjects).where(eq(subjects.id, newSubject.id))

      // Verify coefficients are deleted
      const coeffsAfterDeleteResult = R.unwrap(await getCoefficientTemplates({
        subjectId: newSubject.id,
      }))
      const coeffsAfterDelete = coeffsAfterDeleteResult.coefficients
      expect(coeffsAfterDelete).not.toContainEqual(expect.objectContaining({ id: coeff.id }))
    })
  })
})
