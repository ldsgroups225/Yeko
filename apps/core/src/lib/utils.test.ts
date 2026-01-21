import { beforeEach, describe, expect, test, vi } from 'vitest'
import { cn } from './utils'

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

describe('cn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic class name merging', () => {
    test('should merge two simple class names', () => {
      const result = cn('foo', 'bar')
      expect(result).toBe('foo bar')
    })

    test('should merge multiple class names', () => {
      const result = cn('foo', 'bar', 'baz')
      expect(result).toBe('foo bar baz')
    })

    test('should handle single class name', () => {
      const result = cn('foo')
      expect(result).toBe('foo')
    })

    test('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })

  describe('handling of different input types', () => {
    test('should handle string inputs', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    test('should handle undefined inputs', () => {
      const result = cn('foo', undefined, 'bar')
      expect(result).toBe('foo bar')
    })

    test('should handle null inputs', () => {
      const result = cn('foo', null, 'bar')
      expect(result).toBe('foo bar')
    })

    test('should handle empty string inputs', () => {
      const result = cn('foo', '', 'bar')
      expect(result).toBe('foo bar')
    })

    test('should handle boolean true', () => {
      const result = cn('foo', true && 'conditional', 'bar')
      expect(result).toBe('foo conditional bar')
    })

    test('should handle boolean false', () => {
      const result = cn('foo', false && 'conditional', 'bar')
      expect(result).toBe('foo bar')
    })
  })

  describe('handling of array inputs', () => {
    test('should handle array of class names', () => {
      const result = cn(['foo', 'bar'])
      expect(result).toBe('foo bar')
    })

    test('should handle nested arrays', () => {
      const result = cn(['foo', 'bar'], ['baz', 'qux'])
      expect(result).toBe('foo bar baz qux')
    })

    test('should handle mixed arrays and strings', () => {
      const result = cn('base', ['conditional', 'classes'], 'end')
      expect(result).toBe('base conditional classes end')
    })
  })

  describe('handling of object inputs', () => {
    test('should handle object with boolean values', () => {
      const result = cn('base', { 'conditional-true': true, 'conditional-false': false }, 'end')
      expect(result).toBe('base conditional-true end')
    })

    test('should handle object with multiple true conditions', () => {
      const result = cn('base', { a: true, b: true, c: false }, 'end')
      expect(result).toBe('base a b end')
    })
  })

  describe('tailwind-merge integration', () => {
    test('should merge conflicting tailwind classes (same property)', () => {
      const result = cn('p-4', 'p-6')
      expect(result).toBe('p-6')
    })

    test('should merge non-conflicting tailwind classes', () => {
      const result = cn('p-4', 'm-4', 'bg-red-500')
      expect(result).toBe('p-4 m-4 bg-red-500')
    })

    test('should handle conflicting responsive prefixes', () => {
      const result = cn('text-sm', 'text-lg')
      expect(result).toBe('text-lg')
    })

    test('should handle conflicting hover states', () => {
      const result = cn('hover:bg-red-500', 'hover:bg-blue-500')
      expect(result).toBe('hover:bg-blue-500')
    })

    test('should merge tailwind with custom classes', () => {
      const result = cn('p-4', 'custom-class', 'm-2')
      expect(result).toBe('p-4 custom-class m-2')
    })
  })

  describe('complex real-world scenarios', () => {
    test('should handle button styles with conditional states', () => {
      const result = cn(
        'px-4 py-2',
        true && 'bg-blue-500',
        false && 'bg-red-500',
        { 'opacity-50': false, 'cursor-pointer': true },
      )
      expect(result).toBe('px-4 py-2 bg-blue-500 cursor-pointer')
    })

    test('should handle card component styles', () => {
      const result = cn(
        'rounded-lg border p-4',
        { 'border-gray-200 bg-white': true },
        { 'shadow-lg': true },
      )
      expect(result).toBe('rounded-lg border p-4 border-gray-200 bg-white shadow-lg')
    })

    test('should handle responsive grid classes', () => {
      const result = cn(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-4',
        'gap-4',
      )
      expect(result).toBe('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4')
    })

    test('should handle typography classes', () => {
      const result = cn(
        'text-lg font-bold leading-tight text-gray-900',
        { truncate: true },
      )
      expect(result).toBe('text-lg font-bold leading-tight text-gray-900 truncate')
    })
  })

  describe('edge cases', () => {
    test('should handle all undefined inputs', () => {
      const result = cn(undefined, undefined, undefined)
      expect(result).toBe('')
    })

    test('should handle all null inputs', () => {
      const result = cn(null, null, null)
      expect(result).toBe('')
    })

    test('should handle deeply nested structures', () => {
      const result = cn(
        ['foo', ['bar', ['baz', 'qux']]],
        'end',
      )
      expect(result).toBe('foo bar baz qux end')
    })

    test('should handle objects with undefined values', () => {
      const result = cn('base', { cond1: undefined, cond2: true })
      expect(result).toBe('base cond2')
    })
  })
})
