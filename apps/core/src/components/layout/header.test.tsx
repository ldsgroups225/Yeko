import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Header } from './header'

// Mock auth client
const mockSession = {
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: 'https://example.com/avatar.jpg',
  },
}

const mockAuthClient = {
  useSession: vi.fn(),
}

vi.mock('@/lib/auth-client', () => ({
  authClient: mockAuthClient,
}))

// Mock Breadcrumbs component
vi.mock('./breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>,
}))

// Mock AccountDialog component
vi.mock('@/components/auth/account-dialog', () => ({
  AccountDialog: ({ children }: { children: React.ReactNode }) => <div data-testid="account-dialog">{children}</div>,
}))

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={className}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, placeholder, ...props }: any) => (
    <input
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      data-testid={props['data-testid'] || 'input'}
      {...props}
    />
  ),
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="avatar" {...props}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} data-testid="avatar-image" {...props} />
  ),
  AvatarFallback: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="avatar-fallback" {...props}>
      {children}
    </div>
  ),
}))

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('header Component', () => {
  const mockOnMobileMenuToggle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthClient.useSession.mockReturnValue({ data: mockSession })
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

      // Mobile menu button should be present
      const mobileMenuButton = screen.getByRole('button', { name: '' })
      expect(mobileMenuButton).toBeInTheDocument()
      expect(mobileMenuButton).toHaveClass('lg:hidden')
    })

    test('should display search bar with icon', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const searchInput = screen.getByPlaceholderText('Rechercher des écoles, programmes...')
      expect(searchInput).toBeInTheDocument()

      // Search icon should be present (using SVG)
      const searchIcon = document.querySelector('.absolute.left-3 svg')
      expect(searchIcon).toBeInTheDocument()
    })

    test('should show notification and settings buttons', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const buttons = screen.getAllByRole('button')

      // Find notification and settings buttons (they contain icons)
      const hasNotificationIcon = buttons.some(button =>
        button.querySelector('svg') && button.innerHTML.includes('Bell'),
      )
      const hasSettingsIcon = buttons.some(button =>
        button.querySelector('svg') && button.innerHTML.includes('Settings'),
      )

      expect(hasNotificationIcon).toBe(true)
      expect(hasSettingsIcon).toBe(true)
    })

    test('should render breadcrumbs component', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const breadcrumbs = screen.getByTestId('breadcrumbs')
      expect(breadcrumbs).toBeInTheDocument()
    })

    test('should show notification indicator', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      // Look for the notification indicator (red dot)
      const notificationIndicator = document.querySelector('.bg-destructive')
      expect(notificationIndicator).toBeInTheDocument()
    })
  })

  describe('user Information Display', () => {
    test('should display user name when available', () => {
      mockAuthClient.useSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        },
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    test('should display fallback when user name not available', () => {
      mockAuthClient.useSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      expect(screen.getByText('Utilisateur Admin')).toBeInTheDocument()
    })

    test('should show avatar fallback with initial when no image', () => {
      mockAuthClient.useSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toBeInTheDocument()
      expect(avatarFallback).toHaveTextContent('J') // First letter of "John Doe"
    })

    test('should show email initial when neither name nor image available', () => {
      mockAuthClient.useSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toHaveTextContent('T') // First letter of email
    })

    test('should show default fallback when no user info available', () => {
      mockAuthClient.useSession.mockReturnValue({
        data: {
          user: {},
        },
      })

      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toHaveTextContent('A') // Default fallback
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

      expect(searchInput).toHaveAttribute('type', 'text')
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

      const mobileMenuButton = screen.getByRole('button', { name: '' })
      await user.click(mobileMenuButton)

      expect(mockOnMobileMenuToggle).toHaveBeenCalledTimes(1)
    })

    test('should render menu icon on mobile button', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const mobileMenuButton = screen.getByRole('button', { name: '' })
      const menuIcon = mobileMenuButton.querySelector('svg')
      expect(menuIcon).toBeInTheDocument()
    })

    test('should hide mobile menu button on large screens', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const mobileMenuButton = screen.getByRole('button', { name: '' })
      expect(mobileMenuButton).toHaveClass('lg:hidden')
    })
  })

  describe('account Dialog Integration', () => {
    test('should wrap user menu in AccountDialog', () => {
      render(<Header onMobileMenuToggle={mockOnMobileMenuToggle} />)

      const accountDialog = screen.getByTestId('account-dialog')
      expect(accountDialog).toBeInTheDocument()

      // Should contain the user menu button
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
    test('should have proper button roles', () => {
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
    test('should handle missing user session gracefully', () => {
      mockAuthClient.useSession.mockReturnValue({ data: null })

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

    test('should handle session loading state', () => {
      mockAuthClient.useSession.mockReturnValue({ data: undefined, isLoading: true })

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
