import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import components after unmocking
const { ProgressStatusBadge } = await import('@/components/curriculum-progress/progress-status-badge')
const { SessionStatusBadge } = await import('@/components/curriculum-progress/session-status-badge')
const { ProgressBar } = await import('@/components/curriculum-progress/progress-bar')
const { ProgressCard } = await import('@/components/curriculum-progress/progress-card')
const { ChapterChecklist } = await import('@/components/curriculum-progress/chapter-checklist')
const { ProgressOverviewCards } = await import('@/components/curriculum-progress/progress-overview-cards')

describe('curriculum Progress Integration', () => {
  describe('progress Status Badge', () => {
    test('should display all status types correctly', () => {
      const { rerender } = render(<ProgressStatusBadge status="on_track" />)
      expect(screen.getByText('En cours')).toBeInTheDocument()

      rerender(<ProgressStatusBadge status="slightly_behind" />)
      expect(screen.getByText('Légèrement en retard')).toBeInTheDocument()

      rerender(<ProgressStatusBadge status="significantly_behind" />)
      expect(screen.getByText('Significativement en retard')).toBeInTheDocument()

      rerender(<ProgressStatusBadge status="ahead" />)
      expect(screen.getByText('En avance')).toBeInTheDocument()
    })

    test('should have accessible status role', () => {
      render(<ProgressStatusBadge status="on_track" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('session Status Badge', () => {
    test('should display all session status types', () => {
      const { rerender } = render(<SessionStatusBadge status="scheduled" />)
      expect(screen.getByText('Planifié')).toBeInTheDocument()

      rerender(<SessionStatusBadge status="completed" />)
      expect(screen.getByText('Terminé')).toBeInTheDocument()

      rerender(<SessionStatusBadge status="cancelled" />)
      expect(screen.getByText('Annulé')).toBeInTheDocument()

      rerender(<SessionStatusBadge status="rescheduled" />)
      expect(screen.getByText('Reporté')).toBeInTheDocument()
    })
  })

  describe('progress Bar', () => {
    test('should display progress percentage', () => {
      render(<ProgressBar completed={5} total={10} />)
      // Text includes "chapitres" translation
      expect(screen.getByText(/5\/10/)).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    test('should handle zero total', () => {
      render(<ProgressBar completed={0} total={0} />)
      // Text includes "chapitres" translation
      expect(screen.getByText(/0\/0/)).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    test('should apply correct color based on status', () => {
      const { container, rerender } = render(
        <ProgressBar completed={8} total={10} status="on_track" />,
      )
      expect(container.querySelector('[class*="bg-green"]')).toBeInTheDocument()

      rerender(<ProgressBar completed={5} total={10} status="significantly_behind" />)
      expect(container.querySelector('[class*="bg-red"]')).toBeInTheDocument()
    })

    test('should hide label when showLabel is false', () => {
      render(<ProgressBar completed={5} total={10} showLabel={false} />)
      expect(screen.queryByText('5/10')).not.toBeInTheDocument()
    })
  })

  describe('progress Card', () => {
    const mockProgress = {
      subjectName: 'Mathématiques',
      teacherName: 'M. Dupont',
      completedChapters: 8,
      totalChapters: 12,
      progressPercentage: 66.67,
      expectedPercentage: 75,
      variance: -8.33,
      status: 'slightly_behind' as const,
    }

    test('should render subject and teacher name', () => {
      render(<ProgressCard {...mockProgress} />)
      expect(screen.getByText('Mathématiques')).toBeInTheDocument()
      expect(screen.getByText('M. Dupont')).toBeInTheDocument()
    })

    test('should display progress percentage', () => {
      render(<ProgressCard {...mockProgress} />)
      // Progress percentage may appear multiple times (in card and progress bar)
      const percentageElements = screen.getAllByText(/67%/)
      expect(percentageElements.length).toBeGreaterThan(0)
    })

    test('should show variance indicator', () => {
      render(<ProgressCard {...mockProgress} />)
      expect(screen.getByText(/-8%/)).toBeInTheDocument()
    })

    test('should show positive variance for ahead status', () => {
      const aheadProgress = {
        ...mockProgress,
        variance: 10,
        status: 'ahead' as const,
      }
      render(<ProgressCard {...aheadProgress} />)
      expect(screen.getByText(/\+10%/)).toBeInTheDocument()
    })

    test('should call onClick when clicked', async () => {
      const onClick = vi.fn()
      render(<ProgressCard {...mockProgress} onClick={onClick} />)

      const card = screen.getByText('Mathématiques').closest('[role="button"]')
      if (card) {
        await userEvent.click(card)
      }

      expect(onClick).toHaveBeenCalled()
    })

    test('should be keyboard accessible when clickable', () => {
      const onClick = vi.fn()
      render(<ProgressCard {...mockProgress} onClick={onClick} />)

      const card = screen.getByText('Mathématiques').closest('[role="button"]')
      expect(card).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('chapter Checklist', () => {
    const mockChapters = [
      { id: 'ch-1', name: 'Introduction aux nombres', orderIndex: 1, isCompleted: true },
      { id: 'ch-2', name: 'Addition et soustraction', orderIndex: 2, isCompleted: true },
      { id: 'ch-3', name: 'Multiplication', orderIndex: 3, isCompleted: false },
      { id: 'ch-4', name: 'Division', orderIndex: 4, isCompleted: false },
    ]

    test('should render all chapters', () => {
      render(<ChapterChecklist chapters={mockChapters} />)
      expect(screen.getByText(/Introduction aux nombres/)).toBeInTheDocument()
      expect(screen.getByText(/Addition et soustraction/)).toBeInTheDocument()
      expect(screen.getByText(/Multiplication/)).toBeInTheDocument()
      expect(screen.getByText(/Division/)).toBeInTheDocument()
    })

    test('should display completion count', () => {
      render(<ChapterChecklist chapters={mockChapters} />)
      expect(screen.getByText('2/4')).toBeInTheDocument()
    })

    test('should sort chapters by orderIndex', () => {
      const unorderedChapters = [
        { id: 'ch-3', name: 'Third', orderIndex: 3, isCompleted: false },
        { id: 'ch-1', name: 'First', orderIndex: 1, isCompleted: true },
        { id: 'ch-2', name: 'Second', orderIndex: 2, isCompleted: false },
      ]
      render(<ChapterChecklist chapters={unorderedChapters} />)

      const items = screen.getAllByText(/First|Second|Third/)
      expect(items[0]).toHaveTextContent('First')
      expect(items[1]).toHaveTextContent('Second')
      expect(items[2]).toHaveTextContent('Third')
    })

    test('should call onToggle when chapter clicked', async () => {
      const onToggle = vi.fn()
      render(<ChapterChecklist chapters={mockChapters} onToggle={onToggle} />)

      const toggleButton = screen.getAllByRole('button')[0]
      toggleButton?.click()

      expect(onToggle).toHaveBeenCalled()
    })

    test('should not show toggle buttons in readOnly mode', () => {
      render(<ChapterChecklist chapters={mockChapters} readOnly />)
      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })
  })

  describe('progress Overview Cards', () => {
    const mockOverviewData = {
      totalClasses: 15,
      onTrack: 10,
      slightlyBehind: 3,
      significantlyBehind: 1,
      ahead: 1,
      averageProgress: 72.5,
    }

    test('should display total classes', () => {
      render(<ProgressOverviewCards data={mockOverviewData} />)
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    test('should display on track count', () => {
      render(<ProgressOverviewCards data={mockOverviewData} />)
      // On track + ahead = 10 + 1 = 11
      expect(screen.getByText('11')).toBeInTheDocument()
    })

    test('should display behind count', () => {
      render(<ProgressOverviewCards data={mockOverviewData} />)
      // Slightly behind + significantly behind = 3 + 1 = 4
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    test('should display average progress', () => {
      render(<ProgressOverviewCards data={mockOverviewData} />)
      expect(screen.getByText('73%')).toBeInTheDocument()
    })

    test('should show loading skeletons when loading', () => {
      render(<ProgressOverviewCards data={null} isLoading />)
      const skeletons = document.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    test('should render nothing when data is null and not loading', () => {
      const { container } = render(<ProgressOverviewCards data={null} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('status Colors', () => {
    test('should apply green color for on_track status', () => {
      const { container } = render(<ProgressStatusBadge status="on_track" />)
      expect(container.querySelector('[class*="green"]')).toBeInTheDocument()
    })

    test('should apply yellow color for slightly_behind status', () => {
      const { container } = render(<ProgressStatusBadge status="slightly_behind" />)
      expect(container.querySelector('[class*="yellow"]')).toBeInTheDocument()
    })

    test('should apply red color for significantly_behind status', () => {
      const { container } = render(<ProgressStatusBadge status="significantly_behind" />)
      expect(container.querySelector('[class*="red"]')).toBeInTheDocument()
    })

    test('should apply blue color for ahead status', () => {
      const { container } = render(<ProgressStatusBadge status="ahead" />)
      expect(container.querySelector('[class*="blue"]')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test('should have accessible status badges', () => {
      render(<ProgressStatusBadge status="on_track" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    test('should have accessible session status badges', () => {
      render(<SessionStatusBadge status="completed" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    test('should have accessible toggle buttons in chapter checklist', () => {
      const chapters = [
        { id: 'ch-1', name: 'Chapter 1', orderIndex: 1, isCompleted: false },
      ]
      render(<ChapterChecklist chapters={chapters} onToggle={vi.fn()} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
    })
  })
})
