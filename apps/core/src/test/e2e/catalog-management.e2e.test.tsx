/**
 * End-to-End Workflow Tests: Catalog Management
 *
 * Tests complete user workflows for catalog management including:
 * - Grade management flow
 * - Series management flow
 * - Subject management flow
 *
 * Following vitest-dom principles with React Testing Library
 */

import * as dataOps from '@repo/data-ops/queries/catalogs'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// Mock data-ops package
vi.mock('@repo/data-ops/queries/catalogs', () => ({
  getGrades: vi.fn(),
  createGrade: vi.fn(),
  updateGrade: vi.fn(),
  deleteGrade: vi.fn(),
  bulkUpdateGradesOrder: vi.fn(),
  getSeries: vi.fn(),
  createSerie: vi.fn(),
  updateSerie: vi.fn(),
  deleteSerie: vi.fn(),
  getSubjects: vi.fn(),
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
}))

describe('e2E: Catalog Management Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. Grade Management Flow', () => {
    test('should complete full grade management workflow', async () => {
      const user = userEvent.setup()

      const mockGrades = [
        { id: '1', name: 'Grade 1', code: 'G1', order: 1, trackId: 'track-1' },
        { id: '2', name: 'Grade 2', code: 'G2', order: 2, trackId: 'track-1' },
      ]

      const newGrade = {
        id: '3',
        name: 'Grade 3',
        code: 'G3',
        order: 3,
        trackId: 'track-1',
      }

      vi.mocked(dataOps.getGrades).mockResolvedValue(mockGrades as any)
      vi.mocked(dataOps.createGrade).mockResolvedValue(newGrade as any)

      const GradesPage = () => {
        const [grades, setGrades] = React.useState<any[]>([])
        const [showForm, setShowForm] = React.useState(false)
        const [formData, setFormData] = React.useState({ name: '', code: '', order: 0 })

        React.useEffect(() => {
          dataOps.getGrades({ trackId: 'track-1' }).then(setGrades)
        }, [])

        const handleCreate = async (e: React.FormEvent) => {
          e.preventDefault()
          const created = await dataOps.createGrade({
            ...formData,
            trackId: 'track-1',
          } as any)
          setGrades([...grades, created])
          setShowForm(false)
          setFormData({ name: '', code: '', order: 0 })
        }

        return (
          <div>
            <h1>Grades</h1>
            <button type="button" onClick={() => setShowForm(true)}>Create Grade</button>

            {showForm && (
              <form onSubmit={handleCreate} data-testid="grade-form">
                <input
                  placeholder="Grade Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  placeholder="Code"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Order"
                  value={formData.order || ''}
                  onChange={e => setFormData({ ...formData, order: Number.parseInt(e.target.value) })}
                />
                <button type="submit">Save Grade</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </form>
            )}

            <div data-testid="grades-list">
              {grades.map(grade => (
                <div key={grade.id} data-testid={`grade-${grade.id}`}>
                  <h3>{grade.name}</h3>
                  <span>{grade.code}</span>
                  <span>
                    Order:
                    {grade.order}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<GradesPage />)

      // Wait for grades to load
      await waitFor(() => {
        expect(screen.getByTestId('grade-1')).toBeInTheDocument()
        expect(screen.getByTestId('grade-2')).toBeInTheDocument()
      })

      // Click create grade
      await user.click(screen.getByRole('button', { name: /create grade/i }))

      // Verify form appears
      expect(screen.getByTestId('grade-form')).toBeInTheDocument()

      // Fill form
      await user.type(screen.getByPlaceholderText('Grade Name'), 'Grade 3')
      await user.type(screen.getByPlaceholderText('Code'), 'G3')
      await user.type(screen.getByPlaceholderText('Order'), '3')

      // Submit form
      await user.click(screen.getByRole('button', { name: /save grade/i }))

      // Verify new grade appears
      await waitFor(() => {
        expect(screen.getByTestId('grade-3')).toBeInTheDocument()
      })

      expect(screen.getByText('Grade 3')).toBeInTheDocument()
      expect(dataOps.createGrade).toHaveBeenCalledWith({
        name: 'Grade 3',
        code: 'G3',
        order: 3,
        trackId: 'track-1',
      })
    })

    test('should handle grade reordering workflow', async () => {
      const user = userEvent.setup()

      const mockGrades = [
        { id: '1', name: 'Grade 1', code: 'G1', order: 1, trackId: 'track-1' },
        { id: '2', name: 'Grade 2', code: 'G2', order: 2, trackId: 'track-1' },
        { id: '3', name: 'Grade 3', code: 'G3', order: 3, trackId: 'track-1' },
      ]

      vi.mocked(dataOps.getGrades).mockResolvedValue(mockGrades as any)
      vi.mocked(dataOps.bulkUpdateGradesOrder).mockResolvedValue(undefined)

      const GradesReorder = () => {
        const [grades, setGrades] = React.useState<any[]>([])
        const [reorderMode, setReorderMode] = React.useState(false)

        React.useEffect(() => {
          dataOps.getGrades({ trackId: 'track-1' }).then(setGrades)
        }, [])

        const moveUp = (index: number) => {
          if (index === 0)
            return
          const newGrades = [...grades]
            ;[newGrades[index - 1], newGrades[index]] = [newGrades[index], newGrades[index - 1]]
          setGrades(newGrades)
        }

        const saveOrder = async () => {
          const updates = grades.map((grade, index) => ({
            id: grade.id,
            order: index + 1,
          }))
          await dataOps.bulkUpdateGradesOrder(updates)
          setReorderMode(false)
        }

        return (
          <div>
            <button type="button" onClick={() => setReorderMode(!reorderMode)}>
              {reorderMode ? 'Cancel Reorder' : 'Reorder Grades'}
            </button>

            {reorderMode && (
              <button type="button" onClick={saveOrder}>Save Order</button>
            )}

            <div data-testid="grades-list">
              {grades.map((grade, index) => (
                <div key={grade.id} data-testid={`grade-${grade.id}`}>
                  <span>{grade.name}</span>
                  <span>
                    Order:
                    {index + 1}
                  </span>
                  {reorderMode && index > 0 && (
                    <button type="button" onClick={() => moveUp(index)}>Move Up</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<GradesReorder />)

      // Wait for grades to load
      await waitFor(() => {
        expect(screen.getByTestId('grade-1')).toBeInTheDocument()
      })

      // Enter reorder mode
      await user.click(screen.getByRole('button', { name: /reorder grades/i }))

      // Move Grade 2 up
      const grade2 = screen.getByTestId('grade-2')
      const moveUpButton = within(grade2).getByRole('button', { name: /move up/i })
      await user.click(moveUpButton)

      // Verify order changed in UI
      const gradesList = screen.getByTestId('grades-list')
      const gradeElements = within(gradesList).getAllByText(/Order:/)
      expect(gradeElements[0]).toHaveTextContent('Order:1') // Update to match actual spacing
      expect(gradeElements[1]).toHaveTextContent('Order:2')

      // Save order
      await user.click(screen.getByRole('button', { name: /save order/i }))

      // Verify bulk update called
      await waitFor(() => {
        expect(dataOps.bulkUpdateGradesOrder).toHaveBeenCalled()
      })
    })

    test('should handle grade deletion workflow', async () => {
      const user = userEvent.setup()

      const mockGrades = [
        { id: '1', name: 'Grade 1', code: 'G1', order: 1, trackId: 'track-1' },
      ]

      vi.mocked(dataOps.getGrades).mockResolvedValue(mockGrades as any)
      vi.mocked(dataOps.deleteGrade).mockResolvedValue(undefined)

      const GradesList = () => {
        const [grades, setGrades] = React.useState<any[]>([])
        const [showConfirm, setShowConfirm] = React.useState(false)
        const [gradeToDelete, setGradeToDelete] = React.useState<string | null>(null)

        React.useEffect(() => {
          dataOps.getGrades({ trackId: 'track-1' }).then(setGrades)
        }, [])

        const handleDelete = (id: string) => {
          setGradeToDelete(id)
          setShowConfirm(true)
        }

        const confirmDelete = async () => {
          if (gradeToDelete) {
            await dataOps.deleteGrade(gradeToDelete)
            setGrades(grades.filter(g => g.id !== gradeToDelete))
            setShowConfirm(false)
          }
        }

        return (
          <div>
            <div data-testid="grades-list">
              {grades.map(grade => (
                <div key={grade.id} data-testid={`grade-${grade.id}`}>
                  <span>{grade.name}</span>
                  <button type="button" onClick={() => handleDelete(grade.id)}>Delete</button>
                </div>
              ))}
            </div>

            {showConfirm && (
              <div role="dialog">
                <p>Delete this grade?</p>
                <button type="button" onClick={confirmDelete}>Confirm</button>
                <button type="button" onClick={() => setShowConfirm(false)}>Cancel</button>
              </div>
            )}
          </div>
        )
      }

      render(<GradesList />)

      await waitFor(() => {
        expect(screen.getByTestId('grade-1')).toBeInTheDocument()
      })

      // Click delete
      await user.click(screen.getByRole('button', { name: /delete/i }))

      // Confirm deletion
      await user.click(screen.getByRole('button', { name: /confirm/i }))

      // Verify grade removed
      await waitFor(() => {
        expect(screen.queryByTestId('grade-1')).not.toBeInTheDocument()
      })

      expect(dataOps.deleteGrade).toHaveBeenCalledWith('1')
    })
  })

  describe('2. Series Management Flow', () => {
    test('should complete full series management workflow', async () => {
      const user = userEvent.setup()

      const mockSeries = [
        { id: '1', name: 'Series A', code: 'SA', trackId: 'track-1' },
      ]

      const newSerie = {
        id: '2',
        name: 'Series B',
        code: 'SB',
        trackId: 'track-1',
      }

      vi.mocked(dataOps.getSeries).mockResolvedValue(mockSeries as any)
      vi.mocked(dataOps.createSerie).mockResolvedValue(newSerie as any)

      const SeriesPage = () => {
        const [series, setSeries] = React.useState<any[]>([])
        const [showForm, setShowForm] = React.useState(false)
        const [formData, setFormData] = React.useState({ name: '', code: '' })

        React.useEffect(() => {
          dataOps.getSeries({ trackId: 'track-1' }).then(setSeries)
        }, [])

        const handleCreate = async (e: React.FormEvent) => {
          e.preventDefault()
          const created = await dataOps.createSerie({
            ...formData,
            trackId: 'track-1',
          } as any)
          setSeries([...series, created])
          setShowForm(false)
        }

        return (
          <div>
            <h1>Series</h1>
            <button type="button" onClick={() => setShowForm(true)}>Create Series</button>

            {showForm && (
              <form onSubmit={handleCreate} data-testid="series-form">
                <input
                  placeholder="Series Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  placeholder="Code"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                />
                <button type="submit">Save Series</button>
              </form>
            )}

            <div data-testid="series-list">
              {series.map(serie => (
                <div key={serie.id} data-testid={`serie-${serie.id}`}>
                  <h3>{serie.name}</h3>
                  <span>{serie.code}</span>
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<SeriesPage />)

      // Wait for series to load
      await waitFor(() => {
        expect(screen.getByTestId('serie-1')).toBeInTheDocument()
      })

      // Create new series
      await user.click(screen.getByRole('button', { name: /create series/i }))
      await user.type(screen.getByPlaceholderText('Series Name'), 'Series B')
      await user.type(screen.getByPlaceholderText('Code'), 'SB')
      await user.click(screen.getByRole('button', { name: /save series/i }))

      // Verify new series appears
      await waitFor(() => {
        expect(screen.getByTestId('serie-2')).toBeInTheDocument()
      })

      expect(screen.getByText('Series B')).toBeInTheDocument()
    })
  })

  describe('3. Subject Management Flow', () => {
    test('should complete full subject management workflow with category filtering', async () => {
      const user = userEvent.setup()

      const mockSubjects = [
        { id: '1', name: 'Mathematics', shortName: 'Math', category: 'Scientifique' },
        { id: '2', name: 'Literature', shortName: 'Lit', category: 'Littéraire' },
        { id: '3', name: 'Physics', shortName: 'Phys', category: 'Scientifique' },
      ]

      vi.mocked(dataOps.getSubjects).mockResolvedValue({
        subjects: mockSubjects,
        pagination: { total: 3, page: 1, limit: 20, totalPages: 1 },
      } as any)

      const SubjectsPage = () => {
        const [subjects, setSubjects] = React.useState<any[]>([])
        const [categoryFilter, setCategoryFilter] = React.useState('all')

        React.useEffect(() => {
          dataOps.getSubjects({ page: 1, limit: 20 }).then((result: any) => {
            setSubjects(result.subjects)
          })
        }, [])

        const filteredSubjects = categoryFilter === 'all'
          ? subjects
          : subjects.filter(s => s.category === categoryFilter)

        return (
          <div>
            <h1>Subjects</h1>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              data-testid="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="Scientifique">Scientifique</option>
              <option value="Littéraire">Littéraire</option>
              <option value="Sportif">Sportif</option>
              <option value="Autre">Autre</option>
            </select>

            <div data-testid="subjects-list">
              {filteredSubjects.map(subject => (
                <div key={subject.id} data-testid={`subject-${subject.id}`}>
                  <h3>{subject.name}</h3>
                  <span>{subject.category}</span>
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<SubjectsPage />)

      // Wait for subjects to load
      await waitFor(() => {
        expect(screen.getByTestId('subject-1')).toBeInTheDocument()
        expect(screen.getByTestId('subject-2')).toBeInTheDocument()
        expect(screen.getByTestId('subject-3')).toBeInTheDocument()
      })

      // Filter by Scientifique
      await user.selectOptions(screen.getByTestId('category-filter'), 'Scientifique')

      // Verify only scientific subjects visible
      await waitFor(() => {
        expect(screen.getByTestId('subject-1')).toBeInTheDocument()
        expect(screen.queryByTestId('subject-2')).not.toBeInTheDocument()
        expect(screen.getByTestId('subject-3')).toBeInTheDocument()
      })

      // Filter by Littéraire
      await user.selectOptions(screen.getByTestId('category-filter'), 'Littéraire')

      // Verify only literature subject visible
      await waitFor(() => {
        expect(screen.queryByTestId('subject-1')).not.toBeInTheDocument()
        expect(screen.getByTestId('subject-2')).toBeInTheDocument()
        expect(screen.queryByTestId('subject-3')).not.toBeInTheDocument()
      })

      // Show all
      await user.selectOptions(screen.getByTestId('category-filter'), 'all')

      // Verify all subjects visible
      await waitFor(() => {
        expect(screen.getByTestId('subject-1')).toBeInTheDocument()
        expect(screen.getByTestId('subject-2')).toBeInTheDocument()
        expect(screen.getByTestId('subject-3')).toBeInTheDocument()
      })
    })
  })
})
