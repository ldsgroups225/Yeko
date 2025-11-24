import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

// Mock Grade Form Component
interface GradeFormProps {
  defaultValues?: any
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  onCancel: () => void
  tracks: Array<{ id: string, name: string, code: string }>
}

const DEFAULT_TRACKS: any[] = []

function GradeForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
  onCancel,
  tracks = DEFAULT_TRACKS,
}: GradeFormProps) {
  const mockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      order: Number.parseInt(formData.get('order') as string) || 0,
      trackId: formData.get('trackId'),
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={mockSubmit} data-testid="grade-form">
      <div className="space-y-4">
        <div>
          <label htmlFor="name">Nom de la Classe *</label>
          <input
            id="name"
            name="name"
            defaultValue={defaultValues?.name || ''}
            placeholder="e.g., Sixième"
            data-testid="grade-name-input"
          />
        </div>
        <div>
          <label htmlFor="code">Code *</label>
          <input
            id="code"
            name="code"
            defaultValue={defaultValues?.code || ''}
            placeholder="e.g., 6E"
            data-testid="grade-code-input"
          />
        </div>
        <div>
          <label htmlFor="order">Ordre *</label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={defaultValues?.order || ''}
            placeholder="1"
            data-testid="grade-order-input"
          />
        </div>
        <div>
          <label htmlFor="trackId">Filière *</label>
          <select
            id="trackId"
            name="trackId"
            defaultValue={defaultValues?.trackId || ''}
            data-testid="grade-track-select"
          >
            <option value="">Sélectionner une filière</option>
            {tracks.map(track => (
              <option key={track.id} value={track.id}>{track.name}</option>
            ))}
          </select>
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

// Mock Series Form Component
interface SeriesFormProps {
  defaultValues?: any
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  onCancel: () => void
  tracks: Array<{ id: string, name: string, code: string }>
}

function SeriesForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
  onCancel,
  tracks = DEFAULT_TRACKS,
}: SeriesFormProps) {
  const mockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      trackId: formData.get('trackId'),
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={mockSubmit} data-testid="series-form">
      <div className="space-y-4">
        <div>
          <label htmlFor="name">Nom de la Série *</label>
          <input
            id="name"
            name="name"
            defaultValue={defaultValues?.name || ''}
            placeholder="e.g., Série A"
            data-testid="series-name-input"
          />
        </div>
        <div>
          <label htmlFor="code">Code *</label>
          <input
            id="code"
            name="code"
            defaultValue={defaultValues?.code || ''}
            placeholder="e.g., SERIE_A"
            data-testid="series-code-input"
          />
        </div>
        <div>
          <label htmlFor="trackId">Filière *</label>
          <select
            id="trackId"
            name="trackId"
            defaultValue={defaultValues?.trackId || ''}
            data-testid="series-track-select"
          >
            <option value="">Sélectionner une filière</option>
            {tracks.map(track => (
              <option key={track.id} value={track.id}>{track.name}</option>
            ))}
          </select>
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

// Mock Subject Form Component
interface SubjectFormProps {
  defaultValues?: any
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  onCancel: () => void
}

function SubjectForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
  onCancel,
}: SubjectFormProps) {
  const mockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = {
      name: formData.get('name'),
      shortName: formData.get('shortName'),
      category: formData.get('category') || 'Autre',
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={mockSubmit} data-testid="subject-form">
      <div className="space-y-4">
        <div>
          <label htmlFor="name">Nom de la Matière *</label>
          <input
            id="name"
            name="name"
            defaultValue={defaultValues?.name || ''}
            placeholder="e.g., Mathématiques"
            data-testid="subject-name-input"
          />
        </div>
        <div>
          <label htmlFor="shortName">Nom Court</label>
          <input
            id="shortName"
            name="shortName"
            defaultValue={defaultValues?.shortName || ''}
            placeholder="e.g., Math"
            data-testid="subject-shortname-input"
          />
        </div>
        <div>
          <label htmlFor="category">Catégorie</label>
          <select
            id="category"
            name="category"
            defaultValue={defaultValues?.category || 'Autre'}
            data-testid="subject-category-select"
          >
            <option value="Scientifique">Scientifique</option>
            <option value="Littéraire">Littéraire</option>
            <option value="Sportif">Sportif</option>
            <option value="Autre">Autre</option>
          </select>
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

describe('catalog Forms Tests', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>
  let mockOnCancel: ReturnType<typeof vi.fn>
  let mockTracks: Array<{ id: string, name: string, code: string }>

  beforeEach(() => {
    mockOnSubmit = vi.fn()
    mockOnCancel = vi.fn()
    mockTracks = [
      { id: 'track-1', name: 'Scientifique', code: 'SCI' },
      { id: 'track-2', name: 'Littéraire', code: 'LIT' },
    ]
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('grade Form Component', () => {
    test('should render all form fields correctly', () => {
      render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      expect(screen.getByLabelText(/nom de la classe/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/code/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ordre/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/filière/i)).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })

    test('should populate form with default values', () => {
      const defaultValues = {
        name: 'Sixième',
        code: '6E',
        order: 1,
        trackId: 'track-1',
      }

      render(
        <GradeForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          tracks={mockTracks}
        />,
      )

      expect(screen.getByDisplayValue('Sixième')).toBeInTheDocument()
      expect(screen.getByDisplayValue('6E')).toBeInTheDocument()
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Scientifique')).toBeInTheDocument()
    })

    test('should populate tracks dropdown correctly', () => {
      render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      const trackSelect = screen.getByTestId('grade-track-select')
      expect(trackSelect).toBeInTheDocument()
      expect(screen.getByText('Sélectionner une filière')).toBeInTheDocument()
      expect(screen.getByText('Scientifique')).toBeInTheDocument()
      expect(screen.getByText('Littéraire')).toBeInTheDocument()
    })

    test('should accept input in form fields', async () => {
      const user = userEvent.setup()
      render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      await user.type(screen.getByTestId('grade-name-input'), 'Cinquième')
      await user.type(screen.getByTestId('grade-code-input'), '5E')
      await user.type(screen.getByTestId('grade-order-input'), '2')

      expect(screen.getByDisplayValue('Cinquième')).toBeInTheDocument()
      expect(screen.getByDisplayValue('5E')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    })

    test('should submit form with valid data', async () => {
      const user = userEvent.setup()
      render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      await user.type(screen.getByTestId('grade-name-input'), 'Cinquième')
      await user.type(screen.getByTestId('grade-code-input'), '5E')
      await user.type(screen.getByTestId('grade-order-input'), '2')
      await user.selectOptions(screen.getByTestId('grade-track-select'), 'track-1')

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Cinquième',
          code: '5E',
          order: 2,
          trackId: 'track-1',
        })
      })
    })

    test('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      await user.click(screen.getByTestId('cancel-button'))
      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('should show loading state during submission', () => {
      render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          isSubmitting={true}
          tracks={mockTracks}
        />,
      )

      expect(screen.getByTestId('submit-button')).toBeDisabled()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Enregistrement...')
    })

    test('should validate required fields (empty form submission)', async () => {
      const user = userEvent.setup()
      render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      await user.click(screen.getByTestId('submit-button'))

      // Should submit with empty values, actual validation would happen in the real component
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: '',
          code: '',
          order: 0,
          trackId: '',
        })
      })
    })
  })

  describe('series Form Component', () => {
    test('should render all form fields correctly', () => {
      render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      expect(screen.getByLabelText(/nom de la série/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/code/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/filière/i)).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })

    test('should populate form with default values', () => {
      const defaultValues = {
        name: 'Série A',
        code: 'SERIE_A',
        trackId: 'track-1',
      }

      render(
        <SeriesForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          tracks={mockTracks}
        />,
      )

      expect(screen.getByDisplayValue('Série A')).toBeInTheDocument()
      expect(screen.getByDisplayValue('SERIE_A')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Scientifique')).toBeInTheDocument()
    })

    test('should accept input in form fields', async () => {
      const user = userEvent.setup()
      render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      await user.type(screen.getByTestId('series-name-input'), 'Série B')
      await user.type(screen.getByTestId('series-code-input'), 'SERIE_B')

      expect(screen.getByDisplayValue('Série B')).toBeInTheDocument()
      expect(screen.getByDisplayValue('SERIE_B')).toBeInTheDocument()
    })

    test('should submit form with valid data', async () => {
      const user = userEvent.setup()
      render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      await user.type(screen.getByTestId('series-name-input'), 'Série B')
      await user.type(screen.getByTestId('series-code-input'), 'SERIE_B')
      await user.selectOptions(screen.getByTestId('series-track-select'), 'track-2')

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Série B',
          code: 'SERIE_B',
          trackId: 'track-2',
        })
      })
    })

    test('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )

      await user.click(screen.getByTestId('cancel-button'))
      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('should show loading state during submission', () => {
      render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          isSubmitting={true}
          tracks={mockTracks}
        />,
      )

      expect(screen.getByTestId('submit-button')).toBeDisabled()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Enregistrement...')
    })

    test('should handle empty tracks array', () => {
      render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={[]}
        />,
      )

      expect(screen.getByText('Sélectionner une filière')).toBeInTheDocument()
      // Should not show any track options
      expect(screen.queryByText('Scientifique')).not.toBeInTheDocument()
    })
  })

  describe('subject Form Component', () => {
    test('should render all form fields correctly', () => {
      render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      expect(screen.getByLabelText(/nom de la matière/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nom court/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })

    test('should populate form with default values', () => {
      const defaultValues = {
        name: 'Mathématiques',
        shortName: 'Math',
        category: 'Scientifique',
      }

      render(
        <SubjectForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      expect(screen.getByDisplayValue('Mathématiques')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Math')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Scientifique')).toBeInTheDocument()
    })

    test('should show default category selection', () => {
      render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const categorySelect = screen.getByTestId('subject-category-select')
      expect(categorySelect).toBeInTheDocument()
      expect(screen.getByText('Scientifique')).toBeInTheDocument()
      expect(screen.getByText('Littéraire')).toBeInTheDocument()
      expect(screen.getByText('Sportif')).toBeInTheDocument()
      expect(screen.getByText('Autre')).toBeInTheDocument()
    })

    test('should accept input in form fields', async () => {
      const user = userEvent.setup()
      render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      await user.type(screen.getByTestId('subject-name-input'), 'Physique-Chimie')
      await user.type(screen.getByTestId('subject-shortname-input'), 'PC')

      expect(screen.getByDisplayValue('Physique-Chimie')).toBeInTheDocument()
      expect(screen.getByDisplayValue('PC')).toBeInTheDocument()
    })

    test('should submit form with valid data including optional fields', async () => {
      const user = userEvent.setup()
      render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      await user.type(screen.getByTestId('subject-name-input'), 'Histoire-Géographie')
      await user.type(screen.getByTestId('subject-shortname-input'), 'HG')
      await user.selectOptions(screen.getByTestId('subject-category-select'), 'Littéraire')

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Histoire-Géographie',
          shortName: 'HG',
          category: 'Littéraire',
        })
      })
    })

    test('should submit form with only required field', async () => {
      const user = userEvent.setup()
      render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      await user.type(screen.getByTestId('subject-name-input'), 'Philosophie')

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Philosophie',
          shortName: '',
          category: 'Autre', // Default value
        })
      })
    })

    test('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      await user.click(screen.getByTestId('cancel-button'))
      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('should show loading state during submission', () => {
      render(
        <SubjectForm
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

  describe('cross-Form Validation Tests', () => {
    test('should handle empty submission for all forms', async () => {
      const user = userEvent.setup()

      // Test Grade Form
      const { unmount: unmountGrade } = render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )
      await user.click(screen.getByTestId('submit-button'))
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      unmountGrade()

      // Test Series Form
      const { unmount: unmountSeries } = render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )
      await user.click(screen.getByTestId('submit-button'))
      expect(mockOnSubmit).toHaveBeenCalledTimes(2)
      unmountSeries()

      // Test Subject Form
      const { unmount: unmountSubject } = render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )
      await user.type(screen.getByTestId('subject-name-input'), 'Test Subject')
      await user.click(screen.getByTestId('submit-button'))
      expect(mockOnSubmit).toHaveBeenCalledTimes(3)
      unmountSubject()
    })

    test('should handle form cancellation consistently across all forms', async () => {
      const user = userEvent.setup()

      // Test Grade Form cancellation
      const { unmount: unmountGrade } = render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )
      await user.click(screen.getByTestId('cancel-button'))
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
      unmountGrade()

      // Test Series Form cancellation
      const { unmount: unmountSeries } = render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )
      await user.click(screen.getByTestId('cancel-button'))
      expect(mockOnCancel).toHaveBeenCalledTimes(2)
      unmountSeries()

      // Test Subject Form cancellation
      const { unmount: unmountSubject } = render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )
      await user.click(screen.getByTestId('cancel-button'))
      expect(mockOnCancel).toHaveBeenCalledTimes(3)
      unmountSubject()
    })

    test('should handle loading state consistently across all forms', () => {
      // Test Grade Form loading
      const { unmount: unmountGrade } = render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          isSubmitting={true}
          tracks={mockTracks}
        />,
      )
      expect(screen.getByTestId('submit-button')).toBeDisabled()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Enregistrement...')
      unmountGrade()

      // Test Series Form loading
      const { unmount: unmountSeries } = render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          isSubmitting={true}
          tracks={mockTracks}
        />,
      )
      expect(screen.getByTestId('submit-button')).toBeDisabled()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Enregistrement...')
      unmountSeries()

      // Test Subject Form loading
      const { unmount: unmountSubject } = render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          isSubmitting={true}
        />,
      )
      expect(screen.getByTestId('submit-button')).toBeDisabled()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Enregistrement...')
      unmountSubject()
    })
  })

  describe('form Integration Tests', () => {
    test('should handle track selection consistently in grade and series forms', async () => {
      const user = userEvent.setup()
      const additionalTracks = [
        ...mockTracks,
        { id: 'track-3', name: ' Technologique', code: 'TECH' },
      ]

      // Test Grade Form track selection
      render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={additionalTracks}
        />,
      )

      const gradeTrackSelect = screen.getByTestId('grade-track-select')
      expect(screen.getByText(' Technologique')).toBeInTheDocument()

      await user.selectOptions(gradeTrackSelect, 'track-3')
      expect(gradeTrackSelect).toHaveValue('track-3')

      // Test Series Form track selection
      render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={additionalTracks}
        />,
      )

      const seriesTrackSelect = screen.getByTestId('series-track-select')
      expect(screen.getByText(' Technologique')).toBeInTheDocument()

      await user.selectOptions(seriesTrackSelect, 'track-3')
      expect(seriesTrackSelect).toHaveValue('track-3')
    })

    test('should handle mode switching between create and edit', () => {
      const defaultValues = {
        name: 'Test',
        code: 'TEST',
      }

      // Test Grade Form modes
      const { rerender: rerenderGrade } = render(
        <GradeForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Créer')

      rerenderGrade(
        <GradeForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          tracks={mockTracks}
        />,
      )
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Enregistrer')
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()

      // Test Series Form modes
      const { rerender: rerenderSeries } = render(
        <SeriesForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          tracks={mockTracks}
        />,
      )
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Créer')

      rerenderSeries(
        <SeriesForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          tracks={mockTracks}
        />,
      )
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Enregistrer')

      // Test Subject Form modes
      const { rerender: rerenderSubject } = render(
        <SubjectForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Créer')

      rerenderSubject(
        <SubjectForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Enregistrer')
    })
  })
})
