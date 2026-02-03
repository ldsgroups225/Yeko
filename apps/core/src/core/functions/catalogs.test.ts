import * as dataOps from '@repo/data-ops/queries/catalogs'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  bulkCreateSeriesMutation,
  bulkCreateSubjectsMutation,
  // Bulk Operations
  bulkUpdateGradesOrderMutation,
  // Stats
  catalogStatsQuery,
  createGradeMutation,
  createSerieMutation,
  createSubjectMutation,
  createTrackMutation,
  deleteGradeMutation,
  deleteSerieMutation,
  deleteSubjectMutation,
  deleteTrackMutation,
  // Education Levels
  educationLevelsQuery,
  gradeByIdQuery,
  // Grades
  gradesQuery,
  serieByIdQuery,
  // Series
  seriesQuery,
  subjectByIdQuery,
  // Subjects
  subjectsQuery,
  trackByIdQuery,
  // Tracks
  tracksQuery,
  updateGradeMutation,
  updateSerieMutation,
  updateSubjectMutation,
  updateTrackMutation,
} from './catalogs'

function mockOk<T>(value: T) {
  return {
    isOk: () => true,
    isErr: () => false,
    value,
  }
}

// Mock the data-ops catalog queries
vi.mock('@repo/data-ops/queries/catalogs', () => ({
  // Education Levels
  getEducationLevels: vi.fn(),
  // Tracks
  getTracks: vi.fn(),
  getTrackById: vi.fn(),
  createTrack: vi.fn(),
  updateTrack: vi.fn(),
  deleteTrack: vi.fn(),
  // Grades
  getGrades: vi.fn(),
  getGradeById: vi.fn(),
  createGrade: vi.fn(),
  updateGrade: vi.fn(),
  deleteGrade: vi.fn(),
  // Series
  getSeries: vi.fn(),
  getSerieById: vi.fn(),
  createSerie: vi.fn(),
  updateSerie: vi.fn(),
  deleteSerie: vi.fn(),
  // Subjects
  getSubjects: vi.fn(),
  getSubjectById: vi.fn(),
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
  // Stats
  getCatalogStats: vi.fn(),
  // Bulk Operations
  bulkUpdateGradesOrder: vi.fn(),
  bulkCreateSeries: vi.fn(),
  bulkCreateSubjects: vi.fn(),
}))

// Mock the middleware
vi.mock('@/core/middleware/example-middleware', () => ({
  exampleMiddlewareWithContext: {},
}))

describe('catalogs Server Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('education Levels', () => {
    test('should return education levels', async () => {
      const mockEducationLevels = [
        { id: '1', name: 'Primary', code: 'primary' },
        { id: '2', name: 'Secondary', code: 'secondary' },
      ]

      vi.mocked(dataOps.getEducationLevels).mockResolvedValue(mockOk(mockEducationLevels) as any)

      const result = await educationLevelsQuery()

      expect(dataOps.getEducationLevels).toHaveBeenCalled()
      expect(result).toStrictEqual(mockEducationLevels)
    })
  })

  describe('tracks', () => {
    test('should return all tracks', async () => {
      const mockTracks = [
        { id: '1', name: 'Science', code: 'SCI', educationLevelId: 1 },
        { id: '2', name: 'Literature', code: 'LIT', educationLevelId: 1 },
      ]

      vi.mocked(dataOps.getTracks).mockResolvedValue(mockOk(mockTracks) as any)

      const result = await tracksQuery()

      expect(dataOps.getTracks).toHaveBeenCalled()
      expect(result).toStrictEqual(mockTracks)
    })

    test('should return track by ID', async () => {
      const mockTrack = { id: '1', name: 'Science', code: 'SCI', educationLevelId: 1 }

      vi.mocked(dataOps.getTrackById).mockResolvedValue(mockOk(mockTrack) as any)

      const result = await trackByIdQuery({ data: { id: '1' } })

      expect(dataOps.getTrackById).toHaveBeenCalledWith('1')
      expect(result).toStrictEqual(mockTrack)
    })

    test('should create new track', async () => {
      const newTrackData = { name: 'Arts', code: 'ARTS', educationLevelId: 1 }
      const createdTrack = { ...newTrackData, id: '3', createdAt: new Date(), updatedAt: new Date() }

      vi.mocked(dataOps.createTrack).mockResolvedValue(mockOk(createdTrack) as any)

      const result = await createTrackMutation({ data: newTrackData })

      expect(dataOps.createTrack).toHaveBeenCalledWith(newTrackData)
      expect(result).toStrictEqual(createdTrack)
    })

    test('should update existing track', async () => {
      const updateData = { id: '1', name: 'Advanced Science' }
      const updatedTrack = { id: '1', name: 'Advanced Science', code: 'SCI', educationLevelId: 1 }

      vi.mocked(dataOps.updateTrack).mockResolvedValue(mockOk(updatedTrack) as any)

      const result = await updateTrackMutation({ data: updateData })

      expect(dataOps.updateTrack).toHaveBeenCalledWith('1', { name: 'Advanced Science' })
      expect(result).toStrictEqual(updatedTrack)
    })

    test('should delete track', async () => {
      vi.mocked(dataOps.deleteTrack).mockResolvedValue(mockOk(undefined) as any)

      const result = await deleteTrackMutation({ data: { id: '1' } })

      expect(dataOps.deleteTrack).toHaveBeenCalledWith('1')
      expect(result).toStrictEqual({ success: true, id: '1' })
    })
  })

  describe('grades', () => {
    test('should return grades with filters', async () => {
      const mockGrades = [
        { id: '1', name: 'Grade 1', trackId: '1', order: 1 },
        { id: '2', name: 'Grade 2', trackId: '1', order: 2 },
      ]

      vi.mocked(dataOps.getGrades).mockResolvedValue(mockOk(mockGrades) as any)

      const result = await gradesQuery({ data: { page: 1, limit: 10, trackId: '1' } })

      expect(dataOps.getGrades).toHaveBeenCalledWith({ page: 1, limit: 10, trackId: '1' })
      expect(result).toHaveLength(2)
    })

    test('should return grade by ID', async () => {
      const mockGrade = { id: '1', name: 'Grade 1', trackId: '1', order: 1 }

      vi.mocked(dataOps.getGradeById).mockResolvedValue(mockOk(mockGrade) as any)

      const result = await gradeByIdQuery({ data: { id: '1' } })

      expect(dataOps.getGradeById).toHaveBeenCalledWith('1')
      expect(result).toStrictEqual(mockGrade)
    })

    test('should create new grade with track association', async () => {
      const newGradeData = { name: 'Grade 3', code: 'G3', trackId: '1', order: 3 }
      const createdGrade = { ...newGradeData, id: '3', createdAt: new Date(), updatedAt: new Date() }

      vi.mocked(dataOps.createGrade).mockResolvedValue(mockOk(createdGrade) as any)

      const result = await createGradeMutation({ data: newGradeData })

      expect(dataOps.createGrade).toHaveBeenCalledWith(newGradeData)
      expect(result).toStrictEqual(createdGrade)
    })

    test('should update grade and maintain order management', async () => {
      const updateData = { id: '1', name: 'Grade 1A', order: 1 }
      const updatedGrade = { id: '1', name: 'Grade 1A', trackId: '1', order: 1 }

      vi.mocked(dataOps.updateGrade).mockResolvedValue(mockOk(updatedGrade) as any)

      const result = await updateGradeMutation({ data: updateData })

      expect(dataOps.updateGrade).toHaveBeenCalledWith('1', { name: 'Grade 1A', order: 1 })
      expect(result).toStrictEqual(updatedGrade)
    })

    test('should prevent duplicate grades in same track', async () => {
      const duplicateData = { name: 'Grade 1', code: 'G1', trackId: '1', order: 1 }

      vi.mocked(dataOps.createGrade).mockRejectedValue(new Error('Grade already exists in this track'))

      await expect(createGradeMutation({ data: duplicateData })).rejects.toThrow('Grade already exists in this track')
    })

    test('should delete grade', async () => {
      vi.mocked(dataOps.deleteGrade).mockResolvedValue(mockOk(undefined) as any)

      const result = await deleteGradeMutation({ data: { id: '1' } })

      expect(dataOps.deleteGrade).toHaveBeenCalledWith('1')
      expect(result).toStrictEqual({ success: true, id: '1' })
    })
  })

  describe('series', () => {
    test('should return series with filters', async () => {
      const mockSeries = [
        { id: '1', name: 'Series A', code: 'SA', gradeId: '1' },
        { id: '2', name: 'Series B', code: 'SB', gradeId: '1' },
      ]

      vi.mocked(dataOps.getSeries).mockResolvedValue(mockOk(mockSeries) as any)

      const result = await seriesQuery({ data: { page: 1, limit: 10, gradeId: '1' } })

      expect(dataOps.getSeries).toHaveBeenCalledWith({ page: 1, limit: 10, gradeId: '1' })
      expect(result).toHaveLength(2)
    })

    test('should return series by ID', async () => {
      const mockSerie = { id: '1', name: 'Series A', code: 'SA', gradeId: '1' }

      vi.mocked(dataOps.getSerieById).mockResolvedValue(mockOk(mockSerie) as any)

      const result = await serieByIdQuery({ data: { id: '1' } })

      expect(dataOps.getSerieById).toHaveBeenCalledWith('1')
      expect(result).toStrictEqual(mockSerie)
    })

    test('should create new series with track association', async () => {
      const newSerieData = { name: 'Series C', code: 'SC', trackId: '1' }
      const createdSerie = { ...newSerieData, id: '3', gradeId: '1', createdAt: new Date(), updatedAt: new Date() }

      vi.mocked(dataOps.createSerie).mockResolvedValue(mockOk(createdSerie) as any)

      const result = await createSerieMutation({ data: newSerieData })

      expect(dataOps.createSerie).toHaveBeenCalledWith(newSerieData)
      expect(result).toStrictEqual(createdSerie)
    })

    test('should ensure code uniqueness within track', async () => {
      const duplicateData = { name: 'Series Duplicate', code: 'SA', trackId: '1' }

      vi.mocked(dataOps.createSerie).mockRejectedValue(new Error('Series code already exists in this track'))

      await expect(createSerieMutation({ data: duplicateData })).rejects.toThrow('Series code already exists in this track')
    })

    test('should update series', async () => {
      const updateData = { id: '1', name: 'Series A Updated' }
      const updatedSerie = { id: '1', name: 'Series A Updated', code: 'SA', gradeId: '1' }

      vi.mocked(dataOps.updateSerie).mockResolvedValue(mockOk(updatedSerie) as any)

      const result = await updateSerieMutation({ data: updateData })

      expect(dataOps.updateSerie).toHaveBeenCalledWith('1', { name: 'Series A Updated' })
      expect(result).toStrictEqual(updatedSerie)
    })

    test('should delete series', async () => {
      vi.mocked(dataOps.deleteSerie).mockResolvedValue(mockOk(undefined) as any)

      const result = await deleteSerieMutation({ data: { id: '1' } })

      expect(dataOps.deleteSerie).toHaveBeenCalledWith('1')
      expect(result).toStrictEqual({ success: true, id: '1' })
    })
  })

  describe('subjects', () => {
    test('should return subjects with filters', async () => {
      const mockSubjects = [
        { id: '1', name: 'Mathematics', code: 'MATH', category: 'Scientifique', trackId: '1' },
        { id: '2', name: 'Physics', code: 'PHY', category: 'Scientifique', trackId: '1' },
      ]

      vi.mocked(dataOps.getSubjects).mockResolvedValue(mockOk({
        subjects: mockSubjects as any,
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
      }) as any)

      const result = await subjectsQuery({ data: { page: 1, limit: 10, trackId: '1' } })

      expect(dataOps.getSubjects).toHaveBeenCalledWith({ page: 1, limit: 10, trackId: '1' })
      expect(result.subjects).toHaveLength(2)
    })

    test('should return subject by ID', async () => {
      const mockSubject = { id: '1', name: 'Mathematics', code: 'MATH', category: 'Scientifique', trackId: '1' }

      vi.mocked(dataOps.getSubjectById).mockResolvedValue(mockOk(mockSubject) as any)

      const result = await subjectByIdQuery({ data: { id: '1' } })

      expect(dataOps.getSubjectById).toHaveBeenCalledWith('1')
      expect(result).toStrictEqual(mockSubject)
    })

    test('should create new subject with category management', async () => {
      const newSubjectData = { name: 'Chemistry', shortName: 'CHEM', category: 'Scientifique' }
      const createdSubject = { ...newSubjectData, id: '3', createdAt: new Date(), updatedAt: new Date() }

      vi.mocked(dataOps.createSubject).mockResolvedValue(mockOk(createdSubject) as any)

      const result = await createSubjectMutation({ data: newSubjectData })

      expect(dataOps.createSubject).toHaveBeenCalledWith(newSubjectData)
      expect(result).toStrictEqual(createdSubject)
    })

    test('should handle subject availability across tracks', async () => {
      const crossTrackSubject = { name: 'English', shortName: 'ENG', category: 'Littéraire' }
      const createdSubject = { ...crossTrackSubject, id: '4', createdAt: new Date(), updatedAt: new Date() }

      vi.mocked(dataOps.createSubject).mockResolvedValue(mockOk(createdSubject) as any)

      await createSubjectMutation({ data: crossTrackSubject })

      expect(dataOps.createSubject).toHaveBeenCalledWith(crossTrackSubject)
    })

    test('should update subject', async () => {
      const updateData = { id: '1', name: 'Advanced Mathematics' }
      const updatedSubject = { id: '1', name: 'Advanced Mathematics', code: 'MATH', category: 'Scientifique', trackId: '1' }

      vi.mocked(dataOps.updateSubject).mockResolvedValue(mockOk(updatedSubject) as any)

      const result = await updateSubjectMutation({ data: updateData })

      expect(dataOps.updateSubject).toHaveBeenCalledWith('1', { name: 'Advanced Mathematics' })
      expect(result).toStrictEqual(updatedSubject)
    })

    test('should delete subject', async () => {
      vi.mocked(dataOps.deleteSubject).mockResolvedValue(mockOk(undefined) as any)

      const result = await deleteSubjectMutation({ data: { id: '1' } })

      expect(dataOps.deleteSubject).toHaveBeenCalledWith('1')
      expect(result).toStrictEqual({ success: true, id: '1' })
    })
  })

  describe('catalog Stats', () => {
    test('should return catalog statistics', async () => {
      const mockStats = {
        educationLevels: 3,
        tracks: 12,
        grades: 36,
        series: 72,
        subjects: 48,
      }

      vi.mocked(dataOps.getCatalogStats).mockResolvedValue(mockOk(mockStats) as any)

      const result = await catalogStatsQuery()

      expect(dataOps.getCatalogStats).toHaveBeenCalled()
      expect(result).toStrictEqual(mockStats)
    })
  })

  describe('bulk Operations', () => {
    describe('bulkUpdateGradesOrder', () => {
      test('should reorder multiple grades with transaction handling', async () => {
        const gradeOrders = [
          { id: '1', order: 2 },
          { id: '2', order: 1 },
          { id: '3', order: 3 },
        ]

        vi.mocked(dataOps.bulkUpdateGradesOrder).mockResolvedValue(mockOk(undefined) as any)

        const result = await bulkUpdateGradesOrderMutation({ data: gradeOrders })

        expect(dataOps.bulkUpdateGradesOrder).toHaveBeenCalledWith(gradeOrders)
        expect(result).toStrictEqual({ success: true })
      })

      test('should maintain order consistency', async () => {
        const inconsistentOrders = [
          { id: '1', order: 1 },
          { id: '2', order: 1 }, // Duplicate order
          { id: '3', order: 3 },
        ]

        vi.mocked(dataOps.bulkUpdateGradesOrder).mockRejectedValue(new Error('Duplicate order values detected'))

        await expect(bulkUpdateGradesOrderMutation({ data: inconsistentOrders }))
          .rejects
          .toThrow('Duplicate order values detected')
      })
    })

    describe('bulkCreateSeries', () => {
      test('should create multiple series', async () => {
        const newSeries = [
          { name: 'Series X', code: 'SX', trackId: '1' },
          { name: 'Series Y', code: 'SY', trackId: '1' },
        ]
        const createdSeries = newSeries.map((serie, index) => ({
          ...serie,
          id: `${index + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        vi.mocked(dataOps.bulkCreateSeries).mockResolvedValue(mockOk(createdSeries) as any)

        const result = await bulkCreateSeriesMutation({ data: newSeries })

        expect(dataOps.bulkCreateSeries).toHaveBeenCalledWith(newSeries)
        expect(result).toStrictEqual(createdSeries)
        expect(result).toHaveLength(2)
      })

      test('should handle validation errors during bulk creation', async () => {
        const invalidSeries = [
          { name: 'Valid Series', code: 'VS', trackId: '1' },
          { name: '', code: 'INV', trackId: '1' }, // Invalid: empty name
        ]

        vi.mocked(dataOps.bulkCreateSeries).mockRejectedValue(new Error('Series name is required'))

        await expect(bulkCreateSeriesMutation({ data: invalidSeries }))
          .rejects
          .toThrow()
      })
    })

    describe('bulkCreateSubjects', () => {
      test('should create multiple subjects', async () => {
        const newSubjects = [
          { name: 'Biology', shortName: 'BIO', category: 'Scientifique' },
          { name: 'History', shortName: 'HIST', category: 'Littéraire' },
        ]
        const createdSubjects = newSubjects.map((subject, index) => ({
          ...subject,
          id: `${index + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        vi.mocked(dataOps.bulkCreateSubjects).mockResolvedValue(mockOk(createdSubjects) as any)

        const result = await bulkCreateSubjectsMutation({ data: newSubjects })

        expect(dataOps.bulkCreateSubjects).toHaveBeenCalledWith(newSubjects)
        expect(result).toStrictEqual(createdSubjects)
        expect(result).toHaveLength(2)
      })

      test('should handle duplicate codes during bulk creation', async () => {
        const duplicateSubjects = [
          { name: 'Math 1', shortName: 'MATH', category: 'Scientifique' },
          { name: 'Math 2', shortName: 'MATH', category: 'Scientifique' }, // Duplicate code
        ]

        vi.mocked(dataOps.bulkCreateSubjects).mockRejectedValue(new Error('Subject code must be unique'))

        await expect(bulkCreateSubjectsMutation({ data: duplicateSubjects }))
          .rejects
          .toThrow('Subject code must be unique')
      })
    })
  })

  describe('error Handling', () => {
    test('should handle not found errors gracefully', async () => {
      vi.mocked(dataOps.getTrackById).mockResolvedValue(mockOk(null) as any)

      const result = await trackByIdQuery({ data: { id: 'nonexistent' } })
      expect(result).toBeNull()
    })

    test('should handle database connection errors', async () => {
      vi.mocked(dataOps.createTrack).mockRejectedValue(new Error('Database connection failed'))

      await expect(createTrackMutation({ data: { name: 'Test', code: 'T', educationLevelId: 1 } }))
        .rejects
        .toThrow()
    })

    test('should handle validation errors', async () => {
      // Test invalid input for createTrack
      const invalidData = { name: '', code: '', educationLevelId: '' }

      // This should be caught by the input validator
      await expect(createTrackMutation({ data: invalidData }))
        .rejects
        .toThrow()
    })
  })
})
