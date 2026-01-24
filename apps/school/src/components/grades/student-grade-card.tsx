import type { TranslationFunctions } from '@/i18n'
import { IconCalendar, IconHash, IconInfoCircle, IconSchool, IconStar, IconTrendingDown, IconTrendingUp, IconUser } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/formatDate'
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
    return 'text-amber-500 font-semibold'
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

  const validatedGrades = grades.filter(g => g.status === 'validated')
  const pendingGrades = grades.filter(g => g.status !== 'validated')

  const gradesBySubject = validatedGrades.reduce(
    (acc, grade) => {
      const subjectName = grade.subject.name
      if (!acc[subjectName]) {
        acc[subjectName] = []
      }
      acc[subjectName].push(grade)
      return acc
    },
    {} as Record<string, Grade[]>,
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn('overflow-hidden rounded-2xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl transition-all hover:shadow-primary/5 group', className)}>
        <CardHeader className="bg-muted/20 border-b border-border/20 pb-6 relative overflow-hidden">
          {/* Background Accent */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-primary/5 blur-3xl" />

          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 text-primary shadow-inner border border-primary/20 group-hover:scale-105 transition-transform duration-500">
                  <IconUser className="size-8" />
                </div>
                {rank !== undefined && rank <= 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-background z-20"
                  >
                    <IconStar className="size-3.5 fill-current" />
                  </motion.div>
                )}
              </div>

              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground leading-none">
                  {student.lastName}
                  {' '}
                  <span className="text-primary/80">{student.firstName}</span>
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-[10px] font-bold tracking-widest bg-background/50 border-border/40 py-0.5 px-2 rounded-lg">
                    <IconHash className="size-3 mr-1 text-muted-foreground" />
                    {student.matricule}
                  </Badge>
                  {rank !== undefined && (
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase bg-primary/10 text-primary border-none">
                      {t.academic.grades.rank({ rank, total: totalStudents || 0 })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {average !== undefined && (
              <div className="flex flex-col items-end self-end sm:self-auto">
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn('text-4xl font-bold font-mono tracking-tighter drop-shadow-sm', getGradeColor(average))}>
                      {average.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">/ 20</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 px-3 py-1 rounded-lg bg-background/40 border border-border/10 shadow-inner">
                    <IconSchool className="size-3 text-muted-foreground" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 leading-none">
                      {t.academic.grades.averages.average()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {rank !== undefined && totalStudents !== undefined && (
            <div className="mt-8 relative h-10 flex items-center">
              <div className="absolute inset-0 rounded-xl bg-background/20 backdrop-blur-md border border-border/10 shadow-inner" />
              <div className="relative w-full px-4 flex items-center justify-between gap-6">
                <div className="flex items-center gap-2 shrink-0">
                  <div className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-lg shadow-sm',
                    rank <= 3
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : rank > totalStudents - 3 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
                  )}
                  >
                    {rank <= 3
                      ? <IconTrendingUp className="size-3.5" />
                      : rank > totalStudents - 3 ? <IconTrendingDown className="size-3.5" /> : <IconTrendingUp className="size-3.5 opacity-30" />}
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/80">
                    Niveau Global
                  </span>
                </div>

                <div className="flex-1 max-w-[200px] h-1.5 bg-muted/30 rounded-full overflow-hidden border border-border/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(1 - rank / totalStudents) * 100}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className={cn(
                      'h-full relative',
                      rank <= 3 ? 'bg-emerald-500' : rank > totalStudents - 3 ? 'bg-destructive' : 'bg-primary',
                    )}
                  />
                </div>

                <span className="font-bold tabular-nums text-xs text-foreground shrink-0">
                  {Math.round((1 - rank / totalStudents) * 100)}
                  %
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          <AnimatePresence mode="popLayout">
            {Object.keys(gradesBySubject).length === 0
              ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 space-y-4 opacity-50"
                  >
                    <div className="p-4 rounded-full bg-muted/20 border border-border/10">
                      <IconInfoCircle className="size-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
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
                            <div className="h-5 w-1 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" />
                            <span className="font-bold text-xs tracking-[0.2em] text-foreground uppercase">{subjectName}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold bg-muted/40 border-border/20 px-2 rounded-md">
                            {subjectGrades.length}
                            {' '}
                            {subjectGrades.length > 1 ? 'notes' : 'note'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                          {subjectGrades.map(grade => (
                            <motion.div
                              key={grade.id}
                              whileHover={{ scale: 1.05 }}
                              className="group relative flex flex-col items-center gap-1.5 rounded-2xl border border-border/20 bg-background/40 p-3 transition-all hover:bg-white/5 hover:border-primary/30 hover:shadow-lg shadow-sm"
                              title={grade.description ?? undefined}
                            >
                              <span className={cn('text-xl font-bold font-mono tracking-tighter', getGradeColor(Number(grade.value)))}>
                                {Number(grade.value).toFixed(1)}
                              </span>
                              <div className="h-px w-6 bg-border/20" />
                              <Badge variant="secondary" className="h-5 px-2 text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary/70 border-primary/10">
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
              className="mt-10 pt-8 border-t border-border/20 relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-background border border-border/20 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 shadow-sm">
                En attente
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {pendingGrades.map((grade, idx) => (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 rounded-2xl border border-dashed border-border/40 bg-background/40 pl-4 pr-2 py-2 transition-all hover:border-amber-500/50 hover:bg-amber-500/5 shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold tracking-tighter text-foreground decoration-amber-500/20 underline underline-offset-4">
                        {Number(grade.value).toFixed(1)}
                      </span>
                      <span className="text-[8px] font-bold uppercase text-muted-foreground/60 leading-none mt-0.5">
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
            <div className="mt-8 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 pt-4">
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
