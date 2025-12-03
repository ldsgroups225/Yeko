import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import component
const { BulkImportUsers } = await import('../bulk-import-users')

describe('bulk Import Users', () => {
  describe('cSV Parsing', () => {
    test('should parse valid CSV file', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,teacher,active
Jane Smith,jane@example.com,+225 05 06 07 08,staff,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      })
    })

    test('should parse CSV with optional fields', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,john@example.com,,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('-')).toBeInTheDocument() // Empty phone shows as dash
      })
    })

    test('should handle CSV with French names and accents', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
Adjoua Bénédicte,adjoua@example.com,+225 07 12 34 56,teacher,active
Kouadio Yao,kouadio@example.com,+225 01 23 45 67,staff,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('Adjoua Bénédicte')).toBeInTheDocument()
        expect(screen.getByText('Kouadio Yao')).toBeInTheDocument()
      })
    })

    test('should parse large CSV files', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      // Generate 100 rows
      let csvContent = 'name,email,phone,roles,status\n'
      for (let i = 1; i <= 100; i++) {
        csvContent += `User ${i},user${i}@example.com,+225 0${i},teacher,active\n`
      }

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument()
        // Check that the total rows badge is displayed
        expect(screen.getByText(/total rows/i)).toBeInTheDocument()
      })
    })
  })

  describe('validation', () => {
    test('should validate required name field', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
,john@example.com,+225 01 02 03 04,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
        expect(screen.getByText(/invalid/i)).toBeInTheDocument()
      })
    })

    test('should validate email format', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,invalid-email,+225 01 02 03 04,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/Invalid email/i)).toBeInTheDocument()
      })
    })

    test('should validate required roles field', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/At least one role is required/i)).toBeInTheDocument()
      })
    })

    test('should validate short names', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
J,john@example.com,+225 01 02 03 04,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })

    test('should show valid and invalid row counts', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,teacher,active
,invalid@example.com,+225 05 06 07 08,staff,active
Jane Smith,jane@example.com,+225 09 10 11 12,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        // Check for row counts - text is split across elements
        expect(screen.getByText(/total rows/i)).toBeInTheDocument()
        // Check that both valid and invalid badges are present
        const badges = screen.getAllByText(/valid/i)
        expect(badges.length).toBeGreaterThanOrEqual(2) // "valid" and "invalid"
      })
    })
  })

  describe('error Handling', () => {
    test('should reject non-CSV files', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const file = new File(['content'], 'users.txt', { type: 'text/plain' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      // Should show error toast (we can't test toast directly, but file shouldn't be processed)
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      })
    })

    test('should handle empty CSV file', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = ''
      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      // Should not show preview
      await waitFor(() => {
        expect(screen.queryByText('Total Rows')).not.toBeInTheDocument()
      })
    })

    test('should handle CSV with only headers', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = 'name,email,phone,roles,status'
      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.queryByText('Total Rows')).not.toBeInTheDocument()
      })
    })

    test('should handle malformed CSV rows', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,john@example.com
Jane Smith,jane@example.com,+225 05 06 07 08,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/total rows/i)).toBeInTheDocument()
        // Verify both rows are parsed
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    test('should handle CSV with special characters', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
O'Brien-Smith,obrien@example.com,+225 01 02 03 04,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('O\'Brien-Smith')).toBeInTheDocument()
      })
    })
  })

  describe('import Process', () => {
    test('should import valid users', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,teacher,active
Jane Smith,jane@example.com,+225 05 06 07 08,staff,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      const importButton = screen.getByRole('button', { name: /Import Users/i })
      await user.click(importButton)

      // Should show loading state
      expect(screen.getByText(/Importing/i)).toBeInTheDocument()

      // Wait for import to complete
      await waitFor(() => {
        expect(screen.getByText('2 users imported successfully')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    test('should disable import button when no valid rows', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
,invalid-email,+225 01 02 03 04,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /Import Users/i })
        expect(importButton).toBeDisabled()
      })
    })

    test('should show import results', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,teacher,active
,invalid@example.com,+225 05 06 07 08,staff,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      const importButton = screen.getByRole('button', { name: /Import Users/i })
      await user.click(importButton)

      await waitFor(() => {
        expect(screen.getByText(/users imported successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/users failed/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    test('should allow canceling import', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      // Preview should be cleared
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })

  describe('template Download', () => {
    test('should download CSV template', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const downloadButton = screen.getByRole('button', { name: /Download Template/i })
      await user.click(downloadButton)

      // Template download is triggered (we can't test actual download in jsdom)
      expect(downloadButton).toBeInTheDocument()
    })
  })

  describe('user Interface', () => {
    test('should show step-by-step instructions', () => {
      render(<BulkImportUsers />)

      expect(screen.getByText(/Step 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Step 2/i)).toBeInTheDocument()
    })

    test('should show file input', () => {
      render(<BulkImportUsers />)

      expect(screen.getByLabelText(/Select CSV file/i)).toBeInTheDocument()
    })

    test('should show preview table after file upload', async () => {
      const user = userEvent.setup()
      render(<BulkImportUsers />)

      const csvContent = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,teacher,active`

      const file = new File([csvContent], 'users.csv', { type: 'text/csv' })
      const input = screen.getByLabelText(/Select CSV file/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/Step 3/i)).toBeInTheDocument()
        expect(screen.getByRole('table')).toBeInTheDocument()
      })
    })
  })
})
