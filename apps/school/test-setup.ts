import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock ResizeObserver for jsdom (required by Radix UI components)
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
Element.prototype.getAnimations = vi.fn().mockReturnValue([])

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup() // Clean up DOM after each test
  vi.restoreAllMocks()
})

// Mock i18n - loads translations from actual translation files
vi.mock('react-i18next', async () => {
  // Import actual English translations
  const { en: enTranslations } = await import('./src/i18n/locales/en')

  // Helper function to get nested value from object using dot notation
  const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
    const result = path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key]
      }
      return undefined
    }, obj)
    return typeof result === 'string' ? result : path
  }

  return {
    useTranslation: () => ({
      t: (key: string) => getNestedValue(enTranslations, key),
    }),
  }
})

// Mock tanstack-query
vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}))

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn(),
    unregister: vi.fn(),
    handleSubmit: vi.fn(fn => async (data: unknown) => {
      const result = await fn(data)
      return result
    }),
    formState: {
      errors: {},
      isSubmitting: false,
      isDirty: false,
      isValid: true,
      touchedFields: {},
      dirtyFields: {},
    },
    setValue: vi.fn(),
    getValues: vi.fn(() => ({})),
    watch: vi.fn((field?: string) => {
      // Return appropriate defaults for watched fields
      if (field === 'permissions')
        return {}
      if (field === 'status')
        return 'active'
      if (field === 'scope')
        return 'school'
      if (field)
        return undefined
      return {}
    }),
    reset: vi.fn(),
    trigger: vi.fn(async () => true),
    clearErrors: vi.fn(),
    setError: vi.fn(),
    control: {
      _subjects: {
        values: { next: vi.fn() },
        state: { next: vi.fn() },
      },
      _names: { array: new Set() },
      _formValues: {},
      _defaultValues: {},
    },
  })),
}))
