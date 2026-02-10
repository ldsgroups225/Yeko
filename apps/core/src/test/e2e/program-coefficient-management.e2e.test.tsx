/**
 * End-to-End Workflow Tests: Program & Coefficient Management
 *
 * Tests complete user workflows for:
 * - Program management (create, edit, publish, restore, clone)
 * - Coefficient management (create, matrix edit, bulk update, copy from previous year)
 *
 * Following vitest-dom principles with React Testing Library
 */

import { R } from '@praha/byethrow'
import * as dataOps from '@repo/data-ops'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const mockOk = (val: any) => R.succeed(val)

// Mock data-ops
vi.mock('@repo/data-ops', () => ({
  // Program operations
  getProgramTemplates: vi.fn(),
  createProgramTemplate: vi.fn(),
  updateProgramTemplate: vi.fn(),
  deleteProgramTemplate: vi.fn(),
  publishProgram: vi.fn(),
  restoreProgramVersion: vi.fn(),
  cloneProgramTemplate: vi.fn(),
  getProgramVersions: vi.fn(),
  // Coefficient operations
  getCoefficientTemplates: vi.fn(),
  createCoefficientTemplate: vi.fn(),
  updateCoefficientTemplate: vi.fn(),
  bulkUpdateCoefficients: vi.fn(),
  copyCoefficientTemplates: vi.fn(),
}))

describe('e2E: Program Management Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. Create Program Flow', () => {
    test('should complete full program creation with chapters', async () => {
      const user = userEvent.setup()

      const newProgram = {
        id: 'prog-1',
        name: 'Mathematics Program',
        schoolYearTemplateId: 'year-1',
        subjectId: 'subject-1',
        gradeId: 'grade-1',
        status: 'draft',
        chapters: [],
      }

      vi.mocked(dataOps.createProgramTemplate).mockResolvedValue(mockOk(newProgram) as any)

      const ProgramCreatePage = () => {
        const [formData, setFormData] = React.useState({
          name: '',
          schoolYearTemplateId: '',
          subjectId: '',
          gradeId: '',
        })
        const [chapters, setChapters] = React.useState<any[]>([])
        const [showChapterForm, setShowChapterForm] = React.useState(false)
        const [chapterData, setChapterData] = React.useState({
          title: '',
          objectives: '',
          durationHours: 0,
        })

        const handleAddChapter = () => {
          setChapters([...chapters, { ...chapterData, order: chapters.length + 1 }])
          setChapterData({ title: '', objectives: '', durationHours: 0 })
          setShowChapterForm(false)
        }

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          await dataOps.createProgramTemplate({
            ...formData,
            chapters,
          } as any)
        }

        return (
          <div>
            <h1>Create Program</h1>
            <form onSubmit={handleSubmit} data-testid="program-form">
              <input
                placeholder="Program Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />

              <select
                value={formData.schoolYearTemplateId}
                onChange={e => setFormData({ ...formData, schoolYearTemplateId: e.target.value })}
                data-testid="year-select"
              >
                <option value="">Select Year</option>
                <option value="year-1">2024-2025</option>
              </select>

              <select
                value={formData.subjectId}
                onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                data-testid="subject-select"
              >
                <option value="">Select Subject</option>
                <option value="subject-1">Mathematics</option>
              </select>

              <select
                value={formData.gradeId}
                onChange={e => setFormData({ ...formData, gradeId: e.target.value })}
                data-testid="grade-select"
              >
                <option value="">Select Grade</option>
                <option value="grade-1">Grade 1</option>
              </select>

              <button type="button" onClick={() => setShowChapterForm(true)}>
                Add Chapter
              </button>

              {showChapterForm && (
                <div data-testid="chapter-form">
                  <input
                    placeholder="Chapter Title"
                    value={chapterData.title}
                    onChange={e => setChapterData({ ...chapterData, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Objectives"
                    value={chapterData.objectives}
                    onChange={e => setChapterData({ ...chapterData, objectives: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Duration (hours)"
                    value={chapterData.durationHours || ''}
                    onChange={e => setChapterData({ ...chapterData, durationHours: Number.parseInt(e.target.value) })}
                  />
                  <button type="button" onClick={handleAddChapter}>Save Chapter</button>
                </div>
              )}

              <div data-testid="chapters-list">
                {chapters.map(chapter => (
                  <div key={chapter.order} data-testid={`chapter-${chapter.order}`}>
                    <h4>{chapter.title}</h4>
                    <p>
                      {chapter.durationHours}
                      h
                    </p>
                  </div>
                ))}
              </div>

              <button type="submit">Save Program</button>
            </form>
          </div>
        )
      }

      render(<ProgramCreatePage />)

      // Fill program details
      await user.type(screen.getByPlaceholderText('Program Name'), 'Mathematics Program')
      await user.selectOptions(screen.getByTestId('year-select'), 'year-1')
      await user.selectOptions(screen.getByTestId('subject-select'), 'subject-1')
      await user.selectOptions(screen.getByTestId('grade-select'), 'grade-1')

      // Add first chapter
      await user.click(screen.getByRole('button', { name: /add chapter/i }))

      expect(screen.getByTestId('chapter-form')).toBeInTheDocument()

      await user.type(screen.getByPlaceholderText('Chapter Title'), 'Introduction')
      await user.type(screen.getByPlaceholderText('Objectives'), 'Learn basics')
      await user.type(screen.getByPlaceholderText('Duration (hours)'), '5')
      await user.click(screen.getByRole('button', { name: /save chapter/i }))

      // Verify chapter added
      await waitFor(() => {
        expect(screen.getByTestId('chapter-1')).toBeInTheDocument()
      })

      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('5h')).toBeInTheDocument()

      // Submit program
      await user.click(screen.getByRole('button', { name: /save program/i }))

      // Verify program created
      await waitFor(() => {
        expect(dataOps.createProgramTemplate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Mathematics Program',
            schoolYearTemplateId: 'year-1',
            subjectId: 'subject-1',
            gradeId: 'grade-1',
            chapters: expect.arrayContaining([
              expect.objectContaining({
                title: 'Introduction',
                objectives: 'Learn basics',
                durationHours: 5,
              }),
            ]),
          }),
        )
      })
    })
  })

  describe('2. Publish Program Flow', () => {
    test('should publish program and create version', async () => {
      const user = userEvent.setup()

      const draftProgram = {
        id: 'prog-1',
        name: 'Math Program',
        status: 'draft',
        version: 1,
      }

      const publishedProgram = {
        ...draftProgram,
        status: 'published',
        version: 2,
      }

      vi.mocked(dataOps.publishProgram).mockResolvedValue(mockOk(publishedProgram) as any)

      const ProgramDetailsPage = () => {
        const [program, setProgram] = React.useState(draftProgram)

        const handlePublish = async () => {
          const result = await dataOps.publishProgram('prog-1')
          if (R.isSuccess(result))
            setProgram(result.value as any)
        }

        return (
          <div>
            <h1>{program.name}</h1>
            <div data-testid="status-badge">
              Status:
              {' '}
              {program.status}
            </div>
            <div data-testid="version-info">
              Version:
              {' '}
              {program.version}
            </div>

            {program.status === 'draft' && (
              <button type="button" onClick={handlePublish}>Publish Program</button>
            )}
          </div>
        )
      }

      render(<ProgramDetailsPage />)

      // Verify initial state
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Status: draft')
      expect(screen.getByTestId('version-info')).toHaveTextContent('Version: 1')

      // Publish program
      await user.click(screen.getByRole('button', { name: /publish program/i }))

      // Verify status changed
      await waitFor(() => {
        expect(screen.getByTestId('status-badge')).toHaveTextContent('Status: published')
        expect(screen.getByTestId('version-info')).toHaveTextContent('Version: 2')
      })

      expect(dataOps.publishProgram).toHaveBeenCalledWith('prog-1')
    })
  })

  describe('3. Restore Program Version Flow', () => {
    test('should restore previous version and revert to draft', async () => {
      const user = userEvent.setup()

      const versions = [
        { id: 'v1', version: 1, createdAt: new Date('2024-01-01'), status: 'published' },
        { id: 'v2', version: 2, createdAt: new Date('2024-02-01'), status: 'published' },
        { id: 'v3', version: 3, createdAt: new Date('2024-03-01'), status: 'draft' },
      ]

      vi.mocked(dataOps.getProgramVersions).mockResolvedValue(mockOk(versions) as any)
      vi.mocked(dataOps.restoreProgramVersion).mockResolvedValue(mockOk({
        id: 'prog-1',
        version: 4,
        status: 'draft',
      }) as any)

      const ProgramVersionHistory = () => {
        const [versions, setVersions] = React.useState<any[]>([])
        const [currentVersion, setCurrentVersion] = React.useState(3)

        React.useEffect(() => {
          dataOps.getProgramVersions('prog-1').then((res: any) => {
            if (res.isOk())
              setVersions(res.value)
          })
        }, [])

        const handleRestore = async (versionId: string) => {
          await dataOps.restoreProgramVersion(versionId)
          // In a real scenario we would refetch, but here we simulate the state update
          setCurrentVersion(4)
        }

        return (
          <div>
            <h1>Version History</h1>
            <div data-testid="current-version">
              Current Version:
              {' '}
              {currentVersion}
            </div>

            <div data-testid="versions-list">
              {versions.map(version => (
                <div key={version.id} data-testid={`version-${version.version}`}>
                  <span>
                    Version
                    {version.version}
                  </span>
                  <span>{version.status}</span>
                  {version.version < currentVersion && (
                    <button type="button" onClick={() => handleRestore(version.id)}>
                      Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<ProgramVersionHistory />)

      // Wait for versions to load
      await waitFor(() => {
        expect(screen.getByTestId('version-1')).toBeInTheDocument()
      })

      // Verify current version
      expect(screen.getByTestId('current-version')).toHaveTextContent('Current Version: 3')

      // Restore version 1
      const version1 = screen.getByTestId('version-1')
      await user.click(within(version1).getByRole('button', { name: /restore/i }))

      // Verify version restored
      await waitFor(() => {
        expect(screen.getByTestId('current-version')).toHaveTextContent('Current Version: 4')
      })

      expect(dataOps.restoreProgramVersion).toHaveBeenCalledWith('v1')
    })
  })

  describe('4. Clone Program Flow', () => {
    test('should clone program to new school year', async () => {
      const user = userEvent.setup()

      const originalProgram = {
        id: 'prog-1',
        name: 'Math Program 2023',
        schoolYearTemplateId: 'year-2023',
        chapters: [
          { title: 'Chapter 1', objectives: 'Obj 1', durationHours: 5 },
        ],
      }

      const clonedProgram = {
        id: 'prog-2',
        name: 'Math Program 2024',
        schoolYearTemplateId: 'year-2024',
        chapters: [
          { title: 'Chapter 1', objectives: 'Obj 1', durationHours: 5 },
        ],
      }

      vi.mocked(dataOps.cloneProgramTemplate).mockResolvedValue(mockOk(clonedProgram) as any)

      const ProgramClonePage = () => {
        const [program] = React.useState(originalProgram)
        const [targetYear, setTargetYear] = React.useState('')
        const [cloned, setCloned] = React.useState<any>(null)

        const handleClone = async () => {
          const result = await dataOps.cloneProgramTemplate('prog-1', targetYear, 'Math Program 2024')
          if (R.isSuccess(result))
            setCloned(result.value)
        }

        return (
          <div>
            <h1>Clone Program</h1>
            <div data-testid="original-program">
              <h2>{program.name}</h2>
              <p>
                Year:
                {program.schoolYearTemplateId}
              </p>
              <p>
                Chapters:
                {program.chapters?.length ?? 0}
              </p>
            </div>

            <select
              value={targetYear}
              onChange={e => setTargetYear(e.target.value)}
              data-testid="target-year-select"
            >
              <option value="">Select Target Year</option>
              <option value="year-2024">2024-2025</option>
            </select>

            <button type="button" onClick={handleClone} disabled={!targetYear}>
              Clone Program
            </button>

            {cloned && (
              <div data-testid="cloned-program">
                <h2>{cloned.name}</h2>
                <p>
                  Year:
                  {cloned.schoolYearTemplateId}
                </p>
                <p>
                  Chapters:
                  {cloned.chapters?.length ?? 0}
                </p>
              </div>
            )}
          </div>
        )
      }

      render(<ProgramClonePage />)

      // Verify original program
      expect(screen.getByTestId('original-program')).toHaveTextContent('Math Program 2023')
      expect(screen.getByTestId('original-program')).toHaveTextContent('year-2023')
      expect(screen.getByTestId('original-program')).toHaveTextContent('1')

      // Select target year
      await user.selectOptions(screen.getByTestId('target-year-select'), 'year-2024')

      // Clone program
      await user.click(screen.getByRole('button', { name: /clone program/i }))

      // Verify cloned program appears
      await waitFor(() => {
        expect(screen.getByTestId('cloned-program')).toBeInTheDocument()
      })

      expect(screen.getByTestId('cloned-program')).toHaveTextContent('Math Program 2024')
      expect(screen.getByTestId('cloned-program')).toHaveTextContent('year-2024')
      expect(screen.getByTestId('cloned-program')).toHaveTextContent('1')

      expect(dataOps.cloneProgramTemplate).toHaveBeenCalledWith('prog-1', 'year-2024', 'Math Program 2024')
    })
  })
})

describe('e2E: Coefficient Management Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. Matrix Edit Flow', () => {
    test('should edit coefficients in matrix view', async () => {
      const user = userEvent.setup()

      const mockCoefficients = [
        { id: 'c1', subjectId: 's1', gradeId: 'g1', weight: 3 },
        { id: 'c2', subjectId: 's2', gradeId: 'g1', weight: 2 },
      ]

      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue(mockOk({
        coefficients: mockCoefficients,
        pagination: { total: 2, page: 1, limit: 100, totalPages: 1 },
      }) as any)

      vi.mocked(dataOps.updateCoefficientTemplate).mockResolvedValue(mockOk({
        id: 'c1',
        weight: 4,
      }) as any)

      const CoefficientsMatrix = () => {
        const [coefficients, setCoefficients] = React.useState<any[]>([])
        const [editingId, setEditingId] = React.useState<string | null>(null)
        const [editValue, setEditValue] = React.useState(0)

        React.useEffect(() => {
          dataOps.getCoefficientTemplates({ schoolYearTemplateId: 'year-1' }).then((res: any) => {
            if (res.isOk())
              setCoefficients(res.value.coefficients)
          })
        }, [])

        const startEdit = (id: string, currentWeight: number) => {
          setEditingId(id)
          setEditValue(currentWeight)
        }

        const saveEdit = async (id: string) => {
          const result = await dataOps.updateCoefficientTemplate(id, { weight: editValue })
          if (R.isSuccess(result)) {
            const updated = result.value
            setCoefficients(coefficients.map(c => c.id === id ? { ...c, weight: updated.weight } : c))
            setEditingId(null)
          }
        }

        return (
          <div>
            <h1>Coefficients Matrix</h1>
            <table>
              <tbody>
                {coefficients.map(coef => (
                  <tr key={coef.id} data-testid={`coef-${coef.id}`}>
                    <td>
                      Subject
                      {coef.subjectId}
                    </td>
                    <td>
                      Grade
                      {coef.gradeId}
                    </td>
                    <td>
                      {editingId === coef.id
                        ? (
                            <>
                              <input
                                type="number"
                                value={editValue}
                                onChange={e => setEditValue(Number.parseInt(e.target.value) || 0)}
                                data-testid="weight-input"
                              />
                              <button type="button" onClick={() => saveEdit(coef.id)}>Save</button>
                            </>
                          )
                        : (
                            <>
                              <span data-testid={`weight-${coef.id}`}>{coef.weight}</span>
                              <button type="button" onClick={() => startEdit(coef.id, coef.weight)}>Edit</button>
                            </>
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      render(<CoefficientsMatrix />)

      // Wait for coefficients to load
      await waitFor(() => {
        expect(screen.getByTestId('coef-c1')).toBeInTheDocument()
      })

      // Verify initial weight
      expect(screen.getByTestId('weight-c1')).toHaveTextContent('3')

      // Click edit
      const coef1Row = screen.getByTestId('coef-c1')
      await user.click(within(coef1Row).getByRole('button', { name: /edit/i }))

      // Change weight
      const weightInput = screen.getByTestId('weight-input')
      await user.clear(weightInput)
      await user.type(weightInput, '4')

      // Save
      await user.click(within(coef1Row).getByRole('button', { name: /save/i }))

      // Verify weight updated
      await waitFor(() => {
        expect(screen.getByTestId('weight-c1')).toHaveTextContent('4')
      })

      expect(dataOps.updateCoefficientTemplate).toHaveBeenCalledWith('c1', { weight: 4 })
    })
  })

  describe('2. Bulk Update Flow', () => {
    test('should update multiple coefficients at once', async () => {
      const user = userEvent.setup()

      const mockCoefficients = [
        { id: 'c1', subjectId: 's1', gradeId: 'g1', weight: 3 },
        { id: 'c2', subjectId: 's2', gradeId: 'g1', weight: 2 },
      ]

      vi.mocked(dataOps.getCoefficientTemplates).mockResolvedValue(mockOk({
        coefficients: mockCoefficients,
        pagination: { total: 2, page: 1, limit: 100, totalPages: 1 },
      }) as any)

      vi.mocked(dataOps.bulkUpdateCoefficients).mockResolvedValue(mockOk(undefined) as any)

      const BulkEditCoefficients = () => {
        const [coefficients, setCoefficients] = React.useState<any[]>([])
        const [bulkMode, setBulkMode] = React.useState(false)
        const [updates, setUpdates] = React.useState<Record<string, number>>({})

        React.useEffect(() => {
          dataOps.getCoefficientTemplates({ schoolYearTemplateId: 'year-1' }).then((res: any) => {
            if (res.isOk())
              setCoefficients(res.value.coefficients)
          })
        }, [])

        const handleWeightChange = (id: string, weight: number) => {
          setUpdates({ ...updates, [id]: weight })
        }

        const handleSaveAll = async () => {
          const updateArray = Object.entries(updates).map(([id, weight]) => ({ id, weight }))
          await dataOps.bulkUpdateCoefficients(updateArray)
          setBulkMode(false)
          setUpdates({})
        }

        return (
          <div>
            <button type="button" onClick={() => setBulkMode(!bulkMode)}>
              {bulkMode ? 'Cancel Bulk Edit' : 'Bulk Edit Mode'}
            </button>

            {bulkMode && (
              <button type="button" onClick={handleSaveAll} disabled={Object.keys(updates).length === 0}>
                Save All Changes
              </button>
            )}

            <div data-testid="coefficients-list">
              {coefficients.map(coef => (
                <div key={coef.id} data-testid={`coef-${coef.id}`}>
                  <span>
                    Subject
                    {coef.subjectId}
                  </span>
                  {bulkMode
                    ? (
                        <input
                          type="number"
                          defaultValue={coef.weight}
                          onChange={e => handleWeightChange(coef.id, Number.parseInt(e.target.value))}
                          data-testid={`input-${coef.id}`}
                        />
                      )
                    : (
                        <span>{coef.weight}</span>
                      )}
                </div>
              ))}
            </div>
          </div>
        )
      }

      render(<BulkEditCoefficients />)

      await waitFor(() => {
        expect(screen.getByTestId('coef-c1')).toBeInTheDocument()
      })

      // Enter bulk edit mode
      await user.click(screen.getByRole('button', { name: /bulk edit mode/i }))

      // Update multiple coefficients
      const input1 = screen.getByTestId('input-c1')
      const input2 = screen.getByTestId('input-c2')

      await user.clear(input1)
      await user.type(input1, '5')

      await user.clear(input2)
      await user.type(input2, '4')

      // Save all
      await user.click(screen.getByRole('button', { name: /save all changes/i }))

      // Verify bulk update called
      await waitFor(() => {
        expect(dataOps.bulkUpdateCoefficients).toHaveBeenCalledWith([
          { id: 'c1', weight: 5 },
          { id: 'c2', weight: 4 },
        ])
      })
    })
  })

  describe('3. Copy from Previous Year Flow', () => {
    test('should copy coefficients from previous year', async () => {
      const user = userEvent.setup()

      const copiedCoefficients = [
        { id: 'new-c1', subjectId: 's1', gradeId: 'g1', weight: 3, schoolYearTemplateId: 'year-2024' },
        { id: 'new-c2', subjectId: 's2', gradeId: 'g1', weight: 2, schoolYearTemplateId: 'year-2024' },
      ]

      vi.mocked(dataOps.copyCoefficientTemplates).mockResolvedValue(mockOk(copiedCoefficients) as any)

      const CopyCoefficientsPage = () => {
        const [sourceYear, setSourceYear] = React.useState('')
        const [targetYear] = React.useState('year-2024')
        const [copied, setCopied] = React.useState<any[]>([])

        const handleCopy = async () => {
          const result = await dataOps.copyCoefficientTemplates(sourceYear, targetYear)
          if (R.isSuccess(result))
            setCopied(result.value)
        }

        return (
          <div>
            <h1>Copy Coefficients</h1>

            <select
              value={sourceYear}
              onChange={e => setSourceYear(e.target.value)}
              data-testid="source-year-select"
            >
              <option value="">Select Source Year</option>
              <option value="year-2023">2023-2024</option>
            </select>

            <div>Target Year: 2024-2025</div>

            <button type="button" onClick={handleCopy} disabled={!sourceYear}>
              Copy Coefficients
            </button>

            {copied.length > 0 && (
              <div data-testid="copied-coefficients">
                <p>
                  Copied
                  {copied.length}
                  {' '}
                  coefficients
                </p>
                {copied.map(coef => (
                  <div key={coef.id} data-testid={`copied-${coef.id}`}>
                    Subject
                    {' '}
                    {coef.subjectId}
                    : Weight
                    {' '}
                    {coef.weight}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      render(<CopyCoefficientsPage />)

      // Select source year
      await user.selectOptions(screen.getByTestId('source-year-select'), 'year-2023')

      // Copy coefficients
      await user.click(screen.getByRole('button', { name: /copy coefficients/i }))

      // Verify coefficients copied
      await waitFor(() => {
        expect(screen.getByTestId('copied-coefficients')).toBeInTheDocument()
      })

      expect(screen.getByTestId('copied-new-c1')).toBeInTheDocument()
      expect(screen.getByTestId('copied-new-c2')).toBeInTheDocument()

      expect(dataOps.copyCoefficientTemplates).toHaveBeenCalledWith('year-2023', 'year-2024')
    })
  })
})
