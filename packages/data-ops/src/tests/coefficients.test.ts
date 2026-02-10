import { Result as R } from '@praha/byethrow'
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
    const track = R.unwrap(await createTrack({
      name: `Test Track ${nanoid()}`,
      code: `TTC-${nanoid()}`,
      educationLevelId: 1,
    }))
    testTrackId = track.id

    const year = R.unwrap(await createSchoolYearTemplate({
      name: `Test Year ${nanoid()}`,
      isActive: true,
    }))
    testYearId = year.id

    const subject = R.unwrap(await createSubject({
      name: `Test Subject ${nanoid()}`,
      shortName: `TS-${nanoid().slice(0, 5)}`,
      category: 'Scientifique',
    }))
    testSubjectId = subject.id

    const grade = R.unwrap(await createGrade({
      name: `Test Grade ${nanoid()}`,
      code: `TGC-${nanoid()}`,
      order: 1,
      trackId: track.id,
    }))
    testGradeId = grade.id

    const serie = R.unwrap(await createSerie({
      name: `Test Series ${nanoid()}`,
      code: `TS-${nanoid()}`,
      trackId: track.id,
    }))
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
      const coefficient = R.unwrap(await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))

      expect(coefficient).toBeDefined()
      expect(coefficient.weight).toBe(5)
      expect(coefficient.schoolYearTemplateId).toBe(testYearId)
      expect(coefficient.subjectId).toBe(testSubjectId)
      expect(coefficient.gradeId).toBe(testGradeId)
      expect(coefficient.seriesId).toBe(testSeriesId)
    })

    test('should create a coefficient without series (general coefficient)', async () => {
      const coefficient = R.unwrap(await createCoefficientTemplate({
        weight: 3,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: null,
      }))

      expect(coefficient).toBeDefined()
      expect(coefficient.weight).toBe(3)
      expect(coefficient.seriesId).toBeNull()
    })

    test('should get coefficient template by id', async () => {
      const created = R.unwrap(await createCoefficientTemplate({
        weight: 4,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))

      const fetched = R.unwrap(await getCoefficientTemplateById(created.id))

      expect(fetched).toBeDefined()
      expect(fetched?.id).toBe(created.id)
      expect(fetched?.weight).toBe(4)
      expect(fetched?.subject).toBeDefined()
      expect(fetched?.grade).toBeDefined()
      expect(fetched?.series).toBeDefined()
    })

    test('should update a coefficient template', async () => {
      const created = R.unwrap(await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))

      const updated = R.unwrap(await updateCoefficientTemplate(created.id, {
        weight: 7,
      }))

      expect(updated.weight).toBe(7)
      expect(updated.id).toBe(created.id)
    })

    test('should delete a coefficient template', async () => {
      const created = R.unwrap(await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))

      await deleteCoefficientTemplate(created.id)

      const fetched = R.unwrap(await getCoefficientTemplateById(created.id))
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

      const result = R.unwrap(await getCoefficientTemplates({
        schoolYearTemplateId: testYearId,
      }))

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

      const result = R.unwrap(await getCoefficientTemplates({
        gradeId: testGradeId,
      }))

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

      const result = R.unwrap(await getCoefficientTemplates({
        seriesId: testSeriesId,
      }))

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

      const result = R.unwrap(await getCoefficientTemplates({
        subjectId: testSubjectId,
      }))

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

      const result = R.unwrap(await getCoefficientTemplates({
        schoolYearTemplateId: testYearId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
        subjectId: testSubjectId,
      }))

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

      const page1 = R.unwrap(await getCoefficientTemplates({
        page: 1,
        limit: 2,
      }))

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

      const created = R.unwrap(await bulkCreateCoefficients(coefficients))

      expect(created).toHaveLength(2)
      expect(created[0]?.weight).toBe(5)
      expect(created[1]?.weight).toBe(3)
    })

    test('should bulk update coefficients', async () => {
      const coef1 = R.unwrap(await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))

      const coef2 = R.unwrap(await createCoefficientTemplate({
        weight: 3,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: null,
      }))

      await bulkUpdateCoefficients([
        { id: coef1.id, weight: 7 },
        { id: coef2.id, weight: 4 },
      ])

      const updated1 = R.unwrap(await getCoefficientTemplateById(coef1.id))
      const updated2 = R.unwrap(await getCoefficientTemplateById(coef2.id))

      expect(updated1?.weight).toBe(7)
      expect(updated2?.weight).toBe(4)
    })

    test('should handle empty bulk operations', async () => {
      const created = R.unwrap(await bulkCreateCoefficients([]))
      expect(created).toHaveLength(0)

      await expect(bulkUpdateCoefficients([]).then(r => R.unwrap(r))).resolves.not.toThrow()
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
      const targetYear = R.unwrap(await createSchoolYearTemplate({
        name: `Target Year ${Date.now()}`,
        isActive: false,
      }))

      // Copy coefficients
      const copied = R.unwrap(await copyCoefficientTemplates(testYearId, targetYear.id))

      expect(copied).toHaveLength(2)
      expect(copied[0]?.schoolYearTemplateId).toBe(targetYear.id)
      expect(copied[1]?.schoolYearTemplateId).toBe(targetYear.id)

      // Verify original coefficients still exist
      const original = R.unwrap(await getCoefficientTemplates({
        schoolYearTemplateId: testYearId,
      }))
      expect(original.coefficients.length).toBeGreaterThanOrEqual(2)
    })

    test('should return empty array when copying from year with no coefficients', async () => {
      const emptyYear = R.unwrap(await createSchoolYearTemplate({
        name: `Empty Year ${Date.now()}`,
        isActive: false,
      }))

      const targetYear = R.unwrap(await createSchoolYearTemplate({
        name: `Target Year ${Date.now()}`,
        isActive: false,
      }))

      const copied = R.unwrap(await copyCoefficientTemplates(emptyYear.id, targetYear.id))

      expect(copied).toHaveLength(0)
    })
  })

  describe('statistics', () => {
    test('should get coefficient stats', async () => {
      const statsBefore = R.unwrap(await getCoefficientStats())
      const totalBefore = statsBefore.total

      await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      })

      const statsAfter = R.unwrap(await getCoefficientStats())

      expect(statsAfter.total).toBe(totalBefore + 1)
    })
  })

  describe('data Integrity', () => {
    test('should include all relations when fetching coefficient', async () => {
      const created = R.unwrap(await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))

      const fetched = R.unwrap(await getCoefficientTemplateById(created.id))

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
      const created = R.unwrap(await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: null,
      }))

      const fetched = R.unwrap(await getCoefficientTemplateById(created.id))

      expect(fetched?.seriesId).toBeNull()
      expect(fetched?.series).toBeNull()
    })

    test('should maintain timestamps', async () => {
      const created = R.unwrap(await createCoefficientTemplate({
        weight: 5,
        schoolYearTemplateId: testYearId,
        subjectId: testSubjectId,
        gradeId: testGradeId,
        seriesId: testSeriesId,
      }))

      expect(created.createdAt).toBeDefined()
      expect(created.updatedAt).toBeDefined()

      const createdAt = created.createdAt

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100))

      const updated = R.unwrap(await updateCoefficientTemplate(created.id, {
        weight: 7,
      }))

      expect(updated.updatedAt.getTime()).toBeGreaterThan(createdAt.getTime())
    })

    test('should throw error when updating non-existent coefficient template', async () => {
      // This covers lines 188-189 in coefficients.ts
      const nonExistentId = 'non-existent-coefficient-id'

      const result = await updateCoefficientTemplate(nonExistentId, { weight: 5 })
      if (R.isFailure(result)) {
        expect((result.error.originalError as Error).message).toContain(`Coefficient template with id ${nonExistentId} not found`)
      }
      else {
        expect.fail('Should have returned an error')
      }
    })
  })
})
