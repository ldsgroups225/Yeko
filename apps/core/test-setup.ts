import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock cloudflare:workers module
vi.mock('cloudflare:workers', () => ({
  env: {
    DATABASE_HOST: 'mock-host',
    DATABASE_USERNAME: 'mock-user',
    DATABASE_PASSWORD: 'mock-password',
    BETTER_AUTH_SECRET: 'mock-secret',
    GOOGLE_CLIENT_ID: 'mock-client-id',
    GOOGLE_CLIENT_SECRET: 'mock-client-secret',
  },
}))

// NOTE: @repo/data-ops/database/setup is aliased in vitest.config.ts
// to src/mocks/db-setup.ts

// Global mock for @tanstack/react-router
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  const routeMock = {
    useRouteContext: vi.fn().mockReturnValue({
      auth: {
        isAuthenticated: true,
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        permissions: [],
        isSuperAdmin: true,
      },
    }),
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn().mockReturnValue({}),
    useSearch: vi.fn().mockReturnValue({}),
    addFileChildren: vi.fn().mockReturnThis(),
    addFileTypes: vi.fn().mockReturnThis(),
  }

  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useRouterState: vi.fn(() => ({ location: { pathname: '/' } })),
    createRootRouteWithContext: vi.fn().mockReturnValue(() => routeMock),
    createFileRoute: vi.fn().mockReturnValue(() => routeMock),
    Link: ({ children, ...props }: { children: React.ReactNode, [key: string]: unknown }) => ({
      type: 'a',
      props: { ...props, children },
    }),
  }
})

// Global mock for @tanstack/react-start
vi.mock('@tanstack/react-start', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-start')>()
  return {
    ...actual,
    createMiddleware: vi.fn().mockReturnValue({
      server: vi.fn().mockImplementation(cb => cb),
    }),
    createServerFn: vi.fn().mockImplementation(() => {
      let validator: ((v: unknown) => void) | null = null
      const fnObj: Record<string, any> = {
        middleware: vi.fn().mockImplementation(() => fnObj),
        inputValidator: vi.fn().mockImplementation((v) => {
          validator = v
          return fnObj
        }),
        handler: vi.fn().mockImplementation((cb: (args: { data: any, context: any }) => Promise<any>) => {
          const wrapper = async (payload: any) => {
            const data = (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload
            if (validator) {
              try {
                validator(data)
              }
              catch (err) {
                return Promise.reject(err)
              }
            }
            return cb({ data, context: {} })
          }
          wrapper.middleware = fnObj.middleware
          wrapper.inputValidator = fnObj.inputValidator
          return wrapper
        }),
      }
      return fnObj
    }),
  }
})

// Mock matchMedia
function mockMatchMedia(query: string) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
}

vi.stubGlobal('matchMedia', vi.fn().mockImplementation(mockMatchMedia))
vi.stubGlobal('alert', vi.fn())
vi.stubGlobal('confirm', vi.fn())

// Mock file methods
globalThis.URL.createObjectURL = vi.fn(() => 'mock-url')
globalThis.URL.revokeObjectURL = vi.fn()

// Mock clipboard API
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(),
    },
    writable: true,
    configurable: true,
  })
}
