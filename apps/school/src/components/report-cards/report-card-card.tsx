import type { DeliveryMethod, ReportCardStatus } from '@/schemas/report-card'
import { Download, Eye, FileText, RefreshCw, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DeliveryStatusBadge } from './delivery-status-badge'
import { ReportCardStatusBadge } from './report-card-status-badge'

export interface ReportCardData {
  id: string
  studentId: string
  studentName: string
  studentMatricule?: string
  status: ReportCardStatus
  average?: number
  rank?: number
  totalStudents?: number
  generatedAt?: Date | string | null
  sentAt?: Date | string | null
  deliveryMethod?: DeliveryMethod | null
  pdfUrl?: string | null
}

interface ReportCardCardProps {
  reportCard: ReportCardData
  onPreview?: (id: string) => void
  onDownload?: (id: string) => void
  onSend?: (id: string) => void
  onResend?: (id: string) => void
  className?: string
}

export function ReportCardCard({
  reportCard,
  onPreview,
  onDownload,
  onSend,
  onResend,
  className,
}: ReportCardCardProps) {
  const { t } = useTranslation()

  const canSend = reportCard.status === 'generated'
  const canResend = reportCard.status === 'sent' || reportCard.status === 'delivered'
  const canDownload = reportCard.status !== 'draft' && reportCard.pdfUrl

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold leading-none">{reportCard.studentName}</h3>
              {reportCard.studentMatricule && (
                <p className="text-sm text-muted-foreground">{reportCard.studentMatricule}</p>
              )}
            </div>
          </div>
          <ReportCardStatusBadge status={reportCard.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Average and Rank */}
        {reportCard.average !== undefined && (
          <div className="flex items-center gap-4 text-sm">
            <span>
              <span className="text-muted-foreground">
                {t('reportCards.average')}
                :
              </span>
              {' '}
              <span className="font-medium">
                {reportCard.average.toFixed(2)}
                /20
              </span>
            </span>
            {reportCard.rank && reportCard.totalStudents && (
              <span>
                <span className="text-muted-foreground">
                  {t('reportCards.rank')}
                  :
                </span>
                {' '}
                <span className="font-medium">
                  {reportCard.rank}
                  /
                  {reportCard.totalStudents}
                </span>
              </span>
            )}
          </div>
        )}

        {/* Delivery Info */}
        {reportCard.deliveryMethod && (
          <div className="flex items-center gap-2">
            <DeliveryStatusBadge method={reportCard.deliveryMethod} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {onPreview && (
            <Button variant="outline" size="sm" onClick={() => onPreview(reportCard.id)}>
              <Eye className="mr-1 h-4 w-4" />
              {t('common.preview')}
            </Button>
          )}
          {canDownload && onDownload && (
            <Button variant="outline" size="sm" onClick={() => onDownload(reportCard.id)}>
              <Download className="mr-1 h-4 w-4" />
              {t('common.download')}
            </Button>
          )}
          {canSend && onSend && (
            <Button variant="default" size="sm" onClick={() => onSend(reportCard.id)}>
              <Send className="mr-1 h-4 w-4" />
              {t('reportCards.send')}
            </Button>
          )}
          {canResend && onResend && (
            <Button variant="outline" size="sm" onClick={() => onResend(reportCard.id)}>
              <RefreshCw className="mr-1 h-4 w-4" />
              {t('reportCards.resend')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
