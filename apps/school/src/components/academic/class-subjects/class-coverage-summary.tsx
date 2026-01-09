import type { ClassSubject, Subject } from '@repo/data-ops'
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react'
import { Progress } from '@workspace/ui/components/progress'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface ClassCoverageSummaryProps {
  subjects: Array<{
    classSubject: ClassSubject
    subject: Subject
    teacher?: { id: string | null, name: string | null } | null
  }>
}

export function ClassCoverageSummary({ subjects }: ClassCoverageSummaryProps) {
  const t = useTranslations()
  const totalSubjects = subjects.length
  const assignedSubjects = subjects.filter(s => !!s.classSubject.teacherId).length

  const totalHours = subjects.reduce(
    (acc, curr) => acc + curr.classSubject.hoursPerWeek,
    0,
  )
  const totalCoefficient = subjects.reduce(
    (acc, curr) => acc + curr.classSubject.coefficient,
    0,
  )

  const coveragePercentage = totalSubjects > 0
    ? Math.round((assignedSubjects / totalSubjects) * 100)
    : 0

  const isComplete = coveragePercentage === 100 && totalSubjects > 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm p-6"
      >
        <div className="text-2xl font-bold text-foreground">{totalSubjects}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {t.academic.classes.totalSubjects()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm p-6"
      >
        <div className="text-2xl font-bold text-foreground">{totalCoefficient}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {t.academic.classes.totalCoefficient()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm p-6"
      >
        <div className="text-2xl font-bold text-foreground">
          {totalHours}
          h
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t.academic.classes.weeklyHours()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm p-6 flex flex-col justify-between"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {t.academic.classes.assignmentCoverage()}
            </span>
            <span className="text-sm font-semibold text-primary">
              {coveragePercentage}
              %
            </span>
          </div>
          <Progress
            value={coveragePercentage}
            className={cn(
              'h-1.5 bg-white/5 shadow-inner',
              isComplete ? '[&>div]:bg-primary' : '[&>div]:bg-primary/60',
            )}
          />
        </div>
        <div className="mt-4">
          {isComplete
            ? (
                <div className="flex items-center text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full w-fit">
                  <IconCircleCheck className="mr-1 h-3.1 w-3.1" />
                  {t.academic.classes.allSubjectsAssigned()}
                </div>
              )
            : (
                <div className="flex items-center text-xs text-amber-500 font-medium bg-amber-500/10 px-2 py-1 rounded-full w-fit">
                  <IconAlertCircle className="mr-1 h-3.1 w-3.1" />
                  {t.academic.classes.unassignedCount({
                    count: totalSubjects - assignedSubjects,
                  })}
                </div>
              )}
        </div>
      </motion.div>
    </div>
  )
}
