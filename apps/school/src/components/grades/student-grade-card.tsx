import { BookOpen, Calendar, TrendingDown, TrendingUp, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
    return 'text-green-600'
  if (value >= 14)
    return 'text-emerald-500'
  if (value >= 10)
    return 'text-amber-500'
  return 'text-red-500'
}

function getGradeLabel(type: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    quiz: t('academic.grades.types.quiz'),
    test: t('academic.grades.types.test'),
    exam: t('academic.grades.types.exam'),
    participation: t('academic.grades.types.participation'),
    homework: t('academic.grades.types.homework'),
    project: t('academic.grades.types.project'),
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
  const { t } = useTranslation()

  const validatedGrades = grades.filter(g => g.status === 'validated')
  const pendingGrades = grades.filter(g => g.status !== 'validated')

  // Group grades by subject
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
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-muted/50 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <User className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {student.lastName}
                {' '}
                {student.firstName}
              </CardTitle>
              <p className="font-mono text-sm text-muted-foreground">
                {student.matricule}
              </p>
            </div>
          </div>

          {average !== undefined && (
            <div className="text-right">
              <p className={cn('text-2xl font-bold', getGradeColor(average))}>
                {average.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">/20</p>
            </div>
          )}
        </div>

        {rank !== undefined && totalStudents !== undefined && (
          <div className="mt-3 flex items-center gap-2">
            {rank <= 3
              ? (
                  <TrendingUp className="size-4 text-green-500" />
                )
              : rank > totalStudents - 3
                ? (
                    <TrendingDown className="size-4 text-red-500" />
                  )
                : null}
            <span className="text-sm">
              {t('academic.grades.rank', { rank, total: totalStudents })}
            </span>
            <Progress value={(1 - rank / totalStudents) * 100} className="h-2 flex-1" />
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {Object.keys(gradesBySubject).length === 0
          ? (
              <p className="py-4 text-center text-muted-foreground">
                {t('academic.grades.noGrades')}
              </p>
            )
          : (
              <div className="space-y-4">
                {Object.entries(gradesBySubject).map(([subjectName, subjectGrades]) => (
                  <div key={subjectName}>
                    <div className="mb-2 flex items-center gap-2">
                      <BookOpen className="size-4 text-muted-foreground" />
                      <span className="font-medium">{subjectName}</span>
                    </div>
                    <div className="ml-6 flex flex-wrap gap-2">
                      {subjectGrades.map(grade => (
                        <div
                          key={grade.id}
                          className="flex items-center gap-1 rounded-md border bg-background px-2 py-1"
                          title={grade.description ?? undefined}
                        >
                          <span className={cn('font-mono font-medium', getGradeColor(Number(grade.value)))}>
                            {Number(grade.value).toFixed(1)}
                          </span>
                          <Badge variant="outline" className="h-5 text-xs">
                            {getGradeLabel(grade.type, t)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

        {pendingGrades.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {t('academic.grades.pendingGrades', { count: pendingGrades.length })}
            </p>
            <div className="flex flex-wrap gap-2">
              {pendingGrades.map(grade => (
                <div
                  key={grade.id}
                  className="flex items-center gap-2 rounded-md border border-dashed px-2 py-1"
                >
                  <span className="font-mono text-sm">
                    {Number(grade.value).toFixed(1)}
                  </span>
                  <GradeStatusBadge status={grade.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {grades.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {t('academic.grades.lastUpdated', {
              date: new Date(
                Math.max(...grades.map(g => new Date(g.gradeDate).getTime())),
              ).toLocaleDateString('fr-FR'),
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
