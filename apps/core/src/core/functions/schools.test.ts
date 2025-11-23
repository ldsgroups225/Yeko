import * as dataOps from '@repo/data-ops'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createSchool, getSchoolById, getSchools, updateSchool } from './schools'

// Mock the data-ops package
vi.mock('@repo/data-ops', () => ({
  createSchool: vi.fn(),
  getSchools: vi.fn(),
  getSchoolById: vi.fn(),
  updateSchool: vi.fn(),
  deleteSchool: vi.fn(),
  initDatabase: vi.fn(),
}))

// Mock createServerFn to execute the handler directly
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    const chain = {
      middleware: () => chain,
      inputValidator: () => chain,
      handler: (cb: any) => {
        return async (payload: any) => {
          // Mock the context with data from payload
          return cb({ data: payload?.data || {}, context: {} })
        }
      },
    }
    return chain
  },
}))

// Mock the middleware (less important now if createServerFn is mocked, but good to keep)
vi.mock('@/core/middleware/example-middleware', () => ({
  exampleMiddlewareWithContext: {},
}))

describe('schools Server Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('getSchools should return mapped schools with settings', async () => {
    const mockSchools = [
      { id: '1', name: 'School 1', settings: { theme: 'dark' } },
      { id: '2', name: 'School 2', settings: null }, // Test null settings
    ]
    const mockPagination = { total: 2, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false }

    vi.mocked(dataOps.getSchools).mockResolvedValue({
      schools: mockSchools as any,
      pagination: mockPagination,
    })

    // We call the function. In a unit test environment, createServerFn might behave differently.
    // If this fails, we might need to rely on integration tests or mock createServerFn.
    const result = await getSchools({ data: { page: 1, limit: 10 } })

    expect(dataOps.getSchools).toHaveBeenCalledWith({ page: 1, limit: 10 })
    expect(result.data).toHaveLength(2)
    expect(result.data![0]!.settings).toStrictEqual({ theme: 'dark' })
    expect(result.data![1]!.settings).toStrictEqual({}) // Should default to empty object
    expect(result.meta).toStrictEqual(mockPagination)
  })

  test('createSchool should return new school with settings', async () => {
    const newSchoolData = { name: 'New School', code: 'NEW', status: 'active' as const, settings: { foo: 'bar' } }
    const createdSchool = { ...newSchoolData, id: '123', createdAt: new Date(), updatedAt: new Date() }

    vi.mocked(dataOps.createSchool).mockResolvedValue(createdSchool as any)

    const result = await createSchool({ data: newSchoolData })

    expect(dataOps.createSchool).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New School',
      settings: { foo: 'bar' },
    }))
    expect(result.settings).toStrictEqual({ foo: 'bar' })
  })

  test('getSchoolById should return school with settings', async () => {
    const mockSchool = { id: '1', name: 'School 1', settings: { theme: 'light' } }
    vi.mocked(dataOps.getSchoolById).mockResolvedValue(mockSchool as any)

    const result = await getSchoolById({ data: { id: '1' } })

    expect(dataOps.getSchoolById).toHaveBeenCalledWith('1')
    expect(result.settings).toStrictEqual({ theme: 'light' })
  })

  test('updateSchool should return updated school with settings', async () => {
    const updateData = { id: '1', name: 'Updated School' }
    const updatedSchool = { id: '1', name: 'Updated School', settings: {} }
    vi.mocked(dataOps.updateSchool).mockResolvedValue(updatedSchool as any)

    const result = await updateSchool({ data: updateData })

    expect(dataOps.updateSchool).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Updated School' }))
    expect(result.settings).toStrictEqual({})
  })
})
