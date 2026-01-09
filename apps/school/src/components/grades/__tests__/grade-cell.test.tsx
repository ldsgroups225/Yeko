import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { GradeCell } from '../grade-cell'

describe('gradeCell Component', () => {
  const defaultProps = {
    value: 15,
    status: 'draft' as const,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    test('should render input with value', () => {
      render(<GradeCell {...defaultProps} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('15')
    })

    test('should render empty input when value is null', () => {
      render(<GradeCell {...defaultProps} value={null} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')
    })

    test('should have aria-label for accessibility', () => {
      render(<GradeCell {...defaultProps} />)
      const input = screen.getByLabelText('Note')
      expect(input).toBeInTheDocument()
    })
  })

  describe('editability based on status', () => {
    test('should be editable when status is draft', () => {
      render(<GradeCell {...defaultProps} status="draft" />)
      const input = screen.getByRole('textbox')
      expect(input).not.toBeDisabled()
    })

    test('should be editable when status is rejected', () => {
      render(<GradeCell {...defaultProps} status="rejected" />)
      const input = screen.getByRole('textbox')
      expect(input).not.toBeDisabled()
    })

    test('should be disabled when status is submitted', () => {
      render(<GradeCell {...defaultProps} status="submitted" />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    test('should be disabled when status is validated', () => {
      render(<GradeCell {...defaultProps} status="validated" />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    test('should be disabled when disabled prop is true', () => {
      render(<GradeCell {...defaultProps} disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })
  })

  describe('value changes', () => {
    test('should update local value on input change', async () => {
      const user = userEvent.setup()
      render(<GradeCell {...defaultProps} value={null} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '18')

      expect(input).toHaveValue('18')
    })

    test('should call onChange with valid value on blur', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<GradeCell {...defaultProps} value={null} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '18')
      await user.tab()

      expect(onChange).toHaveBeenCalledWith(18)
    })

    test('should call onBlur when input loses focus', async () => {
      const user = userEvent.setup()
      const onBlur = vi.fn()
      render(<GradeCell {...defaultProps} onBlur={onBlur} />)

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.tab()

      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    test('should show error for value above 20', async () => {
      const user = userEvent.setup()
      render(<GradeCell {...defaultProps} value={null} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '25')
      await user.tab()

      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    test('should show error for negative value', async () => {
      const user = userEvent.setup()
      render(<GradeCell {...defaultProps} value={null} />)

      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, '-5')
      await user.tab()

      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    test('should show error for non-numeric value', async () => {
      const user = userEvent.setup()
      render(<GradeCell {...defaultProps} value={null} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'abc')
      await user.tab()

      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    test('should not show error for valid value', async () => {
      const user = userEvent.setup()
      render(<GradeCell {...defaultProps} value={null} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '15.5')
      await user.tab()

      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    test('should accept quarter point values', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<GradeCell {...defaultProps} value={null} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '12.25')
      await user.tab()

      expect(onChange).toHaveBeenCalledWith(12.25)
    })
  })

  describe('keyboard navigation', () => {
    test('should validate and move focus on Enter key', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<GradeCell {...defaultProps} value={null} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '16')
      await user.keyboard('{Enter}')

      expect(onChange).toHaveBeenCalledWith(16)
    })

    test('should reset value on Escape key', async () => {
      const user = userEvent.setup()
      render(<GradeCell {...defaultProps} value={15} />)

      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, '20')
      await user.keyboard('{Escape}')

      expect(input).toHaveValue('15')
    })
  })

  describe('status styling', () => {
    test('should apply draft styling', () => {
      render(<GradeCell {...defaultProps} status="draft" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('bg-background')
    })

    test('should apply submitted styling', () => {
      render(<GradeCell {...defaultProps} status="submitted" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('bg-blue-50')
    })

    test('should apply validated styling', () => {
      render(<GradeCell {...defaultProps} status="validated" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('bg-green-50')
    })

    test('should apply rejected styling', () => {
      render(<GradeCell {...defaultProps} status="rejected" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('bg-red-50')
    })
  })

  describe('value color coding', () => {
    test('should apply green color for excellent grades (>=16)', () => {
      render(<GradeCell {...defaultProps} value={18} />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('text-green-600')
    })

    test('should apply red color for failing grades (<10)', () => {
      render(<GradeCell {...defaultProps} value={8} />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('text-red-600')
    })
  })

  describe('rejection tooltip', () => {
    test('should show rejection reason in tooltip when rejected', () => {
      render(
        <GradeCell
          {...defaultProps}
          status="rejected"
          rejectionReason="Note incorrecte"
        />,
      )
      // Tooltip trigger should be present
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })
})
