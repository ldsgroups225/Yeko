import { IconHash, IconPercentage, IconTrendingUp, IconTrophy, IconUser } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface StudentAverage {
  studentId: string
  studentName: string
  matricule: string
  average: number
  weightedAverage: number
  rank: number
  gradeCount: number
  grades?: {
    value: number
    max: number
    coefficient: number
    type?: string
    gradeName?: string
  }[]
}

interface ClassAveragesTableProps {
  averages: StudentAverage[]
  className?: string
  onStudentClick?: (studentId: string) => void
}

function getAverageColor(average: number): string {
  if (average >= 16)
    return 'text-success font-bold'
  if (average >= 14)
    return 'text-secondary font-bold'
  if (average >= 10)
    return 'text-foreground font-semibold'
  return 'text-destructive font-bold'
}

function getRankStyles(rank: number): string {
  if (rank === 1)
    return 'bg-accent/10 text-accent-foreground border-accent/20 shadow-accent/10'
  if (rank === 2)
    return 'bg-muted text-muted-foreground border-muted'
  if (rank === 3)
    return 'bg-accent/10 text-accent-foreground border-accent/20'
  return 'bg-muted/50 text-muted-foreground border-border/40'
}

export function ClassAveragesTable({ averages, className, onStudentClick }: ClassAveragesTableProps) {
  const t = useTranslations()
  const sortedAverages = useMemo(() => [...averages].sort((a, b) => a.rank - b.rank), [averages])

  const classAverage = useMemo(() => averages.length > 0
    ? averages.reduce((sum, a) => sum + a.weightedAverage, 0) / averages.length
    : 0, [averages])
  const passCount = useMemo(() => averages.filter(a => a.weightedAverage >= 10).length, [averages])
  const passRate = useMemo(() => averages.length > 0 ? (passCount / averages.length) * 100 : 0, [passCount, averages.length])

  return (
    <Card className={cn(`
      border-border/40 bg-card/30 overflow-hidden rounded-2xl shadow-xl
      backdrop-blur-xl
    `, className)}
    >
      <CardHeader className="border-border/20 bg-muted/20 border-b">
        <div className="
          flex flex-col justify-between gap-4
          sm:flex-row sm:items-center
        "
        >
          <div className="flex items-center gap-3">
            <div className="
              bg-primary/10 text-primary flex h-10 w-10 items-center
              justify-center rounded-xl shadow-inner
            "
            >
              <IconTrophy className="size-5" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">{t.academic.grades.averages.title()}</CardTitle>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="
              bg-background/50 border-border/40 flex items-center gap-3
              rounded-xl border px-4 py-2 shadow-sm
            "
            >
              <div className="bg-primary/10 text-primary rounded-lg p-1.5">
                <IconTrendingUp className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="
                  text-muted-foreground mb-1 text-[10px] leading-none font-bold
                  tracking-widest uppercase opacity-70
                "
                >
                  {t.academic.grades.statistics.classAverage()}
                </span>
                <span className={cn('text-sm font-bold tabular-nums', getAverageColor(classAverage))}>
                  {classAverage.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="
              bg-background/50 border-border/40 flex items-center gap-3
              rounded-xl border px-4 py-2 shadow-sm
            "
            >
              <div className="bg-success/10 text-success rounded-lg p-1.5">
                <IconPercentage className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="
                  text-muted-foreground mb-1 text-[10px] leading-none font-bold
                  tracking-widest uppercase opacity-70
                "
                >
                  {t.academic.grades.statistics.passRate()}
                </span>
                <span className={cn('text-sm font-bold tabular-nums', passRate >= 50
                  ? `text-success`
                  : `text-destructive`)}
                >
                  {passRate.toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="
                bg-muted/10 border-b-border/20
                hover:bg-muted/10
              "
              >
                <TableHead className="w-20 text-center">
                  <span className="
                    text-[10px] font-bold tracking-tight uppercase
                  "
                  >
                    RANG
                  </span>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <IconUser className="text-muted-foreground size-3.5" />
                    <span className="
                      text-[10px] font-bold tracking-tight uppercase
                    "
                    >
                      ELEVE
                    </span>
                  </div>
                </TableHead>
                <TableHead className="w-32">
                  <div className="flex items-center gap-2">
                    <IconHash className="text-muted-foreground size-3.5" />
                    <span className="
                      text-[10px] font-bold tracking-tight uppercase
                    "
                    >
                      MATRICULE
                    </span>
                  </div>
                </TableHead>
                <TableHead className="w-28 px-6 text-center">
                  <span className="
                    text-[10px] font-bold tracking-tight uppercase
                  "
                  >
                    MOYENNE
                  </span>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <span className="
                    text-[10px] font-bold tracking-tight uppercase
                  "
                  >
                    LISTE DES NOTES
                  </span>
                </TableHead>
                <TableHead className="w-32 px-6 text-center">
                  <span className="
                    text-[10px] font-bold tracking-tight uppercase
                  "
                  >
                    MOY. COEF.
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {sortedAverages.map((student, index) => (
                  <motion.tr
                    key={student.studentId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onStudentClick?.(student.studentId)}
                    className={cn(
                      `
                        group border-border/10
                        hover:bg-primary/5
                        border-b transition-colors
                        last:border-0
                      `,
                      onStudentClick && `
                        hover:bg-primary/10
                        cursor-pointer
                      `,
                    )}
                  >
                    <TableCell className="py-4 text-center">
                      <div
                        className={cn(
                          `
                            inline-flex size-8 items-center justify-center
                            rounded-xl border text-xs font-bold shadow-sm
                            transition-transform
                            group-hover:scale-110
                          `,
                          getRankStyles(student.rank),
                        )}
                      >
                        {student.rank}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground py-4 font-bold">
                      {student.studentName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="
                          bg-muted/40 border-border/20 rounded-md px-2 py-0.5
                          font-mono text-[10px] font-bold tracking-widest
                        "
                      >
                        {student.matricule}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(`
                      px-6 text-center font-bold tabular-nums
                    `, getAverageColor(student.average))}
                    >
                      {student.average.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-[200px] flex-wrap gap-1.5">
                        {student.grades?.map(grade => (
                          <div
                            key={`${student.studentId}-${grade.gradeName}-${grade.value}`}
                            title={`Coef: ${grade.coefficient}, Max: ${grade.max}`}
                            className="
                              bg-muted/40 border-border/30 flex min-w-10
                              flex-col items-center justify-center rounded-sm
                              border px-1.5 py-0.5
                            "
                          >
                            <span className={cn('text-xs leading-none font-bold', getAverageColor((grade.value / grade.max) * 20))}>{grade.value}</span>
                            <span className="
                              text-muted-foreground mt-0.5 text-[9px]
                              leading-none
                            "
                            >
                              /
                              {grade.max}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className={cn('px-6 text-center', getAverageColor(student.weightedAverage))}>
                      <div className="
                        bg-background/40 border-border/10 inline-flex
                        items-center justify-center rounded-lg border px-3 py-1
                        font-bold tabular-nums shadow-inner
                      "
                      >
                        {student.weightedAverage.toFixed(2)}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
