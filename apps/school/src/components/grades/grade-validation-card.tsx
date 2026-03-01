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
      <Card className="
        border-border/40 bg-card/30
        group-hover:shadow-primary/10
        overflow-hidden rounded-2xl shadow-xl backdrop-blur-xl transition-all
      "
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="
                bg-primary/10 text-primary flex h-12 w-12 items-center
                justify-center rounded-2xl shadow-inner transition-transform
                group-hover:scale-110
              "
              >
                <IconFileText className="size-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="
                    text-foreground text-lg leading-none font-bold
                    tracking-tight
                  "
                  >
                    {validation.gradeName}
                  </h3>
                  <div className="bg-border h-1 w-1 rounded-full" />
                  <span className="
                    text-muted-foreground text-sm font-bold tracking-wider
                    uppercase
                  "
                  >
                    {validation.className}
                  </span>
                </div>
                <div className="
                  text-primary/60 flex items-center gap-2 text-sm font-semibold
                "
                >
                  {validation.subjectName}
                </div>
              </div>
            </div>
            <div className="
              bg-primary/10 text-primary border-primary/20 rounded-full border
              px-3 py-1 text-[10px] font-bold tracking-widest uppercase
              shadow-sm
            "
            >
              {t.academic.grades.validations.pendingCount({ count: validation.pendingCount })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          <div className="
            bg-muted/30 border-border/20 flex flex-col gap-3 rounded-xl border
            p-4
          "
          >
            <div className="flex items-center gap-2 text-sm">
              <div className="
                bg-background/50 border-border/40 flex h-6 w-6 items-center
                justify-center rounded-full border
              "
              >
                <IconUser className="text-muted-foreground size-3" />
              </div>
              <span className="text-muted-foreground truncate italic">
                {t.academic.grades.validations.submittedBy()}
                :
                <span className="text-foreground ml-1 font-bold not-italic">{validation.teacherName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="
                bg-background/50 border-border/40 flex h-6 w-6 items-center
                justify-center rounded-full border
              "
              >
                <IconClock className="text-muted-foreground size-3" />
              </div>
              <span className="
                text-muted-foreground font-medium tracking-wider uppercase
                opacity-60
              "
              >
                {t.academic.grades.validations.submittedAt()}
                {' '}
                {timeAgo}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/20 border-border/20 gap-3 border-t p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            disabled={isPending}
            className="
              hover:bg-background/80
              flex-1 rounded-xl text-[10px] font-bold tracking-widest uppercase
            "
          >
            {t.academic.grades.validations.viewDetails()}
            <IconChevronRight className="ml-1 size-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            disabled={isPending}
            className="
              border-destructive/30 text-destructive
              hover:bg-destructive hover:text-destructive-foreground
              flex-1 rounded-xl text-[10px] font-bold tracking-widest uppercase
              shadow-sm transition-all
            "
          >
            <IconCircleX className="mr-1.5 size-3.5" />
            {t.academic.grades.validations.reject()}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onValidate}
            disabled={isPending}
            className="
              bg-success
              hover:bg-success/90
              shadow-success/20 flex-1 rounded-xl text-[10px] font-bold
              tracking-widest uppercase shadow-lg
            "
          >
            <IconCircleCheck className="mr-1.5 size-3.5" />
            {t.academic.grades.validations.validate()}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
