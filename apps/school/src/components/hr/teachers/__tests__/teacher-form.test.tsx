import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// We need to import after unmocking
const { TeacherForm } = await import('../teacher-form')

describe('teacherForm Component', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    mockOnSuccess.mockClear()
  })

  describe('rendering - Create Mode', () => {
    test('should render all form fields', () => {
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      expect(screen.getByLabelText(/Select User/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Specialization/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Hire Date/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Status/i).length).toBeGreaterThan(0)
    })

    test('should render basic info section', () => {
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      expect(screen.getByText('Basic Information')).toBeInTheDocument()
    })

    test('should render subject assignment section', () => {
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      expect(screen.getByText('Subject Assignment')).toBeInTheDocument()
      expect(screen.getByText('Select the subjects this teacher can teach')).toBeInTheDocument()
    })

    test('should render action buttons', () => {
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument()
    })

    test('should show user ID field in create mode', () => {
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      expect(screen.getByLabelText(/Select User/i)).toBeInTheDocument()
      expect(screen.getByText('Enter an existing user ID or create a new one')).toBeInTheDocument()
    })
  })

  describe('rendering - Edit Mode', () => {
    const existingTeacher = {
      id: 'teacher-123',
      userId: 'user-123',
      specialization: 'Mathematics',
      hireDate: '2024-01-15',
      status: 'active',
      subjectIds: ['math-101'],
    }

    test('should populate form with teacher data', () => {
      render(<TeacherForm teacher={existingTeacher} onSuccess={mockOnSuccess} />)

      expect(screen.getByDisplayValue('Mathematics')).toBeInTheDocument()
    })

    test('should not show user ID field in edit mode', () => {
      render(<TeacherForm teacher={existingTeacher} onSuccess={mockOnSuccess} />)

      expect(screen.queryByLabelText(/Select User/i)).not.toBeInTheDocument()
    })

    test('should show save button in edit mode', () => {
      render(<TeacherForm teacher={existingTeacher} onSuccess={mockOnSuccess} />)

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
    })
  })

  describe('form Validation', () => {
    test('should show required field indicators', () => {
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      const requiredIndicators = screen.getAllByText('*')
      expect(requiredIndicators.length).toBeGreaterThan(0)
    })

    test('should validate required fields on submit', async () => {
      const user = userEvent.setup()
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled()
      })
    })
  })

  describe('user Interactions', () => {
    test('should allow typing in user ID field', async () => {
      const user = userEvent.setup()
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      const userIdInput = screen.getByLabelText(/Select User/i)
      await user.type(userIdInput, 'user-456')

      expect(userIdInput).toHaveValue('user-456')
    })

    test('should allow typing in specialization field', async () => {
      const user = userEvent.setup()
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      const specializationInput = screen.getByLabelText(/Specialization/i)
      await user.type(specializationInput, 'Physics')

      expect(specializationInput).toHaveValue('Physics')
    })

    test('should call onSuccess when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    test('should have proper form structure', () => {
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    test('should have accessible labels', () => {
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      expect(screen.getByLabelText(/Select User/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Specialization/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Hire Date/i).length).toBeGreaterThan(0)
    })

    test('should have accessible buttons', () => {
      render(<TeacherForm onSuccess={mockOnSuccess} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument()
      })
    })
  })
})
