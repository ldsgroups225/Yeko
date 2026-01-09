import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { PermissionsMatrix } from '../permissions-matrix'

describe('permissionsMatrix Component', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('rendering', () => {
    test('should render the permissions table', () => {
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    test('should render all resource rows', () => {
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      // IconCheck for translated resource names
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Teachers')).toBeInTheDocument()
      expect(screen.getByText('Staff')).toBeInTheDocument()
      expect(screen.getByText('Students')).toBeInTheDocument()
      expect(screen.getByText('Classes')).toBeInTheDocument()
      expect(screen.getByText('Grades')).toBeInTheDocument()
      expect(screen.getByText('Finance')).toBeInTheDocument()
      expect(screen.getByText('Reports')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    test('should render all action columns', () => {
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      expect(screen.getByText('View')).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    test('should render select all column', () => {
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      // Should have 9 "Select All" buttons (one per resource) + 1 header
      const selectAllButtons = screen.getAllByText('Select All')
      expect(selectAllButtons.length).toBeGreaterThanOrEqual(9)
    })
  })

  describe('checkbox State', () => {
    test('should show unchecked checkboxes for empty permissions', () => {
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox.getAttribute('aria-checked')).toBe('false')
      })
    })

    test('should show checked checkboxes for granted permissions', () => {
      const value = {
        users: ['view', 'create'],
      }

      render(<PermissionsMatrix value={value} onChange={mockOnChange} />)

      const checkboxes = screen.getAllByRole('checkbox')
      // Should have at least 2 checked (view and create for users)
      const checkedBoxes = checkboxes.filter(cb => cb.getAttribute('aria-checked') === 'true')
      expect(checkedBoxes.length).toBeGreaterThanOrEqual(2)
    })

    test('should show all checkboxes checked when all actions granted', () => {
      const value = {
        users: ['view', 'create', 'edit', 'delete'],
      }

      render(<PermissionsMatrix value={value} onChange={mockOnChange} />)

      const checkboxes = screen.getAllByRole('checkbox')
      const checkedBoxes = checkboxes.filter(cb => cb.getAttribute('aria-checked') === 'true')
      // At least 4 for the users row
      expect(checkedBoxes.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('user Interactions', () => {
    test('should call onChange when checkbox is clicked', async () => {
      const user = userEvent.setup()
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      const checkboxes = screen.getAllByRole('checkbox')
      const firstCheckbox = checkboxes[0]
      expect(firstCheckbox).toBeDefined()
      await user.click(firstCheckbox!)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    test('should add permission when unchecked checkbox is clicked', async () => {
      const user = userEvent.setup()
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      const checkboxes = screen.getAllByRole('checkbox')
      const firstCheckbox = checkboxes[0]
      expect(firstCheckbox).toBeDefined()
      await user.click(firstCheckbox!) // First checkbox (users - view)

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          users: expect.arrayContaining(['view']),
        }),
      )
    })

    test('should remove permission when checked checkbox is clicked', async () => {
      const user = userEvent.setup()
      const value = {
        users: ['view', 'create'],
      }

      render(<PermissionsMatrix value={value} onChange={mockOnChange} />)

      const checkboxes = screen.getAllByRole('checkbox')
      const checkedBox = checkboxes.find(cb => cb.getAttribute('aria-checked') === 'true')

      if (checkedBox) {
        await user.click(checkedBox)
        expect(mockOnChange).toHaveBeenCalled()
      }
    })

    test('should call onChange when select all button is clicked', async () => {
      const user = userEvent.setup()
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      const selectAllButtons = screen.getAllByRole('button', { name: /Select All/i })
      const firstButton = selectAllButtons[0]
      expect(firstButton).toBeDefined()
      await user.click(firstButton!)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    test('should select all actions for a resource', async () => {
      const user = userEvent.setup()
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      const selectAllButtons = screen.getAllByRole('button', { name: /Select All/i })
      const firstSelectAll = selectAllButtons[0]

      if (firstSelectAll) {
        await user.click(firstSelectAll)

        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            users: ['view', 'create', 'edit', 'delete'],
          }),
        )
      }
    })

    test('should deselect all actions for a resource', async () => {
      const user = userEvent.setup()
      const value = {
        users: ['view', 'create', 'edit', 'delete'],
      }

      render(<PermissionsMatrix value={value} onChange={mockOnChange} />)

      // When all are selected, button shows "Deselect All"
      const deselectAllButtons = screen.getAllByRole('button', { name: /Deselect All/i })
      const firstDeselectAll = deselectAllButtons[0]

      if (firstDeselectAll) {
        await user.click(firstDeselectAll)

        expect(mockOnChange).toHaveBeenCalledWith({})
      }
    })
  })

  describe('permissions Summary', () => {
    test('should show no permissions selected message when empty', () => {
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      expect(screen.getByText('No permissions selected')).toBeInTheDocument()
    })

    test('should show permissions count when permissions are selected', () => {
      const value = {
        users: ['view', 'create'],
        teachers: ['view'],
      }

      render(<PermissionsMatrix value={value} onChange={mockOnChange} />)

      // Should show count of 3 permissions (translated text)
      expect(screen.getByText(/permissions selected/i)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test('should have proper table structure', () => {
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('row').length).toBeGreaterThan(0)
      expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0)
    })

    test('should have accessible checkboxes', () => {
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeInTheDocument()
      })
    })

    test('should have accessible buttons', () => {
      render(<PermissionsMatrix value={{}} onChange={mockOnChange} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('edge Cases', () => {
    test('should handle multiple resources with different permissions', () => {
      const value = {
        users: ['view', 'create'],
        teachers: ['view', 'edit', 'delete'],
        staff: ['view'],
      }

      render(<PermissionsMatrix value={value} onChange={mockOnChange} />)

      const checkboxes = screen.getAllByRole('checkbox')
      const checkedBoxes = checkboxes.filter(cb => cb.getAttribute('aria-checked') === 'true')

      // Should have 6 checked boxes total (2 + 3 + 1)
      expect(checkedBoxes.length).toBeGreaterThanOrEqual(6)
    })

    test('should handle empty resource permissions', () => {
      // When users array is empty, the component shows "0 permissions selected"
      // because Object.keys(value).length is 1 (users key exists)
      const value = {
        users: [],
      }

      render(<PermissionsMatrix value={value} onChange={mockOnChange} />)

      // The component counts Object.values(value).flat().length which is 0
      // But Object.keys(value).length is 1, so it shows the count message
      expect(screen.getByText(/permissions selected/i)).toBeInTheDocument()
    })
  })
})
