import { IconFileText, IconHash, IconPercentage, IconTrendingUp, IconTrophy, IconUser } from '@tabler/icons-react'
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
}

interface ClassAveragesTableProps {
  averages: StudentAverage[]
  className?: string
}

function getAverageColor(average: number): string {
  if (average >= 16)
    return 'text-emerald-500 font-bold'
  if (average >= 14)
    return 'text-indigo-500 font-bold'
  if (average >= 10)
    return 'text-foreground font-semibold'
  return 'text-destructive font-bold'
}

function getRankStyles(rank: number): string {
  if (rank === 1)
    return 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/10'
  if (rank === 2)
    return 'bg-slate-400/10 text-slate-500 border-slate-400/20'
  if (rank === 3)
    return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
  return 'bg-muted/50 text-muted-foreground border-border/40'
}

export function ClassAveragesTable({ averages, className }: ClassAveragesTableProps) {
  const t = useTranslations()
  const sortedAverages = [...averages].sort((a, b) => a.rank - b.rank)

  const classAverage = averages.length > 0
    ? averages.reduce((sum, a) => sum + a.weightedAverage, 0) / averages.length
    : 0
  const passCount = averages.filter(a => a.weightedAverage >= 10).length
  const passRate = averages.length > 0 ? (passCount / averages.length) * 100 : 0

  return (
    <Card className={cn('overflow-hidden rounded-2xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl', className)}>
      <CardHeader className="border-b border-border/20 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <IconTrophy className="size-5" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">{t.academic.grades.averages.title()}</CardTitle>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-background/50 border border-border/40 shadow-sm">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <IconTrendingUp className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70 leading-none mb-1">
                  {t.academic.grades.statistics.classAverage()}
                </span>
                <span className={cn('text-sm font-bold tabular-nums', getAverageColor(classAverage))}>
                  {classAverage.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-background/50 border border-border/40 shadow-sm">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <IconPercentage className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70 leading-none mb-1">
                  {t.academic.grades.statistics.passRate()}
                </span>
                <span className={cn('text-sm font-bold tabular-nums', passRate >= 50 ? 'text-emerald-600' : 'text-destructive')}>
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
              <TableRow className="bg-muted/10 border-b-border/20 hover:bg-muted/10">
                <TableHead className="w-20 text-center">
                  <span className="font-bold uppercase tracking-tight text-[10px]">{t.academic.grades.averages.rank()}</span>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <IconUser className="size-3.5 text-muted-foreground" />
                    <span className="font-bold uppercase tracking-tight text-[10px]">{t.academic.grades.averages.student()}</span>
                  </div>
                </TableHead>
                <TableHead className="w-32">
                  <div className="flex items-center gap-2">
                    <IconHash className="size-3.5 text-muted-foreground" />
                    <span className="font-bold uppercase tracking-tight text-[10px]">{t.academic.grades.averages.matricule()}</span>
                  </div>
                </TableHead>
                <TableHead className="w-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <IconFileText className="size-3.5 text-muted-foreground" />
                    <span className="font-bold uppercase tracking-tight text-[10px]">{t.academic.grades.averages.gradeCount()}</span>
                  </div>
                </TableHead>
                <TableHead className="w-28 text-center px-6">
                  <span className="font-bold uppercase tracking-tight text-[10px]">{t.academic.grades.averages.average()}</span>
                </TableHead>
                <TableHead className="w-32 text-center px-6">
                  <span className="font-bold uppercase tracking-tight text-[10px]">{t.academic.grades.averages.weightedAverage()}</span>
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
                    className="group border-b border-border/10 last:border-0 hover:bg-primary/5 transition-colors"
                  >
                    <TableCell className="text-center py-4">
                      <div
                        className={cn(
                          'inline-flex size-8 items-center justify-center rounded-xl text-xs font-bold border shadow-sm transition-transform group-hover:scale-110',
                          getRankStyles(student.rank),
                        )}
                      >
                        {student.rank}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-bold text-foreground">
                      {student.studentName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] font-bold tracking-widest bg-muted/40 border-border/20 rounded-md py-0.5 px-2">
                        {student.matricule}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold text-muted-foreground tabular-nums">
                      {student.gradeCount}
                    </TableCell>
                    <TableCell className={cn('text-center font-bold tabular-nums px-6', getAverageColor(student.average))}>
                      {student.average.toFixed(2)}
                    </TableCell>
                    <TableCell className={cn('text-center px-6', getAverageColor(student.weightedAverage))}>
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-background/40 border border-border/10 shadow-inner font-bold tabular-nums">
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
