import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// We need to import after unmocking
const { UserForm } = await import('../user-form')

describe('userForm Component', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    mockOnSuccess.mockClear()
  })

  describe('rendering - Create Mode', () => {
    test('should render all form fields', () => {
      render(<UserForm onSuccess={mockOnSuccess} />)

      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Avatar/i)).toBeInTheDocument()
    })

    test('should render basic info section', () => {
      render(<UserForm onSuccess={mockOnSuccess} />)

      expect(screen.getByText('Basic Information')).toBeInTheDocument()
    })

    test('should render role assignment section', () => {
      render(<UserForm onSuccess={mockOnSuccess} />)

      expect(screen.getByText('Role Assignment')).toBeInTheDocument()
      expect(screen.getByText('Select the roles to assign to this user')).toBeInTheDocument()
    })

    test('should render action buttons', () => {
      render(<UserForm onSuccess={mockOnSuccess} />)

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument()
    })

    test('should show email as editable in create mode', () => {
      render(<UserForm onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/Email/i)
      expect(emailInput).not.toBeDisabled()
    })
  })

  describe('rendering - IconEdit Mode', () => {
    const existingUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      avatarUrl: 'https://example.com/avatar.jpg',
      status: 'active' as const,
      roleIds: ['role-1'],
    }

    test('should populate form with user data', () => {
      render(<UserForm user={existingUser} onSuccess={mockOnSuccess} />)

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
    })

    test('should disable email field in edit mode', () => {
      render(<UserForm user={existingUser} onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/Email/i)
      expect(emailInput).toBeDisabled()
    })

    test('should show save button in edit mode', () => {
      render(<UserForm user={existingUser} onSuccess={mockOnSuccess} />)

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
    })
  })

  describe('form Validation', () => {
    test('should show required field indicators', () => {
      render(<UserForm onSuccess={mockOnSuccess} />)

      const requiredIndicators = screen.getAllByText('*')
      expect(requiredIndicators.length).toBeGreaterThan(0)
    })

    test('should validate name field on submit', async () => {
      const user = userEvent.setup()
      render(<UserForm onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      // Form should show validation errors
      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled()
      })
    })
  })

  describe('user Interactions', () => {
    test('should allow typing in name field', async () => {
      const user = userEvent.setup()
      render(<UserForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/Name/i)
      await user.type(nameInput, 'Jane Doe')

      expect(nameInput).toHaveValue('Jane Doe')
    })

    test('should allow typing in email field', async () => {
      const user = userEvent.setup()
      render(<UserForm onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/Email/i)
      await user.type(emailInput, 'jane@example.com')

      expect(emailInput).toHaveValue('jane@example.com')
    })

    test('should allow typing in phone field', async () => {
      const user = userEvent.setup()
      render(<UserForm onSuccess={mockOnSuccess} />)

      const phoneInput = screen.getByLabelText(/Phone/i)
      await user.type(phoneInput, '+1234567890')

      expect(phoneInput).toHaveValue('+1234567890')
    })

    test('should call onSuccess when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<UserForm onSuccess={mockOnSuccess} />)

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    test('should have proper form structure', () => {
      render(<UserForm onSuccess={mockOnSuccess} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    test('should have accessible labels', () => {
      render(<UserForm onSuccess={mockOnSuccess} />)

      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
    })

    test('should have accessible buttons', () => {
      render(<UserForm onSuccess={mockOnSuccess} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument()
      })
    })
  })
})
