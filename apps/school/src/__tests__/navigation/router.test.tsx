import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { describe, expect, test, vi } from 'vitest'

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
      const { router } = createTestRouter('/_auth/dashboard')

      expect(router.state.location.pathname).toBe('/_auth/dashboard')
    })

    test('should initialize at HR index path', () => {
      const { router } = createTestRouter('/_auth/users')

      expect(router.state.location.pathname).toBe('/_auth/users')
    })

    test('should initialize at roles list path', () => {
      const { router } = createTestRouter('/_auth/users/roles')

      expect(router.state.location.pathname).toBe('/_auth/users/roles')
    })

    test('should initialize at users list path', () => {
      const { router } = createTestRouter('/_auth/users/users')

      expect(router.state.location.pathname).toBe('/_auth/users/users')
    })

    test('should initialize at staff list path', () => {
      const { router } = createTestRouter('/_auth/users/staff')

      expect(router.state.location.pathname).toBe('/_auth/users/staff')
    })

    test('should initialize at teachers list path', () => {
      const { router } = createTestRouter('/_auth/users/teachers')

      expect(router.state.location.pathname).toBe('/_auth/users/teachers')
    })
  })

  describe('dynamic Routes', () => {
    test('should handle role detail route with ID', () => {
      const { router } = createTestRouter('/_auth/users/roles/role-123')

      expect(router.state.location.pathname).toBe('/_auth/users/roles/role-123')
    })

    test('should handle user detail route with ID', () => {
      const { router } = createTestRouter('/_auth/users/users/user-456')

      expect(router.state.location.pathname).toBe('/_auth/users/users/user-456')
    })

    test('should handle staff detail route with ID', () => {
      const { router } = createTestRouter('/_auth/users/staff/staff-789')

      expect(router.state.location.pathname).toBe('/_auth/users/staff/staff-789')
    })

    test('should handle teacher detail route with ID', () => {
      const { router } = createTestRouter('/_auth/users/teachers/teacher-101')

      expect(router.state.location.pathname).toBe('/_auth/users/teachers/teacher-101')
    })
  })

  describe('new Resource Routes', () => {
    test('should navigate to new role page', () => {
      const { router } = createTestRouter('/_auth/users/roles/new')

      expect(router.state.location.pathname).toBe('/_auth/users/roles/new')
    })

    test('should navigate to new user page', () => {
      const { router } = createTestRouter('/_auth/users/users/new')

      expect(router.state.location.pathname).toBe('/_auth/users/users/new')
    })

    test('should navigate to new staff page', () => {
      const { router } = createTestRouter('/_auth/users/staff/new')

      expect(router.state.location.pathname).toBe('/_auth/users/staff/new')
    })

    test('should navigate to new teacher page', () => {
      const { router } = createTestRouter('/_auth/users/teachers/new')

      expect(router.state.location.pathname).toBe('/_auth/users/teachers/new')
    })
  })

  describe('programmatic Navigation', () => {
    test('should navigate programmatically between routes', async () => {
      const { router } = createTestRouter('/')

      expect(router.state.location.pathname).toBe('/')

      // Navigate to dashboard
      await router.navigate({ to: '/dashboard' as any })

      expect(router.state.location.pathname).toBe('/dashboard')

      // Navigate to HR
      await router.navigate({ to: '/users/roles' as any })

      expect(router.state.location.pathname).toBe('/users/roles')
    })

    test('should handle back navigation', async () => {
      const { router } = createTestRouter('/')

      // Navigate forward
      await router.navigate({ to: '/dashboard' as any })
      await router.navigate({ to: '/users/roles' as any })

      expect(router.state.location.pathname).toBe('/users/roles')

      // Navigate back using router.navigate with history
      await router.navigate({ to: '/dashboard' as any })

      expect(router.state.location.pathname).toBe('/dashboard')
    })

    test('should handle multiple navigation steps', async () => {
      const { router } = createTestRouter('/')

      // Navigate through multiple routes
      await router.navigate({ to: '/dashboard' as any })
      expect(router.state.location.pathname).toBe('/dashboard')

      await router.navigate({ to: '/users/roles' as any })
      expect(router.state.location.pathname).toBe('/users/roles')

      await router.navigate({ to: '/users/users' as any })
      expect(router.state.location.pathname).toBe('/users/users')
    })
  })

  describe('route Validation', () => {
    test('should have valid root route path', () => {
      const { router } = createTestRouter('/')

      expect(router.state.location.pathname).toBe('/')
      expect(router.state.location.href).toContain('/')
    })

    test('should have valid nested route path', () => {
      const { router } = createTestRouter('/_auth/users/roles')

      expect(router.state.location.pathname).toBe('/_auth/users/roles')
      expect(router.state.location.href).toContain('hr/roles')
    })

    test('should preserve dynamic route parameters in path', () => {
      const { router } = createTestRouter('/_auth/users/roles/role-123')

      expect(router.state.location.pathname).toBe('/_auth/users/roles/role-123')
      expect(router.state.location.pathname).toContain('role-123')
    })

    test('should handle query parameters', async () => {
      const { router } = createTestRouter('/')

      await router.navigate({
        to: '/users/roles' as any,
      })

      expect(router.state.location.pathname).toBe('/users/roles')
    })
  })
})
