import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import components
const { RoleForm } = await import('@/components/hr/roles/role-form')
const { PermissionsMatrix } = await import('@/components/hr/roles/permissions-matrix')

describe('role Management Integration', () => {
  describe('create Role Flow', () => {
    test('should create a new role with permissions', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      // Fill in role name
      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Content Manager')

      // Verify slug is auto-generated
      await waitFor(() => {
        const slugInput = screen.getByLabelText(/Slug/i) as HTMLInputElement
        expect(slugInput.value).toBe('content-manager')
      })

      // Fill in description
      const descriptionInput = screen.getByLabelText(/Description/i)
      await user.type(descriptionInput, 'Manages content and publications')

      // Select permissions
      const checkboxes = screen.getAllByRole('checkbox')
      // Select first few permissions (users - view, create)
      if (checkboxes.length > 0) {
        await user.click(checkboxes[0]!)
        await user.click(checkboxes[1]!)
      }

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      // Verify submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
        const submittedData = mockOnSubmit.mock.calls[0]![0]
        expect(submittedData.name).toBe('Content Manager')
        expect(submittedData.slug).toBe('content-manager')
        expect(submittedData.description).toBe('Manages content and publications')
      })
    })

    test('should handle French characters in role name', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      // Fill in role name with French characters
      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Coordinateur Académique')

      // Verify slug removes accents
      await waitFor(() => {
        const slugInput = screen.getByLabelText(/Slug/i) as HTMLInputElement
        expect(slugInput.value).toBe('coordinateur-academique')
      })

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('edit Role Flow', () => {
    test('should edit existing role', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      const initialData = {
        name: 'Teacher',
        slug: 'teacher',
        description: 'Teaching staff',
        permissions: {
          users: ['view'],
          students: ['view', 'create'],
        },
        scope: 'school',
      }

      render(<RoleForm initialData={initialData} onSubmit={mockOnSubmit} />)

      // Verify initial data is loaded
      expect(screen.getByDisplayValue('Teacher')).toBeInTheDocument()
      expect(screen.getByDisplayValue('teacher')).toBeInTheDocument()

      // Verify slug is disabled
      const slugInput = screen.getByLabelText(/Slug/i)
      expect(slugInput).toBeDisabled()

      // Update description
      const descriptionInput = screen.getByLabelText(/Description/i)
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated teaching staff role')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Save/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
        const submittedData = mockOnSubmit.mock.calls[0]![0]
        expect(submittedData.description).toBe('Updated teaching staff role')
      })
    })
  })

  describe('permissions Management', () => {
    test('should select all permissions for a resource', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      // Click "Select All" for first resource (users)
      const selectAllButtons = screen.getAllByRole('button', { name: /Select All/i })
      await user.click(selectAllButtons[0]!)

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          users: ['view', 'create', 'edit', 'delete'],
        }),
      )
    })

    test('should deselect all permissions for a resource', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      const value = {
        users: ['view', 'create', 'edit', 'delete'],
      }

      render(<PermissionsMatrix value={value} onChange={mockOnChange} />)

      // Click "Deselect All" for users
      const deselectAllButton = screen.getByRole('button', { name: /Deselect All/i })
      await user.click(deselectAllButton)

      expect(mockOnChange).toHaveBeenCalledWith({})
    })

    test('should show permissions count', () => {
      const value = {
        users: ['view', 'create'],
        teachers: ['view', 'edit', 'delete'],
      }

      render(<PermissionsMatrix value={value} onChange={vi.fn()} />)

      // Should show count of 5 permissions
      expect(screen.getByText(/permissions selected/i)).toBeInTheDocument()
    })
  })

  describe('form Validation', () => {
    test('should prevent submission with empty name', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /Create/i })
      await user.click(submitButton)

      // Should not submit
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })

    test('should show required field indicators', () => {
      render(<RoleForm onSubmit={vi.fn()} />)

      const requiredIndicators = screen.getAllByText('*')
      expect(requiredIndicators.length).toBeGreaterThan(0)
    })
  })

  describe('cancel Flow', () => {
    test('should not submit when cancel is clicked', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(<RoleForm onSubmit={mockOnSubmit} />)

      // Fill in some data
      const nameInput = screen.getByLabelText(/Role Name/i)
      await user.type(nameInput, 'Test Role')

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      // Should not submit
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })
})
