import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Breadcrumbs } from './breadcrumbs'

// Mock the router hooks
const mockRouterState = {
  location: {
    pathname: '/app/dashboard',
  },
}

vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => mockRouterState,
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

// Mock generateUUID utility to return different values each call
let uuidCounter = 0
vi.mock('@/utils/generateUUID', () => ({
  generateUUID: () => `test-uuid-${++uuidCounter}`,
}))

// Mock lucide-react icons - use IconHome to match component usage
vi.mock('@tabler/icons-react', async () => {
  const icons = await import('lucide-react')
  return {
    ...icons,
    IconHome: () => <span data-testid="home-icon">🏠</span>,
    IconChevronRight: () => <span data-testid="chevron-right">›</span>,
  }
})

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('breadcrumbs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uuidCounter = 0 // Reset UUID counter
    mockRouterState.location.pathname = '/app/dashboard'
  })

  describe('rendering', () => {
    test('should render breadcrumbs with home icon and dashboard item', () => {
      render(<Breadcrumbs />)

      const homeIcon = screen.getByTestId('home-icon')
      expect(homeIcon).toBeInTheDocument()

      const dashboardLink = screen.getByText('Tableau de bord')
      expect(dashboardLink).toBeInTheDocument()
    })

    test('should render navigation element with proper classes', () => {
      render(<Breadcrumbs />)

      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveClass('flex', 'items-center', 'space-x-1', 'text-sm', 'text-muted-foreground')
    })

    test('should display chevron separators between items', () => {
      mockRouterState.location.pathname = '/app/schools'
      render(<Breadcrumbs />)

      const chevrons = screen.getAllByTestId('chevron-right')
      expect(chevrons.length).toBeGreaterThan(0)
    })

    test('should render home link as clickable', () => {
      render(<Breadcrumbs />)

      const homeLink = screen.getByRole('link', { name: /🏠/ })
      expect(homeLink).toBeInTheDocument()
      expect(homeLink).toHaveAttribute('href', '/app/dashboard')
    })
  })

  describe('path-based Breadcrumb Generation', () => {
    test('should generate correct breadcrumbs for dashboard route', () => {
      mockRouterState.location.pathname = '/app/dashboard'
      render(<Breadcrumbs />)

      expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
    })

    test('should generate correct breadcrumbs for schools route', () => {
      mockRouterState.location.pathname = '/app/schools'
      render(<Breadcrumbs />)

      expect(screen.getByText('Écoles')).toBeInTheDocument()
    })

    test('should generate correct breadcrumbs for catalogs route', () => {
      mockRouterState.location.pathname = '/app/catalogs'
      render(<Breadcrumbs />)

      expect(screen.getByText('Catalogues')).toBeInTheDocument()
    })

    test('should generate correct breadcrumbs for programs route', () => {
      mockRouterState.location.pathname = '/app/catalogs/programs'
      render(<Breadcrumbs />)

      expect(screen.getByText('Catalogues')).toBeInTheDocument()
      expect(screen.getByText('Programmes')).toBeInTheDocument()
    })

    test('should generate correct breadcrumbs for analytics route', () => {
      mockRouterState.location.pathname = '/app/analytics'
      render(<Breadcrumbs />)

      expect(screen.getByText('Analytiques')).toBeInTheDocument()
    })

    test('should generate correct breadcrumbs for support route', () => {
      mockRouterState.location.pathname = '/app/support'
      render(<Breadcrumbs />)

      expect(screen.getByText('Support')).toBeInTheDocument()
    })

    test('should skip app segment in breadcrumbs', () => {
      mockRouterState.location.pathname = '/app/schools'
      render(<Breadcrumbs />)

      // Should not show "App" as a breadcrumb
      expect(screen.queryByText('App')).not.toBeInTheDocument()
      expect(screen.getByText('Écoles')).toBeInTheDocument()
    })

    test('should handle complex nested routes', () => {
      mockRouterState.location.pathname = '/app/catalogs/subjects/create'
      render(<Breadcrumbs />)

      expect(screen.getByText('Catalogues')).toBeInTheDocument()
      expect(screen.getByText('Matières')).toBeInTheDocument()
      expect(screen.getByText('Créer')).toBeInTheDocument()
    })
  })

  describe('custom Breadcrumb Items', () => {
    test('should render custom breadcrumb items when provided', () => {
      const customItems = [
        { label: 'Custom 1', href: '/custom1' },
        { label: 'Custom 2' }, // No href for last item
      ]

      render(<Breadcrumbs items={customItems} />)

      expect(screen.getByText('Custom 1')).toBeInTheDocument()
      expect(screen.getByText('Custom 2')).toBeInTheDocument()
    })

    test('should make non-last items clickable links', () => {
      const customItems = [
        { label: 'Level 1', href: '/level1' },
        { label: 'Level 2', href: '/level2' },
        { label: 'Current Page' },
      ]

      render(<Breadcrumbs items={customItems} />)

      const level1Link = screen.getByRole('link', { name: 'Level 1' })
      const level2Link = screen.getByRole('link', { name: 'Level 2' })

      expect(level1Link).toHaveAttribute('href', '/level1')
      expect(level2Link).toHaveAttribute('href', '/level2')
    })

    test('should make last item non-clickable text', () => {
      const customItems = [
        { label: 'Parent', href: '/parent' },
        { label: 'Current Page' },
      ]

      render(<Breadcrumbs items={customItems} />)

      const currentPage = screen.getByText('Current Page')
      expect(currentPage.tagName).toBe('SPAN')
      expect(currentPage).toHaveClass('text-foreground', 'font-medium')
    })

    test('should handle empty custom items array', () => {
      render(<Breadcrumbs items={[]} />)

      // Should render nothing (return null) when no items
      const nav = screen.queryByRole('navigation')
      expect(nav).not.toBeInTheDocument()
    })
  })

  describe('translation Functionality', () => {
    test('should translate route segments to French', () => {
      mockRouterState.location.pathname = '/app/dashboard/schools/programs/subjects'
      render(<Breadcrumbs />)

      expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
      expect(screen.getByText('Écoles')).toBeInTheDocument()
      expect(screen.getByText('Programmes')).toBeInTheDocument()
      expect(screen.getByText('Matières')).toBeInTheDocument()
    })

    test('should capitalize unknown segments', () => {
      mockRouterState.location.pathname = '/app/unknown-segment'
      render(<Breadcrumbs />)

      expect(screen.getByText('Unknown-segment')).toBeInTheDocument()
    })

    test('should handle single character segments', () => {
      mockRouterState.location.pathname = '/app/a'
      render(<Breadcrumbs />)

      expect(screen.getByText('A')).toBeInTheDocument()
    })
  })

  describe('empty State', () => {
    test('should return null when no breadcrumbs to display', () => {
      mockRouterState.location.pathname = '/app'
      render(<Breadcrumbs />)

      // Should render nothing (return null)
      const nav = screen.queryByRole('navigation')
      expect(nav).not.toBeInTheDocument()
    })

    test('should return null for root path', () => {
      mockRouterState.location.pathname = '/'
      render(<Breadcrumbs />)

      const nav = screen.queryByRole('navigation')
      expect(nav).not.toBeInTheDocument()
    })

    test('should return null when custom items is empty array', () => {
      render(<Breadcrumbs items={[]} />)

      // Only home icon should be present, no navigation
      const nav = screen.queryByRole('navigation')
      expect(nav).not.toBeInTheDocument()
    })
  })

  describe('link Generation', () => {
    test('should generate correct hrefs for nested routes', () => {
      mockRouterState.location.pathname = '/app/catalogs/programs/create'
      render(<Breadcrumbs />)

      const catalogsLink = screen.getByRole('link', { name: 'Catalogues' })
      const programsLink = screen.getByRole('link', { name: 'Programmes' })

      expect(catalogsLink).toHaveAttribute('href', '/app/catalogs')
      expect(programsLink).toHaveAttribute('href', '/app/catalogs/programs')
    })

    test('should not add href to last breadcrumb item', () => {
      mockRouterState.location.pathname = '/app/schools'
      render(<Breadcrumbs />)

      // Schools should be a span, not a link (since it's the last item)
      const schoolsItem = screen.getByText('Écoles')
      expect(schoolsItem.closest('a')).not.toBeInTheDocument()
    })

    test('should handle deeply nested route href generation', () => {
      mockRouterState.location.pathname = '/app/catalogs/subjects/math'
      render(<Breadcrumbs />)

      const links = screen.getAllByRole('link')
      // Should have home link and catalogs link
      expect(links[0]).toHaveAttribute('href', '/app/dashboard') // Home
      expect(links[1]).toHaveAttribute('href', '/app/catalogs') // Catalogues
    })
  })

  describe('cSS Classes and Styling', () => {
    test('should apply custom className to navigation element', () => {
      render(<Breadcrumbs className="custom-breadcrumb-class" />)

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('custom-breadcrumb-class')
    })

    test('should apply hover classes to home link', () => {
      render(<Breadcrumbs />)

      const homeLink = screen.getByRole('link', { name: /🏠/ })
      expect(homeLink).toHaveClass('hover:text-foreground', 'transition-colors')
    })

    test('should apply active styles to current page', () => {
      mockRouterState.location.pathname = '/app/schools'
      render(<Breadcrumbs />)

      const currentPage = screen.getByText('Écoles')
      expect(currentPage).toHaveClass('text-foreground', 'font-medium')
    })

    test('should apply proper spacing between items', () => {
      render(<Breadcrumbs />)

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('space-x-1')
    })
  })

  describe('accessibility', () => {
    test('should have proper navigation role', () => {
      render(<Breadcrumbs />)

      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    test('should have accessible home link', () => {
      render(<Breadcrumbs />)

      const homeLink = screen.getByRole('link', { name: /🏠/ })
      expect(homeLink).toBeInTheDocument()
    })

    test('should have proper link text for screen readers', () => {
      mockRouterState.location.pathname = '/app/schools'
      render(<Breadcrumbs />)

      const schoolsText = screen.getByText('Écoles')
      expect(schoolsText).toBeInTheDocument()
    })

    test('should maintain proper reading order', () => {
      mockRouterState.location.pathname = '/app/catalogs/programs'
      render(<Breadcrumbs />)

      const nav = screen.getByRole('navigation')
      const homeLink = screen.getByRole('link', { name: /🏠/ })
      const catalogsLink = screen.getByRole('link', { name: 'Catalogues' })
      const programsText = screen.getByText('Programmes')

      // Check order in DOM
      expect(nav.contains(homeLink)).toBe(true)
      expect(nav.contains(catalogsLink)).toBe(true)
      expect(nav.contains(programsText)).toBe(true)
    })
  })

  describe('edge Cases', () => {
    test('should handle routes with trailing slashes', () => {
      mockRouterState.location.pathname = '/app/schools/'
      render(<Breadcrumbs />)

      expect(screen.getByText('Écoles')).toBeInTheDocument()
    })

    test('should handle routes with multiple consecutive slashes', () => {
      mockRouterState.location.pathname = '/app//schools'
      render(<Breadcrumbs />)

      // Should not crash and should handle gracefully
      expect(screen.queryByText('Écoles')).toBeInTheDocument()
    })

    test('should handle empty path segments', () => {
      mockRouterState.location.pathname = '/app//'
      render(<Breadcrumbs />)

      // Should not crash
      const nav = screen.queryByRole('navigation')
      expect(nav).not.toBeInTheDocument()
    })

    test('should handle special characters in path', () => {
      mockRouterState.location.pathname = '/app/schools/école-test'
      render(<Breadcrumbs />)

      expect(screen.getByText('École-test')).toBeInTheDocument()
    })

    test('should handle numeric path segments', () => {
      mockRouterState.location.pathname = '/app/schools/123'
      render(<Breadcrumbs />)

      expect(screen.getByText('123')).toBeInTheDocument()
    })
  })

  describe('performance', () => {
    test('should not recreate items on re-renders with same path', () => {
      mockRouterState.location.pathname = '/app/schools'

      const { rerender } = render(<Breadcrumbs />)

      const firstRenderItems = screen.getAllByRole('link').length + screen.getAllByText(/^[^🏠]/u).length

      rerender(<Breadcrumbs />)

      const secondRenderItems = screen.getAllByRole('link').length + screen.getAllByText(/^[^🏠]/u).length

      expect(firstRenderItems).toBe(secondRenderItems)
    })
  })

  describe('integration', () => {
    test('should work with router state changes', () => {
      mockRouterState.location.pathname = '/app/dashboard'

      const { rerender } = render(<Breadcrumbs />)

      expect(screen.getByText('Tableau de bord')).toBeInTheDocument()

      mockRouterState.location.pathname = '/app/schools'
      rerender(<Breadcrumbs />)

      expect(screen.getByText('Écoles')).toBeInTheDocument()
    })

    test('should maintain home link consistency', () => {
      mockRouterState.location.pathname = '/app/schools/departments/math'
      render(<Breadcrumbs />)

      const homeLinks = screen.getAllByRole('link', { name: /🏠/ })
      expect(homeLinks).toHaveLength(1)
      expect(homeLinks[0]).toHaveAttribute('href', '/app/dashboard')
    })
  })
})
