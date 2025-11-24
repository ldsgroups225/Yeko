import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { SchoolForm } from './school-form'

// Mock the necessary UI components that might not be directly needed for testing
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button type="submit" {...props}>{children}</button>,
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
    <select value={value} onChange={e => onValueChange?.(e.target.value)} id="status" name="status">
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <option value="" disabled>{placeholder}</option>,
}))

// Mock zodResolver and CreateSchoolSchema separately
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => (data: any) => {
    // Basic validation for testing
    if (!data.name || data.name.length < 2) {
      return {
        values: data,
        errors: {
          name: {
            message: 'Le nom doit contenir au moins 2 caractères',
          },
        },
      }
    }
    if (!data.code || data.code.length < 2) {
      return {
        values: data,
        errors: {
          code: {
            message: 'Le code doit contenir au moins 2 caractères',
          },
        },
      }
    }
    if (data.email && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(data.email)) {
      return {
        values: data,
        errors: {
          email: {
            message: 'Email invalide',
          },
        },
      }
    }
    if (data.phone && !/^\+?[\d\s()-]*$/.test(data.phone)) {
      return {
        values: data,
        errors: {
          phone: {
            message: 'Le numéro de téléphone doit être valide',
          },
        },
      }
    }
    if (data.logoUrl && !/^https?:\/\/.+/.test(data.logoUrl)) {
      return {
        values: data,
        errors: {
          logoUrl: {
            message: 'URL invalide pour le logo',
          },
        },
      }
    }
    return { values: data, errors: {} }
  }),
}))

vi.mock('@/schemas/school', () => ({
  CreateSchoolSchema: {
    parse: vi.fn(data => data), // Simple mock for parse
    safeParse: vi.fn(data => ({ success: true, data })), // Simple mock for safeParse
  },
}))

describe('schoolForm Component', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>
  let mockOnCancel: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnSubmit = vi.fn()
    mockOnCancel = vi.fn()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering Tests', () => {
    test('should render all form fields correctly', () => {
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      // Check for all required fields
      expect(screen.getByLabelText(/nom de l'école/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/code de l'école/i)).toBeInTheDocument()

      // Check for optional fields
      expect(screen.getByLabelText(/adresse$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/numéro de téléphone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/statut/i)).toBeInTheDocument()

      // Check for logo upload section
      expect(screen.getByText(/logo de l'école/i)).toBeInTheDocument()
      expect(screen.getByText(/télécharger un fichier/i)).toBeInTheDocument()
      expect(screen.getByText(/url du logo/i)).toBeInTheDocument()

      // Check for action buttons
      expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer l'école/i })).toBeInTheDocument()
    })

    test('should display correct placeholders', () => {
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const nameInput = screen.getByLabelText(/nom de l'école/i) as HTMLInputElement
      const codeInput = screen.getByLabelText(/code de l'école/i) as HTMLInputElement
      const addressInput = screen.getByLabelText(/adresse$/i) as HTMLInputElement
      const phoneInput = screen.getByLabelText(/numéro de téléphone/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/adresse email/i) as HTMLInputElement

      expect(nameInput.placeholder).toBe('Entrer le nom de l\'école')
      expect(codeInput.placeholder).toBe('e.g., LYCE_ST_EXUPERY')
      expect(addressInput.placeholder).toBe('123 Avenue de la République, Paris')
      expect(phoneInput.placeholder).toBe('+33 1 23 45 67 89')
      expect(emailInput.placeholder).toBe('contact@ecole.fr')
    })

    test('should show edit mode text when mode is edit', () => {
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          isSubmitting={false}
        />,
      )

      expect(screen.getByRole('button', { name: /enregistrer les modifications/i })).toBeInTheDocument()
    })

    test('should display loading state when submitting', () => {
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          isSubmitting={true}
        />,
      )

      expect(screen.getByRole('button', { name: /création en cours/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /création en cours/i })).toBeDisabled()
    })
  })

  describe('input Handling Tests', () => {
    test('should accept text input in name field', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const nameInput = screen.getByLabelText(/nom de l'école/i)
      await user.type(nameInput, 'Test School')

      expect(nameInput).toHaveValue('Test School')
    })

    test('should accept code input', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const codeInput = screen.getByLabelText(/code de l'école/i)
      await user.type(codeInput, 'TEST_SCHOOL')

      expect(codeInput).toHaveValue('TEST_SCHOOL')
    })

    test('should accept email input', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const emailInput = screen.getByLabelText(/adresse email/i)
      await user.type(emailInput, 'test@school.com')

      expect(emailInput).toHaveValue('test@school.com')
    })

    test('should accept phone input', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const phoneInput = screen.getByLabelText(/numéro de téléphone/i)
      await user.type(phoneInput, '+33 1 23 45 67 89')

      expect(phoneInput).toHaveValue('+33 1 23 45 67 89')
    })

    test('should work with status dropdown', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const statusSelect = screen.getByLabelText(/statut/i)
      expect(statusSelect).toHaveValue('active') // Default value

      await user.selectOptions(statusSelect, 'inactive')
      expect(statusSelect).toHaveValue('inactive')
    })
  })

  describe('validation Tests', () => {
    test('should show error for missing required name field', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const submitButton = screen.getByRole('button', { name: /créer l'école/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Le nom doit contenir au moins 2 caractères/i)).toBeInTheDocument()
      })
    })

    test('should show error for missing required code field', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const submitButton = screen.getByRole('button', { name: /créer l'école/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Le code doit contenir au moins 2 caractères/i)).toBeInTheDocument()
      })
    })

    test('should show error for invalid email format', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const nameInput = screen.getByLabelText(/nom de l'école/i)
      const codeInput = screen.getByLabelText(/code de l'école/i)
      const emailInput = screen.getByLabelText(/adresse email/i)

      await user.type(nameInput, 'Test School')
      await user.type(codeInput, 'TEST001')
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /créer l'école/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Email invalide/i)).toBeInTheDocument()
      })
    })

    test('should show error for invalid phone format', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const nameInput = screen.getByLabelText(/nom de l'école/i)
      const codeInput = screen.getByLabelText(/code de l'école/i)
      const phoneInput = screen.getByLabelText(/numéro de téléphone/i)

      await user.type(nameInput, 'Test School')
      await user.type(codeInput, 'TEST001')
      await user.type(phoneInput, 'invalid-phone-123!')

      const submitButton = screen.getByRole('button', { name: /créer l'école/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Le numéro de téléphone doit être valide/i)).toBeInTheDocument()
      })
    })

    test('should not show error for valid email format', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const nameInput = screen.getByLabelText(/nom de l'école/i)
      const codeInput = screen.getByLabelText(/code de l'école/i)
      const emailInput = screen.getByLabelText(/adresse email/i)

      await user.type(nameInput, 'Test School')
      await user.type(codeInput, 'TEST001')
      await user.type(emailInput, 'valid@email.com')

      const submitButton = screen.getByRole('button', { name: /créer l'école/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test School',
            code: 'TEST001',
            email: 'valid@email.com',
          }),
        )
      })
    })
  })

  describe('file Upload Tests', () => {
    test('should handle file upload and base64 conversion', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onloadend: vi.fn(),
        result: 'data:image/png;base64,mockbase64data',
      }
      globalThis.FileReader = vi.fn(() => mockFileReader) as any

      const fileInput = screen.getByLabelText(/télécharger un fichier/i)
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      await user.upload(fileInput, file)

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file)

      // Simulate successful file read wrapped in act
      await act(async () => {
        mockFileReader.onloadend()
      })

      await waitFor(() => {
        // Check if logo preview would be shown
        expect(screen.getByAltText(/logo preview/i)).toBeInTheDocument()
      })
    })

    test('should reject files larger than 2MB', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      // Mock console.error to avoid test output pollution
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      const fileInput = screen.getByLabelText(/télécharger un fichier/i)
      const largeFile = new File(['test'], 'large.png', { type: 'image/png' })
      Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 }) // 3MB

      await user.upload(fileInput, largeFile)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Le fichier est trop volumineux. Taille maximale: 2MB',
        )
      })

      consoleSpy.mockRestore()
    })

    test('should remove logo when remove button is clicked', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        name: 'Test School',
        code: 'TEST001',
        logoUrl: 'https://example.com/logo.png',
      }

      render(
        <SchoolForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      // Find and click the remove button
      const removeButton = screen.getByRole('button', { name: '' }) // The X button has no text
      await user.click(removeButton)

      // Verify logo URL is cleared
      const logoUrlInput = screen.getByLabelText(/url du logo/i)
      expect(logoUrlInput).toHaveValue('')
    })
  })

  describe('form Submission Tests', () => {
    test('should submit valid form data', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      // Fill in required fields
      const nameInput = screen.getByLabelText(/nom de l'école/i)
      const codeInput = screen.getByLabelText(/code de l'école/i)

      await user.type(nameInput, 'Test School')
      await user.type(codeInput, 'TEST001')

      const submitButton = screen.getByRole('button', { name: /créer l'école/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test School',
            code: 'TEST001',
            status: 'active',
            settings: {},
          }),
        )
      })
    })

    test('should not submit form with missing required fields', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const submitButton = screen.getByRole('button', { name: /créer l'école/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })

      // Should show validation errors
      expect(screen.getByText(/Le nom doit contenir au moins 2 caractères/i)).toBeInTheDocument()
      expect(screen.getByText(/Le code doit contenir au moins 2 caractères/i)).toBeInTheDocument()
    })

    test('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      const cancelButton = screen.getByRole('button', { name: /annuler/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('should disable submit button during submission', async () => {
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
          isSubmitting={true}
        />,
      )

      const submitButton = screen.getByRole('button', { name: /création en cours/i })
      expect(submitButton).toBeDisabled()
    })

    test('should submit form with all optional fields', async () => {
      const user = userEvent.setup()
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      // Fill all fields
      await user.type(screen.getByLabelText(/nom de l'école/i), 'Complete School')
      await user.type(screen.getByLabelText(/code de l'école/i), 'COMPLETE001')
      await user.type(screen.getByLabelText(/adresse/i), '123 Test Street')
      await user.type(screen.getByLabelText(/numéro de téléphone/i), '+33 1 23 45 67 89')
      await user.type(screen.getByLabelText(/adresse email/i), 'complete@school.com')
      await user.type(screen.getByLabelText(/url du logo/i), 'https://example.com/logo.png')
      await user.selectOptions(screen.getByLabelText(/statut/i), 'active')

      const submitButton = screen.getByRole('button', { name: /créer l'école/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Complete School',
            code: 'COMPLETE001',
            address: '123 Test Street',
            phone: '+33 1 23 45 67 89',
            email: 'complete@school.com',
            logoUrl: 'https://example.com/logo.png',
            status: 'active',
            settings: {},
          }),
        )
      })
    })
  })

  describe('default Values and Edit Mode Tests', () => {
    test('should populate form with default values', () => {
      const defaultValues = {
        name: 'Existing School',
        code: 'EXIST001',
        address: '456 Existing St',
        phone: '+33 9 87 65 43 21',
        email: 'existing@school.com',
        logoUrl: 'https://example.com/existing-logo.png',
        status: 'inactive' as const,
        settings: { theme: 'dark' },
      }

      render(
        <SchoolForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      expect(screen.getByLabelText(/nom de l'école/i)).toHaveValue('Existing School')
      expect(screen.getByLabelText(/code de l'école/i)).toHaveValue('EXIST001')
      expect(screen.getByLabelText(/adresse/i)).toHaveValue('456 Existing St')
      expect(screen.getByLabelText(/numéro de téléphone/i)).toHaveValue('+33 9 87 65 43 21')
      expect(screen.getByLabelText(/adresse email/i)).toHaveValue('existing@school.com')
      expect(screen.getByLabelText(/url du logo/i)).toHaveValue('https://example.com/existing-logo.png')
      expect(screen.getByLabelText(/statut/i)).toHaveValue('inactive')
    })

    test('should show correct button text for edit mode', () => {
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      expect(screen.getByRole('button', { name: /enregistrer les modifications/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    })

    test('should show correct button text for create mode', () => {
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      expect(screen.getByRole('button', { name: /créer l'école/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    })
  })

  describe('logo Preview Tests', () => {
    test('should show logo preview when logoUrl is provided', () => {
      const defaultValues = {
        name: 'Test School',
        code: 'TEST001',
        logoUrl: 'https://example.com/logo.png',
      }

      render(
        <SchoolForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
        />,
      )

      const logoImg = screen.getByAltText(/logo preview/i)
      expect(logoImg).toBeInTheDocument()
      expect(logoImg).toHaveAttribute('src', 'https://example.com/logo.png')
    })

    test('should show placeholder when no logo is provided', () => {
      render(
        <SchoolForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />,
      )

      expect(screen.getByAltText(/logo preview/i)).not.toBeInTheDocument()
      expect(screen.getByText(/Ou/i)).toBeInTheDocument() // Divider text
    })
  })
})
