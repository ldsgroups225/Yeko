import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import components after unmocking
const { GradeStatusBadge }
  = await import('@/components/grades/grade-status-badge')
const { GradeTypeSelector }
  = await import('@/components/grades/grade-type-selector')
const { GradeStatisticsCard }
  = await import('@/components/grades/grade-statistics-card')

describe('grades Management Integration', () => {
  describe('grade Status Badge', () => {
    test('should display all status types correctly', () => {
      const { rerender } = render(<GradeStatusBadge status="draft" />)
      expect(screen.getByText('Brouillon')).toBeInTheDocument()

      rerender(<GradeStatusBadge status="submitted" />)
      expect(screen.getByText('Soumis')).toBeInTheDocument()

      rerender(<GradeStatusBadge status="validated" />)
      expect(screen.getByText('Validé')).toBeInTheDocument()

      rerender(<GradeStatusBadge status="rejected" />)
      expect(screen.getByText('Rejeté')).toBeInTheDocument()
    })
  })

  describe('grade Type Selector', () => {
    test('should render combobox trigger', () => {
      const onValueChange = vi.fn()

      render(<GradeTypeSelector value="test" onValueChange={onValueChange} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
    })

    test('should display current value', () => {
      const onValueChange = vi.fn()

      render(<GradeTypeSelector value="test" onValueChange={onValueChange} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveTextContent('Devoir')
    })

    test('should be disabled when disabled prop is true', () => {
      const onValueChange = vi.fn()

      render(
        <GradeTypeSelector
          value="test"
          onValueChange={onValueChange}
          disabled
        />,
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })

    test('should accept custom className', () => {
      const onValueChange = vi.fn()

      render(
        <GradeTypeSelector
          value="test"
          onValueChange={onValueChange}
          className="custom-class"
        />,
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger.className).toContain('custom-class')
    })
  })

  describe('grade Statistics Card', () => {
    const mockStatistics = {
      count: 25,
      average: 12.5,
      min: 5,
      max: 19,
      below10: 5,
      above15: 8,
    }

    test('should render statistics card', () => {
      const { container } = render(
        <GradeStatisticsCard statistics={mockStatistics} />,
      )

      // Card should be rendered
      const card = container.querySelector('[data-slot="card"]')
      expect(card).toBeInTheDocument()
    })

    test('should display pass rate', () => {
      render(<GradeStatisticsCard statistics={mockStatistics} />)

      // Pass rate = (25 - 5) / 25 * 100 = 80%
      expect(screen.getByText('80%')).toBeInTheDocument()
    })

    test('should display 0% pass rate when all students below 10', () => {
      const allFailStats = {
        count: 10,
        average: 5,
        min: 2,
        max: 9,
        below10: 10,
        above15: 0,
      }

      render(<GradeStatisticsCard statistics={allFailStats} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    test('should display 100% pass rate when no students below 10', () => {
      const allPassStats = {
        count: 10,
        average: 15,
        min: 10,
        max: 20,
        below10: 0,
        above15: 8,
      }

      render(<GradeStatisticsCard statistics={allPassStats} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    test('should handle empty statistics', () => {
      const emptyStats = {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        below10: 0,
        above15: 0,
      }

      render(<GradeStatisticsCard statistics={emptyStats} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    test('should accept custom className', () => {
      const { container } = render(
        <GradeStatisticsCard
          statistics={mockStatistics}
          className="custom-class"
        />,
      )

      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('custom-class')
    })
  })

  describe('grade Validation Workflow', () => {
    test('should show correct status progression', () => {
      // Draft -> Submitted -> Validated
      const { rerender } = render(<GradeStatusBadge status="draft" />)
      expect(screen.getByText('Brouillon')).toBeInTheDocument()

      rerender(<GradeStatusBadge status="submitted" />)
      expect(screen.getByText('Soumis')).toBeInTheDocument()

      rerender(<GradeStatusBadge status="validated" />)
      expect(screen.getByText('Validé')).toBeInTheDocument()
    })

    test('should show rejection status', () => {
      // Draft -> Submitted -> Rejected
      const { rerender } = render(<GradeStatusBadge status="draft" />)
      expect(screen.getByText('Brouillon')).toBeInTheDocument()

      rerender(<GradeStatusBadge status="submitted" />)
      expect(screen.getByText('Soumis')).toBeInTheDocument()

      rerender(<GradeStatusBadge status="rejected" />)
      expect(screen.getByText('Rejeté')).toBeInTheDocument()
    })
  })

  describe('french Localization', () => {
    test('should display French label for test grade type', () => {
      render(<GradeTypeSelector value="test" onValueChange={vi.fn()} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveTextContent('Devoir')
    })

    test('should display French label for exam grade type', () => {
      render(<GradeTypeSelector value="exam" onValueChange={vi.fn()} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveTextContent('Examen')
    })

    test('should display French labels for grade statuses', () => {
      const { rerender } = render(<GradeStatusBadge status="draft" />)
      expect(screen.getByText('Brouillon')).toBeInTheDocument()

      rerender(<GradeStatusBadge status="validated" />)
      expect(screen.getByText('Validé')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test('should have accessible grade type selector', () => {
      render(<GradeTypeSelector value="test" onValueChange={vi.fn()} />)

      const combobox = screen.getByRole('combobox')
      expect(combobox).toBeInTheDocument()
    })

    test('should have accessible status badge', () => {
      render(<GradeStatusBadge status="validated" />)

      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
    })
  })
})
