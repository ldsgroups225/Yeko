import type { ReportCardData } from './report-card-card'
import type { ReportCardStatus } from '@/schemas/report-card'
import { FileX } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'
import { ReportCardCard } from './report-card-card'

interface ReportCardListProps {
  reportCards: ReportCardData[]
  isLoading?: boolean
  onPreview?: (id: string) => void
  onDownload?: (id: string) => void
  onSend?: (id: string) => void
  onResend?: (id: string) => void
  filterStatus?: ReportCardStatus
}

function ReportCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export function ReportCardList({
  reportCards,
  isLoading,
  onPreview,
  onDownload,
  onSend,
  onResend,
  filterStatus,
}: ReportCardListProps) {
  const t = useTranslations()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map(() => (
          <ReportCardSkeleton key={generateUUID()} />
        ))}
      </div>
    )
  }

  const filteredCards = filterStatus
    ? reportCards.filter(rc => rc.status === filterStatus)
    : reportCards

  if (filteredCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg">{t.reportCards.noReportCards()}</h3>
        <p className="text-muted-foreground text-sm">
          {t.reportCards.noReportCardsDescription()}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredCards.map(reportCard => (
        <ReportCardCard
          key={reportCard.id}
          reportCard={reportCard}
          onPreview={onPreview}
          onDownload={onDownload}
          onSend={onSend}
          onResend={onResend}
        />
      ))}
    </div>
  )
}
