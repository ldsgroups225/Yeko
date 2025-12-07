import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle2, Clock, FileText, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PendingValidation {
  classId: string
  className: string
  gradeName: string
  subjectId: string
  subjectName: string
  termId: string
  teacherId: string
  teacherName: string
  pendingCount: number
  submittedAt: Date
}

interface GradeValidationCardProps {
  validation: PendingValidation
  onViewDetails: () => void
  onValidate: () => void
  onReject: () => void
  isLoading?: boolean
  className?: string
}

export function GradeValidationCard({
  validation,
  onViewDetails,
  onValidate,
  onReject,
  isLoading,
  className,
}: GradeValidationCardProps) {
  const { t } = useTranslation()
  const timeAgo = formatDistanceToNow(new Date(validation.submittedAt), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">
                {validation.gradeName}
                {' '}
                {validation.className}
                {' '}
                -
                {' '}
                {validation.subjectName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('academic.grades.validations.submittedBy')}
                :
                {' '}
                {validation.teacherName}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-4" />
            <span>
              {t('academic.grades.validations.submittedAt')}
              {' '}
              {timeAgo}
            </span>
          </div>
          <div className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {t('academic.grades.validations.pendingCount', { count: validation.pendingCount })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          disabled={isLoading}
        >
          {t('academic.grades.validations.viewDetails')}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onValidate}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="mr-1 size-4" />
          {t('academic.grades.validations.validate')}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onReject}
          disabled={isLoading}
        >
          <XCircle className="mr-1 size-4" />
          {t('academic.grades.validations.reject')}
        </Button>
      </CardFooter>
    </Card>
  )
}
