import { useQuery } from '@tanstack/react-query'
import { Badge } from '@workspace/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { BookOpen, TrendingUp } from 'lucide-react'
import { useTranslations } from '@/i18n'
import { studentsOptions } from '@/lib/queries/students'

export function StudentDetailPerformance({ studentId }: { studentId: string }) {
  const t = useTranslations()
  const { data, isPending } = useQuery(studentsOptions.performance(studentId))

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (!data)
    return null

  const { subjects, overallAverage, termName } = data

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>{t.students.performance()}</CardTitle>
            <CardDescription>
              {termName || t.students.performanceCurrentYear()}
            </CardDescription>
          </div>
          {overallAverage !== null && (
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                {t.students.performanceOverallAverage()}
              </span>
              <span className="text-primary text-3xl font-bold">
                {overallAverage.toFixed(2)}
                {' '}
                / 20
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {subjects.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-primary/10 rounded-full p-4">
                    <TrendingUp className="text-primary h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">
                    {t.students.performanceNoGradesTitle()}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {t.students.performanceNoGradesDescription()}
                  </p>
                </div>
              )
            : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        {t.students.performanceSubject()}
                      </TableHead>
                      <TableHead>{t.students.performanceRecentGrades()}</TableHead>
                      <TableHead className="text-right">
                        {t.students.performanceAverage()}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map(subject => (
                      <TableRow key={subject.subjectId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <BookOpen className="text-muted-foreground h-4 w-4" />
                            {subject.subjectName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {subject.grades.slice(0, 5).map(grade => (
                              <Badge
                                key={grade.id}
                                variant="secondary"
                                className="font-mono"
                              >
                                {Number(grade.value).toFixed(2)}
                                {grade.weight > 1 && (
                                  <span className="text-muted-foreground ml-1 text-[10px]">
                                    x
                                    {grade.weight}
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {subject.average !== null
                            ? (
                                <span
                                  className={
                                    subject.average >= 10
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }
                                >
                                  {subject.average.toFixed(2)}
                                </span>
                              )
                            : (
                                <span className="text-muted-foreground">-</span>
                              )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
        </CardContent>
      </Card>
    </div>
  )
}
