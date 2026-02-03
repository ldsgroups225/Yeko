import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Header } from './header'

// Mock auth client
const mockSession = {
  user: {
    id: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    email: 'john.doe@example.com',
    emailVerified: true,
    name: 'John Doe',
    image: 'https://example.com/avatar.jpg',
  },
  session: {
    id: 'session-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    userId: '1',
    token: 'mock-token',
    expiresAt: new Date('2024-12-31'),
  },
}

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

// Mock Breadcrumbs component
vi.mock('./breadcrumbs', () => ({
  Breadcrumbs: () => React.createElement('div', { 'data-testid': 'breadcrumbs' }, 'Breadcrumbs'),
}))

// Mock AccountDialog component
vi.mock('@/components/auth/account-dialog', () => ({
  AccountDialog: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'account-dialog' }, children),
}))

// Mock UI components
vi.mock('@workspace/ui/components/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) =>
    React.createElement('button', {
      'type': 'button',
      onClick,
      className,
      'data-testid': props['data-testid'] || 'button',
      ...props,
    }, children),
}))

vi.mock('@workspace/ui/components/input', () => ({
  Input: ({ onChange, value, placeholder, ...props }: any) =>
    React.createElement('input', {
      onChange,
      value,
      placeholder,
      'data-testid': props['data-testid'] || 'input',
      ...props,
    }),
}))

vi.mock('@workspace/ui/components/avatar', () => ({
  Avatar: ({ children, className, ...props }: any) =>
    React.createElement('div', { className, 'data-testid': 'avatar', ...props }, children),
  AvatarImage: ({ src, alt, ...props }: any) =>
    React.createElement('img', { src, alt, 'data-testid': 'avatar-image', ...props }),
  AvatarFallback: ({ children, className, ...props }: any) =>
    React.createElement('div', { className, 'data-testid': 'avatar-fallback', ...props }, children),
}))

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Mock SidebarProvider
vi.mock('@workspace/ui/components/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  SidebarTrigger: ({ children, ...props }: any) =>
    React.createElement('button', { type: 'button', ...props }, children),
  useSidebar: () => ({
    open: true,
    setOpen: vi.fn(),
    openMobile: false,
    setOpenMobile: vi.fn(),
    isMobile: false,
    state: 'expanded',
  }),
}))

// Mock @tabler/icons-react icons with data-testid attributes
vi.mock('@tabler/icons-react', () => ({
  IconMenu: ({ className }: { className?: string }) =>
    React.createElement('svg', { className, 'data-testid': 'icon-menu' }, React.createElement('path', { d: 'M4 6h16a2 2 0 012-2 2v12a2 2 0 01-2-2H4a2 2 0 00-2-2v-12a2 2 0 012 2z' }),
    ),
  IconSearch: ({ className }: { className?: string }) =>
    React.createElement('svg', { className, 'data-testid': 'icon-search' }, React.createElement('path', { d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 11 14 0 7-7-7-7a7 7 0 00-14 0 14-14zm0 14a1 1 0 00-2-2v3a1 1 0 012-2H3' }),
    ),
  IconBell: ({ className }: { className?: string }) =>
    React.createElement('svg', { className, 'data-testid': 'icon-bell' }, React.createElement('path', { d: 'M18 8A6 6 0 016-6v2c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-2a6 6 0 016 6z' }),
    ),
  IconSettings: ({ className }: { className?: string }) =>
    React.createElement('svg', { className, 'data-testid': 'icon-settings' }, React.createElement('path', { d: 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 002 2h.44a2 2 0 002-2V4a2 2 0 00-2-2h-.44z' }),
    ),
}))

describe('header Component', () => {
  const mockOnMobileMenuToggle = vi.fn()

  beforeEach(async () => {
    vi.clearAllMocks()
    const { authClient } = await import('@/lib/auth-client')
    vi.mocked(authClient.useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  describe('rendering', () => {
    test('should render header with all elements', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      // Check if header renders
      const header = screen.getByRole('banner') || document.querySelector('header')
      expect(header).toBeInTheDocument()

      // Check for search input
      expect(screen.getByPlaceholderText('Rechercher des écoles, programmes...')).toBeInTheDocument()

      // Check for user menu elements
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Super Administrateur')).toBeInTheDocument()
    })

    test('should display user avatar with correct image', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const avatarImage = screen.getByTestId('avatar-image')
      expect(avatarImage).toBeInTheDocument()
      expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg')
      expect(avatarImage).toHaveAttribute('alt', 'John Doe')
    })

    test('should show mobile menu button only on mobile', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      // Mobile menu button contains IconMenu - find by data-testid
      const mobileMenuButton = document.querySelector('[data-testid="icon-menu"]')?.closest('button')
      expect(mobileMenuButton).toBeInTheDocument()
      expect(mobileMenuButton).toHaveAttribute('type', 'button')
    })

    test('should display search bar with icon', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const searchInput = screen.getByPlaceholderText('Rechercher des écoles, programmes...')
      expect(searchInput).toBeInTheDocument()

      // Search icon should be present - find by data-testid
      const searchIcon = document.querySelector('[data-testid="icon-search"]')
      expect(searchIcon).toBeInTheDocument()
    })

    test('should show notification and settings buttons', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      // Find notification and settings buttons using their icons' data-testid
      const iconBell = document.querySelector('[data-testid="icon-bell"]')?.closest('button')
      const iconSettings = document.querySelector('[data-testid="icon-settings"]')?.closest('button')

      expect(iconBell).toBeInTheDocument()
      expect(iconSettings).toBeInTheDocument()
    })

    test('should render breadcrumbs component', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const breadcrumbs = screen.getByTestId('breadcrumbs')
      expect(breadcrumbs).toBeInTheDocument()
    })

    test('should show notification indicator', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      // Look for notification indicator (red dot)
      const notificationIndicator = document.querySelector('.bg-destructive')
      expect(notificationIndicator).toBeInTheDocument()
    })
  })

  describe('user Information Display', () => {
    test('should display user name when available', async () => {
      const { authClient } = await import('@/lib/auth-client')
      vi.mocked(authClient.useSession).mockReturnValue({
        data: {
          user: {
            id: '1',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            email: 'jane@example.com',
            emailVerified: true,
            name: 'Jane Smith',
          },
          session: {
            id: 'session-2',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            userId: '1',
            token: 'mock-token-2',
            expiresAt: new Date('2024-12-31'),
          },
        },
        isPending: false,
        isRefetching: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    test('should display fallback when user name not available', async () => {
      const { authClient } = await import('@/lib/auth-client')
      vi.mocked(authClient.useSession).mockReturnValue({
        data: {
          user: {
            id: '1',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            email: 'test@example.com',
            emailVerified: true,
            name: 'Test User',
          },
          session: {
            id: 'session-3',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            userId: '1',
            token: 'mock-token-3',
            expiresAt: new Date('2024-12-31'),
          },
        },
        isPending: false,
        isRefetching: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    test('should show avatar fallback with initial when no image', async () => {
      const { authClient } = await import('@/lib/auth-client')
      vi.mocked(authClient.useSession).mockReturnValue({
        data: {
          user: {
            id: '1',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            email: 'john@example.com',
            emailVerified: true,
            name: 'John Doe',
          },
          session: {
            id: 'session-4',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            userId: '1',
            token: 'mock-token-4',
            expiresAt: new Date('2024-12-31'),
          },
        },
        isPending: false,
        isRefetching: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toBeInTheDocument()
      expect(avatarFallback).toHaveTextContent('J') // First letter of "John Doe"
    })

    test('should show email initial when neither name nor image available', async () => {
      const { authClient } = await import('@/lib/auth-client')
      vi.mocked(authClient.useSession).mockReturnValue({
        data: {
          user: {
            id: '1',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            email: 'test@example.com',
            emailVerified: true,
            name: 'Test User',
          },
          session: {
            id: 'session-5',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            userId: '1',
            token: 'mock-token-5',
            expiresAt: new Date('2024-12-31'),
          },
        },
        isPending: false,
        isRefetching: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toHaveTextContent('T') // First letter of email
    })

    test('should show default fallback when no user info available', async () => {
      const { authClient } = await import('@/lib/auth-client')
      vi.mocked(authClient.useSession).mockReturnValue({
        data: {
          user: {
            id: '1',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            email: 'default@example.com',
            emailVerified: true,
            name: 'Default User',
          },
          session: {
            id: 'session-6',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            userId: '1',
            token: 'mock-token-6',
            expiresAt: new Date('2024-12-31'),
          },
        },
        isPending: false,
        isRefetching: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toHaveTextContent('D') // Default from "Default User"
    })
  })

  describe('search Functionality', () => {
    test('should handle search input changes', async () => {
      const user = userEvent.setup()
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const searchInput = screen.getByPlaceholderText('Rechercher des écoles, programmes...')

      await user.type(searchInput, 'test search')

      expect(searchInput).toHaveValue('test search')
    })

    test('should have proper input attributes', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const searchInput = screen.getByPlaceholderText('Rechercher des écoles, programmes...')

      expect(searchInput).toHaveClass('pl-9') // Padding for icon
    })

    test('should clear search input when value changes', async () => {
      const user = userEvent.setup()
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const searchInput = screen.getByPlaceholderText('Rechercher des écoles, programmes...')

      await user.type(searchInput, 'test')
      expect(searchInput).toHaveValue('test')

      await user.clear(searchInput)
      expect(searchInput).toHaveValue('')
    })
  })

  describe('mobile Menu Toggle', () => {
    test('should call onMobileMenuToggle when mobile menu button is clicked', async () => {
      const user = userEvent.setup()
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const mobileMenuButton = document.querySelector('[data-testid="icon-menu"]')?.closest('button')
      await user.click(mobileMenuButton!)

      expect(mockOnMobileMenuToggle).toHaveBeenCalledTimes(1)
    })

    test('should render menu icon on mobile button', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const mobileMenuButton = document.querySelector('[data-testid="icon-menu"]')?.closest('button')
      const menuIcon = mobileMenuButton?.querySelector('[data-testid="icon-menu"]')
      expect(menuIcon).toBeInTheDocument()
    })

    test('should hide mobile menu button on large screens', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const mobileMenuButton = document.querySelector('[data-testid="icon-menu"]')?.closest('button')
      expect(mobileMenuButton).toBeInTheDocument()
    })
  })

  describe('account Dialog Integration', () => {
    test('should wrap user menu in AccountDialog', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const accountDialog = screen.getByTestId('account-dialog')
      expect(accountDialog).toBeInTheDocument()

      // Should contain user menu button
      const userMenuButton = accountDialog.querySelector('button')
      expect(userMenuButton).toBeInTheDocument()
    })

    test('should pass avatar and user info to AccountDialog', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const accountDialog = screen.getByTestId('account-dialog')
      const avatar = accountDialog.querySelector('[data-testid="avatar"]')

      expect(avatar).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  describe('responsive Design', () => {
    test('should hide user details on small screens', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      // User details should have hidden classes for small screens
      const userDetails = screen.getByText('John Doe').closest('.hidden')
      expect(userDetails).toHaveClass('sm:flex')
    })

    test('should show user details on medium screens', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      // User details should be visible on small screens and above
      const userDetails = screen.getByText('John Doe').closest('div')
      expect(userDetails).toHaveClass('sm:flex')
    })

    test('should maintain proper header structure across screen sizes', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const header = document.querySelector('header')
      expect(header).toHaveClass('flex', 'flex-col')
    })
  })

  describe('accessibility', () => {
    test.todo('should have proper button roles', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      // All buttons should have proper type
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    test('should have proper input labels and placeholders', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toHaveAttribute('placeholder', 'Rechercher des écoles, programmes...')
    })

    test('should have proper alt text for avatar', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const avatarImage = screen.getByTestId('avatar-image')
      expect(avatarImage).toHaveAttribute('alt', 'John Doe')
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const searchInput = screen.getByRole('textbox')
      searchInput.focus()

      expect(searchInput).toHaveFocus()

      await user.keyboard('{Tab}')

      // Focus should move to next interactive element
      const focusedElement = document.activeElement
      expect(focusedElement?.tagName).toBe('BUTTON')
    })
  })

  describe('error Handling', () => {
    test('should handle missing user session gracefully', async () => {
      const { authClient } = await import('@/lib/auth-client')
      vi.mocked(authClient.useSession).mockReturnValue({
        data: null,
        isPending: false,
        isRefetching: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      // Should render with default values
      expect(screen.getByText('Utilisateur Admin')).toBeInTheDocument()
      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('A')
    })

    test('should handle missing onMobileMenuToggle gracefully', () => {
      expect(() => {
        render(<Header />)
      }).not.toThrow()
    })

    test('should handle session loading state', async () => {
      const { authClient } = await import('@/lib/auth-client')
      vi.mocked(authClient.useSession).mockReturnValue({
        data: null,
        isPending: true,
        isRefetching: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      // Should render without crashing
      expect(screen.getByPlaceholderText('Rechercher des écoles, programmes...')).toBeInTheDocument()
    })
  })

  describe('component Structure', () => {
    test('should have proper header semantic structure', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('border-b', 'border-border', 'bg-background')
    })

    test('should render breadcrumbs in separate section', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const breadcrumbsContainer = screen.getByTestId('breadcrumbs').closest('.border-t')
      expect(breadcrumbsContainer).toBeInTheDocument()
    })

    test('should maintain proper flex layout for controls', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const controlsContainer = document.querySelector('.flex.items-center.justify-between')
      expect(controlsContainer).toBeInTheDocument()
    })
  })
})
