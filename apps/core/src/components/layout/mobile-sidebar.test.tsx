import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { MobileSidebar } from './mobile-sidebar'

// Mock the router hooks
const mockNavigate = vi.fn()
const mockRouterState = {
  location: {
    pathname: '/dashboard',
  },
}

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useRouterState: () => mockRouterState,
}))

// Mock Sheet component
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div
      data-testid="sheet"
      data-open={open}
      onClick={() => onOpenChange?.(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenChange?.(false)
        }
      }}
    >
      {children}
    </div>
  ),
  SheetContent: ({ children, side, className }: any) => (
    <div
      data-testid="sheet-content"
      data-side={side}
      className={className}
    >
      {children}
    </div>
  ),
  SheetHeader: ({ children, className }: any) => (
    <div data-testid="sheet-header" className={className}>
      {children}
    </div>
  ),
  SheetTitle: ({ children, className }: any) => (
    <h2 data-testid="sheet-title" className={className}>
      {children}
    </h2>
  ),
}))

// Mock other UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button
      type={props.type || 'button'}
      onClick={onClick}
      className={className}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => (
    <div className={className} data-testid="scroll-area">
      {children}
    </div>
  ),
}))

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('mobileSidebar Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockRouterState.location.pathname = '/dashboard'
  })

  describe('rendering', () => {
    test('should render mobile sidebar when open', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const sheet = screen.getByTestId('sheet')
      expect(sheet).toBeInTheDocument()
      expect(sheet).toHaveAttribute('data-open', 'true')
    })

    test('should not render mobile sidebar when closed', () => {
      render(<MobileSidebar isOpen={false} onClose={mockOnClose} />)

      const sheet = screen.getByTestId('sheet')
      expect(sheet).toHaveAttribute('data-open', 'false')
    })

    test('should render sheet content on left side', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const sheetContent = screen.getByTestId('sheet-content')
      expect(sheetContent).toHaveAttribute('data-side', 'left')
    })

    test('should render navigation items', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
      expect(screen.getByText('Écoles')).toBeInTheDocument()
      expect(screen.getByText('Catalogues')).toBeInTheDocument()
      expect(screen.getByText('Programmes')).toBeInTheDocument()
      expect(screen.getByText('Analytiques')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
    })

    test('should render header with logo and title', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const logo = screen.getByAltText('Yeko Logo')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/icon.png')

      const title = screen.getByTestId('sheet-title')
      expect(title).toHaveTextContent('Yeko Core')

      expect(screen.getByText('Super Administrateur')).toBeInTheDocument()
    })

    test('should render user profile section', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Utilisateur Admin')).toBeInTheDocument()
      expect(screen.getByText('Super Administrateur')).toBeInTheDocument()

      // Should have user avatar fallback
      expect(screen.getByText('A')).toBeInTheDocument()
    })

    test('should show proper sheet header styling', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const sheetHeader = screen.getByTestId('sheet-header')
      expect(sheetHeader).toHaveClass('p-6', 'border-b')
    })

    test('should render scroll area for navigation', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const scrollArea = screen.getByTestId('scroll-area')
      expect(scrollArea).toBeInTheDocument()
    })
  })

  describe('navigation Interaction', () => {
    test('should navigate and close when clicking navigation item', async () => {
      const user = userEvent.setup()
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const schoolsButton = screen.getByText('Écoles')
      await user.click(schoolsButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/schools' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    test('should navigate to dashboard when clicking Tableau de bord', async () => {
      const user = userEvent.setup()
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const dashboardButton = screen.getByText('Tableau de bord')
      await user.click(dashboardButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    test('should navigate to catalogs when clicking Catalogues', async () => {
      const user = userEvent.setup()
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const catalogsButton = screen.getByText('Catalogues')
      await user.click(catalogsButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/catalogs' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    test('should navigate to programs when clicking Programmes', async () => {
      const user = userEvent.setup()
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const programsButton = screen.getByText('Programmes')
      await user.click(programsButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/programs' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    test('should navigate to analytics when clicking Analytiques', async () => {
      const user = userEvent.setup()
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const analyticsButton = screen.getByText('Analytiques')
      await user.click(analyticsButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/analytics' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    test('should navigate to support when clicking Support', async () => {
      const user = userEvent.setup()
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const supportButton = screen.getByText('Support')
      await user.click(supportButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/support' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('active State Display', () => {
    test('should highlight dashboard as active when on dashboard route', () => {
      mockRouterState.location.pathname = '/dashboard'
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const dashboardButton = screen.getByText('Tableau de bord').closest('button')
      expect(dashboardButton).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    test('should highlight schools as active when on schools route', () => {
      mockRouterState.location.pathname = '/schools'
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const schoolsButton = screen.getByText('Écoles').closest('button')
      expect(schoolsButton).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    test('should highlight catalogs as active when on catalogs sub-routes', () => {
      mockRouterState.location.pathname = '/catalogs/programs'
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const catalogsButton = screen.getByText('Catalogues').closest('button')
      expect(catalogsButton).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    test('should not highlight inactive items', () => {
      mockRouterState.location.pathname = '/dashboard'
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const schoolsButton = screen.getByText('Écoles').closest('button')
      const catalogsButton = screen.getByText('Catalogues').closest('button')

      expect(schoolsButton).not.toHaveClass('bg-primary')
      expect(catalogsButton).not.toHaveClass('bg-primary')
    })
  })

  describe('sheet Interaction', () => {
    test('should call onClose when sheet is closed', async () => {
      const user = userEvent.setup()
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const sheet = screen.getByTestId('sheet')
      await user.click(sheet)

      expect(mockOnClose).toHaveBeenCalledWith(false)
    })

    test('should handle onOpenChange prop correctly', () => {
      const { rerender } = render(
        <MobileSidebar isOpen={false} onClose={mockOnClose} />,
      )

      let sheet = screen.getByTestId('sheet')
      expect(sheet).toHaveAttribute('data-open', 'false')

      rerender(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      sheet = screen.getByTestId('sheet')
      expect(sheet).toHaveAttribute('data-open', 'true')
    })
  })

  describe('navigation Item Structure', () => {
    test('should render navigation items with proper styling', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const buttons = screen.getAllByRole('button')
      const navigationButtons = buttons.filter(button =>
        ['Tableau de bord', 'Écoles', 'Catalogues', 'Programmes', 'Analytiques', 'Support']
          .some(text => button.textContent?.includes(text)),
      )

      navigationButtons.forEach((button) => {
        expect(button).toHaveClass('w-full', 'justify-start', 'gap-3', 'h-14', 'flex-col', 'items-start')
      })
    })

    test('should display descriptions for navigation items', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Vue d\'ensemble du système')).toBeInTheDocument()
      expect(screen.getByText('Écoles partenaires')).toBeInTheDocument()
      expect(screen.getByText('Catalogues globaux')).toBeInTheDocument()
      expect(screen.getByText('Programmes ministériels')).toBeInTheDocument()
      expect(screen.getByText('Analytiques du système')).toBeInTheDocument()
      expect(screen.getByText('CRM & tickets')).toBeInTheDocument()
    })

    test('should render icons for navigation items', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const buttons = screen.getAllByRole('button')
      const navigationButtons = buttons.filter(button =>
        button.textContent?.includes('Tableau de bord'),
      )

      // Should contain icons (SVG elements)
      expect(navigationButtons[0]?.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('user Profile Section', () => {
    test('should render user profile with proper styling', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const userProfileContainer = document.querySelector('.mt-auto.pt-6.border-t')
      expect(userProfileContainer).toBeInTheDocument()

      const userProfileBox = document.querySelector('.flex.items-center.gap-3.p-4.rounded-lg.bg-muted\\/50')
      expect(userProfileBox).toBeInTheDocument()
    })

    test('should display user avatar with fallback', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const avatarFallback = screen.getByText('A')
      expect(avatarFallback).toBeInTheDocument()
      expect(avatarFallback.parentElement).toHaveClass(
        'flex',
        'h-10',
        'w-10',
        'items-center',
        'justify-center',
        'rounded-full',
        'bg-primary',
        'text-primary-foreground',
        'text-sm',
        'font-medium',
      )
    })

    test('should display user information correctly', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Utilisateur Admin')).toBeInTheDocument()
      expect(screen.getByText('Super Administrateur')).toBeInTheDocument()

      const userName = screen.getByText('Utilisateur Admin')
      expect(userName).toHaveClass('text-sm', 'font-medium', 'text-foreground')

      const userRole = screen.getByText('Super Administrateur')
      expect(userRole).toHaveClass('text-xs', 'text-muted-foreground')
    })
  })

  describe('accessibility', () => {
    test('should have proper button roles for navigation', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      const navigationButtons = buttons.filter(button =>
        ['Tableau de bord', 'Écoles', 'Catalogues', 'Programmes', 'Analytiques', 'Support']
          .some(text => button.textContent?.includes(text)),
      )

      navigationButtons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    test('should have proper alt text for logo', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const logo = screen.getByAltText('Yeko Logo')
      expect(logo).toBeInTheDocument()
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const firstButton = screen.getByText('Tableau de bord')
      firstButton.focus()

      expect(firstButton).toHaveFocus()

      await user.keyboard('{Tab}')

      // Focus should move to next interactive element
      const focusedElement = document.activeElement
      expect(focusedElement?.tagName).toBe('BUTTON')
    })

    test('should have proper heading structure', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Yeko Core')
    })
  })

  describe('responsive Design', () => {
    test('should have correct width for mobile sidebar', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const sheetContent = screen.getByTestId('sheet-content')
      expect(sheetContent).toHaveClass('w-80')
    })

    test('should have proper padding for sheet content', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const sheetContent = screen.getByTestId('sheet-content')
      expect(sheetContent).toHaveClass('p-0')
    })
  })

  describe('error Handling', () => {
    test('should handle missing onClose gracefully', () => {
      expect(() => {
        render(<MobileSidebar isOpen={true} onClose={() => { }} />)
      }).not.toThrow()
    })

    test('should handle navigation errors gracefully', async () => {
      const user = userEvent.setup()
      mockNavigate.mockRejectedValue(new Error('Navigation failed'))

      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const schoolsButton = screen.getByText('Écoles')

      // Should not throw error
      await expect(user.click(schoolsButton)).resolves.not.toThrow()
    })

    test('should handle missing route gracefully', () => {
      mockRouterState.location.pathname = '/nonexistent-route'

      expect(() => {
        render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)
      }).not.toThrow()
    })
  })

  describe('component Structure', () => {
    test('should render navigation within scroll area', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const scrollArea = screen.getByTestId('scroll-area')
      const nav = scrollArea.querySelector('nav')

      expect(nav).toBeInTheDocument()
      expect(nav).toHaveClass('space-y-2')
    })

    test('should have proper sheet content structure', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const sheetContent = screen.getByTestId('sheet-content')
      expect(sheetContent.querySelector('[data-testid="sheet-header"]')).toBeInTheDocument()
      expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
    })

    test('should have proper spacing between navigation items', () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const nav = document.querySelector('nav')
      expect(nav).toHaveClass('space-y-2')
    })
  })

  describe('integration with Router', () => {
    test('should update active state when route changes', () => {
      mockRouterState.location.pathname = '/dashboard'

      const { rerender } = render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const dashboardButton = screen.getByText('Tableau de bord').closest('button')
      expect(dashboardButton).toHaveClass('bg-primary')

      mockRouterState.location.pathname = '/schools'
      rerender(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const schoolsButton = screen.getByText('Écoles').closest('button')
      expect(schoolsButton).toHaveClass('bg-primary')
    })

    test('should handle partial route matches correctly', () => {
      mockRouterState.location.pathname = '/schools/departments'
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const schoolsButton = screen.getByText('Écoles').closest('button')
      expect(schoolsButton).toHaveClass('bg-primary')
    })

    test('should not match dashboard when on other routes', () => {
      mockRouterState.location.pathname = '/schools'
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />)

      const dashboardButton = screen.getByText('Tableau de bord').closest('button')
      expect(dashboardButton).not.toHaveClass('bg-primary')
    })
  })
})
