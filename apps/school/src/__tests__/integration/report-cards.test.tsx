import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

// Unmock react-hook-form to use real implementation
vi.unmock('react-hook-form')

// Import components after unmocking
const { ReportCardStatusBadge } = await import('@/components/report-cards/report-card-status-badge')
const { DeliveryStatusBadge } = await import('@/components/report-cards/delivery-status-badge')
const { ReportCardCard } = await import('@/components/report-cards/report-card-card')
const { ReportCardList } = await import('@/components/report-cards/report-card-list')

describe('report Cards Integration', () => {
  describe('report Card Status Badge', () => {
    test('should display all status types correctly', () => {
      const { rerender } = render(<ReportCardStatusBadge status="draft" />)
      expect(screen.getByText('Brouillon')).toBeInTheDocument()

      rerender(<ReportCardStatusBadge status="generated" />)
      expect(screen.getByText('Généré')).toBeInTheDocument()

      rerender(<ReportCardStatusBadge status="sent" />)
      expect(screen.getByText('Envoyé')).toBeInTheDocument()

      rerender(<ReportCardStatusBadge status="delivered" />)
      expect(screen.getByText('Livré')).toBeInTheDocument()

      rerender(<ReportCardStatusBadge status="viewed" />)
      expect(screen.getByText('Vu')).toBeInTheDocument()
    })

    test('should have accessible status role', () => {
      render(<ReportCardStatusBadge status="generated" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    test('should accept custom className', () => {
      render(<ReportCardStatusBadge status="draft" className="custom-class" />)
      const badge = screen.getByRole('status')
      expect(badge.className).toContain('custom-class')
    })
  })

  describe('delivery Status Badge', () => {
    test('should display all delivery methods correctly', () => {
      const { rerender } = render(<DeliveryStatusBadge method="email" />)
      expect(screen.getByText('Email')).toBeInTheDocument()

      rerender(<DeliveryStatusBadge method="in_app" />)
      expect(screen.getByText('Application')).toBeInTheDocument()

      rerender(<DeliveryStatusBadge method="sms" />)
      expect(screen.getByText('SMS')).toBeInTheDocument()

      rerender(<DeliveryStatusBadge method="print" />)
      expect(screen.getByText('Impression')).toBeInTheDocument()
    })
  })

  describe('report Card Card', () => {
    const mockReportCard = {
      id: 'rc-1',
      studentId: 'student-1',
      studentName: 'KOUASSI Aya Marie',
      studentMatricule: 'MAT-2024-001',
      status: 'generated' as const,
      average: 15.75,
      rank: 3,
      totalStudents: 28,
      pdfUrl: 'https://example.com/report.pdf',
    }

    test('should render student name and matricule', () => {
      render(<ReportCardCard reportCard={mockReportCard} />)
      expect(screen.getByText('KOUASSI Aya Marie')).toBeInTheDocument()
      expect(screen.getByText('MAT-2024-001')).toBeInTheDocument()
    })

    test('should display average and rank', () => {
      render(<ReportCardCard reportCard={mockReportCard} />)
      expect(screen.getByText('15.75/20')).toBeInTheDocument()
      expect(screen.getByText('3/28')).toBeInTheDocument()
    })

    test('should show status badge', () => {
      render(<ReportCardCard reportCard={mockReportCard} />)
      expect(screen.getByText('Généré')).toBeInTheDocument()
    })

    test('should call onPreview when preview button clicked', async () => {
      const onPreview = vi.fn()
      render(<ReportCardCard reportCard={mockReportCard} onPreview={onPreview} />)

      const previewButton = screen.getByRole('button', { name: /aperçu|preview/i })
      previewButton.click()

      expect(onPreview).toHaveBeenCalledWith('rc-1')
    })

    test('should show send button for generated status', () => {
      const onSend = vi.fn()
      render(<ReportCardCard reportCard={mockReportCard} onSend={onSend} />)

      expect(screen.getByRole('button', { name: /envoyer|send/i })).toBeInTheDocument()
    })

    test('should show resend button for sent status', () => {
      const sentReportCard = { ...mockReportCard, status: 'sent' as const }
      const onResend = vi.fn()
      render(<ReportCardCard reportCard={sentReportCard} onResend={onResend} />)

      expect(screen.getByRole('button', { name: /renvoyer|resend/i })).toBeInTheDocument()
    })
  })

  describe('report Card List', () => {
    const mockReportCards = [
      {
        id: 'rc-1',
        studentId: 'student-1',
        studentName: 'KOUASSI Aya',
        status: 'generated' as const,
        average: 15.75,
      },
      {
        id: 'rc-2',
        studentId: 'student-2',
        studentName: 'KONÉ Ibrahim',
        status: 'sent' as const,
        average: 12.50,
      },
    ]

    test('should render all report cards', () => {
      render(<ReportCardList reportCards={mockReportCards} />)
      expect(screen.getByText('KOUASSI Aya')).toBeInTheDocument()
      expect(screen.getByText('KONÉ Ibrahim')).toBeInTheDocument()
    })

    test('should show loading skeletons when loading', () => {
      render(<ReportCardList reportCards={[]} isLoading />)
      // Should render skeleton elements
      const skeletons = document.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    test('should show empty state when no report cards', () => {
      render(<ReportCardList reportCards={[]} />)
      // Test setup uses English translations
      expect(screen.getByText(/no report cards found/i)).toBeInTheDocument()
    })

    test('should filter by status', () => {
      render(<ReportCardList reportCards={mockReportCards} filterStatus="generated" />)
      expect(screen.getByText('KOUASSI Aya')).toBeInTheDocument()
      expect(screen.queryByText('KONÉ Ibrahim')).not.toBeInTheDocument()
    })
  })

  describe('status Workflow', () => {
    test('should show correct status progression', () => {
      // Draft -> Generated -> Sent -> Delivered -> Viewed
      const { rerender } = render(<ReportCardStatusBadge status="draft" />)
      expect(screen.getByText('Brouillon')).toBeInTheDocument()

      rerender(<ReportCardStatusBadge status="generated" />)
      expect(screen.getByText('Généré')).toBeInTheDocument()

      rerender(<ReportCardStatusBadge status="sent" />)
      expect(screen.getByText('Envoyé')).toBeInTheDocument()

      rerender(<ReportCardStatusBadge status="delivered" />)
      expect(screen.getByText('Livré')).toBeInTheDocument()

      rerender(<ReportCardStatusBadge status="viewed" />)
      expect(screen.getByText('Vu')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test('should have accessible status badge', () => {
      render(<ReportCardStatusBadge status="generated" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    test('should have accessible buttons in report card', () => {
      const mockReportCard = {
        id: 'rc-1',
        studentId: 'student-1',
        studentName: 'Test Student',
        status: 'generated' as const,
        pdfUrl: 'https://example.com/report.pdf',
      }

      render(
        <ReportCardCard
          reportCard={mockReportCard}
          onPreview={vi.fn()}
          onDownload={vi.fn()}
          onSend={vi.fn()}
        />,
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
