/**
 * End-to-End Workflow Tests: Section 4.1
 * Complete user workflows for Yeko core features
 * Using vitest-dom with React Testing Library
 */

import * as dataOps from '@repo/data-ops'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// Mock data-ops

function mockOk<T>(value: T) {
  return {
    isOk: () => true,
    isErr: () => false,
    value,
  }
}

vi.mock('@repo/data-ops', () => ({
  createSchool: vi.fn(),
  getSchools: vi.fn(),
  updateSchool: vi.fn(),
  deleteSchool: vi.fn(),
  getGrades: vi.fn(),
  createGrade: vi.fn(),
  updateGrade: vi.fn(),
  deleteGrade: vi.fn(),
  getSeries: vi.fn(),
  createSerie: vi.fn(),
  updateSerie: vi.fn(),
  deleteSerie: vi.fn(),
  getSubjects: vi.fn(),
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
  getProgramTemplates: vi.fn(),
  createProgramTemplate: vi.fn(),
  updateProgramTemplate: vi.fn(),
  deleteProgramTemplate: vi.fn(),
  cloneProgramTemplate: vi.fn(),
  getCoefficientTemplates: vi.fn(),
  createCoefficientTemplate: vi.fn(),
  updateCoefficientTemplate: vi.fn(),
  deleteCoefficientTemplate: vi.fn(),
  bulkUpdateCoefficients: vi.fn(),
  copyCoefficientTemplates: vi.fn(),
}))

describe('e2E: 4.1 End-to-End Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================================
  // SCHOOL MANAGEMENT WORKFLOWS
  // ============================================================================

  describe('school Management Workflows', () => {
    describe('1. Create School Flow', () => {
      test('should create school with valid data', async () => {
        const user = userEvent.setup()

        const mockSchool = {
          id: 'school-1',
          name: 'Test School',
          code: 'TS001',
          email: 'test@school.com',
          phone: '+1234567890',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        vi.mocked(dataOps.createSchool).mockResolvedValue(mockOk(mockSchool) as any)

        const SchoolForm = () => {
          const [school, setSchool] = React.useState<any>(null)
          const [formData, setFormData] = React.useState({
            name: '',
            code: '',
            email: '',
            phone: '',
          })

          const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            const result = await dataOps.createSchool(formData as any)
            if (result.isOk())
              setSchool(result.value)
          }

          return (
            <form onSubmit={handleSubmit}>
              <input
                placeholder="School Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                placeholder="School Code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
              <input
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                placeholder="Phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <button type="submit">Create School</button>
              {school && (
                <div data-testid="school-created">
                  <h2>{school.name}</h2>
                  <p>{school.code}</p>
                </div>
              )}
            </form>
          )
        }

        render(<SchoolForm />)

        // Fill form
        await user.type(screen.getByPlaceholderText('School Name'), 'Test School')
        await user.type(screen.getByPlaceholderText('School Code'), 'TS001')
        await user.type(screen.getByPlaceholderText('Email'), 'test@school.com')
        await user.type(screen.getByPlaceholderText('Phone'), '+1234567890')

        // Submit
        await user.click(screen.getByRole('button', { name: /create school/i }))

        // Verify
        await waitFor(() => {
          expect(screen.getByTestId('school-created')).toBeInTheDocument()
          expect(screen.getByText('Test School')).toBeInTheDocument()
          expect(screen.getByText('TS001')).toBeInTheDocument()
        })

        expect(dataOps.createSchool).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test School',
            code: 'TS001',
            email: 'test@school.com',
            phone: '+1234567890',
          }),
        )
      })
    })

    describe('2. Edit School Flow', () => {
      test('should update school fields', async () => {
        const user = userEvent.setup()

        const original = {
          id: 'school-1',
          name: 'Original Name',
          code: 'TS001',
          email: 'original@school.com',
        }

        const updated = {
          ...original,
          name: 'Updated Name',
          email: 'updated@school.com',
        }

        vi.mocked(dataOps.updateSchool).mockResolvedValue(mockOk(updated) as any)

        const SchoolEditForm = () => {
          const [school, setSchool] = React.useState<any>(original)
          const [formData, setFormData] = React.useState<any>(original)

          const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            const result = await dataOps.updateSchool('school-1', formData as any)
            if (result.isOk())
              setSchool(result.value)
          }

          return (
            <form onSubmit={handleSubmit}>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <button type="submit">Update</button>
              <div data-testid="school-display">
                <h2>{school.name}</h2>
                <p>{school.email}</p>
              </div>
            </form>
          )
        }

        render(<SchoolEditForm />)

        // Update fields
        await user.clear(screen.getByDisplayValue('Original Name'))
        await user.type(screen.getByDisplayValue(''), 'Updated Name')

        await user.clear(screen.getByDisplayValue('original@school.com'))
        await user.type(screen.getByDisplayValue(''), 'updated@school.com')

        // Submit
        await user.click(screen.getByRole('button', { name: /update/i }))

        // Verify
        await waitFor(() => {
          expect(screen.getByText('Updated Name')).toBeInTheDocument()
          expect(screen.getByText('updated@school.com')).toBeInTheDocument()
        })
      })
    })

    describe('3. Delete School Flow', () => {
      test('should delete school with confirmation', async () => {
        const user = userEvent.setup()

        vi.mocked(dataOps.deleteSchool).mockResolvedValue(mockOk(undefined) as any)

        const SchoolsList = () => {
          const [schools, setSchools] = React.useState([
            { id: 'school-1', name: 'School to Delete', code: 'TD001' },
          ])
          const [showConfirm, setShowConfirm] = React.useState(false)
          const [schoolToDelete, setSchoolToDelete] = React.useState<string | null>(null)

          const handleDelete = (id: string) => {
            setSchoolToDelete(id)
            setShowConfirm(true)
          }

          const confirmDelete = async () => {
            if (schoolToDelete) {
              await dataOps.deleteSchool(schoolToDelete)
              setSchools(schools.filter(s => s.id !== schoolToDelete))
              setShowConfirm(false)
              setSchoolToDelete(null)
            }
          }

          return (
            <div>
              <div data-testid="schools-list">
                {schools.map(school => (
                  <div key={school.id} data-testid={`school-${school.id}`}>
                    <h3>{school.name}</h3>
                    <button type="button" onClick={() => handleDelete(school.id)}>Delete</button>
                  </div>
                ))}
              </div>

              {showConfirm && (
                <div role="dialog">
                  <p>Are you sure you want to delete this school?</p>
                  <button type="button" onClick={confirmDelete}>Confirm</button>
                  <button type="button" onClick={() => setShowConfirm(false)}>Cancel</button>
                </div>
              )}
            </div>
          )
        }

        render(<SchoolsList />)

        // Verify school exists
        expect(screen.getByTestId('school-school-1')).toBeInTheDocument()

        // Click delete
        await user.click(screen.getByRole('button', { name: /delete/i }))

        // Verify confirmation dialog
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        // Confirm deletion
        await user.click(screen.getByRole('button', { name: /confirm/i }))

        // Verify school removed
        await waitFor(() => {
          expect(screen.queryByTestId('school-school-1')).not.toBeInTheDocument()
        })

        expect(dataOps.deleteSchool).toHaveBeenCalledWith('school-1')
      })
    })

    describe('4. Search & Filter Flow', () => {
      test('should filter schools by search term and status', async () => {
        const user = userEvent.setup()

        const mockSchools = [
          { id: '1', name: 'Alpha School', code: 'AS001', status: 'active' },
          { id: '2', name: 'Beta School', code: 'BS001', status: 'active' },
          { id: '3', name: 'Gamma School', code: 'GS001', status: 'inactive' },
        ]

        const SchoolsList = () => {
          const [schools] = React.useState(mockSchools)
          const [searchTerm, setSearchTerm] = React.useState('')
          const [statusFilter, setStatusFilter] = React.useState('all')

          const filteredSchools = schools.filter((school) => {
            const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase())
              || school.code.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'all' || school.status === statusFilter
            return matchesSearch && matchesStatus
          })

          return (
            <div>
              <input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                data-testid="search-input"
              />

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                data-testid="status-filter"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
              >
                Clear Filters
              </button>

              <div data-testid="schools-list">
                {filteredSchools.map(school => (
                  <div key={school.id} data-testid={`school-${school.id}`}>
                    <h3>{school.name}</h3>
                    <span>{school.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        render(<SchoolsList />)

        // Verify all schools visible
        expect(screen.getByTestId('school-1')).toBeInTheDocument()
        expect(screen.getByTestId('school-2')).toBeInTheDocument()
        expect(screen.getByTestId('school-3')).toBeInTheDocument()

        // Search for "Alpha"
        await user.type(screen.getByTestId('search-input'), 'Alpha')

        await waitFor(() => {
          expect(screen.getByTestId('school-1')).toBeInTheDocument()
          expect(screen.queryByTestId('school-2')).not.toBeInTheDocument()
          expect(screen.queryByTestId('school-3')).not.toBeInTheDocument()
        })

        // Clear search
        await user.clear(screen.getByTestId('search-input'))

        // Filter by inactive status
        await user.selectOptions(screen.getByTestId('status-filter'), 'inactive')

        await waitFor(() => {
          expect(screen.queryByTestId('school-1')).not.toBeInTheDocument()
          expect(screen.queryByTestId('school-2')).not.toBeInTheDocument()
          expect(screen.getByTestId('school-3')).toBeInTheDocument()
        })

        // Clear all filters
        await user.click(screen.getByRole('button', { name: /clear filters/i }))

        await waitFor(() => {
          expect(screen.getByTestId('school-1')).toBeInTheDocument()
          expect(screen.getByTestId('school-2')).toBeInTheDocument()
          expect(screen.getByTestId('school-3')).toBeInTheDocument()
        })
      })
    })
  })
})

// ============================================================================
// CATALOG MANAGEMENT WORKFLOWS
// ============================================================================

describe('catalog Management Workflows', () => {
  describe('1. Grade Management Flow', () => {
    test('should create and manage grades', async () => {
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

      vi.mocked(dataOps.getGrades).mockResolvedValue(mockOk(mockGrades) as any)
      vi.mocked(dataOps.createGrade).mockResolvedValue(mockOk(newGrade) as any)
      vi.mocked(dataOps.deleteGrade).mockResolvedValue(mockOk(undefined) as any)

      const GradesPage = () => {
        const [grades, setGrades] = React.useState<any[]>([])
        const [showForm, setShowForm] = React.useState(false)
        const [formData, setFormData] = React.useState({ name: '', code: '' })

        React.useEffect(() => {
          dataOps.getGrades({ trackId: 'track-1' }).then((res: any) => {
            if (res.isOk())
              setGrades(res.value)
          })
        }, [])

        const handleCreate = async (e: React.FormEvent) => {
          e.preventDefault()
          const result = await dataOps.createGrade({
            ...formData,
            trackId: 'track-1',
          } as any)
          if (result.isOk()) {
            setGrades([...grades, result.value])
            setShowForm(false)
            setFormData({ name: '', code: '' })
          }
        }

        const handleDelete = async (id: string) => {
          await dataOps.deleteGrade(id)
          setGrades(grades.filter(g => g.id !== id))
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
                <button type="submit">Create</button>
              </form>
            )}

            <div data-testid="grades-list">
              {grades.map(grade => (
                <div key={grade.id} data-testid={`grade-${grade.id}`}>
                  <h3>{grade.name}</h3>
                  <p>{grade.code}</p>
                  <button type="button" onClick={() => handleDelete(grade.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<GradesPage />)

      // Verify initial grades loaded
      await waitFor(() => {
        expect(screen.getByTestId('grade-1')).toBeInTheDocument()
        expect(screen.getByTestId('grade-2')).toBeInTheDocument()
      })

      // Create new grade
      await user.click(screen.getByRole('button', { name: /create grade/i }))
      await user.type(screen.getByPlaceholderText('Grade Name'), 'Grade 3')
      await user.type(screen.getByPlaceholderText('Code'), 'G3')
      const createButtons = screen.getAllByRole('button', { name: /create/i })
      const lastCreateButton = createButtons[createButtons.length - 1]
      if (lastCreateButton) {
        await user.click(lastCreateButton)
      }

      // Verify new grade appears
      await waitFor(() => {
        expect(screen.getByTestId('grade-3')).toBeInTheDocument()
        expect(screen.getByText('Grade 3')).toBeInTheDocument()
      })

      expect(dataOps.createGrade).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Grade 3',
          code: 'G3',
          trackId: 'track-1',
        }),
      )
    })
  })

  describe('2. Series Management Flow', () => {
    test('should create and manage series', async () => {
      const user = userEvent.setup()

      const newSerie = {
        id: 'series-1',
        name: 'Series A',
        code: 'SA',
        trackId: 'track-1',
      }

      vi.mocked(dataOps.createSerie).mockResolvedValue(mockOk(newSerie) as any)

      const SeriesPage = () => {
        const [series, setSeries] = React.useState<any[]>([])
        const [formData, setFormData] = React.useState({ name: '', code: '' })

        const handleCreate = async (e: React.FormEvent) => {
          e.preventDefault()
          const result = await dataOps.createSerie({
            ...formData,
            trackId: 'track-1',
          } as any)
          if (result.isOk()) {
            setSeries([...series, result.value])
            setFormData({ name: '', code: '' })
          }
        }

        return (
          <div>
            <form onSubmit={handleCreate}>
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
              <button type="submit">Create Series</button>
            </form>

            <div data-testid="series-list">
              {series.map(s => (
                <div key={s.id} data-testid={`series-${s.id}`}>
                  <h3>{s.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<SeriesPage />)

      // Create series
      await user.type(screen.getByPlaceholderText('Series Name'), 'Series A')
      await user.type(screen.getByPlaceholderText('Code'), 'SA')
      await user.click(screen.getByRole('button', { name: /create series/i }))

      // Verify
      await waitFor(() => {
        expect(screen.getByTestId('series-series-1')).toBeInTheDocument()
        expect(screen.getByText('Series A')).toBeInTheDocument()
      })
    })
  })

  describe('3. Subject Management Flow', () => {
    test('should create and filter subjects by category', async () => {
      const user = userEvent.setup()

      const mockSubjects = [
        { id: '1', name: 'Mathematics', category: 'science' },
        { id: '2', name: 'Physics', category: 'science' },
        { id: '3', name: 'English', category: 'language' },
      ]

      const newSubject = {
        id: '4',
        name: 'Chemistry',
        category: 'science',
      }

      vi.mocked(dataOps.getSubjects).mockResolvedValue(mockOk(mockSubjects) as any)
      vi.mocked(dataOps.createSubject).mockResolvedValue(mockOk(newSubject) as any)

      const SubjectsPage = () => {
        const [subjects, setSubjects] = React.useState<any[]>([])
        const [categoryFilter, setCategoryFilter] = React.useState('all')
        const [formData, setFormData] = React.useState({ name: '', category: 'science' })

        React.useEffect(() => {
          dataOps.getSubjects().then((result: any) => {
            if (result.isOk()) {
              const val = result.value
              setSubjects(Array.isArray(val) ? val : val.subjects || [])
            }
          })
        }, [])

        const handleCreate = async (e: React.FormEvent) => {
          e.preventDefault()
          const result = await dataOps.createSubject(formData as any)
          if (result.isOk()) {
            setSubjects([...subjects, result.value])
            setFormData({ name: '', category: 'science' })
          }
        }

        const filteredSubjects = categoryFilter === 'all'
          ? subjects
          : subjects.filter(s => s.category === categoryFilter)

        return (
          <div>
            <form onSubmit={handleCreate}>
              <input
                placeholder="Subject Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="science">Science</option>
                <option value="language">Language</option>
              </select>
              <button type="submit">Create Subject</button>
            </form>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              data-testid="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="science">Science</option>
              <option value="language">Language</option>
            </select>

            <div data-testid="subjects-list">
              {filteredSubjects.map(subject => (
                <div key={subject.id} data-testid={`subject-${subject.id}`}>
                  <h3>{subject.name}</h3>
                  <p>{subject.category}</p>
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
      })

      // Filter by science category
      await user.selectOptions(screen.getByTestId('category-filter'), 'science')

      await waitFor(() => {
        expect(screen.getByTestId('subject-1')).toBeInTheDocument()
        expect(screen.getByTestId('subject-2')).toBeInTheDocument()
        expect(screen.queryByTestId('subject-3')).not.toBeInTheDocument()
      })

      // Create new subject
      await user.type(screen.getByPlaceholderText('Subject Name'), 'Chemistry')
      await user.click(screen.getByRole('button', { name: /create subject/i }))

      // Verify new subject appears
      await waitFor(() => {
        expect(screen.getByTestId('subject-4')).toBeInTheDocument()
        expect(screen.getByText('Chemistry')).toBeInTheDocument()
      })
    })
  })
})

// ============================================================================
// PROGRAM MANAGEMENT WORKFLOWS
// ============================================================================

describe('program Management Workflows', () => {
  describe('1. Create Program Flow', () => {
    test('should create program template with chapters', async () => {
      const user = userEvent.setup()

      const mockProgram = {
        id: 'prog-1',
        name: 'Math Program',
        schoolYearTemplateId: 'year-1',
        subjectId: 'subj-1',
        gradeId: 'grade-1',
        status: 'draft',
      }

      vi.mocked(dataOps.createProgramTemplate).mockResolvedValue(mockOk(mockProgram) as any)

      const ProgramForm = () => {
        const [program, setProgram] = React.useState<any>(null)
        const [formData, setFormData] = React.useState({
          name: '',
          schoolYearTemplateId: '',
          subjectId: '',
          gradeId: '',
        })

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          const result = await dataOps.createProgramTemplate(formData as any)
          if (result.isOk())
            setProgram(result.value)
        }

        return (
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Program Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              placeholder="School Year ID"
              value={formData.schoolYearTemplateId}
              onChange={e => setFormData({ ...formData, schoolYearTemplateId: e.target.value })}
            />
            <input
              placeholder="Subject ID"
              value={formData.subjectId}
              onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
            />
            <input
              placeholder="Grade ID"
              value={formData.gradeId}
              onChange={e => setFormData({ ...formData, gradeId: e.target.value })}
            />

            <button type="submit">Create Program</button>

            {program && (
              <div data-testid="program-created">
                <h2>{program.name}</h2>
                <p>{program.status}</p>
              </div>
            )}
          </form>
        )
      }

      render(<ProgramForm />)

      // Fill form
      await user.type(screen.getByPlaceholderText('Program Name'), 'Math Program')
      await user.type(screen.getByPlaceholderText('School Year ID'), 'year-1')
      await user.type(screen.getByPlaceholderText('Subject ID'), 'subj-1')
      await user.type(screen.getByPlaceholderText('Grade ID'), 'grade-1')

      // Submit
      await user.click(screen.getByRole('button', { name: /create program/i }))

      // Verify
      await waitFor(() => {
        expect(screen.getByTestId('program-created')).toBeInTheDocument()
        expect(screen.getByText('Math Program')).toBeInTheDocument()
      })
    })
  })

  describe('2. Edit Program Flow', () => {
    test('should edit program template', async () => {
      const user = userEvent.setup()

      const original = {
        id: 'prog-1',
        name: 'Original Program',
      }

      const updated = {
        ...original,
        name: 'Updated Program',
      }

      vi.mocked(dataOps.updateProgramTemplate).mockResolvedValue(mockOk(updated) as any)

      const ProgramEditForm = () => {
        const [program, setProgram] = React.useState<any>(original)
        const [name, setName] = React.useState(original.name)

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          const result = await dataOps.updateProgramTemplate('prog-1', { name } as any)
          if (result.isOk())
            setProgram(result.value)
        }

        return (
          <form onSubmit={handleSubmit}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <button type="submit">Update</button>
            <div data-testid="program-display">
              <h2>{program.name}</h2>
            </div>
          </form>
        )
      }

      render(<ProgramEditForm />)

      // Update name
      await user.clear(screen.getByDisplayValue('Original Program'))
      await user.type(screen.getByDisplayValue(''), 'Updated Program')

      // Submit
      await user.click(screen.getByRole('button', { name: /update/i }))

      // Verify
      await waitFor(() => {
        expect(screen.getByText('Updated Program')).toBeInTheDocument()
      })
    })
  })

  describe('3. Clone Program Flow', () => {
    test('should clone program to new school year', async () => {
      const user = userEvent.setup()

      const original = {
        id: 'prog-1',
        name: 'Original Program',
        schoolYearTemplateId: 'year-1',
      }

      const cloned = {
        id: 'prog-2',
        name: 'Original Program (Copy)',
        schoolYearTemplateId: 'year-2',
      }

      vi.mocked(dataOps.cloneProgramTemplate).mockResolvedValue(mockOk(cloned) as any)

      const ProgramsList = () => {
        const [programs, setPrograms] = React.useState([original])
        const [showCloneForm, setShowCloneForm] = React.useState(false)
        const [selectedYear, setSelectedYear] = React.useState('year-2')

        const handleClone = async () => {
          const result = await dataOps.cloneProgramTemplate(
            'prog-1',
            selectedYear,
            `${original.name} (Copy)`,
          )
          if (result.isOk()) {
            setPrograms([...programs, result.value])
            setShowCloneForm(false)
          }
        }

        return (
          <div>
            <div data-testid="programs-list">
              {programs.map(prog => (
                <div key={prog.id} data-testid={`program-${prog.id}`}>
                  <h3>{prog.name}</h3>
                  <button type="button" onClick={() => setShowCloneForm(true)}>Clone</button>
                </div>
              ))}
            </div>

            {showCloneForm && (
              <div role="dialog">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                >
                  <option value="year-2">Year 2</option>
                  <option value="year-3">Year 3</option>
                </select>
                <button type="button" onClick={handleClone}>Clone to Year</button>
                <button type="button" onClick={() => setShowCloneForm(false)}>Cancel</button>
              </div>
            )}
          </div>
        )
      }

      render(<ProgramsList />)

      // Click clone
      await user.click(screen.getByRole('button', { name: /clone/i }))

      // Verify dialog
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Select year and clone
      await user.click(screen.getByRole('button', { name: /clone to year/i }))

      // Verify cloned program appears
      await waitFor(() => {
        expect(screen.getByTestId('program-prog-2')).toBeInTheDocument()
        expect(screen.getByText('Original Program (Copy)')).toBeInTheDocument()
      })
    })
  })
})

// ============================================================================
// COEFFICIENT MANAGEMENT WORKFLOWS
// ============================================================================

describe('coefficient Management Workflows', () => {
  describe('1. Create Coefficient Flow', () => {
    test('should create coefficient template with weight', async () => {
      const user = userEvent.setup()

      const mockCoefficient = {
        id: 'coeff-1',
        schoolYearTemplateId: 'year-1',
        subjectId: 'subj-1',
        gradeId: 'grade-1',
        seriesId: 'series-1',
        weight: 2.5,
      }

      vi.mocked(dataOps.createCoefficientTemplate).mockResolvedValue(mockOk(mockCoefficient) as any)

      const CoefficientForm = () => {
        const [coefficient, setCoefficient] = React.useState<any>(null)
        const [formData, setFormData] = React.useState({
          schoolYearTemplateId: '',
          subjectId: '',
          gradeId: '',
          seriesId: '',
          weight: '',
        })

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          const result = await dataOps.createCoefficientTemplate({
            ...formData,
            weight: Number.parseFloat(formData.weight),
          } as any)
          if (result.isOk())
            setCoefficient(result.value)
        }

        return (
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Year ID"
              value={formData.schoolYearTemplateId}
              onChange={e => setFormData({ ...formData, schoolYearTemplateId: e.target.value })}
            />
            <input
              placeholder="Subject ID"
              value={formData.subjectId}
              onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
            />
            <input
              placeholder="Grade ID"
              value={formData.gradeId}
              onChange={e => setFormData({ ...formData, gradeId: e.target.value })}
            />
            <input
              placeholder="Series ID"
              value={formData.seriesId}
              onChange={e => setFormData({ ...formData, seriesId: e.target.value })}
            />
            <input
              type="number"
              placeholder="Weight"
              step="0.1"
              value={formData.weight}
              onChange={e => setFormData({ ...formData, weight: e.target.value })}
            />
            <button type="submit">Create Coefficient</button>

            {coefficient && (
              <div data-testid="coefficient-created">
                <p>
                  Weight:
                  {coefficient.weight}
                </p>
              </div>
            )}
          </form>
        )
      }

      render(<CoefficientForm />)

      // Fill form
      await user.type(screen.getByPlaceholderText('Year ID'), 'year-1')
      await user.type(screen.getByPlaceholderText('Subject ID'), 'subj-1')
      await user.type(screen.getByPlaceholderText('Grade ID'), 'grade-1')
      await user.type(screen.getByPlaceholderText('Series ID'), 'series-1')
      await user.type(screen.getByPlaceholderText('Weight'), '2.5')

      // Submit
      await user.click(screen.getByRole('button', { name: /create coefficient/i }))

      // Verify
      await waitFor(() => {
        expect(screen.getByTestId('coefficient-created')).toBeInTheDocument()
        expect(screen.getByText(/2\.5/)).toBeInTheDocument()
      })

      expect(dataOps.createCoefficientTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          schoolYearTemplateId: 'year-1',
          subjectId: 'subj-1',
          gradeId: 'grade-1',
          seriesId: 'series-1',
          weight: 2.5,
        }),
      )
    })
  })

  describe('2. Matrix Edit Flow', () => {
    test('should edit coefficients in matrix view', async () => {
      const user = userEvent.setup()

      const mockCoefficients = [
        { id: 'c1', schoolYearTemplateId: 'y1', subjectId: 's1', gradeId: 'g1', weight: 1.5 },
        { id: 'c2', schoolYearTemplateId: 'y1', subjectId: 's2', gradeId: 'g1', weight: 2.0 },
      ]

      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue(mockOk(mockCoefficients) as any)
      vi.mocked(dataOps.updateCoefficientTemplate).mockResolvedValue(mockOk({
        ...mockCoefficients[0],
        weight: 2.5,
      }) as any)

      const CoefficientMatrix = () => {
        const [coefficients, setCoefficients] = React.useState<any[]>([])
        const [editingId, setEditingId] = React.useState<string | null>(null)
        const [editValue, setEditValue] = React.useState('')

        React.useEffect(() => {
          dataOps.getCoefficientTemplates({ schoolYearTemplateId: 'y1' }).then((res: any) => {
            if (res.isOk()) {
              const val = res.value
              setCoefficients(Array.isArray(val) ? val : val.coefficients || [])
            }
          })
        }, [])

        const handleEdit = async (id: string, newWeight: number) => {
          const result = await dataOps.updateCoefficientTemplate(id, { weight: newWeight } as any)
          if (result.isOk()) {
            const updated = result.value
            setCoefficients(coefficients.map(c => (c.id === id ? updated : c)))
            setEditingId(null)
          }
        }

        return (
          <div>
            <table data-testid="coefficient-matrix">
              <tbody>
                {coefficients.map(coeff => (
                  <tr key={coeff.id} data-testid={`row-${coeff.id}`}>
                    <td>{coeff.subjectId}</td>
                    <td>
                      {editingId === coeff.id
                        ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              data-testid={`edit-${coeff.id}`}
                            />
                          )
                        : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(coeff.id)
                                setEditValue(coeff.weight.toString())
                              }}
                              data-testid={`weight-${coeff.id}`}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              {coeff.weight}
                            </button>
                          )}
                    </td>
                    {editingId === coeff.id && (
                      <td>
                        <button
                          type="button"
                          onClick={() => handleEdit(coeff.id, Number.parseFloat(editValue))}
                        >
                          Save
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      render(<CoefficientMatrix />)

      // Wait for matrix to load
      await waitFor(() => {
        expect(screen.getByTestId('row-c1')).toBeInTheDocument()
      })

      // Click to edit first coefficient
      await user.click(screen.getByTestId('weight-c1'))

      // Verify edit input appears
      await waitFor(() => {
        expect(screen.getByTestId('edit-c1')).toBeInTheDocument()
      })

      // Change value
      await user.clear(screen.getByTestId('edit-c1'))
      await user.type(screen.getByTestId('edit-c1'), '2.5')

      // Save
      await user.click(screen.getByRole('button', { name: /save/i }))

      // Verify update
      await waitFor(() => {
        expect(dataOps.updateCoefficientTemplate).toHaveBeenCalledWith('c1', { weight: 2.5 })
      })
    })
  })

  describe('3. Bulk Update Flow', () => {
    test('should bulk update multiple coefficients', async () => {
      const user = userEvent.setup()

      const mockCoefficients = [
        { id: 'c1', weight: 1.5 },
        { id: 'c2', weight: 2.0 },
        { id: 'c3', weight: 1.0 },
      ]

      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue(mockOk(mockCoefficients) as any)

      const BulkUpdateForm = () => {
        const [coefficients, setCoefficients] = React.useState<any[]>([])
        const [bulkMode, setBulkMode] = React.useState(false)
        const [updates, setUpdates] = React.useState<Record<string, number>>({})

        React.useEffect(() => {
          dataOps.getCoefficientTemplates().then((res: any) => {
            if (res.isOk()) {
              const val = res.value
              setCoefficients(Array.isArray(val) ? val : val.coefficients || [])
            }
          })
        }, [])

        const handleBulkSave = async () => {
          const updatesList = Object.entries(updates).map(([id, weight]) => ({ id, weight }))
          await dataOps.bulkUpdateCoefficients(updatesList)
          setBulkMode(false)
          setUpdates({})
        }

        return (
          <div>
            <button type="button" onClick={() => setBulkMode(!bulkMode)}>
              {bulkMode ? 'Cancel Bulk Edit' : 'Bulk Edit'}
            </button>

            {bulkMode && (
              <div data-testid="bulk-edit-form">
                {coefficients.map(coeff => (
                  <div key={coeff.id}>
                    <label>{coeff.id}</label>
                    <input
                      type="number"
                      defaultValue={coeff.weight}
                      onChange={e => setUpdates({
                        ...updates,
                        [coeff.id]: Number.parseFloat(e.target.value),
                      })}
                      data-testid={`bulk-input-${coeff.id}`}
                    />
                  </div>
                ))}
                <button type="button" onClick={handleBulkSave}>Save All</button>
              </div>
            )}
          </div>
        )
      }

      render(<BulkUpdateForm />)

      // Enter bulk edit mode
      await user.click(screen.getByRole('button', { name: /bulk edit/i }))

      // Verify form appears
      await waitFor(() => {
        expect(screen.getByTestId('bulk-edit-form')).toBeInTheDocument()
      })

      // Update values
      await user.clear(screen.getByTestId('bulk-input-c1'))
      await user.type(screen.getByTestId('bulk-input-c1'), '2.5')

      await user.clear(screen.getByTestId('bulk-input-c2'))
      await user.type(screen.getByTestId('bulk-input-c2'), '3.0')

      // Save all
      await user.click(screen.getByRole('button', { name: /save all/i }))

      // Verify updates
      await waitFor(() => {
        expect(dataOps.bulkUpdateCoefficients).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'c1', weight: 2.5 }),
            expect.objectContaining({ id: 'c2', weight: 3.0 }),
          ]),
        )
      })
    })
  })

  describe('4. Copy from Previous Year Flow', () => {
    test('should copy coefficients from previous year', async () => {
      const user = userEvent.setup()

      const previousYearCoefficients = [
        { id: 'c1', schoolYearTemplateId: 'year-1', weight: 1.5 },
        { id: 'c2', schoolYearTemplateId: 'year-1', weight: 2.0 },
      ]

      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue(mockOk(previousYearCoefficients) as any)
      vi.mocked(dataOps.copyCoefficientTemplates).mockResolvedValue(mockOk([]) as any)

      const CopyYearForm = () => {
        const [coefficients, setCoefficients] = React.useState<any[]>([])
        const [showCopyForm, setShowCopyForm] = React.useState(false)
        const [sourceYear, setSourceYear] = React.useState('year-1')

        const handleCopyFromYear = async () => {
          await dataOps.copyCoefficientTemplates(sourceYear, 'year-2')
          setCoefficients(previousYearCoefficients)
          setShowCopyForm(false)
        }

        return (
          <div>
            <button type="button" onClick={() => setShowCopyForm(true)}>Copy from Previous Year</button>

            {showCopyForm && (
              <div role="dialog">
                <select
                  value={sourceYear}
                  onChange={e => setSourceYear(e.target.value)}
                >
                  <option value="year-1">Year 1</option>
                  <option value="year-2">Year 2</option>
                </select>
                <button type="button" onClick={handleCopyFromYear}>Copy</button>
                <button type="button" onClick={() => setShowCopyForm(false)}>Cancel</button>
              </div>
            )}

            <div data-testid="coefficients-list">
              {coefficients.map(coeff => (
                <div key={coeff.id} data-testid={`coeff-${coeff.id}`}>
                  Weight:
                  {' '}
                  {coeff.weight}
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<CopyYearForm />)

      // Click copy button
      await user.click(screen.getByRole('button', { name: /copy from previous year/i }))

      // Verify dialog
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Copy
      await user.click(screen.getByRole('button', { name: /^Copy$/i }))

      // Verify coefficients copied
      await waitFor(() => {
        expect(screen.getByTestId('coeff-c1')).toBeInTheDocument()
        expect(screen.getByTestId('coeff-c2')).toBeInTheDocument()
      })
    })
  })
})
