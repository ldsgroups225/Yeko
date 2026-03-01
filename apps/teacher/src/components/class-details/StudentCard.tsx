import {
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconMinus,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { cn } from '@workspace/ui/lib/utils'
import { AnimatePresence, m as motion } from 'motion/react'
import { useI18nContext } from '@/i18n/i18n-react'

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 14,
  GOOD: 12,
  PASSING: 10,
} as const

// Utility functions
function getPerformanceColor(average: number | null): string {
  if (average === null)
    return 'text-muted-foreground'
  if (average >= PERFORMANCE_THRESHOLDS.EXCELLENT)
    return 'text-success'
  if (average >= PERFORMANCE_THRESHOLDS.GOOD)
    return 'text-info'
  if (average >= PERFORMANCE_THRESHOLDS.PASSING)
    return 'text-warning'
  return 'text-destructive'
}

function getPerformanceBgColor(average: number | null): string {
  if (average === null)
    return 'bg-muted/30'
  if (average >= PERFORMANCE_THRESHOLDS.EXCELLENT)
    return 'bg-success'
  if (average >= PERFORMANCE_THRESHOLDS.GOOD)
    return 'bg-info'
  if (average >= PERFORMANCE_THRESHOLDS.PASSING)
    return 'bg-warning'
  return 'bg-destructive'
}

function getPerformanceIcon(average: number | null, classAvg: number | null) {
  if (average === null || classAvg === null)
    return null
  const diff = average - classAvg
  if (diff > 1)
    return <IconTrendingUp className="text-success h-3 w-3" />
  if (diff < -1)
    return <IconTrendingDown className="text-destructive h-3 w-3" />
  return <IconMinus className="text-muted-foreground h-3 w-3" />
}

export interface StudentCardProps {
  student: {
    id: string
    firstName: string
    lastName: string
    matricule: string
    photoUrl: string | null
  }
  isExpanded: boolean
  classAverage: number | null
  onToggle: () => void
  onGradeChange?: (val: string) => void
  isEntryMode: boolean
  gradeValue: string | undefined
  gradeOutOf?: number
}

export function StudentCard({
  student,
  isExpanded,
  classAverage,
  onToggle,
  isEntryMode,
  gradeValue,
  onGradeChange,
  gradeOutOf = 20,
}: StudentCardProps) {
  const { LL } = useI18nContext()
  // Mock data - would be replaced with actual grade data
  // Using as const assertion to keep the type as number | null
  const studentAverage = null as number | null
  const participationCount = 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        `
          border-border/50 bg-card/80 overflow-hidden rounded-xl border
          shadow-sm backdrop-blur-sm transition-all
        `,
        !isEntryMode ? 'hover:scale-[1.01] hover:shadow-lg' : '',
      )}
    >
      <div className="flex w-full items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar className="border-border/50 h-10 w-10 shrink-0 border">
            <AvatarImage src={student.photoUrl ?? undefined} alt={`${student.firstName} ${student.lastName}`} />
            <AvatarFallback className="
              bg-primary/10 text-primary text-xs font-bold
            "
            >
              {student.firstName[0]}
              {student.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="text-foreground truncate text-sm font-semibold">
              {student.firstName}
              {' '}
              {student.lastName}
            </h3>
            {!isEntryMode && (
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="h-5 text-xs font-normal">
                  <span className="text-muted-foreground">
                    {LL.common.participation()}
                    :
                  </span>
                  <span className="ml-1 font-semibold">{participationCount}</span>
                </Badge>
              </div>
            )}
          </div>
        </div>

        {isEntryMode
          ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder={LL.common.notAvailable()}
                  value={gradeValue || ''}
                  onChange={e => onGradeChange?.(e.target.value)}
                  className="
                    bg-muted/40 border-primary/20
                    focus:ring-primary/30
                    h-12 w-20 rounded-xl text-center text-xl font-black
                    focus:ring-2
                  "
                />
                <span className="text-muted-foreground text-sm font-black">
                  /
                  {gradeOutOf}
                </span>
              </div>
            )
          : (
              <button
                type="button"
                onClick={onToggle}
                className="flex items-center gap-2"
              >
                <div className="text-right">
                  <div className="
                    text-muted-foreground text-[10px] font-bold tracking-tighter
                    uppercase
                  "
                  >
                    {LL.common.average()}
                  </div>
                  <div
                    className={cn(
                      `
                        flex items-center gap-1 rounded-md px-2.5 py-1 text-base
                        font-bold
                      `,
                      getPerformanceBgColor(studentAverage),
                    )}
                  >
                    {getPerformanceIcon(studentAverage, classAverage)}
                    <span className={cn(
                      getPerformanceColor(studentAverage),
                      !!getPerformanceColor(studentAverage) && 'mx-auto',
                    )}
                    >
                      {studentAverage !== null ? studentAverage.toFixed(2) : '-'}
                    </span>
                  </div>
                </div>
                {isExpanded
                  ? (
                      <IconChevronUp className="text-muted-foreground h-5 w-5" />
                    )
                  : (
                      <IconChevronDown className="text-muted-foreground h-5 w-5" />
                    )}
              </button>
            )}
      </div>

      <AnimatePresence>
        {isExpanded && !isEntryMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="
              from-muted/30 to-muted/10 overflow-hidden border-t bg-linear-to-br
            "
          >
            <div className="space-y-4 p-4">
              {/* Grade Details */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-background flex flex-col rounded-md p-2">
                  <span className="text-muted-foreground mb-1.5 font-medium">{LL.grades.quizzes()}</span>
                  <span className="
                    text-muted-foreground text-base font-semibold
                  "
                  >
                    -
                  </span>
                </div>
                <div className="bg-background flex flex-col rounded-md p-2">
                  <span className="text-muted-foreground mb-1.5 font-medium">{LL.grades.tests()}</span>
                  <span className="
                    text-muted-foreground text-base font-semibold
                  "
                  >
                    -
                  </span>
                </div>
                <div className="bg-background flex flex-col rounded-md p-2">
                  <span className="text-muted-foreground mb-1.5 font-medium">{LL.grades.level_tests()}</span>
                  <span className="
                    text-muted-foreground text-base font-semibold
                  "
                  >
                    -
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  to="/app/students/$studentId/notes"
                  params={{ studentId: student.id }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="
                      border-border/60
                      hover:bg-muted/50
                      h-10 w-full font-bold
                    "
                  >
                    <IconEdit className="mr-2 h-4 w-4" />
                    {LL.notes.manage()}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
