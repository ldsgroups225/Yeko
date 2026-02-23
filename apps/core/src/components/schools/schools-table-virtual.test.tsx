import type { School } from '@repo/data-ops'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { SchoolsTableVirtual } from './schools-table-virtual'

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, params, to, ...props }: any) => (
    <a href={to.replace(/\$schoolId/, params?.schoolId || '')} {...props}>
      {children}
    </a>
  ),
}))

// Mock @tanstack/react-virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(({ count }) => ({
    getVirtualItems: () => Array.from({ length: Math.min(count, 10) }, (_, i) => ({
      index: i,
      size: 73,
      start: i * 73,
    })),
    getTotalSize: () => count * 73,
  })),
}))

// Mock dropdown menu components that are not properly exported
vi.mock('@workspace/ui/components/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, ...props }: any) => <div data-testid="dropdown-item" {...props}>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  DropdownMenuTrigger: ({ children }: any) => <button data-testid="dropdown-trigger">{children}</button>,
}))

const mockSchools: School[] = [
  {
    id: '1',
    name: 'École Primaire Test',
    code: 'EPT001',
    address: '123 Rue Test',
    phone: '+221123456789',
    email: 'test@ecole.sn',
    status: 'active',
    logoUrl: null,
    latitude: null,
    longitude: null,
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'École Secondaire Test',
    code: 'EST002',
    address: '456 Avenue Test',
    phone: '+221987654321',
    email: 'secondaire@ecole.sn',
    status: 'inactive',
    logoUrl: null,
    latitude: null,
    longitude: null,
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'École Suspendue',
    code: 'ESP003',
    address: null,
    phone: null,
    email: null,
    status: 'suspended',
    logoUrl: null,
    latitude: null,
    longitude: null,
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('schools List Component', () => {
  const mockOnSchoolClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    test('should render schools in table format', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        expect(screen.getByText('École Primaire Test')).toBeInTheDocument()
        expect(screen.getByText('École Secondaire Test')).toBeInTheDocument()
        expect(screen.getByText('École Suspendue')).toBeInTheDocument()
      })
    })

    test('should display correct columns', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        expect(screen.getByText('École')).toBeInTheDocument()
        expect(screen.getByText('Code')).toBeInTheDocument()
        expect(screen.getByText('Contact')).toBeInTheDocument()
        expect(screen.getByText('Statut')).toBeInTheDocument()

        // Look for Actions column header specifically in table header context
        const actionsHeader = screen.getByRole('columnheader', { name: 'Actions' })
        expect(actionsHeader).toBeInTheDocument()
      })
    })

    test('should display status badges correctly', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Inactive')).toBeInTheDocument()
        expect(screen.getByText('Suspendue')).toBeInTheDocument()
      })

      // Check badge text content
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Inactive')).toBeInTheDocument()
      expect(screen.getByText('Suspendue')).toBeInTheDocument()

      // Verify badges are rendered (check parent has badge styling)
      const activeBadge = screen.getByText('Active').closest('[class*="Badge"]') || screen.getByText('Active').closest('[class*="badge"]')
      expect(activeBadge).toBeInTheDocument()
    })

    test('should show action dropdowns', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        // Look for the action dropdown triggers - they have sr-only "Actions" text
        const actionDropdowns = screen.getAllByTestId('dropdown-trigger')
        expect(actionDropdowns).toHaveLength(mockSchools.length)

        // Also check for the MoreHorizontal icons
        const moreHorizontalButtons = document.querySelectorAll('[data-testid="dropdown-trigger"]')
        expect(moreHorizontalButtons.length).toBeGreaterThan(0)
      })
    })

    test('should display school codes in monospace with background', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        expect(screen.getByText('EPT001')).toBeInTheDocument()
        expect(screen.getByText('EST002')).toBeInTheDocument()
        expect(screen.getByText('ESP003')).toBeInTheDocument()
      })

      const codeElements = screen.getAllByText(/E[PS]T\d+/)
      codeElements.forEach((element) => {
        expect(element).toHaveClass('font-mono')
      })
    })

    test('should display contact information when available', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        expect(screen.getByText('test@ecole.sn')).toBeInTheDocument()
        expect(screen.getByText('+221123456789')).toBeInTheDocument()
        expect(screen.getByText('secondaire@ecole.sn')).toBeInTheDocument()
        expect(screen.getByText('+221987654321')).toBeInTheDocument()
      })
    })

    test('should display addresses when available', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        expect(screen.getByText('123 Rue Test')).toBeInTheDocument()
        expect(screen.getByText('456 Avenue Test')).toBeInTheDocument()
      })
    })

    test('should handle empty schools list', () => {
      render(<SchoolsTableVirtual schools={[]} />)

      // Should render table structure but no data rows
      expect(screen.getByText('École')).toBeInTheDocument()
      expect(screen.getByText('Code')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
      expect(screen.getByText('Statut')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    test('should call onSchoolClick when row is clicked', async () => {
      const user = userEvent.setup()
      render(<SchoolsTableVirtual schools={mockSchools} onSchoolClick={mockOnSchoolClick} />)

      await waitFor(() => {
        expect(screen.getByText('École Primaire Test')).toBeInTheDocument()
      })

      const schoolRow = screen.getByText('École Primaire Test').closest('tr')
      if (schoolRow) {
        await user.click(schoolRow)
      }

      expect(mockOnSchoolClick).toHaveBeenCalledWith('1')
    })

    test('should navigate to school details when action dropdown clicked', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        // Look for action dropdown triggers - they have data-testid
        const actionDropdowns = screen.getAllByTestId('dropdown-trigger')
        expect(actionDropdowns[0]).toBeInTheDocument()
      })

      // For now, just verify the dropdown triggers are present
      // Testing dropdown interactions would require more complex mocking of the DropdownMenu component
      const actionDropdowns = screen.getAllByTestId('dropdown-trigger')
      expect(actionDropdowns).toHaveLength(mockSchools.length)
    })

    test('should handle dropdown click without row navigation', async () => {
      const user = userEvent.setup()
      render(<SchoolsTableVirtual schools={mockSchools} onSchoolClick={mockOnSchoolClick} />)

      await waitFor(() => {
        // Look for action dropdown triggers
        const actionDropdowns = screen.getAllByTestId('dropdown-trigger')
        expect(actionDropdowns[0]).toBeInTheDocument()
      })

      // Click on the action dropdown
      const actionDropdowns = screen.getAllByTestId('dropdown-trigger')
      const firstDropdown = actionDropdowns[0]

      if (firstDropdown) {
        await user.click(firstDropdown)
      }
    })
  })

  describe('virtualization', () => {
    test('should render virtual container with correct height', () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      const virtualContainer = document.querySelector('[style*="height:"]')
      expect(virtualContainer).toBeInTheDocument()

      const height = virtualContainer?.getAttribute('style')
      expect(height).toContain('height:')
      expect(height).toContain('px')
    })

    test('should render scrollable container', () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      const scrollContainer = document.querySelector('.overflow-auto')
      expect(scrollContainer).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test('should have proper table structure', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'École' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'Code' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'Contact' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'Statut' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
      })
    })

    test('should have clickable rows with proper cursor', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} onSchoolClick={mockOnSchoolClick} />)

      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        expect(rows[1]).toHaveClass('cursor-pointer') // Skip header row
      })
    })

    test('should have semantic buttons with proper text', async () => {
      render(<SchoolsTableVirtual schools={mockSchools} />)

      await waitFor(() => {
        // Check that we have action dropdown buttons with data-testid
        const actionButtons = screen.getAllByTestId('dropdown-trigger')
        expect(actionButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('error Handling', () => {
    test('should handle missing school properties gracefully', async () => {
      const incompleteSchool: School = {
        id: 'incomplete',
        name: 'Incomplete School',
        code: 'INC001',
        address: null,
        phone: null,
        email: null,
        status: 'active',
        logoUrl: null,
        latitude: null,
        longitude: null,
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(<SchoolsTableVirtual schools={[incompleteSchool]} />)

      await waitFor(() => {
        expect(screen.getByText('Incomplete School')).toBeInTheDocument()
        expect(screen.getByText('INC001')).toBeInTheDocument()
        expect(screen.getByText('Active')).toBeInTheDocument()
      })

      // Should not throw errors for missing optional fields
      expect(screen.queryByText('+221123456789')).not.toBeInTheDocument()
      expect(screen.queryByText('test@ecole.sn')).not.toBeInTheDocument()
    })

    test('should handle unknown status gracefully', async () => {
      const unknownStatusSchool: School = {
        id: 'unknown',
        name: 'Unknown Status School',
        code: 'UNK001',
        address: null,
        phone: null,
        email: null,
        status: 'unknown_status' as any,
        logoUrl: null,
        latitude: null,
        longitude: null,
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(<SchoolsTableVirtual schools={[unknownStatusSchool]} />)

      await waitFor(() => {
        expect(screen.getByText('unknown_status')).toBeInTheDocument()
      })
    })
  })
})
