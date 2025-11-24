import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button type="button" {...props}>{children}</button>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select value={value} onChange={e => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ placeholder }: any) => (
    <option value="" disabled>{placeholder}</option>
  ),
  SelectValue: ({ placeholder }: any) => <option value="" disabled>{placeholder}</option>,
}))

// Mock Chapter Form Component
interface ChapterFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

function ChapterForm({ onSubmit, onCancel }: ChapterFormProps) {
  const mockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      order: Number.parseInt(formData.get('order') as string) || 0,
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={mockSubmit} data-testid="chapter-form">
      <div className="space-y-4">
        <div>
          <label htmlFor="title">Titre du Chapitre *</label>
          <input
            id="title"
            name="title"
            placeholder="e.g., Introduction aux fonctions"
            data-testid="chapter-title-input"
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Description du chapitre..."
            data-testid="chapter-description-input"
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="order">Ordre *</label>
          <input
            id="order"
            name="order"
            type="number"
            placeholder="1"
            data-testid="chapter-order-input"
            required
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={onCancel} data-testid="chapter-cancel-btn">
          Annuler
        </button>
        <button type="submit" data-testid="chapter-submit-btn">
          Ajouter
        </button>
      </div>
    </form>
  )
}

// Mock Program Form Component
interface ProgramFormProps {
  defaultValues?: any
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  onCancel: () => void
}

interface Chapter {
  id: string
  title: string
  description?: string
  order: number
}

function ProgramForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
  onCancel,
}: ProgramFormProps) {
  const [showChapterForm, setShowChapterForm] = React.useState(false)
  const [chapters, setChapters] = React.useState<Chapter[]>(defaultValues?.chapters || [])

  const handleAddChapter = (chapterData: Omit<Chapter, 'id'>) => {
    const newChapter: Chapter = {
      ...chapterData,
      id: `chapter-${Date.now()}`,
    }
    setChapters([...chapters, newChapter])
    setShowChapterForm(false)
  }

  const handleDeleteChapter = (chapterId: string) => {
    setChapters(chapters.filter((ch: Chapter) => ch.id !== chapterId))
  }

  const handleReorderChapter = (chapterId: string, direction: 'up' | 'down') => {
    const index = chapters.findIndex((ch: Chapter) => ch.id === chapterId)
    if (index === -1)
      return

    const newChapters = [...chapters]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < chapters.length) {
      const chapter1 = newChapters[index]
      const chapter2 = newChapters[newIndex]
      if (chapter1 && chapter2) {
        newChapters[index] = chapter2
        newChapters[newIndex] = chapter1
        setChapters(newChapters)
      }
    }
  }

  const mockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      description: formData.get('description'),
      gradeId: formData.get('gradeId'),
      status: formData.get('status') || 'draft',
      chapters,
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={mockSubmit} data-testid="program-form">
      <div className="space-y-6">
        {/* Program Basic Information */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name">Nom du Programme *</label>
            <input
              id="name"
              name="name"
              defaultValue={defaultValues?.name || ''}
              placeholder="e.g., Programme de Mathématiques 6ème"
              data-testid="program-name-input"
              required
            />
          </div>
          <div>
            <label htmlFor="code">Code du Programme *</label>
            <input
              id="code"
              name="code"
              defaultValue={defaultValues?.code || ''}
              placeholder="e.g., MATH_6E"
              data-testid="program-code-input"
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              defaultValue={defaultValues?.description || ''}
              placeholder="Description du programme..."
              data-testid="program-description-input"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="gradeId">Classe *</label>
            <select
              id="gradeId"
              name="gradeId"
              defaultValue={defaultValues?.gradeId || ''}
              data-testid="program-grade-select"
              required
            >
              <option value="">Sélectionner une classe</option>
              <option value="grade-1">Sixième</option>
              <option value="grade-2">Cinquième</option>
              <option value="grade-3">Quatrième</option>
              <option value="grade-4">Troisième</option>
            </select>
          </div>
          <div>
            <label htmlFor="status">Statut</label>
            <select
              id="status"
              name="status"
              defaultValue={defaultValues?.status || 'draft'}
              data-testid="program-status-select"
            >
              <option value="draft">Brouillon</option>
              <option value="active">Actif</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>

        {/* Chapters Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3>Chapitres</h3>
            <button
              type="button"
              onClick={() => setShowChapterForm(true)}
              data-testid="add-chapter-btn"
              disabled={showChapterForm}
            >
              Ajouter un Chapitre
            </button>
          </div>

          {showChapterForm && (
            <div className="mb-4 p-4 border rounded-lg" data-testid="chapter-form-container">
              <h4 className="mb-2">Nouveau Chapitre</h4>
              <ChapterForm
                onSubmit={handleAddChapter}
                onCancel={() => setShowChapterForm(false)}
              />
            </div>
          )}

          <div className="space-y-2" data-testid="chapters-list">
            {chapters.length === 0
              ? (
                  <p className="text-muted-foreground" data-testid="no-chapters-message">
                    Aucun chapitre ajouté
                  </p>
                )
              : (
                  chapters.map((chapter: Chapter, index: number) => (
                    <div
                      key={chapter.id}
                      className="flex items-center justify-between p-3 border rounded"
                      data-testid={`chapter-item-${chapter.id}`}
                    >
                      <div>
                        <h5 className="font-medium">{chapter.title}</h5>
                        {chapter.description && (
                          <p className="text-sm text-muted-foreground">{chapter.description}</p>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Ordre:
                          {chapter.order}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleReorderChapter(chapter.id, 'up')}
                          disabled={index === 0}
                          data-testid={`chapter-up-${chapter.id}`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorderChapter(chapter.id, 'down')}
                          disabled={index === chapters.length - 1}
                          data-testid={`chapter-down-${chapter.id}`}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChapter(chapter.id)}
                          data-testid={`chapter-delete-${chapter.id}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button type="button" onClick={onCancel} data-testid="cancel-button">
          Annuler
        </button>
        <button type="submit" disabled={isSubmitting} data-testid="submit-button">
          {isSubmitting ? 'Enregistrement...' : (mode === 'create' ? 'Créer' : 'Enregistrer')}
        </button>
      </div>
    </form>
  )
}

describe('program Form Component', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>
  let mockOnCancel: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnSubmit = vi.fn()
    mockOnCancel = vi.fn()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('rendering Tests', () => {
    test('should render all program fields correctly', () => {
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      expect(screen.getByLabelText(/nom du programme/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/code du programme/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/classe/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/statut/i)).toBeInTheDocument()

      expect(screen.getByTestId('add-chapter-btn')).toBeInTheDocument()
      expect(screen.getByTestId('chapters-list')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })

    test('should populate form with default values', () => {
      const defaultValues = {
        name: 'Programme de Mathématiques 6ème',
        code: 'MATH_6E',
        description: 'Programme complet de mathématiques pour la classe de 6ème',
        gradeId: 'grade-1',
        status: 'active',
      }

      render(
        <ProgramForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      expect(screen.getByDisplayValue('Programme de Mathématiques 6ème')).toBeInTheDocument()
      expect(screen.getByDisplayValue('MATH_6E')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Programme complet de mathématiques pour la classe de 6ème')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Sixième')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Actif')).toBeInTheDocument()
    })

    test('should display empty chapters message initially', () => {
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      expect(screen.getByTestId('no-chapters-message')).toBeInTheDocument()
      expect(screen.getByText('Aucun chapitre ajouté')).toBeInTheDocument()
    })

    test('should display existing chapters', () => {
      const defaultValues = {
        chapters: [
          { id: 'ch1', title: 'Introduction', description: 'Chapitre introductif', order: 1 },
          { id: 'ch2', title: 'Nombres', description: 'Les nombres entiers', order: 2 },
        ],
      }

      render(
        <ProgramForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      expect(screen.queryByTestId('no-chapters-message')).not.toBeInTheDocument()
      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('Les nombres entiers')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-item-ch1')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-item-ch2')).toBeInTheDocument()
    })
  })

  describe('chapter Management Tests', () => {
    test('should show chapter form when add chapter button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const addChapterBtn = screen.getByTestId('add-chapter-btn')
      await user.click(addChapterBtn)

      expect(screen.getByTestId('chapter-form-container')).toBeInTheDocument()
      expect(screen.getByTestId('chapter-form')).toBeInTheDocument()
      expect(screen.getByLabelText(/titre du chapitre/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ordre/i)).toBeInTheDocument()
      expect(addChapterBtn).toBeDisabled()
    })

    test('should hide chapter form when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const addChapterBtn = screen.getByTestId('add-chapter-btn')
      await user.click(addChapterBtn)

      expect(screen.getByTestId('chapter-form-container')).toBeInTheDocument()

      const cancelBtn = screen.getByTestId('chapter-cancel-btn')
      await user.click(cancelBtn)

      expect(screen.queryByTestId('chapter-form-container')).not.toBeInTheDocument()
      expect(addChapterBtn).not.toBeDisabled()
    })

    test('should add chapter when chapter form is submitted', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const addChapterBtn = screen.getByTestId('add-chapter-btn')
      await user.click(addChapterBtn)

      await user.type(screen.getByTestId('chapter-title-input'), 'Introduction aux fonctions')
      await user.type(screen.getByTestId('chapter-description-input'), 'Ce chapitre couvre les bases des fonctions')
      await user.type(screen.getByTestId('chapter-order-input'), '1')

      const submitBtn = screen.getByTestId('chapter-submit-btn')
      await user.click(submitBtn)

      await waitFor(() => {
        expect(screen.queryByTestId('chapter-form-container')).not.toBeInTheDocument()
      })

      expect(screen.getByText('Introduction aux fonctions')).toBeInTheDocument()
      expect(screen.getByText('Ce chapitre couvre les bases des fonctions')).toBeInTheDocument()
      expect(screen.getByText('Ordre: 1')).toBeInTheDocument()
      expect(addChapterBtn).not.toBeDisabled()
    })

    test('should delete chapter when delete button is clicked', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        chapters: [
          { id: 'ch1', title: 'Introduction', description: 'Chapitre introductif', order: 1 },
        ],
      }

      render(
        <ProgramForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      const deleteBtn = screen.getByTestId('chapter-delete-ch1')
      await user.click(deleteBtn)

      await waitFor(() => {
        expect(screen.queryByText('Introduction')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('no-chapters-message')).toBeInTheDocument()
    })

    test('should reorder chapters up and down', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        chapters: [
          { id: 'ch1', title: 'Premier', description: 'Premier chapitre', order: 1 },
          { id: 'ch2', title: 'Deuxième', description: 'Deuxième chapitre', order: 2 },
          { id: 'ch3', title: 'Troisième', description: 'Troisième chapitre', order: 3 },
        ],
      }

      render(
        <ProgramForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      const chaptersList = screen.getByTestId('chapters-list')

      // Initial order
      expect(chaptersList.children[0]).toHaveTextContent('Premier')
      expect(chaptersList.children[1]).toHaveTextContent('Deuxième')
      expect(chaptersList.children[2]).toHaveTextContent('Troisième')

      // Move "Deuxième" up
      const upBtn = screen.getByTestId('chapter-up-ch2')
      await user.click(upBtn)

      await waitFor(() => {
        expect(chaptersList.children[0]).toHaveTextContent('Deuxième')
        expect(chaptersList.children[1]).toHaveTextContent('Premier')
        expect(chaptersList.children[2]).toHaveTextContent('Troisième')
      })

      // Move "Deuxième" down (now at index 0)
      const downBtn = screen.getByTestId('chapter-down-ch2')
      await user.click(downBtn)

      await waitFor(() => {
        expect(chaptersList.children[0]).toHaveTextContent('Premier')
        expect(chaptersList.children[1]).toHaveTextContent('Deuxième')
        expect(chaptersList.children[2]).toHaveTextContent('Troisième')
      })
    })

    test('should disable reorder buttons at boundaries', () => {
      const defaultValues = {
        chapters: [
          { id: 'ch1', title: 'Premier', description: 'Premier chapitre', order: 1 },
          { id: 'ch2', title: 'Deuxième', description: 'Deuxième chapitre', order: 2 },
        ],
      }

      render(
        <ProgramForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      const firstUpBtn = screen.getByTestId('chapter-up-ch1')
      const lastDownBtn = screen.getByTestId('chapter-down-ch2')

      expect(firstUpBtn).toBeDisabled()
      expect(lastDownBtn).toBeDisabled()
      expect(screen.getByTestId('chapter-down-ch1')).not.toBeDisabled()
      expect(screen.getByTestId('chapter-up-ch2')).not.toBeDisabled()
    })
  })

  describe('form Submission Tests', () => {
    test('should submit program without chapters', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      await user.type(screen.getByTestId('program-name-input'), 'Programme de Physique')
      await user.type(screen.getByTestId('program-code-input'), 'PHYSICS_6E')
      await user.selectOptions(screen.getByTestId('program-grade-select'), 'grade-1')

      const submitBtn = screen.getByTestId('submit-button')
      await user.click(submitBtn)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Programme de Physique',
            code: 'PHYSICS_6E',
            gradeId: 'grade-1',
            status: 'draft',
            chapters: [],
          }),
        )
      })
    })

    test('should submit program with chapters', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      // Fill program details
      await user.type(screen.getByTestId('program-name-input'), 'Programme de Chimie')
      await user.type(screen.getByTestId('program-code-input'), 'CHEM_6E')
      await user.selectOptions(screen.getByTestId('program-grade-select'), 'grade-2')

      // Add chapter
      const addChapterBtn = screen.getByTestId('add-chapter-btn')
      await user.click(addChapterBtn)

      await user.type(screen.getByTestId('chapter-title-input'), 'Introduction à la chimie')
      await user.type(screen.getByTestId('chapter-description-input'), 'Bases de la chimie')
      await user.type(screen.getByTestId('chapter-order-input'), '1')

      const chapterSubmitBtn = screen.getByTestId('chapter-submit-btn')
      await user.click(chapterSubmitBtn)

      // Submit program
      const programSubmitBtn = screen.getByTestId('submit-button')
      await user.click(programSubmitBtn)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Programme de Chimie',
            code: 'CHEM_6E',
            gradeId: 'grade-2',
            status: 'draft',
            chapters: expect.arrayContaining([
              expect.objectContaining({
                title: 'Introduction à la chimie',
                description: 'Bases de la chimie',
                order: 1,
              }),
            ]),
          }),
        )
      })
    })

    test('should include all chapters in submission order', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        chapters: [
          { id: 'ch1', title: 'Chapitre 1', order: 1 },
          { id: 'ch2', title: 'Chapitre 2', order: 2 },
        ],
      }

      render(
        <ProgramForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      await user.type(screen.getByTestId('program-name-input'), 'Updated Program')
      await user.selectOptions(screen.getByTestId('program-grade-select'), 'grade-1')

      const submitBtn = screen.getByTestId('submit-button')
      await user.click(submitBtn)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Program',
            chapters: [
              expect.objectContaining({ title: 'Chapitre 1', order: 1 }),
              expect.objectContaining({ title: 'Chapitre 2', order: 2 }),
            ],
          }),
        )
      })
    })

    test('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const cancelBtn = screen.getByTestId('cancel-button')
      await user.click(cancelBtn)

      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('should show loading state during submission', () => {
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          isSubmitting={true}
        />,
      )

      expect(screen.getByTestId('submit-button')).toBeDisabled()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Enregistrement...')
    })
  })

  describe('status Management Tests', () => {
    test('should handle different status transitions', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const statusSelect = screen.getByTestId('program-status-select')
      expect(statusSelect).toHaveValue('draft')

      await user.selectOptions(statusSelect, 'active')
      expect(statusSelect).toHaveValue('active')

      await user.type(screen.getByTestId('program-name-input'), 'Active Program')
      await user.type(screen.getByTestId('program-code-input'), 'ACTIVE')
      await user.selectOptions(screen.getByTestId('program-grade-select'), 'grade-1')

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'active',
          }),
        )
      })
    })

    test('should maintain status in edit mode', () => {
      const defaultValues = {
        name: 'Existing Program',
        code: 'EXIST',
        gradeId: 'grade-1',
        status: 'archived',
      }

      render(
        <ProgramForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      const statusSelect = screen.getByTestId('program-status-select')
      expect(statusSelect).toHaveValue('archived')
    })
  })

  describe('input Validation Tests', () => {
    test('should require name and code fields', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      // Try to submit without required fields
      const submitBtn = screen.getByTestId('submit-button')
      await user.click(submitBtn)

      // Form should not submit due to HTML5 validation
      expect(mockOnSubmit).not.toHaveBeenCalled()

      // Fill required fields
      await user.type(screen.getByTestId('program-name-input'), 'Test Program')
      await user.type(screen.getByTestId('program-code-input'), 'TEST')
      await user.selectOptions(screen.getByTestId('program-grade-select'), 'grade-1')

      await user.click(submitBtn)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    test('should require grade selection', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      await user.type(screen.getByTestId('program-name-input'), 'Test Program')
      await user.type(screen.getByTestId('program-code-input'), 'TEST')

      const submitBtn = screen.getByTestId('submit-button')
      await user.click(submitBtn)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('chapter Form Validation Tests', () => {
    test('should require chapter title and order', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const addChapterBtn = screen.getByTestId('add-chapter-btn')
      await user.click(addChapterBtn)

      const chapterSubmitBtn = screen.getByTestId('chapter-submit-btn')
      await user.click(chapterSubmitBtn)

      // Chapter form should not submit due to HTML5 validation
      expect(screen.getByTestId('chapter-form-container')).toBeInTheDocument()
      expect(screen.queryByText('Test Chapter')).not.toBeInTheDocument()

      await user.type(screen.getByTestId('chapter-title-input'), 'Test Chapter')
      await user.type(screen.getByTestId('chapter-order-input'), '1')
      await user.click(chapterSubmitBtn)

      await waitFor(() => {
        expect(screen.getByText('Test Chapter')).toBeInTheDocument()
      })
    })
  })

  describe('edge Cases and Error Handling', () => {
    test('should handle empty chapters array gracefully', async () => {
      const user = userEvent.setup()
      const defaultValues = { chapters: [] }

      render(
        <ProgramForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      expect(screen.getByTestId('no-chapters-message')).toBeInTheDocument()

      await user.type(screen.getByTestId('program-name-input'), 'Program without chapters')
      await user.type(screen.getByTestId('program-code-input'), 'EMPTY')
      await user.selectOptions(screen.getByTestId('program-grade-select'), 'grade-1')

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            chapters: [],
          }),
        )
      })
    })

    test('should handle adding multiple chapters', async () => {
      const user = userEvent.setup()
      render(
        <ProgramForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      // Add first chapter
      const addChapterBtn = screen.getByTestId('add-chapter-btn')
      await user.click(addChapterBtn)

      await user.type(screen.getByTestId('chapter-title-input'), 'Chapter 1')
      await user.type(screen.getByTestId('chapter-order-input'), '1')
      await user.click(screen.getByTestId('chapter-submit-btn'))

      // Add second chapter
      await user.click(addChapterBtn)
      await user.type(screen.getByTestId('chapter-title-input'), 'Chapter 2')
      await user.type(screen.getByTestId('chapter-order-input'), '2')
      await user.click(screen.getByTestId('chapter-submit-btn'))

      expect(screen.getByText('Chapter 1')).toBeInTheDocument()
      expect(screen.getByText('Chapter 2')).toBeInTheDocument()
    })
  })
})
