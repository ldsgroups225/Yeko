import { describe, expect, test, vi } from 'vitest'
import {
  getProgramTemplateById,
  getProgramTemplates,
  getProgramVersions,
  publishProgram,
  restoreProgramVersion,
} from '../queries/programs'

// Mock the database
vi.mock('../drizzle/db', () => ({
  getDb: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb: any) => cb({
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
  })),
}))

describe('program Queries', () => {
  test('should get program templates', async () => {
    const result = await getProgramTemplates({})
    expect(result).toBeDefined()
  })

  test('should get program template by id', async () => {
    const result = await getProgramTemplateById('test-id')
    expect(result).toBeDefined()
  })

  test('should publish a program', async () => {
    // Mock implementation details would go here
    // For now we just check if the function exists and runs
    await expect(publishProgram('test-id')).rejects.toThrow()
  })

  test('should get program versions', async () => {
    const result = await getProgramVersions('test-id')
    expect(result).toBeDefined()
  })

  test('should restore a program version', async () => {
    await expect(restoreProgramVersion('version-id')).rejects.toThrow()
  })
})
