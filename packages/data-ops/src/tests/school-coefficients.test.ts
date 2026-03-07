import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getDb } from '../database/setup'
import {
  bulkUpdateSchoolCoefficients,
  createCoefficientOverride,
  updateCoefficientOverride,
  upsertCoefficientOverride,
} from '../queries/school-coefficients'

vi.mock('../database/setup', () => ({
  getDb: vi.fn(),
}))

describe('school coefficients queries', () => {
  const fakeSchoolId = 'fake-school-id'
  const fakeTemplateId = 'fake-template-id'

  beforeEach(() => {
    vi.clearAllMocks()
  })

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
      expect(result).toStrictEqual([])
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

    test('should deduplicate repeated template ids before bulk upsert', async () => {
      const returning = vi.fn().mockResolvedValue([])
      const onConflictDoUpdate = vi.fn().mockReturnValue({ returning })
      const values = vi.fn().mockReturnValue({ onConflictDoUpdate })
      const insert = vi.fn().mockReturnValue({ values })

      vi.mocked(getDb).mockReturnValue({ insert } as unknown as ReturnType<typeof getDb>)

      await bulkUpdateSchoolCoefficients({
        schoolId: fakeSchoolId,
        updates: [
          { coefficientTemplateId: 'template-1', weightOverride: 5 },
          { coefficientTemplateId: 'template-2', weightOverride: 6 },
          { coefficientTemplateId: 'template-1', weightOverride: 7 },
        ],
      })

      expect(insert).toHaveBeenCalledOnce()
      expect(values).toHaveBeenCalledOnce()

      const insertedRows = values.mock.calls[0]?.[0]
      expect(insertedRows).toHaveLength(2)
      expect(insertedRows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            schoolId: fakeSchoolId,
            coefficientTemplateId: 'template-1',
            weightOverride: 7,
          }),
          expect.objectContaining({
            schoolId: fakeSchoolId,
            coefficientTemplateId: 'template-2',
            weightOverride: 6,
          }),
        ]),
      )
    })
  })
})
