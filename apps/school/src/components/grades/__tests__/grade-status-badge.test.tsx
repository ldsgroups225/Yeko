import type { GradeStatus } from '@/schemas/grade'
import { render, screen } from '@testing-library/react'

import { describe, expect, test } from 'vitest'

import { GradeStatusBadge } from '../grade-status-badge'

describe('gradeStatusBadge Component', () => {
  const statuses: GradeStatus[] = ['draft', 'submitted', 'validated', 'rejected']

  describe('rendering', () => {
    test.each(statuses)('should render badge for %s status', (status) => {
      render(<GradeStatusBadge status={status} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    test('should display correct label for draft status', () => {
      render(<GradeStatusBadge status="draft" />)
      expect(screen.getByText('Brouillon')).toBeInTheDocument()
    })

    test('should display correct label for submitted status', () => {
      render(<GradeStatusBadge status="submitted" />)
      expect(screen.getByText('Soumis')).toBeInTheDocument()
    })

    test('should display correct label for validated status', () => {
      render(<GradeStatusBadge status="validated" />)
      expect(screen.getByText('Validé')).toBeInTheDocument()
    })

    test('should display correct label for rejected status', () => {
      render(<GradeStatusBadge status="rejected" />)
      expect(screen.getByText('Rejeté')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    test('should apply muted style for draft', () => {
      render(<GradeStatusBadge status="draft" />)
      const badge = screen.getByRole('status')
      expect(badge.className).toContain('bg-muted')
    })

    test('should apply blue style for submitted', () => {
      render(<GradeStatusBadge status="submitted" />)
      const badge = screen.getByRole('status')
      expect(badge.className).toContain('bg-blue-100')
    })

    test('should apply green style for validated', () => {
      render(<GradeStatusBadge status="validated" />)
      const badge = screen.getByRole('status')
      expect(badge.className).toContain('bg-green-100')
    })

    test('should apply red style for rejected', () => {
      render(<GradeStatusBadge status="rejected" />)
      const badge = screen.getByRole('status')
      expect(badge.className).toContain('bg-red-100')
    })

    test('should accept custom className', () => {
      render(<GradeStatusBadge status="draft" className="custom-class" />)
      const badge = screen.getByRole('status')
      expect(badge.className).toContain('custom-class')
    })
  })
})
