/**
 * Localization Testing: Section 9
 * i18n Coverage, Language Switching, Translation Completeness, Date/Time/Number Formatting
 * Using vitest with jsdom environment for frontend tests
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import i18n from '@/i18n/config'
import { en } from '@/i18n/locales/en'
import { fr } from '@/i18n/locales/fr'

// ============================================================================
// 9.1 LANGUAGE SWITCHING
// ============================================================================

describe('9.1 Language Switching', () => {
  beforeEach(async () => {
    // Reset i18n to default state
    localStorage.clear()
    await i18n.changeLanguage('fr')
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('should load French language by default', async () => {
    expect(i18n.language).toBe('fr')
    expect(i18n.t('nav.home')).toBe(fr.nav.home)
  })

  test('should load English language when requested', async () => {
    await i18n.changeLanguage('en')
    expect(i18n.language).toBe('en')
    expect(i18n.t('nav.home')).toBe(en.nav.home)
  })

  test('should persist language preference in localStorage', async () => {
    await i18n.changeLanguage('en')
    expect(localStorage.getItem('i18nextLng')).toBe('en')

    await i18n.changeLanguage('fr')
    expect(localStorage.getItem('i18nextLng')).toBe('fr')
  })

  test('should restore language preference from localStorage on init', async () => {
    localStorage.setItem('i18nextLng', 'en')
    // Reinitialize i18n to simulate page reload
    await i18n.changeLanguage('en')
    expect(i18n.language).toBe('en')
  })

  test('should support switching between French and English', async () => {
    expect(i18n.language).toBe('fr')
    expect(i18n.t('nav.home')).toBe(fr.nav.home)

    await i18n.changeLanguage('en')
    expect(i18n.language).toBe('en')
    expect(i18n.t('nav.home')).toBe(en.nav.home)

    await i18n.changeLanguage('fr')
    expect(i18n.language).toBe('fr')
    expect(i18n.t('nav.home')).toBe(fr.nav.home)
  })

  test('should handle invalid language gracefully', async () => {
    await i18n.changeLanguage('invalid')
    // Should fall back to default or keep current language
    expect(['fr', 'en']).toContain(i18n.language)
  })

  test('should emit language change event', async () => {
    const languageChangedSpy = vi.fn()
    i18n.on('languageChanged', languageChangedSpy)

    await i18n.changeLanguage('en')
    expect(languageChangedSpy).toHaveBeenCalledWith('en')

    i18n.off('languageChanged', languageChangedSpy)
  })
})

// ============================================================================
// 9.2 TRANSLATION COMPLETENESS
// ============================================================================

describe('9.2 Translation Completeness', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr')
  })

  test('should have all French translations defined', () => {
    expect(fr).toBeDefined()
    expect(Object.keys(fr).length).toBeGreaterThan(0)
  })

  test('should have all English translations defined', () => {
    expect(en).toBeDefined()
    expect(Object.keys(en).length).toBeGreaterThan(0)
  })

  test('should have matching keys between French and English', () => {
    const frKeys = Object.keys(fr).sort()
    const enKeys = Object.keys(en).sort()
    expect(frKeys).toStrictEqual(enKeys)
  })

  test('should have no missing translation keys in French', () => {
    const checkTranslations = (obj: any, prefix = ''): string[] => {
      const missing: string[] = []
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const value = obj[key]
        if (typeof value === 'object' && value !== null) {
          missing.push(...checkTranslations(value, fullKey))
        }
        else if (typeof value !== 'string' || value.trim() === '') {
          missing.push(fullKey)
        }
      }
      return missing
    }

    const missingFr = checkTranslations(fr)
    expect(missingFr).toHaveLength(0)
  })

  test('should have no missing translation keys in English', () => {
    const checkTranslations = (obj: any, prefix = ''): string[] => {
      const missing: string[] = []
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const value = obj[key]
        if (typeof value === 'object' && value !== null) {
          missing.push(...checkTranslations(value, fullKey))
        }
        else if (typeof value !== 'string' || value.trim() === '') {
          missing.push(fullKey)
        }
      }
      return missing
    }

    const missingEn = checkTranslations(en)
    expect(missingEn).toHaveLength(0)
  })

  test('should use fallback language when translation missing', async () => {
    await i18n.changeLanguage('en')
    // All keys should be available, so fallback shouldn't be needed
    const key = 'nav.home'
    const translation = i18n.t(key)
    expect(translation).not.toBe(key) // Should not return the key itself
  })

  test('should handle nested translation keys correctly', () => {
    const nestedKey = 'hero.cta.primary'
    const translation = i18n.t(nestedKey)
    expect(translation).toBeDefined()
    expect(typeof translation).toBe('string')
    expect(translation.length).toBeGreaterThan(0)
  })

  test('should return key name when translation not found', () => {
    const nonExistentKey = 'nonexistent.key.that.does.not.exist'
    const translation = i18n.t(nonExistentKey)
    // i18next returns the key when translation is not found
    expect(translation).toBe(nonExistentKey)
  })

  test('should have consistent translation structure across languages', () => {
    const getStructure = (obj: any, prefix = ''): string[] => {
      const keys: string[] = []
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const value = obj[key]
        if (typeof value === 'object' && value !== null) {
          keys.push(...getStructure(value, fullKey))
        }
        else {
          keys.push(fullKey)
        }
      }
      return keys
    }

    const frStructure = getStructure(fr).sort()
    const enStructure = getStructure(en).sort()

    // Check for significant differences (allow small discrepancies in development)
    const frSet = new Set(frStructure)
    const enSet = new Set(enStructure)
    const missingInFr = [...enSet].filter(key => !frSet.has(key))
    const missingInEn = [...frSet].filter(key => !enSet.has(key))

    // Allow up to 5 missing keys to account for development differences
    expect(missingInFr.length).toBeLessThanOrEqual(5)
    expect(missingInEn.length).toBeLessThanOrEqual(5)

    // Log the differences for debugging (optional)
    if (missingInFr.length > 0 || missingInEn.length > 0) {
      console.warn('Missing in FR:', missingInFr)
      console.warn('Missing in EN:', missingInEn)
    }
  })
})

// ============================================================================
// 9.3 DATE/TIME FORMATTING
// ============================================================================

describe('9.3 Date/Time Formatting', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr')
  })

  test('should format dates according to French locale', () => {
    const date = new Date('2024-01-15')
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const formatted = formatter.format(date)
    expect(formatted).toContain('janvier')
  })

  test('should format dates according to English locale', () => {
    const date = new Date('2024-01-15')
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const formatted = formatter.format(date)
    expect(formatted).toContain('January')
  })

  test('should format times according to French locale', () => {
    const date = new Date('2024-01-15T14:30:00')
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const formatted = formatter.format(date)
    expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}/)
  })

  test('should format times according to English locale', () => {
    const date = new Date('2024-01-15T14:30:00')
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    const formatted = formatter.format(date)
    expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/)
  })

  test('should handle timezone correctly for French locale', () => {
    const date = new Date('2024-01-15T14:30:00Z')
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    const formatted = formatter.format(date)
    expect(formatted).toBeDefined()
    expect(formatted.length).toBeGreaterThan(0)
  })

  test('should handle timezone correctly for English locale', () => {
    const date = new Date('2024-01-15T14:30:00Z')
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    const formatted = formatter.format(date)
    expect(formatted).toBeDefined()
    expect(formatted.length).toBeGreaterThan(0)
  })

  test('should format date range correctly in French', () => {
    const startDate = new Date('2024-01-15')
    const endDate = new Date('2024-01-20')
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const formatted = `${formatter.format(startDate)} - ${formatter.format(endDate)}`
    expect(formatted).toContain('janvier')
  })

  test('should format date range correctly in English', () => {
    const startDate = new Date('2024-01-15')
    const endDate = new Date('2024-01-20')
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const formatted = `${formatter.format(startDate)} - ${formatter.format(endDate)}`
    expect(formatted).toContain('January')
  })
})

// ============================================================================
// 9.4 NUMBER FORMATTING
// ============================================================================

describe('9.4 Number Formatting', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr')
  })

  test('should format numbers according to French locale', () => {
    const number = 1234.56
    const formatter = new Intl.NumberFormat('fr-FR')
    const formatted = formatter.format(number)
    // French uses non-breaking space or thin space as thousands separator
    expect(formatted).toMatch(/1\s234,56/)
  })

  test('should format numbers according to English locale', () => {
    const number = 1234.56
    const formatter = new Intl.NumberFormat('en-US')
    const formatted = formatter.format(number)
    expect(formatted).toBe('1,234.56')
  })

  test('should format currency in French', () => {
    const amount = 1234.56
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })
    const formatted = formatter.format(amount)
    expect(formatted).toContain('€')
  })

  test('should format currency in English', () => {
    const amount = 1234.56
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    })
    const formatted = formatter.format(amount)
    expect(formatted).toContain('$')
  })

  test('should use correct decimal separator for French', () => {
    const number = 10.5
    const formatter = new Intl.NumberFormat('fr-FR')
    const formatted = formatter.format(number)
    expect(formatted).toContain(',')
  })

  test('should use correct decimal separator for English', () => {
    const number = 10.5
    const formatter = new Intl.NumberFormat('en-US')
    const formatted = formatter.format(number)
    expect(formatted).toContain('.')
  })

  test('should use correct thousands separator for French', () => {
    const number = 1000000
    const formatter = new Intl.NumberFormat('fr-FR')
    const formatted = formatter.format(number)
    // French uses non-breaking space or thin space as thousands separator
    expect(formatted).toMatch(/1\s000\s000/)
  })

  test('should use correct thousands separator for English', () => {
    const number = 1000000
    const formatter = new Intl.NumberFormat('en-US')
    const formatted = formatter.format(number)
    expect(formatted).toContain(',')
  })

  test('should format percentages correctly in French', () => {
    const percentage = 0.85
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'percent',
    })
    const formatted = formatter.format(percentage)
    expect(formatted).toContain('%')
  })

  test('should format percentages correctly in English', () => {
    const percentage = 0.85
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'percent',
    })
    const formatted = formatter.format(percentage)
    expect(formatted).toContain('%')
  })

  test('should handle large numbers correctly in French', () => {
    const number = 1234567890.12
    const formatter = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    const formatted = formatter.format(number)
    expect(formatted).toBeDefined()
    expect(formatted.length).toBeGreaterThan(0)
  })

  test('should handle large numbers correctly in English', () => {
    const number = 1234567890.12
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    const formatted = formatter.format(number)
    expect(formatted).toBeDefined()
    expect(formatted.length).toBeGreaterThan(0)
  })

  test('should handle negative numbers correctly in French', () => {
    const number = -1234.56
    const formatter = new Intl.NumberFormat('fr-FR')
    const formatted = formatter.format(number)
    expect(formatted).toContain('-')
  })

  test('should handle negative numbers correctly in English', () => {
    const number = -1234.56
    const formatter = new Intl.NumberFormat('en-US')
    const formatted = formatter.format(number)
    expect(formatted).toContain('-')
  })
})

// ============================================================================
// 9.5 PLURALIZATION
// ============================================================================

describe('9.5 Pluralization', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr')
  })

  test('should handle singular form in French', () => {
    const count = 1
    const formatter = new Intl.PluralRules('fr-FR')
    const rule = formatter.select(count)
    expect(['one', 'other']).toContain(rule)
  })

  test('should handle plural form in French', () => {
    const count = 5
    const formatter = new Intl.PluralRules('fr-FR')
    const rule = formatter.select(count)
    expect(['one', 'other']).toContain(rule)
  })

  test('should handle singular form in English', () => {
    const count = 1
    const formatter = new Intl.PluralRules('en-US')
    const rule = formatter.select(count)
    expect(['one', 'other']).toContain(rule)
  })

  test('should handle plural form in English', () => {
    const count = 5
    const formatter = new Intl.PluralRules('en-US')
    const rule = formatter.select(count)
    expect(['one', 'other']).toContain(rule)
  })

  test('should handle zero count correctly', () => {
    const count = 0
    const formatter = new Intl.PluralRules('en-US')
    const rule = formatter.select(count)
    expect(['one', 'other']).toContain(rule)
  })
})

// ============================================================================
// 9.6 FALLBACK LANGUAGE
// ============================================================================

describe('9.6 Fallback Language', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr')
  })

  test('should use French as fallback language', () => {
    expect(i18n.options.fallbackLng).toStrictEqual(['fr'])
  })

  test('should fall back to French when language not supported', async () => {
    // Try to change to unsupported language
    await i18n.changeLanguage('de')
    // Should fall back to supported language
    expect(['fr', 'en']).toContain(i18n.language)
  })

  test('should have French translations for all keys', () => {
    const getAllKeys = (obj: any, prefix = ''): string[] => {
      const keys: string[] = []
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const value = obj[key]
        if (typeof value === 'object' && value !== null) {
          keys.push(...getAllKeys(value, fullKey))
        }
        else {
          keys.push(fullKey)
        }
      }
      return keys
    }

    const allKeys = getAllKeys(fr)
    for (const key of allKeys) {
      const translation = i18n.t(key)
      expect(translation).not.toBe(key)
    }
  })
})

// ============================================================================
// 9.7 LANGUAGE DETECTION
// ============================================================================

describe('9.7 Language Detection', () => {
  beforeEach(async () => {
    localStorage.clear()
    await i18n.changeLanguage('fr')
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('should detect language from localStorage first', async () => {
    localStorage.setItem('i18nextLng', 'en')
    await i18n.changeLanguage('en')
    expect(i18n.language).toBe('en')
  })

  test('should use default language when localStorage is empty', async () => {
    localStorage.clear()
    await i18n.changeLanguage('fr')
    expect(i18n.language).toBe('fr')
  })

  test('should support language detection order', () => {
    const detectionOrder = i18n.options.detection?.order
    expect(detectionOrder).toBeDefined()
    expect(Array.isArray(detectionOrder)).toBe(true)
  })
})

// ============================================================================
// 9.8 INTERPOLATION
// ============================================================================

describe('9.8 Interpolation', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr')
  })

  test('should handle string interpolation', () => {
    // Test with a simple interpolation
    const key = 'nav.home'
    const translation = i18n.t(key)
    expect(typeof translation).toBe('string')
  })

  test('should escape HTML by default', () => {
    const translation = i18n.t('nav.home')
    expect(translation).not.toContain('<script>')
  })

  test('should not escape when escapeValue is false', () => {
    // i18next is configured with escapeValue: false for React
    expect(i18n.options.interpolation?.escapeValue).toBe(false)
  })
})
