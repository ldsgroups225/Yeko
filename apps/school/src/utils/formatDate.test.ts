import { beforeEach, describe, expect, test, vi } from 'vitest'
import { formatDate } from './formatDate'

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

vi.mock('@/i18n/config', () => ({
  default: {
    language: 'fr',
  },
}))

describe('formatDate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('date formatting with different locales', () => {
    test('should format date in French with LONG format', () => {
      const date = new Date(2025, 11, 18)
      const result = formatDate(date, 'LONG', 'fr')
      expect(result).toBe('18 décembre 2025')
    })

    test('should format date in English with LONG format', () => {
      const date = new Date(2025, 11, 18)
      const result = formatDate(date, 'LONG', 'en')
      expect(result).toBe('18 December 2025')
    })

    test('should format date in French with MEDIUM format', () => {
      const date = new Date(2025, 0, 15)
      const result = formatDate(date, 'MEDIUM', 'fr')
      expect(result).toBe('15 janv. 2025')
    })

    test('should format date in English with MEDIUM format', () => {
      const date = new Date(2025, 0, 15)
      const result = formatDate(date, 'MEDIUM', 'en')
      expect(result).toBe('Jan 15, 2025')
    })

    test('should format date in French with FULL format', () => {
      const date = new Date(2025, 11, 18)
      const result = formatDate(date, 'FULL', 'fr')
      expect(result).toBe('jeudi 18 décembre 2025')
    })

    test('should format date in English with FULL format', () => {
      const date = new Date(2025, 11, 18)
      const result = formatDate(date, 'FULL', 'en')
      expect(result).toBe('Thursday 18 December 2025')
    })

    test('should format date with SHORT format regardless of locale', () => {
      const date = new Date(2025, 11, 18)
      const resultFr = formatDate(date, 'SHORT', 'fr')
      const resultEn = formatDate(date, 'SHORT', 'en')
      expect(resultFr).toBe('2025-12-18')
      expect(resultEn).toBe('2025-12-18')
    })
  })

  describe('handling of ISO date strings', () => {
    test('should parse ISO date string and format correctly', () => {
      const isoDate = '2025-12-18T10:30:00.000Z'
      const result = formatDate(isoDate, 'LONG', 'fr')
      expect(result).toBe('18 décembre 2025')
    })

    test('should handle ISO date string with different times', () => {
      const isoDate = '2024-02-29T23:59:59.999Z'
      const result = formatDate(isoDate, 'MEDIUM', 'en')
      expect(result).toBe('Feb 29, 2024')
    })

    test('should handle date string without time component', () => {
      const dateString = '2025-01-01'
      const result = formatDate(dateString, 'SHORT', 'en')
      expect(result).toBe('2025-01-01')
    })
  })

  describe('format variations', () => {
    test('should use SHORT format by default', () => {
      const date = new Date(2025, 6, 4)
      const result = formatDate(date)
      expect(result).toBe('2025-07-04')
    })

    test('should handle all format styles', () => {
      const date = new Date(2025, 3, 15)
      expect(formatDate(date, 'SHORT')).toBe('2025-04-15')
      expect(formatDate(date, 'MEDIUM', 'fr')).toBe('15 avr. 2025')
      expect(formatDate(date, 'LONG', 'fr')).toBe('15 avril 2025')
      expect(formatDate(date, 'FULL', 'fr')).toContain('15 avril 2025')
    })

    test('should handle leap year dates', () => {
      const leapYearDate = new Date(2024, 1, 29)
      const result = formatDate(leapYearDate, 'MEDIUM', 'en')
      expect(result).toBe('Feb 29, 2024')
    })

    test('should handle dates at year boundaries', () => {
      const newYearDate = new Date(2025, 11, 31)
      const result = formatDate(newYearDate, 'SHORT')
      expect(result).toBe('2025-12-31')

      const yearStart = new Date(2025, 0, 1)
      const resultStart = formatDate(yearStart, 'SHORT')
      expect(resultStart).toBe('2025-01-01')
    })
  })

  describe('locale auto-detection', () => {
    test('should use French as default when i18n returns unknown locale', () => {
      const date = new Date(2025, 11, 18)
      vi.doMock('@/i18n/config', () => ({
        default: {
          language: 'de',
        },
      }))
      const result = formatDate(date, 'MEDIUM')
      expect(result).toBe('18 déc. 2025')
    })

    test('should use first two characters of locale code', () => {
      const date = new Date(2025, 11, 18)
      vi.doMock('@/i18n/config', () => ({
        default: {
          language: 'en-US',
        },
      }))
      const result = formatDate(date, 'MEDIUM', 'en')
      expect(result).toBe('Dec 18, 2025')
    })
  })

  describe('edge cases', () => {
    test('should handle very old dates', () => {
      const oldDate = new Date(1900, 0, 1)
      const result = formatDate(oldDate, 'SHORT')
      expect(result).toBe('1900-01-01')
    })

    test('should handle future dates', () => {
      const futureDate = new Date(2100, 11, 31)
      const result = formatDate(futureDate, 'SHORT')
      expect(result).toBe('2100-12-31')
    })

    test('should handle midnight time', () => {
      const midnightDate = new Date(2025, 6, 4, 0, 0, 0)
      const result = formatDate(midnightDate, 'SHORT')
      expect(result).toBe('2025-07-04')
    })

    test('should handle end of day time', () => {
      const endOfDayDate = new Date(2025, 6, 4, 23, 59, 59)
      const result = formatDate(endOfDayDate, 'SHORT')
      expect(result).toBe('2025-07-04')
    })
  })
})
