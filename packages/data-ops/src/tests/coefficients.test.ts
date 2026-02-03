import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { getDb } from '../database/setup'
import { coefficientTemplates, grades, schoolYearTemplates, series, subjects, tracks } from '../drizzle/core-schema'
import { createGrade, createSerie, createSubject, createTrack } from '../queries/catalogs'
import {
  bulkCreateCoefficients,
  bulkUpdateCoefficients,
  copyCoefficientTemplates,
  createCoefficientTemplate,
  deleteCoefficientTemplate,
  getCoefficientStats,
  getCoefficientTemplateById,
  getCoefficientTemplates,
  updateCoefficientTemplate,
} from '../queries/coefficients'
import { createSchoolYearTemplate } from '../queries/programs'
import './setup'

describe('coefficient queries', () => {
  let testYearId: string
  let testGradeId: string
  let testSubjectId: string
  let testSeriesId: string
  let testTrackId: string

  beforeEach(async () => {
    const track = (await createTrack({
      name: `Test Track ${nanoid()}`,
      code: `TTC-${nanoid()}`,
      educationLevelId: 1,
    }))._unsafeUnwrap()
    testTrackId = track.id

    const year = (await createSchoolYearTemplate({
      name: `Test Year ${nanoid()}`,
      isActive: true,
    }))._unsafeUnwrap()
    testYearId = year.id

    const subject = (await createSubject({
      name: `Test Subject ${nanoid()}`,
      shortName: `TS-${nanoid().slice(0, 5)}`,
      category: 'Scientifique',
    }))._unsafeUnwrap()
    testSubjectId = subject.id

    const grade = (await createGrade({
      name: `Test Grade ${nanoid()}`,
      code: `TGC-${nanoid()}`,
      order: 1,
      trackId: track.id,
    }))._unsafeUnwrap()
    testGradeId = grade.id

    const serie = (await createSerie({
      name: `Test Series ${nanoid()}`,
      code: `TS-${nanoid()}`,
      trackId: track.id,
    }))._unsafeUnwrap()
    testSeriesId = serie.id
  })

  afterEach(async () => {
    try {
      const db = getDb()
      await db.delete(coefficientTemplates).where(eq(coefficientTemplates.schoolYearTemplateId, testYearId))
      await db.delete(schoolYearTemplates).where(eq(schoolYearTemplates.id, testYearId))
      await db.delete(subjects).where(eq(subjects.id, testSubjectId))
      await db.delete(grades).where(eq(grades.id, testGradeId))
      await db.delete(series).where(eq(series.id, testSeriesId))
      await db.delete(tracks).where(eq(tracks.id, testTrackId))
    }
    catch {
      // Required catch for cleanup errors in isolated tests
    }
  })

  describe('cRUD Operations', () => {
    test('should create a coefficient template', async () => {
      const coefficient = (await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))._unsafeUnwrap()

      expect(coefficient).toBeDefined()
      expect(coefficient.weight).toBe(5)
      expect(coefficient.schoolYearTemplateId).toBe(testYearId)
      expect(coefficient.subjectId).toBe(testSubjectId)
      expect(coefficient.gradeId).toBe(testGradeId)
      expect(coefficient.seriesId).toBe(testSeriesId)
    })

    test('should create a coefficient without series (general coefficient)', async () => {
      const coefficient = (await createCoefficientTemplate({
        weight: 3,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: null,
      }))._unsafeUnwrap()

      expect(coefficient).toBeDefined()
      expect(coefficient.weight).toBe(3)
      expect(coefficient.seriesId).toBeNull()
    })

    test('should get coefficient template by id', async () => {
      const created = (await createCoefficientTemplate({
        weight: 4,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))._unsafeUnwrap()

      const fetched = (await getCoefficientTemplateById(created.id))._unsafeUnwrap()

      expect(fetched).toBeDefined()
      expect(fetched?.id).toBe(created.id)
      expect(fetched?.weight).toBe(4)
      expect(fetched?.subject).toBeDefined()
      expect(fetched?.grade).toBeDefined()
      expect(fetched?.series).toBeDefined()
    })

    test('should update a coefficient template', async () => {
      const created = (await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))._unsafeUnwrap()

      const updated = (await updateCoefficientTemplate(created.id, {
        weight: 7,
      }))._unsafeUnwrap()

      expect(updated.weight).toBe(7)
      expect(updated.id).toBe(created.id)
    })

    test('should delete a coefficient template', async () => {
      const created = (await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))._unsafeUnwrap()

      await deleteCoefficientTemplate(created.id)

      const fetched = (await getCoefficientTemplateById(created.id))._unsafeUnwrap()
      expect(fetched).toBeNull()
    })
  })

  describe('filtering and Querying', () => {
    test('should filter coefficients by school year', async () => {
      await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      })

      const result = (await getCoefficientTemplates({
        schoolYearTemplateId: testYearId,
      }))._unsafeUnwrap()

      expect(result.coefficients.length).toBeGreaterThan(0)
      expect(result.coefficients[0]?.schoolYearTemplateId).toBe(testYearId)
    })

    test('should filter coefficients by grade', async () => {
      await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      })

      const result = (await getCoefficientTemplates({
        gradeId: testGradeId,
      }))._unsafeUnwrap()

      expect(result.coefficients.length).toBeGreaterThan(0)
      expect(result.coefficients[0]?.gradeId).toBe(testGradeId)
    })

    test('should filter coefficients by series', async () => {
      await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      })

      const result = (await getCoefficientTemplates({
        seriesId: testSeriesId,
      }))._unsafeUnwrap()

      expect(result.coefficients.length).toBeGreaterThan(0)
      expect(result.coefficients[0]?.seriesId).toBe(testSeriesId)
    })

    test('should filter coefficients by subject', async () => {
      await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      })

      const result = (await getCoefficientTemplates({
        subjectId: testSubjectId,
      }))._unsafeUnwrap()

      expect(result.coefficients.length).toBeGreaterThan(0)
      expect(result.coefficients[0]?.subjectId).toBe(testSubjectId)
    })

    test('should filter with multiple criteria', async () => {
      await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      })

      const result = (await getCoefficientTemplates({
        schoolYearTemplateId: testYearId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
        subjectId: testSubjectId,
      }))._unsafeUnwrap()

      expect(result.coefficients.length).toBeGreaterThan(0)
      expect(result.coefficients[0]?.schoolYearTemplateId).toBe(testYearId)
      expect(result.coefficients[0]?.gradeId).toBe(testGradeId)
      expect(result.coefficients[0]?.seriesId).toBe(testSeriesId)
      expect(result.coefficients[0]?.subjectId).toBe(testSubjectId)
    })

    test('should paginate results', async () => {
      // Create multiple coefficients
      for (let i = 0; i < 5; i++) {
        await createCoefficientTemplate({
          weight: i + 1,
          schoolYearTemplateId: testYearId,
          subjectId: testSubjectId,
          gradeId: testGradeId,
          seriesId: testSeriesId,
        })
      }

      const page1 = (await getCoefficientTemplates({
        page: 1,
        limit: 2,
      }))._unsafeUnwrap()

      expect(page1.coefficients.length).toBeLessThanOrEqual(2)
      expect(page1.pagination.page).toBe(1)
      expect(page1.pagination.limit).toBe(2)
    })
  })

  describe('bulk Operations', () => {
    test('should bulk create coefficients', async () => {
      const coefficients = [
        {
          weight: 5,
          schoolYearTemplateId: testYearId,
          subjectId: testSubjectId,
          gradeId: testGradeId,
          seriesId: testSeriesId,
        },
        {
          weight: 3,
          schoolYearTemplateId: testYearId,
          subjectId: testSubjectId,
          gradeId: testGradeId,
          seriesId: null,
        },
      ]

      const created = (await bulkCreateCoefficients(coefficients))._unsafeUnwrap()

      expect(created).toHaveLength(2)
      expect(created[0]?.weight).toBe(5)
      expect(created[1]?.weight).toBe(3)
    })

    test('should bulk update coefficients', async () => {
      const coef1 = (await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))._unsafeUnwrap()

      const coef2 = (await createCoefficientTemplate({
        weight: 3,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: null,
      }))._unsafeUnwrap()

      await bulkUpdateCoefficients([
        { id: coef1.id, weight: 7 },
        { id: coef2.id, weight: 4 },
      ])

      const updated1 = (await getCoefficientTemplateById(coef1.id))._unsafeUnwrap()
      const updated2 = (await getCoefficientTemplateById(coef2.id))._unsafeUnwrap()

      expect(updated1?.weight).toBe(7)
      expect(updated2?.weight).toBe(4)
    })

    test('should handle empty bulk operations', async () => {
      const created = (await bulkCreateCoefficients([]))._unsafeUnwrap()
      expect(created).toHaveLength(0)

      await expect(bulkUpdateCoefficients([]).then(r => r._unsafeUnwrap())).resolves.not.toThrow()
    })
  })

  describe('copy Functionality', () => {
    test('should copy coefficients from one year to another', async () => {
      // Create source year coefficients
      await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      })

      await createCoefficientTemplate({
        weight: 3,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: null,
      })

      // Create target year
      const targetYear = (await createSchoolYearTemplate({
        name: `Target Year ${Date.now()}`,
        isActive: false,
      }))._unsafeUnwrap()

      // Copy coefficients
      const copied = (await copyCoefficientTemplates(testYearId, targetYear.id))._unsafeUnwrap()

      expect(copied).toHaveLength(2)
      expect(copied[0]?.schoolYearTemplateId).toBe(targetYear.id)
      expect(copied[1]?.schoolYearTemplateId).toBe(targetYear.id)

      // Verify original coefficients still exist
      const original = (await getCoefficientTemplates({
        schoolYearTemplateId: testYearId,
      }))._unsafeUnwrap()
      expect(original.coefficients.length).toBeGreaterThanOrEqual(2)
    })

    test('should return empty array when copying from year with no coefficients', async () => {
      const emptyYear = (await createSchoolYearTemplate({
        name: `Empty Year ${Date.now()}`,
        isActive: false,
      }))._unsafeUnwrap()

      const targetYear = (await createSchoolYearTemplate({
        name: `Target Year ${Date.now()}`,
        isActive: false,
      }))._unsafeUnwrap()

      const copied = (await copyCoefficientTemplates(emptyYear.id, targetYear.id))._unsafeUnwrap()

      expect(copied).toHaveLength(0)
    })
  })

  describe('statistics', () => {
    test('should get coefficient stats', async () => {
      const statsBefore = (await getCoefficientStats())._unsafeUnwrap()
      const totalBefore = statsBefore.total

      await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      })

      const statsAfter = (await getCoefficientStats())._unsafeUnwrap()

      expect(statsAfter.total).toBe(totalBefore + 1)
    })
  })

  describe('data Integrity', () => {
    test('should include all relations when fetching coefficient', async () => {
      const created = (await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))._unsafeUnwrap()

      const fetched = (await getCoefficientTemplateById(created.id))._unsafeUnwrap()

      expect(fetched?.schoolYearTemplate).toBeDefined()
      expect(fetched?.schoolYearTemplate?.name).toBeDefined()
      expect(fetched?.subject).toBeDefined()
      expect(fetched?.subject?.name).toBeDefined()
      expect(fetched?.grade).toBeDefined()
      expect(fetched?.grade?.name).toBeDefined()
      expect(fetched?.series).toBeDefined()
      expect(fetched?.series?.name).toBeDefined()
    })

    test('should handle null series correctly', async () => {
      const created = (await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: null,
      }))._unsafeUnwrap()

      const fetched = (await getCoefficientTemplateById(created.id))._unsafeUnwrap()

      expect(fetched?.seriesId).toBeNull()
      expect(fetched?.series).toBeNull()
    })

    test('should maintain timestamps', async () => {
      const created = (await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))._unsafeUnwrap()

      expect(created.createdAt).toBeDefined()
      expect(created.updatedAt).toBeDefined()

      const createdAt = created.createdAt

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100))

      const updated = (await updateCoefficientTemplate(created.id, {
        weight: 7,
      }))._unsafeUnwrap()

      expect(updated.updatedAt.getTime()).toBeGreaterThan(createdAt.getTime())
    })

    test('should throw error when updating non-existent coefficient template', async () => {
      // This covers lines 188-189 in coefficients.ts
      const nonExistentId = 'non-existent-coefficient-id'

      const result = await updateCoefficientTemplate(nonExistentId, { weight: 5 })
      if (result.isErr()) {
        expect((result.error.originalError as Error).message).toContain(`Coefficient template with id ${nonExistentId} not found`)
      }
      else {
        expect.fail('Should have returned an error')
      }
    })
  })
})
