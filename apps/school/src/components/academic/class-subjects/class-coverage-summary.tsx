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
    <div className="
      mb-6 grid gap-4
      md:grid-cols-2
      lg:grid-cols-4
    "
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="
          border-border/40 bg-card/40 rounded-xl border p-6 shadow-sm
          backdrop-blur-xl
        "
      >
        <div className="text-foreground text-2xl font-bold">{totalSubjects}</div>
        <p className="text-muted-foreground mt-1 text-xs">
          {t.academic.classes.totalSubjects()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="
          border-border/40 bg-card/40 rounded-xl border p-6 shadow-sm
          backdrop-blur-xl
        "
      >
        <div className="text-foreground text-2xl font-bold">{totalCoefficient}</div>
        <p className="text-muted-foreground mt-1 text-xs">
          {t.academic.classes.totalCoefficient()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="
          border-border/40 bg-card/40 rounded-xl border p-6 shadow-sm
          backdrop-blur-xl
        "
      >
        <div className="text-foreground text-2xl font-bold">
          {totalHours}
          h
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {t.academic.classes.weeklyHours()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="
          border-border/40 bg-card/40 flex flex-col justify-between rounded-xl
          border p-6 shadow-sm backdrop-blur-xl
        "
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-sm font-medium">
              {t.academic.classes.assignmentCoverage()}
            </span>
            <span className="text-primary text-sm font-semibold">
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
                <div className="
                  text-primary bg-primary/10 flex w-fit items-center
                  rounded-full px-2 py-1 text-xs font-medium
                "
                >
                  <IconCircleCheck className="h-3.1 w-3.1 mr-1" />
                  {t.academic.classes.allSubjectsAssigned()}
                </div>
              )
            : (
                <div className="
                  text-accent bg-accent/10 flex w-fit items-center rounded-full
                  px-2 py-1 text-xs font-medium
                "
                >
                  <IconAlertCircle className="h-3.1 w-3.1 mr-1" />
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
