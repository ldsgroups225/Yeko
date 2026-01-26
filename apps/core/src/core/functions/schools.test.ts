import * as dataOps from '@repo/data-ops'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { bulkUpdateSchools, createSchool, deleteSchool, getSchoolById, getSchools, updateSchool } from './schools'

// Mock the data-ops package and its subpaths
vi.mock('@repo/data-ops', () => ({
  createSchool: vi.fn(),
  getSchools: vi.fn(),
  getSchoolById: vi.fn(),
  updateSchool: vi.fn(),
  deleteSchool: vi.fn(),
  initDatabase: vi.fn(),
}))

vi.mock('@repo/data-ops/queries/schools', () => ({
  createSchool: vi.fn(),
  getSchools: vi.fn(),
  getSchoolById: vi.fn(),
  updateSchool: vi.fn(),
  deleteSchool: vi.fn(),
}))

// Mock the middleware (less important now if createServerFn is mocked, but good to keep)
vi.mock('@/core/middleware/example-middleware', () => ({
  exampleMiddlewareWithContext: {},
}))

describe('schools Server Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSchools', () => {
    test('should return mapped schools with settings', async () => {
      const mockSchools = [
        { id: '1', name: 'School 1', settings: { theme: 'dark' } },
        { id: '2', name: 'School 2', settings: null }, // Test null settings
      ]
      const mockPagination = { total: 2, page: 1, limit: 10, totalPages: 1 }

      vi.mocked(dataOps.getSchools).mockResolvedValue({
        schools: mockSchools as any,
        pagination: mockPagination,
      })

      const result = await getSchools({ data: { page: 1, limit: 10 } })

      expect(dataOps.getSchools).toHaveBeenCalledWith({ page: 1, limit: 10 })
      expect(result.data).toHaveLength(2)
      expect(result.data![0]!.settings).toStrictEqual({ theme: 'dark' })
      expect(result.data![1]!.settings).toStrictEqual({}) // Should default to empty object
      expect(result.meta).toStrictEqual(mockPagination)
    })

    test('should handle pagination with various page sizes', async () => {
      const mockSchools = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        name: `School ${i + 1}`,
        settings: {},
      }))

      vi.mocked(dataOps.getSchools).mockResolvedValue({
        schools: mockSchools.slice(0, 10) as any,
        pagination: { total: 25, page: 1, limit: 10, totalPages: 3 },
      })

      const result = await getSchools({ data: { page: 1, limit: 10 } })

      expect(result.data).toHaveLength(10)
      expect(result.meta.total).toBe(25)
      expect(result.meta.page).toBe(1)
    })

    test('should handle search functionality', async () => {
      vi.mocked(dataOps.getSchools).mockResolvedValue({
        schools: [{ id: '1', name: 'Search Result School', settings: {} }] as any,
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      })

      const result = await getSchools({ data: { page: 1, limit: 10, search: 'Search' } })

      expect(dataOps.getSchools).toHaveBeenCalledWith({ page: 1, limit: 10, search: 'Search' })
      expect(result.data).toHaveLength(1)
      expect(result.data![0]!.name).toContain('Search')
    })

    test('should handle status filtering', async () => {
      vi.mocked(dataOps.getSchools).mockResolvedValue({
        schools: [{ id: '1', name: 'Active School', settings: {}, status: 'active' }] as any,
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      })

      const result = await getSchools({ data: { page: 1, limit: 10, status: 'active' } })

      expect(dataOps.getSchools).toHaveBeenCalledWith({ page: 1, limit: 10, status: 'active' })
      expect(result.data).toHaveLength(1)
    })

    test('should handle empty results', async () => {
      vi.mocked(dataOps.getSchools).mockResolvedValue({
        schools: [] as any,
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      })

      const result = await getSchools({ data: { page: 1, limit: 10 } })

      expect(result.data).toHaveLength(0)
      expect(result.meta.total).toBe(0)
    })
  })

  describe('createSchool', () => {
    test('should create school with valid data', async () => {
      const newSchoolData = {
        name: 'New School',
        code: 'NEW',
        status: 'active' as const,
        settings: { foo: 'bar' },
      }
      const createdSchool = {
        ...newSchoolData,
        id: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(dataOps.createSchool).mockResolvedValue(createdSchool as any)

      const result = await createSchool({ data: newSchoolData })

      expect(dataOps.createSchool).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New School',
        settings: { foo: 'bar' },
      }))
      expect(result.settings).toStrictEqual({ foo: 'bar' })
      expect(result.id).toBe('123')
    })

    test('should handle missing settings gracefully', async () => {
      const newSchoolData = { name: 'School Without Settings', code: 'SWS', status: 'active' as const }
      const createdSchool = {
        ...newSchoolData,
        id: '123',
        settings: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(dataOps.createSchool).mockResolvedValue(createdSchool as any)

      const result = await createSchool({ data: newSchoolData })

      expect(dataOps.createSchool).toHaveBeenCalledWith(expect.objectContaining({
        name: 'School Without Settings',
        settings: {},
      }))
      expect(result.settings).toStrictEqual({})
    })

    test('should reject duplicate school codes', async () => {
      const duplicateData = { name: 'Duplicate School', code: 'DUP', status: 'active' as const }

      vi.mocked(dataOps.createSchool).mockRejectedValue(new Error('School code already exists'))

      await expect(createSchool({ data: duplicateData })).rejects.toThrow('School code already exists')
    })
  })

  describe('getSchoolById', () => {
    test('should return existing school with settings', async () => {
      const mockSchool = { id: '1', name: 'School 1', settings: { theme: 'light' } }
      vi.mocked(dataOps.getSchoolById).mockResolvedValue(mockSchool as any)

      const result = await getSchoolById({ data: { id: '1' } })

      expect(dataOps.getSchoolById).toHaveBeenCalledWith('1')
      expect(result.settings).toStrictEqual({ theme: 'light' })
      expect(result.name).toBe('School 1')
    })

    test('should throw error for non-existent school', async () => {
      vi.mocked(dataOps.getSchoolById).mockResolvedValue(null)

      await expect(getSchoolById({ data: { id: 'nonexistent' } })).rejects.toThrow('School not found')
    })

    test('should handle null settings', async () => {
      const mockSchool = { id: '1', name: 'School 1', settings: null }
      vi.mocked(dataOps.getSchoolById).mockResolvedValue(mockSchool as any)

      const result = await getSchoolById({ data: { id: '1' } })

      expect(result.settings).toStrictEqual({})
    })
  })

  describe('updateSchool', () => {
    test('should update single field', async () => {
      const updateData = { id: '1', name: 'Updated School' }
      const updatedSchool = { id: '1', name: 'Updated School', settings: {} }
      vi.mocked(dataOps.updateSchool).mockResolvedValue(updatedSchool as any)

      const result = await updateSchool({ data: updateData })

      expect(dataOps.updateSchool).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Updated School' }))
      expect(result.settings).toStrictEqual({})
      expect(result.name).toBe('Updated School')
    })

    test('should update multiple fields', async () => {
      const updateData = { id: '1', name: 'Updated School', code: 'UPD', status: 'inactive' as const }
      const updatedSchool = { ...updateData, settings: {} }
      vi.mocked(dataOps.updateSchool).mockResolvedValue(updatedSchool as any)

      await updateSchool({ data: updateData })

      expect(dataOps.updateSchool).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated School',
        code: 'UPD',
        status: 'inactive',
      }))
    })

    test('should throw error for non-existent school', async () => {
      vi.mocked(dataOps.updateSchool).mockRejectedValue(new Error('School not found'))

      await expect(updateSchool({ data: { id: 'nonexistent', name: 'Updated' } })).rejects.toThrow('School not found')
    })

    test('should update timestamp verification', async () => {
      const updateData = { id: '1', name: 'Updated School' }
      const now = new Date()
      const updatedSchool = {
        id: '1',
        name: 'Updated School',
        settings: {},
        updatedAt: now,
      }
      vi.mocked(dataOps.updateSchool).mockResolvedValue(updatedSchool as any)

      const result = await updateSchool({ data: updateData })

      expect(result.updatedAt).toBe(now)
    })
  })

  describe('deleteSchool', () => {
    test('should delete existing school', async () => {
      vi.mocked(dataOps.deleteSchool).mockResolvedValue(undefined)

      const result = await deleteSchool({ data: { id: '1' } })

      expect(dataOps.deleteSchool).toHaveBeenCalledWith('1')
      expect(result).toStrictEqual({ success: true, id: '1' })
    })

    test('should handle non-existent school deletion', async () => {
      vi.mocked(dataOps.deleteSchool).mockRejectedValue(new Error('School not found'))

      await expect(deleteSchool({ data: { id: 'nonexistent' } })).rejects.toThrow('School not found')
    })
  })

  describe('bulkUpdateSchools', () => {
    test('should update multiple schools status', async () => {
      vi.mocked(dataOps.updateSchool).mockResolvedValue({ id: '1' } as any)

      const result = await bulkUpdateSchools({
        data: { schoolIds: ['1', '2', '3'], status: 'inactive' },
      })

      expect(dataOps.updateSchool).toHaveBeenCalledTimes(3)
      expect(dataOps.updateSchool).toHaveBeenNthCalledWith(1, '1', { status: 'inactive' })
      expect(dataOps.updateSchool).toHaveBeenNthCalledWith(2, '2', { status: 'inactive' })
      expect(dataOps.updateSchool).toHaveBeenNthCalledWith(3, '3', { status: 'inactive' })
      expect(result).toStrictEqual({ success: true, count: 3 })
    })

    test('should handle non-existent schools gracefully', async () => {
      vi.mocked(dataOps.updateSchool)
        .mockResolvedValueOnce({ id: '1' } as any)
        .mockRejectedValueOnce(new Error('School not found'))
        .mockResolvedValueOnce({ id: '3' } as any)

      const result = await bulkUpdateSchools({
        data: { schoolIds: ['1', 'nonexistent', '3'], status: 'active' },
      })

      expect(dataOps.updateSchool).toHaveBeenCalledTimes(3)
      expect(result).toStrictEqual({ success: true, count: 3 })
    })
  })
})
