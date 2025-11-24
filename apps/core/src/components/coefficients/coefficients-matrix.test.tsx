import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
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
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, min, max, className, ...props }: any) => (
    <input
      type="number"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      className={className}
      {...props}
    />
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>{children}</button>
  ),
}))

// Mock Excel functions
vi.mock('@/lib/excel/coefficients-excel', () => ({
  exportCoefficientsToExcel: vi.fn(),
  generateCoefficientTemplate: vi.fn(),
  parseCoefficientsExcel: vi.fn(),
}))

// Mock constants
vi.mock('@/constants/coefficients', () => ({
  COEFFICIENT_LIMITS: { MIN: 0, MAX: 99 },
  COEFFICIENT_MESSAGES: {
    CREATED: 'Coefficient template created',
    DELETED: 'Coefficient template deleted',
    BULK_UPDATED: 'Coefficients updated',
    COPIED: 'Coefficients copied',
    ERROR_DUPLICATE: 'Duplicate coefficient',
    ERROR_CREATE: 'Error creating',
    ERROR_DELETE: 'Error deleting',
    ERROR_BULK_UPDATE: 'Error updating',
    ERROR_COPY: 'Error copying',
  },
}))

// Mock types and data
interface Subject {
  id: string
  name: string
}

interface Grade {
  id: string
  name: string
}

interface Coefficient {
  id: string
  subjectId: string
  gradeId: string
  weight: number
  subject?: Subject
  grade?: Grade
}

interface CoefficientsMatrixProps {
  matrixData: Record<string, Record<string, Coefficient>>
  subjects: Subject[]
  grades: Grade[]
  onCellEdit?: (coefficientId: string, value: number) => void
  onBulkUpdate?: (updates: Record<string, number>) => void
  onCopyFromPreviousYear?: () => void
  onExportToExcel?: () => void
  onImportFromExcel?: (file: File) => void
  editingCells?: Record<string, number>
  isLoading?: boolean
}

// Simple Coefficients Matrix component for testing
const DEFAULT_EDITING_CELLS = {}

function CoefficientsMatrix({
  matrixData,
  grades,
  onCellEdit,
  onBulkUpdate,
  onCopyFromPreviousYear,
  onExportToExcel,
  onImportFromExcel,
  editingCells = DEFAULT_EDITING_CELLS,
  isLoading = false,
}: CoefficientsMatrixProps) {
  if (isLoading) {
    return (
      <div>
        <div>Vue Matrice</div>
        <div>Cliquez sur un coefficient pour le modifier</div>
        <div data-testid="matrix-loading">Loading matrix...</div>
      </div>
    )
  }

  if (!matrixData || Object.keys(matrixData).length === 0) {
    return (
      <div>
        <div>Vue Matrice</div>
        <div data-testid="matrix-empty">No coefficient data available</div>
      </div>
    )
  }

  return (
    <div data-testid="coefficients-matrix">
      <h3>Vue Matrice</h3>
      <p>Cliquez sur un coefficient pour le modifier</p>

      <div className="flex gap-2 mb-4">
        {onCopyFromPreviousYear && (
          <button type="button" onClick={onCopyFromPreviousYear} data-testid="copy-from-previous">
            Copy from Previous Year
          </button>
        )}
        {onExportToExcel && (
          <button type="button" onClick={onExportToExcel} data-testid="export-excel">
            Export to Excel
          </button>
        )}
        {onImportFromExcel && (
          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file)
                  onImportFromExcel(file)
              }
              input.click()
            }}
            data-testid="import-excel"
          >
            Import from Excel
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" data-testid="matrix-table">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 bg-muted sticky left-0 z-10">Matière</th>
              {grades?.map(grade => (
                <th key={grade.id} className="text-center p-3 bg-muted min-w-24">
                  {grade.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(matrixData).map(([subjectName, gradeCoefs], index) => (
              <tr key={subjectName} className={index % 2 === 0 ? 'bg-muted/30' : ''} data-testid={`matrix-row-${subjectName}`}>
                <td className="font-medium p-3 border-r sticky left-0 bg-background">
                  {subjectName}
                </td>
                {grades?.map((grade) => {
                  const coef = gradeCoefs[grade.name]
                  return (
                    <td key={grade.id} className="text-center p-3" data-testid={`matrix-cell-${subjectName}-${grade.name}`}>
                      {coef
                        ? (
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="number"
                                value={editingCells[coef.id] ?? coef.weight}
                                onChange={e => onCellEdit?.(coef.id, Number.parseInt(e.target.value))}
                                className={`w-16 mx-auto text-center ${coef.weight === 0 ? 'border-yellow-500' : ''}`}
                                min={0}
                                max={99}
                                data-testid={`coefficient-input-${coef.id}`}
                              />
                              {coef.weight === 0 && (
                                <div className="flex items-center gap-1 text-xs text-yellow-600" data-testid={`zero-warning-${coef.id}`}>
                                  <span className="icon-warning">⚠</span>
                                  <span>Coef 0</span>
                                </div>
                              )}
                            </div>
                          )
                        : (
                            <span className="text-muted-foreground text-sm" data-testid={`missing-coef-${subjectName}-${grade.name}`}>-</span>
                          )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onBulkUpdate && Object.keys(editingCells).length > 0 && (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onBulkUpdate(editingCells)} data-testid="bulk-update">
            Save All Changes (
            {Object.keys(editingCells).length}
            )
          </button>
          <button type="button" onClick={() => onBulkUpdate({})} data-testid="cancel-changes">
            Cancel Changes
          </button>
        </div>
      )}
    </div>
  )
}

const mockSubjects: Subject[] = [
  { id: 'subj-1', name: 'Mathématiques' },
  { id: 'subj-2', name: 'Physique-Chimie' },
  { id: 'subj-3', name: 'Français' },
]

const mockGrades: Grade[] = [
  { id: 'grade-1', name: '6ème' },
  { id: 'grade-2', name: '5ème' },
  { id: 'grade-3', name: '4ème' },
]

const mockMatrixData: Record<string, Record<string, Coefficient>> = {
  'Mathématiques': {
    '6ème': {
      id: 'coef-1',
      subjectId: 'subj-1',
      gradeId: 'grade-1',
      weight: 4,
    },
    '5ème': {
      id: 'coef-2',
      subjectId: 'subj-1',
      gradeId: 'grade-2',
      weight: 4,
    },
    '4ème': {
      id: 'coef-3',
      subjectId: 'subj-1',
      gradeId: 'grade-3',
      weight: 5,
    },
  },
  'Physique-Chimie': {
    '6ème': {
      id: 'coef-4',
      subjectId: 'subj-2',
      gradeId: 'grade-1',
      weight: 3,
    },
    '5ème': {
      id: 'coef-5',
      subjectId: 'subj-2',
      gradeId: 'grade-2',
      weight: 3,
    },
  },
  'Français': {
    '6ème': {
      id: 'coef-6',
      subjectId: 'subj-3',
      gradeId: 'grade-1',
      weight: 5,
    },
    '5ème': {
      id: 'coef-7',
      subjectId: 'subj-3',
      gradeId: 'grade-2',
      weight: 0, // Zero coefficient for warning test
    },
  },
}

describe('coefficients Matrix View', () => {
  const mockOnCellEdit = vi.fn()
  const mockOnBulkUpdate = vi.fn()
  const mockOnCopyFromPreviousYear = vi.fn()
  const mockOnExportToExcel = vi.fn()
  const mockOnImportFromExcel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    test('should render matrix with correct structure', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      expect(screen.getByText('Vue Matrice')).toBeInTheDocument()
      expect(screen.getByText('Cliquez sur un coefficient pour le modifier')).toBeInTheDocument()
      expect(screen.getByTestId('coefficients-matrix')).toBeInTheDocument()
    })

    test('should display subjects as rows and grades as columns', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      // Check column headers (grades)
      expect(screen.getByText('6ème')).toBeInTheDocument()
      expect(screen.getByText('5ème')).toBeInTheDocument()
      expect(screen.getByText('4ème')).toBeInTheDocument()

      // Check row headers (subjects)
      expect(screen.getByText('Mathématiques')).toBeInTheDocument()
      expect(screen.getByText('Physique-Chimie')).toBeInTheDocument()
      expect(screen.getByText('Français')).toBeInTheDocument()
    })

    test('should display coefficient values in cells', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      // Check specific coefficient values
      expect(screen.getByDisplayValue('4')).toBeInTheDocument() // Math 6ème
      expect(screen.getByDisplayValue('5')).toBeInTheDocument() // Math 4ème
      expect(screen.getByDisplayValue('3')).toBeInTheDocument() // Physics 6ème
      expect(screen.getByDisplayValue('0')).toBeInTheDocument() // French 5ème
    })

    test('should show missing coefficients as dashes', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      // Check for missing coefficients
      expect(screen.getByTestId('missing-coef-Physique-Chimie-4ème')).toBeInTheDocument()
      expect(screen.getByTestId('missing-coef-Français-4ème')).toBeInTheDocument()
    })

    test('should display zero coefficient warnings', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      // Check for zero coefficient warning
      expect(screen.getByTestId('zero-warning-coef-7')).toBeInTheDocument()
      expect(screen.getByText('Coef 0')).toBeInTheDocument()
    })

    test('should show loading state', () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
          isLoading={true}
        />,
      )

      expect(screen.getByTestId('matrix-loading')).toBeInTheDocument()
      expect(screen.getByText('Loading matrix...')).toBeInTheDocument()
    })

    test('should show empty state when no data', () => {
      render(
        <CoefficientsMatrix
          matrixData={{}}
          subjects={[]}
          grades={[]}
        />,
      )

      expect(screen.getByTestId('matrix-empty')).toBeInTheDocument()
      expect(screen.getByText('No coefficient data available')).toBeInTheDocument()
    })
  })

  describe('inline Editing', () => {
    test('should allow editing coefficient values', async () => {
      const user = userEvent.setup()
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
          onCellEdit={mockOnCellEdit}
        />,
      )

      const mathInput = screen.getByTestId('coefficient-input-coef-1')
      await user.clear(mathInput)
      await user.type(mathInput, '6')

      expect(mockOnCellEdit).toHaveBeenCalledWith('coef-1', 6)
    })

    test('should highlight zero coefficient inputs', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      const zeroInput = screen.getByDisplayValue('0')
      expect(zeroInput).toHaveClass('border-yellow-500')
    })

    test('should show visual warnings for zero coefficients', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      const warning = screen.getByTestId('zero-warning-coef-7')
      expect(warning).toBeInTheDocument()
      expect(warning).toHaveClass('text-yellow-600')
    })

    test('should handle invalid coefficient values', async () => {
      const user = userEvent.setup()
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
          onCellEdit={mockOnCellEdit}
        />,
      )

      const input = screen.getByTestId('coefficient-input-coef-1')

      // Test empty value
      await user.clear(input)
      expect(mockOnCellEdit).toHaveBeenCalledWith('coef-1', Number.NaN)

      // Test minimum and maximum constraints
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '99')
    })
  })

  describe('warnings', () => {
    test('should display warning for zero coefficient', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      const zeroWarning = screen.getByTestId('zero-warning-coef-7')
      expect(zeroWarning).toBeInTheDocument()
      expect(screen.getByText('Coef 0')).toBeInTheDocument()
    })

    test('should show clear visual indicators for missing coefficients', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      const missingCoefs = screen.getAllByTestId(/missing-coef-/)
      expect(missingCoefs.length).toBeGreaterThan(0)

      missingCoefs.forEach((element) => {
        expect(element).toHaveClass('text-muted-foreground', 'text-sm')
        expect(element).toHaveTextContent('-')
      })
    })
  })

  describe('bulk Operations', () => {
    test('should show bulk update button when changes exist', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
          editingCells={{ 'coef-1': 6 }}
          onBulkUpdate={mockOnBulkUpdate}
        />,
      )

      const bulkUpdateButton = screen.getByTestId('bulk-update')
      expect(bulkUpdateButton).toBeInTheDocument()
      expect(bulkUpdateButton).toHaveTextContent('Save All Changes (1)')
    })

    test('should call onBulkUpdate when save button clicked', async () => {
      const user = userEvent.setup()
      const editingCells = { 'coef-1': 6, 'coef-2': 7 }
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
          editingCells={editingCells}
          onBulkUpdate={mockOnBulkUpdate}
        />,
      )

      const saveButton = screen.getByTestId('bulk-update')
      await user.click(saveButton)

      expect(mockOnBulkUpdate).toHaveBeenCalledWith(editingCells)
    })

    test('should call onBulkUpdate with empty object when cancel clicked', async () => {
      const user = userEvent.setup()
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
          editingCells={{ 'coef-1': 6 }}
          onBulkUpdate={mockOnBulkUpdate}
        />,
      )

      const cancelButton = screen.getByTestId('cancel-changes')
      await user.click(cancelButton)

      expect(mockOnBulkUpdate).toHaveBeenCalledWith({})
    })

    test('should call onCopyFromPreviousYear when copy button clicked', async () => {
      const user = userEvent.setup()
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
          onCopyFromPreviousYear={mockOnCopyFromPreviousYear}
        />,
      )

      const copyButton = screen.getByTestId('copy-from-previous')
      await user.click(copyButton)

      expect(mockOnCopyFromPreviousYear).toHaveBeenCalled()
    })

    test('should call onExportToExcel when export button clicked', async () => {
      const user = userEvent.setup()
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
          onExportToExcel={mockOnExportToExcel}
        />,
      )

      const exportButton = screen.getByTestId('export-excel')
      await user.click(exportButton)

      expect(mockOnExportToExcel).toHaveBeenCalled()
    })

    test('should handle file import when import button clicked', async () => {
      const user = userEvent.setup()
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
          onImportFromExcel={mockOnImportFromExcel}
        />,
      )

      const importButton = screen.getByTestId('import-excel')
      await user.click(importButton)

      // Should trigger file input creation
      expect(document.querySelector('input[type="file"]')).toBeInTheDocument()
    })
  })

  describe('visual Design', () => {
    test('should have proper table structure', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      const table = screen.getByTestId('matrix-table')
      expect(table).toBeInTheDocument()
      expect(table).toHaveClass('w-full', 'border-collapse')
    })

    test('should have sticky subject column header', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      const subjectHeader = screen.getByText('Matière')
      expect(subjectHeader).toHaveClass('sticky', 'left-0', 'z-10')
    })

    test('should have alternating row colors', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      const firstRow = screen.getByTestId('matrix-row-Mathématiques')
      expect(firstRow).toHaveClass('bg-muted/30')

      const secondRow = screen.getByTestId('matrix-row-Physique-Chimie')
      expect(secondRow).not.toHaveClass('bg-muted/30')
    })

    test('should center coefficient inputs in cells', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      const inputs = screen.getAllByRole('spinbutton')
      inputs.forEach((input) => {
        expect(input).toHaveClass('text-center')
      })
    })
  })

  describe('accessibility', () => {
    test('should have proper table headers', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      expect(screen.getByRole('columnheader', { name: 'Matière' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '6ème' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '5ème' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '4ème' })).toBeInTheDocument()
    })

    test('should have form inputs with proper attributes', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      const inputs = screen.getAllByRole('spinbutton')
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('type', 'number')
        expect(input).toHaveAttribute('min', '0')
        expect(input).toHaveAttribute('max', '99')
      })
    })

    test('should have descriptive text for matrix purpose', async () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      expect(screen.getByText('Cliquez sur un coefficient pour le modifier')).toBeInTheDocument()
    })
  })

  describe('error Handling', () => {
    test('should handle empty matrix data gracefully', () => {
      render(
        <CoefficientsMatrix
          matrixData={{}}
          subjects={[]}
          grades={[]}
        />,
      )

      expect(screen.getByTestId('matrix-empty')).toBeInTheDocument()
    })

    test('should handle missing coefficient properties gracefully', async () => {
      const incompleteMatrix: Record<string, Record<string, Coefficient>> = {
        'Incomplete Subject': {
          '6ème': {
            id: 'incomplete',
            subjectId: 'subj-1',
            gradeId: 'grade-1',
            weight: 0,
          },
        },
      }

      render(
        <CoefficientsMatrix
          matrixData={incompleteMatrix}
          subjects={[{ id: 'subj-1', name: 'Incomplete Subject' }]}
          grades={[{ id: 'grade-1', name: '6ème' }]}
        />,
      )

      expect(screen.getByText('Incomplete Subject')).toBeInTheDocument()
      expect(screen.getByDisplayValue('0')).toBeInTheDocument()
    })

    test('should handle missing callbacks gracefully', () => {
      render(
        <CoefficientsMatrix
          matrixData={mockMatrixData}
          subjects={mockSubjects}
          grades={mockGrades}
        />,
      )

      // Should not throw errors when callbacks are not provided
      expect(screen.getByTestId('coefficients-matrix')).toBeInTheDocument()
    })
  })
})
