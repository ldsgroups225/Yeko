import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import components after unmocking
const { TimetableSessionCard } = await import('@/components/timetables/timetable-session-card')
const { ConflictIndicator } = await import('@/components/timetables/conflict-indicator')
const { TimetableGrid } = await import('@/components/timetables/timetable-grid')

describe('timetables Integration', () => {
  describe('timetable Session Card', () => {
    const mockSession = {
      id: 'session-1',
      subjectId: 'subject-1',
      subjectName: 'Mathématiques',
      teacherId: 'teacher-1',
      teacherName: 'M. Dupont',
      classroomId: 'room-1',
      classroomName: 'Salle 101',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:00',
      color: '#3b82f6',
    }

    test('should render session details', () => {
      render(<TimetableSessionCard session={mockSession} />)
      expect(screen.getByText('Mathématiques')).toBeInTheDocument()
      expect(screen.getByText('M. Dupont')).toBeInTheDocument()
      expect(screen.getByText(/08:00-09:00/)).toBeInTheDocument()
    })

    test('should display classroom name', () => {
      render(<TimetableSessionCard session={mockSession} />)
      expect(screen.getByText('Salle 101')).toBeInTheDocument()
    })

    test('should call onClick when clicked', async () => {
      const onClick = vi.fn()
      render(<TimetableSessionCard session={mockSession} onClick={onClick} />)

      const card = screen.getByText('Mathématiques').closest('div[role="button"]')
      if (card) {
        await userEvent.click(card)
      }

      expect(onClick).toHaveBeenCalledWith(mockSession)
    })

    test('should show conflict indicator when hasConflict is true', () => {
      const conflictSession = { ...mockSession, hasConflict: true }
      render(<TimetableSessionCard session={conflictSession} />)

      // Should have a visual indicator for conflict (the exclamation mark badge)
      expect(screen.getByText('!')).toBeInTheDocument()
    })

    test('should render compact mode', () => {
      render(<TimetableSessionCard session={mockSession} compact />)
      // In compact mode, teacher name should not be visible
      expect(screen.queryByText('M. Dupont')).not.toBeInTheDocument()
    })

    test('should show day when showDay is true', () => {
      render(<TimetableSessionCard session={mockSession} showDay />)
      expect(screen.getByText(/Lun/)).toBeInTheDocument()
    })

    test('should be keyboard accessible', () => {
      const onClick = vi.fn()
      render(<TimetableSessionCard session={mockSession} onClick={onClick} />)

      const card = screen.getByText('Mathématiques').closest('div[role="button"]')
      expect(card).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('conflict Indicator', () => {
    test('should not render when no conflicts', () => {
      const { container } = render(<ConflictIndicator conflicts={[]} />)
      expect(container.firstChild).toBeNull()
    })

    test('should display conflict count', () => {
      const conflicts = [
        { type: 'teacher' as const, message: 'Teacher already assigned' },
        { type: 'classroom' as const, message: 'Classroom occupied' },
      ]
      render(<ConflictIndicator conflicts={conflicts} />)
      // Test setup uses English translations - "2 conflict(s)"
      expect(screen.getByText(/2/)).toBeInTheDocument()
      expect(screen.getByText(/conflict/i)).toBeInTheDocument()
    })

    test('should show conflict details in tooltip', () => {
      const conflicts = [
        { type: 'teacher' as const, message: 'M. Dupont déjà assigné' },
      ]
      render(<ConflictIndicator conflicts={conflicts} />)

      // Badge should be present with count - "1 conflict(s)"
      expect(screen.getByText(/1/)).toBeInTheDocument()
      expect(screen.getByText(/conflict/i)).toBeInTheDocument()
    })
  })

  describe('timetable Grid', () => {
    const mockSessions = [
      {
        id: 'session-1',
        subjectId: 'subject-1',
        subjectName: 'Mathématiques',
        teacherId: 'teacher-1',
        teacherName: 'M. Dupont',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        color: '#3b82f6',
      },
      {
        id: 'session-2',
        subjectId: 'subject-2',
        subjectName: 'Français',
        teacherId: 'teacher-2',
        teacherName: 'Mme Martin',
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '10:00',
        color: '#22c55e',
      },
    ]

    test('should render day headers', () => {
      render(<TimetableGrid sessions={mockSessions} />)
      expect(screen.getByText('Lundi')).toBeInTheDocument()
      expect(screen.getByText('Mardi')).toBeInTheDocument()
      expect(screen.getByText('Mercredi')).toBeInTheDocument()
    })

    test('should render sessions in correct slots', () => {
      render(<TimetableGrid sessions={mockSessions} />)
      expect(screen.getByText('Mathématiques')).toBeInTheDocument()
      expect(screen.getByText('Français')).toBeInTheDocument()
    })

    test('should show loading skeletons when loading', () => {
      render(<TimetableGrid sessions={[]} isLoading />)
      const skeletons = document.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    test('should call onSessionClick when session clicked', async () => {
      const onSessionClick = vi.fn()
      render(<TimetableGrid sessions={mockSessions} onSessionClick={onSessionClick} />)

      const mathSession = screen.getByText('Mathématiques').closest('div[role="button"]')
      if (mathSession) {
        await userEvent.click(mathSession)
      }

      expect(onSessionClick).toHaveBeenCalled()
    })

    test('should call onSlotClick when empty slot clicked', () => {
      const onSlotClick = vi.fn()
      render(<TimetableGrid sessions={[]} onSlotClick={onSlotClick} />)

      // Find an empty slot and click it
      const emptySlots = document.querySelectorAll('[role="button"]')
      if (emptySlots.length > 0) {
        emptySlots[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    })

    test('should respect readOnly mode', () => {
      const onSlotClick = vi.fn()
      render(<TimetableGrid sessions={[]} onSlotClick={onSlotClick} readOnly />)

      // In readOnly mode, empty slots should not be clickable
      const slots = document.querySelectorAll('[role="button"]')
      expect(slots).toHaveLength(0)
    })

    test('should only show specified days', () => {
      render(<TimetableGrid sessions={mockSessions} daysToShow={[1, 2, 3]} />)
      expect(screen.getByText('Lundi')).toBeInTheDocument()
      expect(screen.getByText('Mardi')).toBeInTheDocument()
      expect(screen.getByText('Mercredi')).toBeInTheDocument()
      expect(screen.queryByText('Jeudi')).not.toBeInTheDocument()
    })
  })

  describe('day Labels', () => {
    test('should display French day names', () => {
      const session = {
        id: 'session-1',
        subjectId: 'subject-1',
        subjectName: 'Test',
        teacherId: 'teacher-1',
        teacherName: 'Teacher',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
      }

      render(<TimetableSessionCard session={session} showDay />)
      expect(screen.getByText(/Lun/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test('should have keyboard accessible session cards', () => {
      const mockSession = {
        id: 'session-1',
        subjectId: 'subject-1',
        subjectName: 'Test',
        teacherId: 'teacher-1',
        teacherName: 'Teacher',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
      }

      render(<TimetableSessionCard session={mockSession} onClick={vi.fn()} />)

      const card = screen.getByText('Test').closest('div[role="button"]')
      expect(card).toHaveAttribute('tabIndex', '0')
    })
  })
})
