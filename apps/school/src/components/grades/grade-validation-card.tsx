import { IconChevronRight, IconCircleCheck, IconCircleX, IconClock, IconFileText, IconUser } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardFooter, CardHeader } from '@workspace/ui/components/card'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
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
  submittedAt: Date | string
}

interface GradeValidationCardProps {
  validation: PendingValidation
  onViewDetails: () => void
  onValidate: () => void
  onReject: () => void
  isPending?: boolean
  className?: string
}

export function GradeValidationCard({
  validation,
  onViewDetails,
  onValidate,
  onReject,
  isPending,
  className,
}: GradeValidationCardProps) {
  const t = useTranslations()
  const timeAgo = formatDistanceToNow(new Date(validation.submittedAt), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('group', className)}
    >
      <Card className="overflow-hidden rounded-2xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl transition-all group-hover:shadow-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform shadow-inner">
                <IconFileText className="size-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold tracking-tight text-foreground leading-none">
                    {validation.gradeName}
                  </h3>
                  <div className="h-1 w-1 rounded-full bg-border" />
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{validation.className}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary/60">
                  {validation.subjectName}
                </div>
              </div>
            </div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20 shadow-sm">
              {t.academic.grades.validations.pendingCount({ count: validation.pendingCount })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/30 border border-border/20">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/50 border border-border/40">
                <IconUser className="size-3 text-muted-foreground" />
              </div>
              <span className="text-muted-foreground italic truncate">
                {t.academic.grades.validations.submittedBy()}
                :
                <span className="text-foreground font-bold not-italic ml-1">{validation.teacherName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/50 border border-border/40">
                <IconClock className="size-3 text-muted-foreground" />
              </div>
              <span className="text-muted-foreground font-medium uppercase tracking-wider opacity-60">
                {t.academic.grades.validations.submittedAt()}
                {' '}
                {timeAgo}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-3 p-4 bg-muted/20 border-t border-border/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            disabled={isPending}
            className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-background/80"
          >
            {t.academic.grades.validations.viewDetails()}
            <IconChevronRight className="ml-1 size-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            disabled={isPending}
            className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
          >
            <IconCircleX className="mr-1.5 size-3.5" />
            {t.academic.grades.validations.reject()}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onValidate}
            disabled={isPending}
            className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-success hover:bg-success/90 shadow-lg shadow-success/20"
          >
            <IconCircleCheck className="mr-1.5 size-3.5" />
            {t.academic.grades.validations.validate()}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
