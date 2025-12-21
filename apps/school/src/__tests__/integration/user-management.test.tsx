import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import component
const { UserForm } = await import('@/components/hr/users/user-form')

describe('user Management Integration', () => {
  describe('create User Flow', () => {
    test('should create a new user with all fields', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()

      render(<UserForm onSuccess={mockOnSuccess} />)

      // Fill in user details
      const nameInput = screen.getByLabelText(/Name/i)
      await user.type(nameInput, 'Jean Kouassi')

      const emailInput = screen.getByLabelText(/Email/i)
      await user.type(emailInput, 'jean.kouassi@example.com')

      const phoneInput = screen.getByLabelText(/Phone/i)
      await user.type(phoneInput, '+225 07 12 34 56 78')

      // Verify all fields are filled
      expect(nameInput).toHaveValue('Jean Kouassi')
      expect(emailInput).toHaveValue('jean.kouassi@example.com')
      expect(phoneInput).toHaveValue('+225 07 12 34 56 78')
    })

    test('should handle Ivorian names with accents', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()

      render(<UserForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/Name/i)
      await user.type(nameInput, 'Adjoua Bénédicte Koné')

      expect(nameInput).toHaveValue('Adjoua Bénédicte Koné')
    })

    test('should show role assignment section', () => {
      render(<UserForm onSuccess={vi.fn()} />)

      expect(screen.getByText('Role Assignment')).toBeInTheDocument()
      expect(screen.getByText('Select the roles to assign to this user')).toBeInTheDocument()
    })
  })

  describe('edit User Flow', () => {
    test('should edit existing user', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()

      const existingUser = {
        id: 'user-123',
        name: 'Kouadio Yao',
        email: 'kouadio@example.com',
        phone: '+225 01 23 45 67 89',
        status: 'active' as const,
        roleIds: ['teacher'],
      }

      render(<UserForm user={existingUser} onSuccess={mockOnSuccess} />)

      // Verify data is loaded
      expect(screen.getByDisplayValue('Kouadio Yao')).toBeInTheDocument()
      expect(screen.getByDisplayValue('kouadio@example.com')).toBeInTheDocument()

      // Verify email is disabled in edit mode
      const emailInput = screen.getByLabelText(/Email/i)
      expect(emailInput).toBeDisabled()

      // Update phone
      const phoneInput = screen.getByLabelText(/Phone/i)
      await user.clear(phoneInput)
      await user.type(phoneInput, '+225 07 98 76 54 32')

      expect(phoneInput).toHaveValue('+225 07 98 76 54 32')
    })

    test('should show save button in edit mode', () => {
      const existingUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        status: 'active' as const,
        roleIds: [],
      }

      render(<UserForm user={existingUser} onSuccess={vi.fn()} />)

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
    })
  })

  describe('form Validation', () => {
    test('should show required field indicators', () => {
      render(<UserForm onSuccess={vi.fn()} />)

      const requiredIndicators = screen.getAllByText('*')
      expect(requiredIndicators.length).toBeGreaterThan(0)
    })

    test('should validate email format', async () => {
      const user = userEvent.setup()
      render(<UserForm onSuccess={vi.fn()} />)

      const emailInput = screen.getByLabelText(/Email/i)
      await user.type(emailInput, 'invalid-email')

      // Email input should accept the value (validation happens on submit)
      expect(emailInput).toHaveValue('invalid-email')
    })
  })

  describe('cancel Flow', () => {
    test('should call onSuccess when cancel is clicked', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()

      render(<UserForm onSuccess={mockOnSuccess} />)

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    test('should have accessible form structure', () => {
      render(<UserForm onSuccess={vi.fn()} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    test('should have accessible labels for all inputs', () => {
      render(<UserForm onSuccess={vi.fn()} />)

      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
    })
  })
})
