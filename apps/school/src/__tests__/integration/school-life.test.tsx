import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import components after unmocking
const { ConductSeverityBadge } = await import('@/components/conduct/conduct-severity-badge')
const { ConductStatusBadge } = await import('@/components/conduct/conduct-status-badge')
const { ConductTypeBadge } = await import('@/components/conduct/conduct-type-badge')
const { TeacherAttendanceStatusBadge } = await import(
  '@/components/attendance/teacher/teacher-attendance-status-badge',
)
const { StudentAttendanceStatusBadge } = await import(
  '@/components/attendance/student/student-attendance-status-badge',
)

describe('school Life Management Integration', () => {
  describe('conduct Severity Badge', () => {
    test('should display all severity levels correctly', () => {
      const { rerender } = render(<ConductSeverityBadge severity="low" />)
      expect(screen.getByText('Low')).toBeInTheDocument()

      rerender(<ConductSeverityBadge severity="medium" />)
      expect(screen.getByText('Medium')).toBeInTheDocument()

      rerender(<ConductSeverityBadge severity="high" />)
      expect(screen.getByText('High')).toBeInTheDocument()

      rerender(<ConductSeverityBadge severity="critical" />)
      expect(screen.getByText('Critical')).toBeInTheDocument()
    })

    test('should accept custom className', () => {
      const { container } = render(<ConductSeverityBadge severity="high" className="custom-class" />)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('custom-class')
    })

    test('should hide icon when showIcon is false', () => {
      const { container } = render(<ConductSeverityBadge severity="low" showIcon={false} />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })
  })

  describe('conduct Status Badge', () => {
    test('should display all status types correctly', () => {
      const { rerender } = render(<ConductStatusBadge status="open" />)
      expect(screen.getByText('Open')).toBeInTheDocument()

      rerender(<ConductStatusBadge status="investigating" />)
      expect(screen.getByText('Investigating')).toBeInTheDocument()

      rerender(<ConductStatusBadge status="pending_decision" />)
      expect(screen.getByText('Pending Decision')).toBeInTheDocument()

      rerender(<ConductStatusBadge status="resolved" />)
      expect(screen.getByText('Resolved')).toBeInTheDocument()

      rerender(<ConductStatusBadge status="closed" />)
      expect(screen.getByText('Closed')).toBeInTheDocument()

      rerender(<ConductStatusBadge status="appealed" />)
      expect(screen.getByText('Appealed')).toBeInTheDocument()
    })

    test('should accept custom className', () => {
      const { container } = render(<ConductStatusBadge status="open" className="custom-class" />)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('custom-class')
    })
  })

  describe('conduct IconTypography Badge', () => {
    test('should display all conduct types correctly', () => {
      const { rerender } = render(<ConductTypeBadge type="incident" />)
      expect(screen.getByText('Incident')).toBeInTheDocument()

      rerender(<ConductTypeBadge type="sanction" />)
      expect(screen.getByText('Sanction')).toBeInTheDocument()

      rerender(<ConductTypeBadge type="reward" />)
      expect(screen.getByText('Reward')).toBeInTheDocument()

      rerender(<ConductTypeBadge type="note" />)
      expect(screen.getByText('Note')).toBeInTheDocument()
    })

    test('should accept custom className', () => {
      const { container } = render(<ConductTypeBadge type="incident" className="custom-class" />)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('custom-class')
    })
  })

  describe('teacher Attendance Status Badge', () => {
    test('should display all teacher attendance statuses correctly', () => {
      const { rerender } = render(<TeacherAttendanceStatusBadge status="present" />)
      expect(screen.getByText('Present')).toBeInTheDocument()

      rerender(<TeacherAttendanceStatusBadge status="late" />)
      expect(screen.getByText('Late')).toBeInTheDocument()

      rerender(<TeacherAttendanceStatusBadge status="absent" />)
      expect(screen.getByText('Absent')).toBeInTheDocument()

      rerender(<TeacherAttendanceStatusBadge status="excused" />)
      expect(screen.getByText('Excused')).toBeInTheDocument()

      rerender(<TeacherAttendanceStatusBadge status="on_leave" />)
      expect(screen.getByText('On Leave')).toBeInTheDocument()
    })

    test('should accept custom className', () => {
      const { container } = render(
        <TeacherAttendanceStatusBadge status="present" className="custom-class" />,
      )
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('custom-class')
    })

    test('should hide icon when showIcon is false', () => {
      const { container } = render(<TeacherAttendanceStatusBadge status="present" showIcon={false} />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })
  })

  describe('student Attendance Status Badge', () => {
    test('should display all student attendance statuses correctly', () => {
      const { rerender } = render(<StudentAttendanceStatusBadge status="present" />)
      expect(screen.getByText('Present')).toBeInTheDocument()

      rerender(<StudentAttendanceStatusBadge status="late" />)
      expect(screen.getByText('Late')).toBeInTheDocument()

      rerender(<StudentAttendanceStatusBadge status="absent" />)
      expect(screen.getByText('Absent')).toBeInTheDocument()

      rerender(<StudentAttendanceStatusBadge status="excused" />)
      expect(screen.getByText('Excused')).toBeInTheDocument()
    })

    test('should accept custom className', () => {
      const { container } = render(
        <StudentAttendanceStatusBadge status="present" className="custom-class" />,
      )
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('custom-class')
    })
  })

  describe('accessibility', () => {
    test('should have accessible conduct severity badge', () => {
      render(<ConductSeverityBadge severity="high" />)
      const badge = screen.getByText('High')
      expect(badge).toBeInTheDocument()
    })

    test('should have accessible conduct status badge', () => {
      render(<ConductStatusBadge status="open" />)
      const badge = screen.getByText('Open')
      expect(badge).toBeInTheDocument()
    })

    test('should have accessible conduct type badge', () => {
      render(<ConductTypeBadge type="incident" />)
      const badge = screen.getByText('Incident')
      expect(badge).toBeInTheDocument()
    })

    test('should have accessible teacher attendance badge', () => {
      render(<TeacherAttendanceStatusBadge status="present" />)
      const badge = screen.getByText('Present')
      expect(badge).toBeInTheDocument()
    })

    test('should have accessible student attendance badge', () => {
      render(<StudentAttendanceStatusBadge status="present" />)
      const badge = screen.getByText('Present')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('color Coding', () => {
    test('should apply correct color classes for severity levels', () => {
      const { container, rerender } = render(<ConductSeverityBadge severity="low" />)
      let badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('text-blue-600')

      rerender(<ConductSeverityBadge severity="medium" />)
      badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('text-amber-600')

      rerender(<ConductSeverityBadge severity="high" />)
      badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('text-orange-600')

      rerender(<ConductSeverityBadge severity="critical" />)
      badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('text-red-600')
    })

    test('should apply correct color classes for attendance statuses', () => {
      const { container, rerender } = render(<StudentAttendanceStatusBadge status="present" />)
      let badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('text-green-600')

      rerender(<StudentAttendanceStatusBadge status="late" />)
      badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('text-amber-600')

      rerender(<StudentAttendanceStatusBadge status="absent" />)
      badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('text-red-600')

      rerender(<StudentAttendanceStatusBadge status="excused" />)
      badge = container.querySelector('[data-slot="badge"]')
      expect(badge?.className).toContain('text-blue-600')
    })
  })
})
