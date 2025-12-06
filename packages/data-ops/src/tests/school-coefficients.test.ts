import { describe, expect, test } from 'vitest'
import {
  bulkUpdateSchoolCoefficients,
  createCoefficientOverride,
  updateCoefficientOverride,
  upsertCoefficientOverride,
} from '../queries/school-coefficients'

describe('school coefficients queries', () => {
  const fakeSchoolId = 'fake-school-id'
  const fakeTemplateId = 'fake-template-id'

  describe('createCoefficientOverride - validation', () => {
    test('should reject weight below 0', async () => {
      await expect(
        createCoefficientOverride({
          schoolId: fakeSchoolId,
          coefficientTemplateId: fakeTemplateId,
          weightOverride: -1,
        }),
      ).rejects.toThrow('Coefficient weight must be between 0 and 20')
    })

    test('should reject weight above 20', async () => {
      await expect(
        createCoefficientOverride({
          schoolId: fakeSchoolId,
          coefficientTemplateId: fakeTemplateId,
          weightOverride: 21,
        }),
      ).rejects.toThrow('Coefficient weight must be between 0 and 20')
    })
  })

  describe('updateCoefficientOverride - validation', () => {
    test('should reject weight below 0', async () => {
      await expect(
        updateCoefficientOverride('some-id', -1),
      ).rejects.toThrow('Coefficient weight must be between 0 and 20')
    })

    test('should reject weight above 20', async () => {
      await expect(
        updateCoefficientOverride('some-id', 21),
      ).rejects.toThrow('Coefficient weight must be between 0 and 20')
    })
  })

  describe('upsertCoefficientOverride - validation', () => {
    test('should reject weight below 0', async () => {
      await expect(
        upsertCoefficientOverride({
          schoolId: fakeSchoolId,
          coefficientTemplateId: fakeTemplateId,
          weightOverride: -5,
        }),
      ).rejects.toThrow('Coefficient weight must be between 0 and 20')
    })

    test('should reject weight above 20', async () => {
      await expect(
        upsertCoefficientOverride({
          schoolId: fakeSchoolId,
          coefficientTemplateId: fakeTemplateId,
          weightOverride: 25,
        }),
      ).rejects.toThrow('Coefficient weight must be between 0 and 20')
    })
  })

  describe('bulkUpdateSchoolCoefficients - validation', () => {
    test('should return empty array for empty updates', async () => {
      const result = await bulkUpdateSchoolCoefficients({
        schoolId: fakeSchoolId,
        updates: [],
      })
      expect(result).toEqual([])
    })

    test('should reject if any weight is above 20', async () => {
      await expect(
        bulkUpdateSchoolCoefficients({
          schoolId: fakeSchoolId,
          updates: [
            { coefficientTemplateId: 'template-1', weightOverride: 5 },
            { coefficientTemplateId: 'template-2', weightOverride: 25 },
          ],
        }),
      ).rejects.toThrow('Invalid weight 25 - must be between 0 and 20')
    })

    test('should reject negative weights', async () => {
      await expect(
        bulkUpdateSchoolCoefficients({
          schoolId: fakeSchoolId,
          updates: [
            { coefficientTemplateId: 'template-1', weightOverride: -3 },
          ],
        }),
      ).rejects.toThrow('Invalid weight -3 - must be between 0 and 20')
    })
  })
})
