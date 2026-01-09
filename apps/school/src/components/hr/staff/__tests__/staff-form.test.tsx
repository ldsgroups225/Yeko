import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// We need to import after unmocking
const { StaffForm } = await import('../staff-form')

describe('staffForm Component', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('rendering - Create Mode', () => {
    test('should render all form fields', () => {
      render(<StaffForm onSubmit={mockOnSubmit} />)

      expect(screen.getByLabelText(/Select User/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Position/i).length).toBeGreaterThan(0)
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Hire Date/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Status/i).length).toBeGreaterThan(0)
    })

    test('should render basic info section', () => {
      render(<StaffForm onSubmit={mockOnSubmit} />)

      expect(screen.getByText('Basic Information')).toBeInTheDocument()
    })

    test('should render action buttons', () => {
      render(<StaffForm onSubmit={mockOnSubmit} />)

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument()
    })

    test('should show user ID field in create mode', () => {
      render(<StaffForm onSubmit={mockOnSubmit} />)

      expect(screen.getByLabelText(/Select User/i)).toBeInTheDocument()
      expect(screen.getByText('Enter the ID of an existing user')).toBeInTheDocument()
    })
  })

  describe('rendering - Edit Mode', () => {
    const initialData = {
      id: 'staff-123',
      userId: 'user-123',
      position: 'accountant' as const,
      department: 'Finance',
      hireDate: new Date('2024-01-15'),
      status: 'active' as const,
    }

    test('should populate form with initial data', () => {
      render(<StaffForm initialData={initialData} onSubmit={mockOnSubmit} />)

      expect(screen.getByDisplayValue('Finance')).toBeInTheDocument()
    })

    test('should not show user ID field in edit mode', () => {
      render(<StaffForm initialData={initialData} onSubmit={mockOnSubmit} />)

      expect(screen.queryByLabelText(/Select User/i)).not.toBeInTheDocument()
    })

    test('should show save button in edit mode', () => {
      render(<StaffForm initialData={initialData} onSubmit={mockOnSubmit} />)

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
    })
  })

  describe('form Validation', () => {
    test('should show required field indicators', () => {
      render(<StaffForm onSubmit={mockOnSubmit} />)

      const requiredIndicators = screen.getAllByText('*')
      expect(requiredIndicators.length).toBeGreaterThan(0)
    })

    test('should validate required fields on submit', async () => {
      const user = userEvent.setup()
      render(<StaffForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })
  })

  describe('user Interactions', () => {
    test('should allow typing in user ID field', async () => {
      const user = userEvent.setup()
      render(<StaffForm onSubmit={mockOnSubmit} />)

      const userIdInput = screen.getByLabelText(/Select User/i)
      await user.type(userIdInput, 'user-456')

      expect(userIdInput).toHaveValue('user-456')
    })

    test('should allow typing in department field', async () => {
      const user = userEvent.setup()
      render(<StaffForm onSubmit={mockOnSubmit} />)

      const departmentInput = screen.getByLabelText(/Department/i)
      await user.type(departmentInput, 'Human Resources')

      expect(departmentInput).toHaveValue('Human Resources')
    })
  })

  describe('accessibility', () => {
    test('should have proper form structure', () => {
      render(<StaffForm onSubmit={mockOnSubmit} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    test('should have accessible labels', () => {
      render(<StaffForm onSubmit={mockOnSubmit} />)

      expect(screen.getByLabelText(/Select User/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Position/i).length).toBeGreaterThan(0)
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument()
    })

    test('should have accessible buttons', () => {
      render(<StaffForm onSubmit={mockOnSubmit} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument()
      })
    })
  })
})
