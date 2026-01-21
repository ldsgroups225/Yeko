import { beforeEach, describe, expect, test, vi } from 'vitest'
import { generateUUID } from './generateUUID'

vi.mock('@repo/data-ops', () => ({
  initDatabase: vi.fn(),
}))

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    const chain = {
      middleware: () => chain,
      inputValidator: () => chain,
      handler: (cb: any) => {
        return async (payload: any) => {
          return cb({ data: payload?.data || {}, context: {} })
        }
      },
    }
    return chain
  },
}))

describe('generateUUID', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('uUID format validation', () => {
    test('should generate UUID with correct format 8-4-4-4-12', () => {
      const uuid = generateUUID()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuid).toMatch(uuidRegex)
    })

    test('should generate UUID with version 4 indicator', () => {
      const uuid = generateUUID()
      // UUID format: xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx
      // Version 4 is at position 14 (after second hyphen)
      expect(uuid.charAt(14)).toBe('4')
    })

    test('should generate UUID with correct variant indicator', () => {
      const uuid = generateUUID()
      // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // Variant indicator (8, 9, a, b) is at position 19
      const variantChar = uuid.charAt(19)
      expect(['8', '9', 'a', 'b']).toContain(variantChar)
    })

    test('should generate UUID with proper hyphen placement', () => {
      const uuid = generateUUID()
      expect(uuid.charAt(8)).toBe('-')
      expect(uuid.charAt(13)).toBe('-')
      expect(uuid.charAt(18)).toBe('-')
      expect(uuid.charAt(23)).toBe('-')
    })

    test('should generate UUID of correct length', () => {
      const uuid = generateUUID()
      expect(uuid).toHaveLength(36)
    })
  })

  describe('uniqueness', () => {
    test('should generate unique UUIDs on consecutive calls', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      const uuid3 = generateUUID()
      expect(uuid1).not.toBe(uuid2)
      expect(uuid2).not.toBe(uuid3)
      expect(uuid1).not.toBe(uuid3)
    })

    test('should generate statistically unique UUIDs (1000 samples)', () => {
      const uuidSet = new Set<string>()
      for (let i = 0; i < 1000; i++) {
        const uuid = generateUUID()
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        uuidSet.add(uuid)
      }
      expect(uuidSet.size).toBe(1000)
    })

    test('should handle high-frequency generation without collisions', () => {
      const iterations = 500
      const uuidSet = new Set<string>()
      for (let i = 0; i < iterations; i++) {
        uuidSet.add(generateUUID())
      }
      expect(uuidSet.size).toBe(iterations)
    })
  })

  describe('invalid inputs and edge cases', () => {
    test('should always return a string type', () => {
      const uuid = generateUUID()
      expect(typeof uuid).toBe('string')
    })

    test('should only contain hexadecimal characters (except hyphens)', () => {
      const uuid = generateUUID()
      const hexOnly = uuid.replace(/-/g, '')
      expect(hexOnly).toMatch(/^[0-9a-f]+$/i)
    })

    test('should generate valid UUIDs after multiple generations', () => {
      const validUUIDs: string[] = []
      for (let i = 0; i < 100; i++) {
        const uuid = generateUUID()
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (uuid.match(uuidRegex)) {
          validUUIDs.push(uuid)
        }
      }
      expect(validUUIDs).toHaveLength(100)
    })
  })

  describe('consistency', () => {
    test('should generate UUIDs that can be used as object keys', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      const map = new Map()
      map.set(uuid1, 'value1')
      map.set(uuid2, 'value2')
      expect(map.get(uuid1)).toBe('value1')
      expect(map.get(uuid2)).toBe('value2')
    })

    test('should generate UUIDs suitable for array filtering', () => {
      const uuids = [generateUUID(), generateUUID(), generateUUID()]
      const filtered = uuids.filter(uuid => uuid.length === 36)
      expect(filtered).toHaveLength(3)
    })
  })
})
