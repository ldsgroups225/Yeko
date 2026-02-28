import { describe, expect, test } from 'vitest'
import { parseServerFnError } from '../error-handlers'

describe('parseServerFnError', () => {
  describe('basic Input Handling', () => {
    test('should return fallback for null or undefined error', () => {
      expect(parseServerFnError(null)).toBe('Une erreur est survenue')
      expect(parseServerFnError(undefined)).toBe('Une erreur est survenue')
    })

    test('should return custom fallback when provided', () => {
      expect(parseServerFnError(null, 'Custom fallback')).toBe('Custom fallback')
    })

    test('should handle simple string errors', () => {
      expect(parseServerFnError('Simple error')).toBe('Simple error')
    })

    test('should handle Error objects', () => {
      expect(parseServerFnError(new Error('Standard error'))).toBe('Standard error')
    })

    test('should handle objects with a message property', () => {
      expect(parseServerFnError({ message: 'Object error' })).toBe('Object error')
    })
  })

  describe('specific Error Keywords (French Translations)', () => {
    test('should translate network errors', () => {
      expect(parseServerFnError('Network connection lost')).toBe('Connexion perdue. Veuillez réessayer une fois la connexion rétablie.')
      expect(parseServerFnError('fetch failed')).toBe('Connexion perdue. Veuillez réessayer une fois la connexion rétablie.')
      expect(parseServerFnError('NetworkError')).toBe('Connexion perdue. Veuillez réessayer une fois la connexion rétablie.')
    })

    test('should translate timeout errors', () => {
      expect(parseServerFnError('Request timeout')).toBe('La requête a expiré. Veuillez réessayer.')
      expect(parseServerFnError('The operation timed out')).toBe('La requête a expiré. Veuillez réessayer.')
    })

    test('should translate authorization errors', () => {
      expect(parseServerFnError('User is unauthorized')).toBe('Session expirée. Veuillez vous reconnecter.')
      expect(parseServerFnError('Unauthorized access')).toBe('Session expirée. Veuillez vous reconnecter.')
    })
  })

  describe('zod/JSON Error Parsing', () => {
    test('should parse simple JSON array with messages', () => {
      const errorString = 'Error: [{"message": "Invalid email"}]'
      expect(parseServerFnError(errorString)).toBe('Invalid email')
    })

    test('should join multiple error messages', () => {
      const errorString = 'Error: [{"message": "Field A required"}, {"message": "Field B invalid"}]'
      expect(parseServerFnError(errorString)).toBe('Field A required, Field B invalid')
    })

    test('should handle nested brackets correctly (manual parser test)', () => {
      // The parser counts brackets. Nested brackets inside a string might confuse a simple counter if not handled,
      // but the current implementation just counts [ and ].
      // Let's see if it handles a message that contains brackets itself.
      // JSON: [{"message": "Error [code 123]"}]
      const errorString = 'Error: [{"message": "Error [code 123]"}]'
      expect(parseServerFnError(errorString)).toBe('Error [code 123]')
    })

    test('should handle malformed JSON gracefully', () => {
      const errorString = 'Error: [{"message": "Broken JSON"' // Missing closing bracket/brace
      // Should fall back to cleaning the string, which includes stripping 'Error: '
      expect(parseServerFnError(errorString)).toBe('[{"message": "Broken JSON"') // Cleaned but not parsed as JSON
    })

    test('should ignore JSON arrays without message property', () => {
      const errorString = 'Error: [{"code": 123}]'
      // Should fall back to the string itself, which includes stripping 'Error: '
      expect(parseServerFnError(errorString)).toBe('[{"code": 123}]')
    })
  })

  describe('message Cleaning', () => {
    test('should remove "Server Fn Error!" prefix', () => {
      expect(parseServerFnError('Server Fn Error! Actual message')).toBe('Actual message')
    })

    test('should remove "ZodError:" prefix', () => {
      expect(parseServerFnError('ZodError: Validation failed')).toBe('Validation failed')
    })

    test('should remove "Error:" prefix', () => {
      expect(parseServerFnError('Error: Something went wrong')).toBe('Something went wrong')
    })

    test('should handle combined prefixes', () => {
      // The regexes are applied sequentially.
      // 1. Server Fn Error! -> removed
      // 2. ZodError: -> removed
      // 3. Error: -> removed
      expect(parseServerFnError('Server Fn Error! ZodError: Invalid input')).toBe('Invalid input')
    })

    test('should trim whitespace', () => {
      expect(parseServerFnError('  Error message  ')).toBe('Error message')
    })
  })

  describe('edge Cases', () => {
    test('should use fallback for very long messages (>200 chars)', () => {
      const longMessage = 'a'.repeat(201)
      expect(parseServerFnError(longMessage)).toBe('Une erreur est survenue')
    })

    test('should allow messages exactly 200 chars? (Current logic is < 200)', () => {
      // Code: cleanMessage.length < 200
      const boundaryMessage = 'a'.repeat(199)
      expect(parseServerFnError(boundaryMessage)).toBe(boundaryMessage)

      const tooLongMessage = 'a'.repeat(200)
      expect(parseServerFnError(tooLongMessage)).toBe('Une erreur est survenue')
    })

    test('should use fallback if cleaned message is empty', () => {
      expect(parseServerFnError('Error: ')).toBe('Une erreur est survenue')
      expect(parseServerFnError('')).toBe('Une erreur est survenue')
    })
  })
})
