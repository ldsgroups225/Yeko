import type { TranslationFunctions } from '@/i18n'
import { formatDate } from '@repo/data-ops'
import { IconCalendar, IconHash, IconInfoCircle, IconSchool, IconStar, IconTrendingDown, IconTrendingUp, IconUser } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { GradeStatusBadge } from './grade-status-badge'

interface Grade {
  id: string
  value: string
  type: string
  weight: number
  description: string | null
  gradeDate: string
  status: 'draft' | 'submitted' | 'validated' | 'rejected'
  subject: {
    name: string
  }
}

interface StudentGradeCardProps {
  student: {
    id: string
    firstName: string
    lastName: string
    matricule: string
  }
  grades: Grade[]
  average?: number
  rank?: number
  totalStudents?: number
  className?: string
}

function getGradeColor(value: number): string {
  if (value >= 16)
    return 'text-emerald-500 font-bold'
  if (value >= 14)
    return 'text-indigo-500 font-bold'
  if (value >= 10)
    return 'text-accent font-semibold'
  return 'text-destructive font-bold'
}

function getGradeLabel(type: string, t: TranslationFunctions): string {
  const labels: Record<string, string> = {
    quiz: t.academic.grades.types.quiz(),
    test: t.academic.grades.types.test(),
    exam: t.academic.grades.types.exam(),
    participation: t.academic.grades.types.participation(),
    homework: t.academic.grades.types.homework(),
    project: t.academic.grades.types.project(),
  }
  return labels[type] ?? type
}

export function StudentGradeCard({
  student,
  grades,
  average,
  rank,
  totalStudents,
  className,
}: StudentGradeCardProps) {
  const t = useTranslations()

  const validatedGrades = useMemo(() => grades.filter(g => g.status === 'validated'), [grades])
  const pendingGrades = useMemo(() => grades.filter(g => g.status !== 'validated'), [grades])

  const gradesBySubject = useMemo(() => validatedGrades.reduce(
    (acc, grade) => {
      const subjectName = grade.subject.name
      if (!acc[subjectName]) {
        acc[subjectName] = []
      }
      acc[subjectName].push(grade)
      return acc
    },
    {} as Record<string, Grade[]>,
  ), [validatedGrades])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(`
        border-border/40 bg-card/30
        hover:shadow-primary/5
        group overflow-hidden rounded-2xl shadow-xl backdrop-blur-xl
        transition-all
      `, className)}
      >
        <CardHeader className="
          bg-muted/20 border-border/20 relative overflow-hidden border-b pb-6
        "
        >
          {/* Background Accent */}
          <div className="
            bg-primary/5 absolute top-0 right-0 -mt-8 -mr-8 size-32 rounded-full
            blur-3xl
          "
          />

          <div className="
            relative z-10 flex flex-col items-start justify-between gap-6
            sm:flex-row
          "
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="
                  from-primary/20 to-primary/5 text-primary border-primary/20
                  flex size-16 items-center justify-center rounded-2xl border
                  bg-linear-to-br shadow-inner transition-transform duration-500
                  group-hover:scale-105
                "
                >
                  <IconUser className="size-8" />
                </div>
                {rank !== undefined && rank <= 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="
                      bg-accent shadow-accent/30 ring-background absolute -top-2
                      -right-2 z-20 flex h-7 w-7 items-center justify-center
                      rounded-full text-white shadow-lg ring-2
                    "
                  >
                    <IconStar className="size-3.5 fill-current" />
                  </motion.div>
                )}
              </div>

              <div className="space-y-1.5">
                <CardTitle className="
                  text-foreground text-2xl leading-none font-bold tracking-tight
                "
                >
                  {student.lastName}
                  {' '}
                  <span className="text-primary/80">{student.firstName}</span>
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="
                      bg-background/50 border-border/40 rounded-lg px-2 py-0.5
                      font-mono text-[10px] font-bold tracking-widest
                    "
                  >
                    <IconHash className="text-muted-foreground mr-1 size-3" />
                    {student.matricule}
                  </Badge>
                  {rank !== undefined && (
                    <Badge
                      variant="secondary"
                      className="
                        bg-primary/10 text-primary border-none text-[10px]
                        font-bold uppercase
                      "
                    >
                      {t.academic.grades.rank({ rank, total: totalStudents || 0 })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {average !== undefined && (
              <div className="
                flex flex-col items-end self-end
                sm:self-auto
              "
              >
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn(`
                      font-mono text-4xl font-bold tracking-tighter
                      drop-shadow-sm
                    `, getGradeColor(average))}
                    >
                      {average.toFixed(2)}
                    </span>
                    <span className="
                      text-muted-foreground/40 text-xs font-bold tracking-widest
                      uppercase
                    "
                    >
                      / 20
                    </span>
                  </div>
                  <div className="
                    bg-background/40 border-border/10 mt-1 flex items-center
                    gap-2 rounded-lg border px-3 py-1 shadow-inner
                  "
                  >
                    <IconSchool className="text-muted-foreground size-3" />
                    <p className="
                      text-muted-foreground/80 text-[9px] leading-none font-bold
                      tracking-widest uppercase
                    "
                    >
                      {t.academic.grades.averages.average()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {rank !== undefined && totalStudents !== undefined && (
            <div className="relative mt-8 flex h-10 items-center">
              <div className="
                bg-background/20 border-border/10 absolute inset-0 rounded-xl
                border shadow-inner backdrop-blur-md
              "
              />
              <div className="
                relative flex w-full items-center justify-between gap-6 px-4
              "
              >
                <div className="flex shrink-0 items-center gap-2">
                  <div className={cn(
                    `
                      flex h-6 w-6 items-center justify-center rounded-lg
                      shadow-sm
                    `,
                    rank <= 3
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : rank > totalStudents - 3
                        ? `bg-destructive/10 text-destructive`
                        : `bg-primary/10 text-primary`,
                  )}
                  >
                    {rank <= 3
                      ? <IconTrendingUp className="size-3.5" />
                      : rank > totalStudents - 3
                        ? (
                            <IconTrendingDown className="size-3.5" />
                          )
                        : (
                            <IconTrendingUp className="size-3.5 opacity-30" />
                          )}
                  </div>
                  <span className="
                    text-muted-foreground/80 text-[10px] font-bold
                    tracking-widest uppercase
                  "
                  >
                    Niveau Global
                  </span>
                </div>

                <div className="
                  bg-muted/30 border-border/5 h-1.5 max-w-[200px] flex-1
                  overflow-hidden rounded-full border
                "
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(1 - rank / totalStudents) * 100}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className={cn(
                      'relative h-full',
                      rank <= 3
                        ? 'bg-emerald-500'
                        : rank > totalStudents - 3
                          ? `bg-destructive`
                          : `bg-primary`,
                    )}
                  />
                </div>

                <span className="
                  text-foreground shrink-0 text-xs font-bold tabular-nums
                "
                >
                  {Math.round((1 - rank / totalStudents) * 100)}
                  %
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          <AnimatePresence mode="popLayout">
            {Object.keys(gradesBySubject).length === 0
              ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="
                      flex flex-col items-center justify-center space-y-4 py-12
                      opacity-50
                    "
                  >
                    <div className="
                      bg-muted/20 border-border/10 rounded-full border p-4
                    "
                    >
                      <IconInfoCircle className="text-muted-foreground size-8" />
                    </div>
                    <p className="
                      text-muted-foreground text-sm font-bold tracking-widest
                      uppercase
                    "
                    >
                      {t.academic.grades.noGrades()}
                    </p>
                  </motion.div>
                )
              : (
                  <div className="space-y-8">
                    {Object.entries(gradesBySubject).map(([subjectName, subjectGrades], idx) => (
                      <motion.div
                        key={subjectName}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-3">
                            <div className="
                              bg-primary/40 h-5 w-1 rounded-full
                              shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]
                            "
                            />
                            <span className="
                              text-foreground text-xs font-bold tracking-[0.2em]
                              uppercase
                            "
                            >
                              {subjectName}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="
                              bg-muted/40 border-border/20 rounded-md px-2
                              text-[10px] font-bold
                            "
                          >
                            {subjectGrades.length}
                            {' '}
                            {subjectGrades.length > 1 ? 'notes' : 'note'}
                          </Badge>
                        </div>

                        <div className="
                          xs:grid-cols-3
                          grid grid-cols-2 gap-3
                          sm:grid-cols-4
                        "
                        >
                          {subjectGrades.map(grade => (
                            <motion.div
                              key={grade.id}
                              whileHover={{ scale: 1.05 }}
                              className="
                                group border-border/20 bg-background/40
                                hover:border-primary/30
                                relative flex flex-col items-center gap-1.5
                                rounded-2xl border p-3 shadow-sm transition-all
                                hover:bg-white/5 hover:shadow-lg
                              "
                              title={grade.description ?? undefined}
                            >
                              <span className={cn(`
                                font-mono text-xl font-bold tracking-tighter
                              `, getGradeColor(Number(grade.value)))}
                              >
                                {Number(grade.value).toFixed(1)}
                              </span>
                              <div className="bg-border/20 h-px w-6" />
                              <Badge
                                variant="secondary"
                                className="
                                  bg-primary/5 text-primary/70 border-primary/10
                                  h-5 px-2 text-[9px] font-bold tracking-wider
                                  uppercase
                                "
                              >
                                {getGradeLabel(grade.type, t)}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
          </AnimatePresence>

          {pendingGrades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-border/20 relative mt-10 border-t pt-8"
            >
              <div className="
                bg-background border-border/20 text-accent absolute top-0
                left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border
                px-4 py-1 text-[10px] font-bold tracking-[0.2em] uppercase
                shadow-sm
              "
              >
                En attente
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {pendingGrades.map((grade, idx) => (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="
                      border-border/40 bg-background/40
                      hover:border-accent/50 hover:bg-accent/5
                      flex items-center gap-4 rounded-2xl border border-dashed
                      py-2 pr-2 pl-4 shadow-sm transition-all
                    "
                  >
                    <div className="flex flex-col">
                      <span className="
                        text-foreground decoration-accent/20 font-mono text-sm
                        font-bold tracking-tighter underline underline-offset-4
                      "
                      >
                        {Number(grade.value).toFixed(1)}
                      </span>
                      <span className="
                        text-muted-foreground/60 mt-0.5 text-[8px] leading-none
                        font-bold uppercase
                      "
                      >
                        {getGradeLabel(grade.type, t)}
                      </span>
                    </div>
                    <GradeStatusBadge status={grade.status} className="scale-90" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {grades.length > 0 && (
            <div className="
              text-muted-foreground/40 mt-8 flex items-center justify-center
              gap-2 pt-4 text-[9px] font-bold tracking-[0.2em] uppercase
            "
            >
              <IconCalendar className="size-3" />
              {t.academic.grades.lastUpdated({
                date: formatDate(
                  new Date(
                    Math.max(
                      ...grades.map(g => new Date(g.gradeDate).getTime()),
                    ),
                  ),
                  'MEDIUM',
                ),
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
