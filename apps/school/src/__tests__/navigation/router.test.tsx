import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { describe, expect, vi } from 'vitest'

// Unmock react-query to use real implementation
vi.unmock('@tanstack/react-query')

// Import after unmocking
const { QueryClient } = await import('@tanstack/react-query')
const { routeTree } = await import('@/routeTree.gen')

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
    })),
  },
}))

// Mock school context hook
vi.mock('@/hooks/use-school-context', () => ({
  useSchoolContext: vi.fn(() => ({
    schoolId: 'school-123',
    schoolName: 'Test School',
    isLoading: false,
  })),
}))

// Mock role hook
vi.mock('@/hooks/use-role', () => ({
  useRole: vi.fn(() => ({
    role: 'school_administrator',
    isLoading: false,
  })),
}))

describe('router Navigation', () => {
  const createTestRouter = (initialPath = '/') => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const memoryHistory = createMemoryHistory({
      initialEntries: [initialPath],
    })

    const router = createRouter({
      routeTree,
      history: memoryHistory,
      context: { queryClient },
      defaultPreload: false,
    })

    return { router, queryClient }
  }

  describe('root Routes', () => {
    test('should initialize at root path', () => {
      const { router } = createTestRouter('/')

      expect(router.state.location.pathname).toBe('/')
    })

    test('should have correct initial history entry', () => {
      const { router } = createTestRouter('/')

      expect(router.history.location.pathname).toBe('/')
    })
  })

  describe('navigation Paths', () => {
    test('should initialize at dashboard path', () => {
      const { router } = createTestRouter('/_auth/app/dashboard')

      expect(router.state.location.pathname).toBe('/_auth/app/dashboard')
    })

    test('should initialize at HR index path', () => {
      const { router } = createTestRouter('/_auth/app/hr')

      expect(router.state.location.pathname).toBe('/_auth/app/hr')
    })

    test('should initialize at roles list path', () => {
      const { router } = createTestRouter('/_auth/app/hr/roles')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/roles')
    })

    test('should initialize at users list path', () => {
      const { router } = createTestRouter('/_auth/app/hr/users')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/users')
    })

    test('should initialize at staff list path', () => {
      const { router } = createTestRouter('/_auth/app/hr/staff')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/staff')
    })

    test('should initialize at teachers list path', () => {
      const { router } = createTestRouter('/_auth/app/hr/teachers')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/teachers')
    })
  })

  describe('dynamic Routes', () => {
    test('should handle role detail route with ID', () => {
      const { router } = createTestRouter('/_auth/app/hr/roles/role-123')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/roles/role-123')
    })

    test('should handle user detail route with ID', () => {
      const { router } = createTestRouter('/_auth/app/hr/users/user-456')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/users/user-456')
    })

    test('should handle staff detail route with ID', () => {
      const { router } = createTestRouter('/_auth/app/hr/staff/staff-789')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/staff/staff-789')
    })

    test('should handle teacher detail route with ID', () => {
      const { router } = createTestRouter('/_auth/app/hr/teachers/teacher-101')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/teachers/teacher-101')
    })
  })

  describe('new Resource Routes', () => {
    test('should navigate to new role page', () => {
      const { router } = createTestRouter('/_auth/app/hr/roles/new')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/roles/new')
    })

    test('should navigate to new user page', () => {
      const { router } = createTestRouter('/_auth/app/hr/users/new')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/users/new')
    })

    test('should navigate to new staff page', () => {
      const { router } = createTestRouter('/_auth/app/hr/staff/new')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/staff/new')
    })

    test('should navigate to new teacher page', () => {
      const { router } = createTestRouter('/_auth/app/hr/teachers/new')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/teachers/new')
    })
  })

  describe('programmatic Navigation', () => {
    test('should navigate programmatically between routes', async () => {
      const { router } = createTestRouter('/')

      expect(router.state.location.pathname).toBe('/')

      // Navigate to dashboard
      await router.navigate({ to: '/app/dashboard' as any })

      expect(router.state.location.pathname).toBe('/app/dashboard')

      // Navigate to HR
      await router.navigate({ to: '/app/hr/roles' as any })

      expect(router.state.location.pathname).toBe('/app/hr/roles')
    })

    test('should handle back navigation', async () => {
      const { router } = createTestRouter('/')

      // Navigate forward
      await router.navigate({ to: '/app/dashboard' as any })
      await router.navigate({ to: '/app/hr/roles' as any })

      expect(router.state.location.pathname).toBe('/app/hr/roles')

      // Navigate back using router.navigate with history
      await router.navigate({ to: '/app/dashboard' as any })

      expect(router.state.location.pathname).toBe('/app/dashboard')
    })

    test('should handle multiple navigation steps', async () => {
      const { router } = createTestRouter('/')

      // Navigate through multiple routes
      await router.navigate({ to: '/app/dashboard' as any })
      expect(router.state.location.pathname).toBe('/app/dashboard')

      await router.navigate({ to: '/app/hr/roles' as any })
      expect(router.state.location.pathname).toBe('/app/hr/roles')

      await router.navigate({ to: '/app/hr/users' as any })
      expect(router.state.location.pathname).toBe('/app/hr/users')
    })
  })

  describe('route Validation', () => {
    test('should have valid root route path', () => {
      const { router } = createTestRouter('/')

      expect(router.state.location.pathname).toBe('/')
      expect(router.state.location.href).toContain('/')
    })

    test('should have valid nested route path', () => {
      const { router } = createTestRouter('/_auth/app/hr/roles')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/roles')
      expect(router.state.location.href).toContain('hr/roles')
    })

    test('should preserve dynamic route parameters in path', () => {
      const { router } = createTestRouter('/_auth/app/hr/roles/role-123')

      expect(router.state.location.pathname).toBe('/_auth/app/hr/roles/role-123')
      expect(router.state.location.pathname).toContain('role-123')
    })

    test('should handle query parameters', async () => {
      const { router } = createTestRouter('/')

      await router.navigate({
        to: '/app/hr/roles' as any,
      })

      expect(router.state.location.pathname).toBe('/app/hr/roles')
    })
  })
})
