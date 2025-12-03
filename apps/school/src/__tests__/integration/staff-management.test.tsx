import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import component
const { StaffForm } = await import('@/components/hr/staff/staff-form')

describe('staff Management Integration', () => {
  describe('create Staff Flow', () => {
    test('should create new staff member', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<StaffForm onSubmit={mockOnSubmit} />)

      // Fill in user ID
      const userIdInput = screen.getByLabelText(/Select User/i)
      await user.type(userIdInput, 'user-123')

      // Fill in department
      const departmentInput = screen.getByLabelText(/Department/i)
      await user.type(departmentInput, 'Administration')

      expect(userIdInput).toHaveValue('user-123')
      expect(departmentInput).toHaveValue('Administration')
    })

    test('should show user ID field in create mode', () => {
      render(<StaffForm onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/Select User/i)).toBeInTheDocument()
      expect(screen.getByText('Enter the ID of an existing user')).toBeInTheDocument()
    })

    test('should have position selection', () => {
      render(<StaffForm onSubmit={vi.fn()} />)

      expect(screen.getAllByText(/Position/i).length).toBeGreaterThan(0)
    })
  })

  describe('edit Staff Flow', () => {
    test('should edit existing staff member', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      const initialData = {
        userId: 'user-456',
        position: 'accountant',
        department: 'Finance',
        hireDate: '2024-01-15',
        status: 'active',
      }

      render(<StaffForm initialData={initialData} onSubmit={mockOnSubmit} />)

      // Verify data is loaded
      expect(screen.getByDisplayValue('Finance')).toBeInTheDocument()

      // Verify user ID field is hidden in edit mode
      expect(screen.queryByLabelText(/Select User/i)).not.toBeInTheDocument()

      // Update department
      const departmentInput = screen.getByLabelText(/Department/i)
      await user.clear(departmentInput)
      await user.type(departmentInput, 'Accounting')

      expect(departmentInput).toHaveValue('Accounting')
    })

    test('should show save button in edit mode', () => {
      const initialData = {
        userId: 'user-456',
        position: 'secretary',
        status: 'active',
      }

      render(<StaffForm initialData={initialData} onSubmit={vi.fn()} />)

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
    })
  })

  describe('form Validation', () => {
    test('should show required field indicators', () => {
      render(<StaffForm onSubmit={vi.fn()} />)

      const requiredIndicators = screen.getAllByText('*')
      expect(requiredIndicators.length).toBeGreaterThan(0)
    })

    test('should prevent submission with missing required fields', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<StaffForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })
  })

  describe('accessibility', () => {
    test('should have accessible form structure', () => {
      render(<StaffForm onSubmit={vi.fn()} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    test('should have accessible labels', () => {
      render(<StaffForm onSubmit={vi.fn()} />)

      expect(screen.getByLabelText(/Select User/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument()
    })
  })
})
