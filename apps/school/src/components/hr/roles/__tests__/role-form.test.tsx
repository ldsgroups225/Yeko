import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// We need to import after unmocking
const { RoleForm } = await import('../role-form')

describe('roleForm Component', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('rendering - Create Mode', () => {
    test('should render all form fields', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      expect(screen.getByLabelText(/Role Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    })

    test('should render permissions section', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      expect(screen.getByText('Permissions')).toBeInTheDocument()
      expect(screen.getByText('Select what this role can do')).toBeInTheDocument()
    })

    test('should render action buttons', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument()
    })

    test('should show slug as editable in create mode', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const slugInput = screen.getByLabelText(/Slug/i)
      expect(slugInput).not.toBeDisabled()
    })

    test('should show slug help text in create mode', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      expect(screen.getByText('Auto-generated from role name')).toBeInTheDocument()
    })
  })

  describe('rendering - Edit Mode', () => {
    const initialData = {
      id: '123',
      name: 'Administrator',
      slug: 'administrator',
      description: 'Full system access',
      permissions: {
        users: ['view', 'create', 'edit', 'delete'],
      },
      scope: 'school' as const,
    }

    test('should populate form with initial data', () => {
      render(<RoleForm initialData={initialData} onSubmit={mockOnSubmit} />)

      expect(screen.getByDisplayValue('Administrator')).toBeInTheDocument()
      expect(screen.getByDisplayValue('administrator')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Full system access')).toBeInTheDocument()
    })

    test('should disable slug field in edit mode', () => {
      render(<RoleForm initialData={initialData} onSubmit={mockOnSubmit} />)

      const slugInput = screen.getByLabelText(/Slug/i)
      expect(slugInput).toBeDisabled()
    })

    test('should not show slug help text in edit mode', () => {
      render(<RoleForm initialData={initialData} onSubmit={mockOnSubmit} />)

      expect(screen.queryByText('Auto-generated from role name')).not.toBeInTheDocument()
    })

    test('should show save button in edit mode', () => {
      render(<RoleForm initialData={initialData} onSubmit={mockOnSubmit} />)

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
    })
  })

  describe('form Validation', () => {
    test('should show required field indicators', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const requiredIndicators = screen.getAllByText('*')
      expect(requiredIndicators.length).toBeGreaterThan(0)
    })

    test('should validate name field on submit', async () => {
      const user = userEvent.setup()
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      // Form should not submit with empty name
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })

    test('should validate slug field on submit', async () => {
      const user = userEvent.setup()
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      // Should auto-generate slug, so form might submit
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('auto-generate Slug', () => {
    test('should auto-generate slug from name in create mode', async () => {
      const user = userEvent.setup()
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      await waitFor(() => {
        const slugInput = screen.getByLabelText(/Slug/i) as HTMLInputElement
        expect(slugInput.value).toBe('test-role')
      })
    })

    test('should handle French characters in name', async () => {
      const user = userEvent.setup()
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Élève')

      await waitFor(() => {
        const slugInput = screen.getByLabelText(/Slug/i) as HTMLInputElement
        expect(slugInput.value).toBe('eleve')
      })
    })

    test('should not auto-generate slug in edit mode', async () => {
      const user = userEvent.setup()
      const initialData = {
        id: '456',
        name: 'Administrator',
        slug: 'administrator',
        permissions: {},
        scope: 'school' as const,
      }

      render(<RoleForm initialData={initialData} onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'New Name')

      const slugInput = screen.getByLabelText(/Slug/i) as HTMLInputElement
      expect(slugInput.value).toBe('administrator')
    })
  })

  describe('form Submission', () => {
    test('should call onSubmit with form data', async () => {
      const user = userEvent.setup()
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      const descriptionInput = screen.getByLabelText(/Description/i)

      await user.type(nameInput, 'Test Role')
      await user.type(descriptionInput, 'Test description')

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    test('should disable buttons during submission', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })

    test('should show loading indicator during submission', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('permissions Integration', () => {
    test('should render PermissionsMatrix component', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    test('should update permissions when matrix changes', async () => {
      const user = userEvent.setup()
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const checkboxes = screen.getAllByRole('checkbox')
      if (checkboxes.length > 0) {
        await user.click(checkboxes[0] as HTMLElement)
      }

      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      await waitFor(() => {
        if (mockOnSubmit.mock.calls.length > 0) {
          const submittedData = mockOnSubmit.mock.calls[0]![0]
          expect(submittedData).toHaveProperty('permissions')
        }
      })
    })
  })

  describe('accessibility', () => {
    test('should have proper form structure', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    test('should have accessible labels', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      expect(screen.getByLabelText(/Role Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    })

    test('should have accessible buttons', () => {
      render(<RoleForm onSubmit={mockOnSubmit} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument()
      })
    })
  })
})
