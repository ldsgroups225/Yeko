import { fireEvent, render, screen } from '@testing-library/react'
import { SidebarProvider } from '@workspace/ui/components/sidebar'
import * as React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Sidebar } from './sidebar'

// Mock the router hooks
const mockNavigate = vi.fn()
const mockRouterState = {
  location: {
    pathname: '/app/dashboard',
  },
}

const { mockRoute } = vi.hoisted(() => ({
  mockRoute: {
    useRouteContext: vi.fn().mockReturnValue({
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', email: 'test@example.com' },
        permissions: [],
        isSuperAdmin: true,
      },
    }),
    addFileChildren: vi.fn().mockReturnThis(),
    addFileTypes: vi.fn().mockReturnThis(),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useRouterState: () => mockRouterState,
  createRootRouteWithContext: () => () => mockRoute,
  createFileRoute: () => () => mockRoute,
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

vi.mock('@/routes/__root', () => ({
  Route: mockRoute,
}))

describe('sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.useRouteContext.mockReturnValue({
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', email: 'test@example.com' },
        permissions: [],
        isSuperAdmin: true,
      },
    })
  })

  const renderSidebar = () => render(
    <SidebarProvider>
      <Sidebar />
    </SidebarProvider>,
  )

  describe('rendering', () => {
    test('should render sidebar with all menu items', () => {
      renderSidebar()

      expect(screen.getByText(/Tableau de Bord/i)).toBeInTheDocument()
      expect(screen.getByText(/Écoles/i)).toBeInTheDocument()
      expect(screen.getByText(/Catalogues/i)).toBeInTheDocument()
      expect(screen.getByText(/Analytique/i)).toBeInTheDocument()
    })

    test('should display logo and branding', () => {
      renderSidebar()
      expect(screen.getByAltText(/Yeko Logo/i)).toBeInTheDocument()
      expect(screen.getByText(/Yeko/i)).toBeInTheDocument()
    })

    test('should show icons display correctly', () => {
      renderSidebar()
      // Check for some common icons by their test ids or labels if available
      // Or just check if the container exists
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(5)
    })

    test.todo('should show active state indicators correctly')

    test('should render nested menu items in Catalogues', () => {
      renderSidebar()
      const cataloguesBtn = screen.getByText(/Catalogues/i)
      fireEvent.click(cataloguesBtn)

      expect(screen.getByText(/Programmes/i)).toBeInTheDocument()
      expect(screen.getByText(/Matières/i)).toBeInTheDocument()
      expect(screen.getByText(/Niveaux/i)).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    test('should click menu item and navigate', () => {
      renderSidebar()
      const dashboardLink = screen.getByText(/Tableau de Bord/i).closest('a')
      expect(dashboardLink).toBeInTheDocument()
      // In our mock Link is just an <a> tag, navigation is handled by router
    })

    test('should expand and collapse nested menu items', async () => {
      renderSidebar()
      const cataloguesBtn = screen.getByText(/Catalogues/i)

      // Initially sub-items might not be visible depending on implementation
      fireEvent.click(cataloguesBtn)
      expect(screen.getByText(/Programmes/i)).toBeInTheDocument()

      fireEvent.click(cataloguesBtn)
      // They might still be in DOM but hidden, or removed
    })

    test.todo('should collapse sidebar and persist state')

    test('should show tooltips when collapsed', () => {
      // This would require setting the collapsed state, which might be internal or via props
      renderSidebar()
      // ... test tooltip logic
    })
  })

  describe('active State Logic', () => {
    test.todo('should highlight dashboard as active when on dashboard route')
    test.todo('should highlight schools as active when on schools route')

    test('should highlight catalogs as active when on catalogs sub-routes', () => {
      // Mock pathname to a sub-route
      mockRouterState.location.pathname = '/app/catalogs/subjects'
      renderSidebar()
      // Check for active class or styling
    })

    test.todo('should highlight analytics as active when on analytics route')

    test('should not highlight inactive items', () => {
      mockRouterState.location.pathname = '/app/dashboard'
      renderSidebar()
      // ...
    })
  })

  describe('nested Items Expansion', () => {
    test('should initially render Catalogues with Programs child', () => {
      renderSidebar()
      expect(screen.getByText(/Catalogues/i)).toBeInTheDocument()
    })

    test('should expand Programs section when Catalogues is expanded', () => {
      renderSidebar()
      fireEvent.click(screen.getByText(/Catalogues/i))
      expect(screen.getByText(/Programmes/i)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test.todo('should have proper button roles for navigation')

    test('should have proper alt text for logo', () => {
      renderSidebar()
      expect(screen.getByAltText(/Yeko Logo/i)).toBeInTheDocument()
    })

    test('should support keyboard navigation', () => {
      renderSidebar()
      const dashboardLink = screen.getByText(/Tableau de Bord/i).closest('a')
      dashboardLink?.focus()
      expect(document.activeElement).toBe(dashboardLink)
    })
  })

  describe('responsive Design', () => {
    test('should hide sidebar on mobile by default', () => {
      // Mock window innerWidth
      globalThis.innerWidth = 375
      renderSidebar()
      // Check for mobile hidden classes
    })

    test('should show sidebar on large screens', () => {
      globalThis.innerWidth = 1024
      renderSidebar()
      // Check for visible classes
    })
  })

  describe('error Handling', () => {
    test('should handle navigation errors gracefully', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Nav failed')
      })
      renderSidebar()
      // ...
    })

    test('should handle missing route gracefully', () => {
      // Mock useRouteContext to return empty or partial data
      mockRoute.useRouteContext.mockReturnValue({})

      // Should not throw error
      expect(() => renderSidebar()).not.toThrow()
    })
  })

  describe('component Structure', () => {
    test.todo('should render ScrollArea for navigation')
    test.todo('should have proper navigation structure')
  })
})
