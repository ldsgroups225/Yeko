import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
    return 'text-green-600 dark:text-green-400'
  if (average >= 14)
    return 'text-emerald-600 dark:text-emerald-400'
  if (average >= 10)
    return 'text-foreground'
  return 'text-red-600 dark:text-red-400'
}

function getRankBadge(rank: number): string {
  if (rank === 1)
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (rank === 2)
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  if (rank === 3)
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  return 'bg-muted text-muted-foreground'
}

export function ClassAveragesTable({ averages, className }: ClassAveragesTableProps) {
  const t = useTranslations()
  const sortedAverages = [...averages].sort((a, b) => a.rank - b.rank)

  // Calculate class statistics
  const classAverage = averages.length > 0
    ? averages.reduce((sum, a) => sum + a.weightedAverage, 0) / averages.length
    : 0
  const passCount = averages.filter(a => a.weightedAverage >= 10).length
  const passRate = averages.length > 0 ? (passCount / averages.length) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t.academic.grades.averages.title()}</CardTitle>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">
                {t.academic.grades.statistics.classAverage()}
                :
                {' '}
              </span>
              <span className={cn('font-semibold', getAverageColor(classAverage))}>
                {classAverage.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t.academic.grades.statistics.passRate()}
                :
                {' '}
              </span>
              <span className={cn('font-semibold', passRate >= 50 ? 'text-green-600' : 'text-red-600')}>
                {passRate.toFixed(0)}
                %
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">{t.academic.grades.averages.rank()}</TableHead>
              <TableHead>{t.academic.grades.averages.student()}</TableHead>
              <TableHead className="w-24">{t.academic.grades.averages.matricule()}</TableHead>
              <TableHead className="w-20 text-center">{t.academic.grades.averages.gradeCount()}</TableHead>
              <TableHead className="w-24 text-center">{t.academic.grades.averages.average()}</TableHead>
              <TableHead className="w-24 text-center">{t.academic.grades.averages.weightedAverage()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAverages.map(student => (
              <TableRow key={student.studentId}>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      'inline-flex size-7 items-center justify-center rounded-full text-xs font-medium',
                      getRankBadge(student.rank),
                    )}
                  >
                    {student.rank}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{student.studentName}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {student.matricule}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {student.gradeCount}
                </TableCell>
                <TableCell className={cn('text-center font-semibold tabular-nums', getAverageColor(student.average))}>
                  {student.average.toFixed(2)}
                </TableCell>
                <TableCell className={cn('text-center font-semibold tabular-nums', getAverageColor(student.weightedAverage))}>
                  {student.weightedAverage.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
