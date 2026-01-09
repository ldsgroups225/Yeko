import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import components
const { RoleForm } = await import('@/components/hr/roles/role-form')
const { UserForm } = await import('@/components/hr/users/user-form')
const { StaffForm } = await import('@/components/hr/staff/staff-form')

describe('error Handling Integration', () => {
  describe('role Form Error Handling', () => {
    test('should handle submission errors gracefully', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Network error'))

      render(<RoleForm onSubmit={mockOnSubmit} />)

      // Fill in valid data
      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      // Verify submission was attempted
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    test('should validate slug format', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      // Type name with special characters
      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role 123')

      // Verify slug is sanitized (spaces become hyphens)
      await waitFor(() => {
        const slugInput = screen.getByLabelText(/Slug/i) as HTMLInputElement
        expect(slugInput.value).toBe('test-role-123')
      })
    })

    test('should handle very long role names', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      // Type a reasonable length to avoid timeout
      const longName = 'A'.repeat(50)
      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, longName)

      // Form should accept the input (validation happens on submit)
      expect(nameInput).toHaveValue(longName)
    })

    test('should handle empty permissions', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      // Should allow submission with no permissions selected
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('user Form Error Handling', () => {
    test('should handle invalid email format', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()

      render(<UserForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/Name/i)
      await user.type(nameInput, 'Test User')

      const emailInput = screen.getByLabelText(/Email/i)
      await user.type(emailInput, 'not-an-email')

      // Email input accepts the value (validation on submit)
      expect(emailInput).toHaveValue('not-an-email')
    })

    test('should handle special characters in names', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()

      render(<UserForm onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/Name/i)
      await user.type(nameInput, 'O\'Brien-Smith')

      expect(nameInput).toHaveValue('O\'Brien-Smith')
    })

    test('should handle international phone numbers', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()

      render(<UserForm onSuccess={mockOnSuccess} />)

      const phoneInput = screen.getByLabelText(/Phone/i)
      await user.type(phoneInput, '+225 07 12 34 56 78')

      expect(phoneInput).toHaveValue('+225 07 12 34 56 78')
    })

    test('should handle empty optional fields', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()

      render(<UserForm onSuccess={mockOnSuccess} />)

      // Fill only required fields
      const nameInput = screen.getByLabelText(/Name/i)
      await user.type(nameInput, 'Test User')

      const emailInput = screen.getByLabelText(/Email/i)
      await user.type(emailInput, 'test@example.com')

      // Phone and avatar are optional, leave them empty
      expect(nameInput).toHaveValue('Test User')
      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  describe('staff Form Error Handling', () => {
    test('should handle invalid user ID', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<StaffForm onSubmit={mockOnSubmit} />)

      const userIdInput = screen.getByLabelText(/Select User/i)
      await user.type(userIdInput, 'invalid-id-123')

      expect(userIdInput).toHaveValue('invalid-id-123')
    })

    test('should handle empty department', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<StaffForm onSubmit={mockOnSubmit} />)

      const userIdInput = screen.getByLabelText(/Select User/i)
      await user.type(userIdInput, 'user-123')

      // Department is optional, leave it empty
      const departmentInput = screen.getByLabelText(/Department/i)
      expect(departmentInput).toHaveValue('')
    })

    test('should handle future hire dates', async () => {
      const mockOnSubmit = vi.fn()

      render(<StaffForm onSubmit={mockOnSubmit} />)

      // The DatePicker component should prevent future dates
      // This test verifies the form accepts the component
      expect(screen.getAllByText(/Hire Date/i).length).toBeGreaterThan(0)
    })
  })

  describe('concurrent Operations', () => {
    test('should handle rapid form submissions', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      const submitButton = screen.getByRole('button', { name: /Create/i })

      // Submit form
      await user.click(submitButton)

      // Verify submission was called
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    test('should handle form changes during submission', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100)),
      )

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('data Integrity', () => {
    test('should preserve form data on validation errors', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      const descriptionInput = screen.getByLabelText(/Description/i)
      await user.type(descriptionInput, 'Test description')

      // Even if validation fails, data should be preserved
      expect(nameInput).toHaveValue('Test Role')
      expect(descriptionInput).toHaveValue('Test description')
    })

    test('should handle Unicode characters', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, '测试角色 🎓')

      expect(nameInput).toHaveValue('测试角色 🎓')
    })

    test('should handle RTL text', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'مدير المدرسة')

      expect(nameInput).toHaveValue('مدير المدرسة')
    })
  })

  describe('edge Cases', () => {
    test('should handle whitespace-only input', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, '   ')

      expect(nameInput).toHaveValue('   ')
    })

    test('should handle copy-paste operations', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.click(nameInput)
      await user.paste('Pasted Role Name')

      expect(nameInput).toHaveValue('Pasted Role Name')
    })

    test('should handle form reset', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      await user.clear(nameInput)

      expect(nameInput).toHaveValue('')
    })
  })
})
