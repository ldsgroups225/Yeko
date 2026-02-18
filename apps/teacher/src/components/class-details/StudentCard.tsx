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
    return <IconTrendingUp className="w-3 h-3 text-success" />
  if (diff < -1)
    return <IconTrendingDown className="w-3 h-3 text-destructive" />
  return <IconMinus className="w-3 h-3 text-muted-foreground" />
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
        'overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm transition-all',
        !isEntryMode ? 'hover:shadow-lg hover:scale-[1.01]' : '',
      )}
    >
      <div className="w-full p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar className="h-10 w-10 border border-border/50 shrink-0">
            <AvatarImage src={student.photoUrl ?? undefined} alt={`${student.firstName} ${student.lastName}`} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {student.firstName[0]}
              {student.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground text-sm">
              {student.firstName}
              {' '}
              {student.lastName}
            </h3>
            {!isEntryMode && (
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="h-5 font-normal text-xs">
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
                  className="h-12 w-20 text-center text-xl font-black bg-muted/40 border-primary/20 rounded-xl focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-sm font-black text-muted-foreground">
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
                  <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-tighter">{LL.common.average()}</div>
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-md px-2.5 py-1 font-bold text-base',
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
                      <IconChevronUp className="h-5 w-5 text-muted-foreground" />
                    )
                  : (
                      <IconChevronDown className="h-5 w-5 text-muted-foreground" />
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
            className="overflow-hidden border-t bg-linear-to-br from-muted/30 to-muted/10"
          >
            <div className="p-4 space-y-4">
              {/* Grade Details */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex flex-col rounded-md bg-background p-2">
                  <span className="mb-1.5 font-medium text-muted-foreground">{LL.grades.quizzes()}</span>
                  <span className="font-semibold text-base text-muted-foreground">-</span>
                </div>
                <div className="flex flex-col rounded-md bg-background p-2">
                  <span className="mb-1.5 font-medium text-muted-foreground">{LL.grades.tests()}</span>
                  <span className="font-semibold text-base text-muted-foreground">-</span>
                </div>
                <div className="flex flex-col rounded-md bg-background p-2">
                  <span className="mb-1.5 font-medium text-muted-foreground">{LL.grades.level_tests()}</span>
                  <span className="font-semibold text-base text-muted-foreground">-</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link to="/app/students/$studentId/notes" params={{ studentId: student.id }} className="flex-1">
                  <Button variant="outline" className="w-full h-10 font-bold border-border/60 hover:bg-muted/50">
                    <IconEdit className="w-4 h-4 mr-2" />
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
