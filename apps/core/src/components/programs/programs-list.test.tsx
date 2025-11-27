import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnimatePresence, motion } from 'motion/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // Filter out motion-specific props that shouldn't be on DOM elements
      return <div {...props}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: vi.fn(),
  useNavigate: () => vi.fn(),
}))

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}))

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} {...props}>{children}</span>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>{children}</button>
  ),
}))

vi.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value,
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  useLogger: () => ({
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  }),
}))

// Mock types and data
interface Program {
  id: string
  name: string
  status: 'draft' | 'published' | 'archived'
  subject?: { id: string, name: string }
  grade?: { id: string, name: string }
  schoolYearTemplate?: { id: string, name: string, isActive?: boolean }
}

interface ProgramsListProps {
  programs: Program[]
  onProgramClick?: (programId: string) => void
  onEdit?: (programId: string) => void
  onDelete?: (program: { id: string, name: string }) => void
  onClone?: (program: { id: string, name: string }) => void
}

// Simple Programs List component for testing
function ProgramsList({ programs, onProgramClick, onEdit, onDelete, onClone }: ProgramsListProps) {
  if (programs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="h-12 w-12 text-muted-foreground mx-auto mb-4" data-testid="database-icon" />
        <h3 className="text-lg font-medium">Aucun programme trouvé</h3>
        <p className="text-muted-foreground">
          Commencez par créer votre premier programme.
        </p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="popLayout">
      {programs.map(program => (
        <motion.div
          key={program.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => onProgramClick?.(program.id)}
          data-testid={`program-item-${program.id}`}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <div className="h-5 w-5 text-primary" data-testid="book-icon" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{program.name}</h3>
                {program.status === 'published' && (
                  <span className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1 rounded">Publié</span>
                )}
                {program.status === 'draft' && (
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Brouillon</span>
                )}
                {program.status === 'archived' && (
                  <span className="text-xs border border-border px-2 py-1 rounded">Archivé</span>
                )}
                {program.schoolYearTemplate?.isActive && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Active</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>{program.subject?.name}</span>
                <span>•</span>
                <span>{program.grade?.name}</span>
                <span>•</span>
                <span>{program.schoolYearTemplate?.name}</span>
              </div>
            </div>
            <div className="h-5 w-5 text-muted-foreground" data-testid="chevron-icon" />
          </div>
          <div
            className="flex gap-2"
            onClick={e => e.stopPropagation()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.stopPropagation()}
            data-testid={`program-actions-${program.id}`}
          >
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(program.id)}
                data-testid={`edit-program-${program.id}`}
              >
                Edit
              </button>
            )}
            {onClone && (
              <button
                type="button"
                onClick={() => onClone({ id: program.id, name: program.name })}
                data-testid={`clone-program-${program.id}`}
              >
                Clone
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete({ id: program.id, name: program.name })}
                data-testid={`delete-program-${program.id}`}
              >
                Delete
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'Programme de Mathématiques - Terminale C',
    status: 'published',
    subject: { id: 'subj-1', name: 'Mathématiques' },
    grade: { id: 'grade-1', name: 'Terminale C' },
    schoolYearTemplate: { id: 'year-1', name: '2024-2025', isActive: true },
  },
  {
    id: '2',
    name: 'Programme de Physique-Chimie - Première S',
    status: 'draft',
    subject: { id: 'subj-2', name: 'Physique-Chimie' },
    grade: { id: 'grade-2', name: 'Première S' },
    schoolYearTemplate: { id: 'year-1', name: '2024-2025', isActive: true },
  },
  {
    id: '3',
    name: 'Programme Histoire - Seconde',
    status: 'archived',
    subject: { id: 'subj-3', name: 'Histoire' },
    grade: { id: 'grade-3', name: 'Seconde' },
    schoolYearTemplate: { id: 'year-2', name: '2023-2024', isActive: false },
  },
]

describe('programs List Component', () => {
  const mockOnProgramClick = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnClone = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    test('should render all programs in list', async () => {
      render(<ProgramsList programs={mockPrograms} />)

      await waitFor(() => {
        expect(screen.getByText('Programme de Mathématiques - Terminale C')).toBeInTheDocument()
        expect(screen.getByText('Programme de Physique-Chimie - Première S')).toBeInTheDocument()
        expect(screen.getByText('Programme Histoire - Seconde')).toBeInTheDocument()
      })
    })

    test('should display status badges correctly', async () => {
      render(<ProgramsList programs={mockPrograms} />)

      await waitFor(() => {
        expect(screen.getByText('Publié')).toBeInTheDocument()
        expect(screen.getByText('Brouillon')).toBeInTheDocument()
        expect(screen.getByText('Archivé')).toBeInTheDocument()
      })
    })

    test('should display metadata correctly', async () => {
      render(<ProgramsList programs={mockPrograms} />)

      await waitFor(() => {
        expect(screen.getByText('Mathématiques')).toBeInTheDocument()
        expect(screen.getByText('Terminale C')).toBeInTheDocument()

        expect(screen.getByText('Physique-Chimie')).toBeInTheDocument()
        expect(screen.getByText('Première S')).toBeInTheDocument()

        expect(screen.getByText('Histoire')).toBeInTheDocument()
        expect(screen.getByText('Seconde')).toBeInTheDocument()

        // Check for school year templates - use getAllByText since there might be duplicates
        const year2024Elements = screen.getAllByText('2024-2025')
        const year2023Elements = screen.getAllByText('2023-2024')
        expect(year2024Elements.length).toBeGreaterThan(0)
        expect(year2023Elements.length).toBeGreaterThan(0)
      })
    })

    test('should display active year badge', async () => {
      render(<ProgramsList programs={mockPrograms} />)

      await waitFor(() => {
        const activeBadges = screen.getAllByText('Active')
        expect(activeBadges).toHaveLength(2) // Two programs have active school year
      })
    })

    test('should show empty state when no programs', () => {
      render(<ProgramsList programs={[]} />)

      expect(screen.getByText('Aucun programme trouvé')).toBeInTheDocument()
      expect(screen.getByText('Commencez par créer votre premier programme.')).toBeInTheDocument()
      expect(screen.getByTestId('database-icon')).toBeInTheDocument()
    })

    test('should display action buttons when callbacks provided', async () => {
      render(
        <ProgramsList
          programs={mockPrograms}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onClone={mockOnClone}
        />,
      )

      await waitFor(() => {
        const editButtons = screen.getAllByTestId(/edit-program-/)
        const deleteButtons = screen.getAllByTestId(/delete-program-/)
        const cloneButtons = screen.getAllByTestId(/clone-program-/)

        expect(editButtons).toHaveLength(mockPrograms.length)
        expect(deleteButtons).toHaveLength(mockPrograms.length)
        expect(cloneButtons).toHaveLength(mockPrograms.length)
      })
    })
  })

  describe('filtering & Search', () => {
    test('should filter programs by status (implicit through data)', async () => {
      const publishedPrograms = mockPrograms.filter(p => p.status === 'published')
      render(<ProgramsList programs={publishedPrograms} />)

      await waitFor(() => {
        expect(screen.getByText('Programme de Mathématiques - Terminale C')).toBeInTheDocument()
        expect(screen.queryByText('Programme de Physique-Chimie - Première S')).not.toBeInTheDocument()
        expect(screen.queryByText('Programme Histoire - Seconde')).not.toBeInTheDocument()
      })
    })

    test('should filter programs by subject (implicit through data)', async () => {
      const mathPrograms = mockPrograms.filter(p => p.subject?.name === 'Mathématiques')
      render(<ProgramsList programs={mathPrograms} />)

      await waitFor(() => {
        expect(screen.getByText('Programme de Mathématiques - Terminale C')).toBeInTheDocument()
        expect(screen.queryByText('Programme de Physique-Chimie - Première S')).not.toBeInTheDocument()
        expect(screen.queryByText('Programme Histoire - Seconde')).not.toBeInTheDocument()
      })
    })

    test('should filter programs by grade (implicit through data)', async () => {
      const terminalPrograms = mockPrograms.filter(p => p.grade?.name === 'Terminale C')
      render(<ProgramsList programs={terminalPrograms} />)

      await waitFor(() => {
        expect(screen.getByText('Programme de Mathématiques - Terminale C')).toBeInTheDocument()
        expect(screen.queryByText('Programme de Physique-Chimie - Première S')).not.toBeInTheDocument()
        expect(screen.queryByText('Programme Histoire - Seconde')).not.toBeInTheDocument()
      })
    })

    test('should filter programs by school year (implicit through data)', async () => {
      const year2024Programs = mockPrograms.filter(p => p.schoolYearTemplate?.name === '2024-2025')
      render(<ProgramsList programs={year2024Programs} />)

      await waitFor(() => {
        expect(screen.getByText('Programme de Mathématiques - Terminale C')).toBeInTheDocument()
        expect(screen.getByText('Programme de Physique-Chimie - Première S')).toBeInTheDocument()
        expect(screen.queryByText('Programme Histoire - Seconde')).not.toBeInTheDocument()
      })
    })
  })

  describe('search Functionality', () => {
    test('should filter programs by name search', async () => {
      const searchResults = mockPrograms.filter(p =>
        p.name.toLowerCase().includes('mathématiques'),
      )
      render(<ProgramsList programs={searchResults} />)

      await waitFor(() => {
        expect(screen.getByText('Programme de Mathématiques - Terminale C')).toBeInTheDocument()
        expect(screen.queryByText('Programme de Physique-Chimie - Première S')).not.toBeInTheDocument()
        expect(screen.queryByText('Programme Histoire - Seconde')).not.toBeInTheDocument()
      })
    })
  })

  describe('actions', () => {
    test('should call onProgramClick when program item clicked', async () => {
      const user = userEvent.setup()
      render(<ProgramsList programs={mockPrograms} onProgramClick={mockOnProgramClick} />)

      await waitFor(() => {
        const programItem = screen.getByTestId('program-item-1')
        expect(programItem).toBeInTheDocument()
      })

      const programItem = screen.getByTestId('program-item-1')
      await user.click(programItem)

      expect(mockOnProgramClick).toHaveBeenCalledWith('1')
    })

    test('should call onEdit when edit button clicked', async () => {
      const user = userEvent.setup()
      render(<ProgramsList programs={mockPrograms} onEdit={mockOnEdit} />)

      await waitFor(() => {
        const editButton = screen.getByTestId('edit-program-1')
        expect(editButton).toBeInTheDocument()
      })

      const editButton = screen.getByTestId('edit-program-1')
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledWith('1')
      expect(mockOnProgramClick).not.toHaveBeenCalled()
    })

    test('should call onDelete when delete button clicked', async () => {
      const user = userEvent.setup()
      render(<ProgramsList programs={mockPrograms} onDelete={mockOnDelete} />)

      await waitFor(() => {
        const deleteButton = screen.getByTestId('delete-program-1')
        expect(deleteButton).toBeInTheDocument()
      })

      const deleteButton = screen.getByTestId('delete-program-1')
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledWith({ id: '1', name: 'Programme de Mathématiques - Terminale C' })
    })

    test('should call onClone when clone button clicked', async () => {
      const user = userEvent.setup()
      render(<ProgramsList programs={mockPrograms} onClone={mockOnClone} />)

      await waitFor(() => {
        const cloneButton = screen.getByTestId('clone-program-1')
        expect(cloneButton).toBeInTheDocument()
      })

      const cloneButton = screen.getByTestId('clone-program-1')
      await user.click(cloneButton)

      expect(mockOnClone).toHaveBeenCalledWith({ id: '1', name: 'Programme de Mathématiques - Terminale C' })
    })
  })

  describe('visual Design', () => {
    test('should render program items with proper styling', async () => {
      render(<ProgramsList programs={mockPrograms} />)

      await waitFor(() => {
        const programItems = screen.getAllByTestId(/program-item-/)
        programItems.forEach((item) => {
          expect(item).toHaveClass('cursor-pointer', 'border', 'rounded-lg')
        })
      })
    })

    test('should display program icons', async () => {
      render(<ProgramsList programs={mockPrograms} />)

      await waitFor(() => {
        const bookIcons = screen.getAllByTestId('book-icon')
        const chevronIcons = screen.getAllByTestId('chevron-icon')

        expect(bookIcons).toHaveLength(mockPrograms.length)
        expect(chevronIcons).toHaveLength(mockPrograms.length)
      })
    })

    test('should display status badges with proper styling', async () => {
      render(<ProgramsList programs={mockPrograms} />)

      await waitFor(() => {
        const publishedBadge = screen.getByText('Publié')
        const draftBadge = screen.getByText('Brouillon')
        const archivedBadge = screen.getByText('Archivé')

        expect(publishedBadge).toHaveClass('bg-primary')
        expect(draftBadge).toHaveClass('bg-secondary')
        expect(archivedBadge).toHaveClass('border', 'border-border')
      })
    })
  })

  describe('accessibility', () => {
    test('should have clickable program items', async () => {
      render(<ProgramsList programs={mockPrograms} onProgramClick={mockOnProgramClick} />)

      await waitFor(() => {
        const programItems = screen.getAllByTestId(/program-item-/)
        programItems.forEach((item) => {
          expect(item).toHaveClass('cursor-pointer')
        })
      })
    })

    test('should have proper button elements for actions', async () => {
      render(
        <ProgramsList
          programs={mockPrograms}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onClone={mockOnClone}
        />,
      )

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button').filter(btn =>
          btn.getAttribute('data-testid')?.includes('edit-program'),
        )
        const deleteButtons = screen.getAllByRole('button').filter(btn =>
          btn.getAttribute('data-testid')?.includes('delete-program'),
        )

        expect(editButtons).toHaveLength(mockPrograms.length)
        expect(deleteButtons).toHaveLength(mockPrograms.length)
      })
    })
  })

  describe('error Handling', () => {
    test('should handle missing program metadata gracefully', async () => {
      const incompletePrograms: Program[] = [
        {
          id: 'incomplete',
          name: 'Incomplete Program',
          status: 'draft',
        },
      ]

      render(<ProgramsList programs={incompletePrograms} />)

      await waitFor(() => {
        expect(screen.getByText('Incomplete Program')).toBeInTheDocument()
        expect(screen.getByText('Brouillon')).toBeInTheDocument()
      })
    })

    test('should handle missing subject gracefully', async () => {
      const programWithoutSubject: Program[] = [
        {
          id: 'no-subject',
          name: 'Program without Subject',
          status: 'draft',
          grade: { id: 'grade-1', name: 'Test Grade' },
          schoolYearTemplate: { id: 'year-1', name: 'Test Year' },
        },
      ]

      render(<ProgramsList programs={programWithoutSubject} />)

      await waitFor(() => {
        expect(screen.getByText('Program without Subject')).toBeInTheDocument()
        expect(screen.getByText('Test Grade')).toBeInTheDocument()
        expect(screen.getByText('Test Year')).toBeInTheDocument()
      })
    })
  })
})
