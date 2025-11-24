import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock browser APIs
globalThis.alert = vi.fn()
globalThis.confirm = vi.fn()

// Mock window methods
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true,
})

// Mock file methods
globalThis.URL.createObjectURL = vi.fn(() => 'mock-url')
globalThis.URL.revokeObjectURL = vi.fn()

// Mock clipboard API
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
  },
  writable: true,
  configurable: true,
})
