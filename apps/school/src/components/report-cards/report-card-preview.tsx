import type { ReportCardStatus } from '@/schemas/report-card'

import { IconAward, IconMessage, IconSchool, IconUser } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

import { Separator } from '@workspace/ui/components/separator'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useTranslations } from '@/i18n'

import { ReportCardStatusBadge } from './report-card-status-badge'

interface SubjectGrade {
  subjectId: string
  subjectName: string
  average: number
  coefficient: number
  teacherComment?: string
}

interface ReportCardPreviewData {
  id: string
  status: ReportCardStatus
  student: {
    name: string
    matricule?: string
    photoUrl?: string
  }
  class: {
    name: string
    level: string
  }
  term: {
    name: string
  }
  grades: SubjectGrade[]
  overallAverage: number
  rank?: number
  totalStudents?: number
  homeroomComment?: string
  conductSummary?: string
  attendance?: {
    absences: number
    lates: number
  }
}

interface ReportCardPreviewProps {
  data: ReportCardPreviewData | null
  isLoading?: boolean
}

function PreviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

export function ReportCardPreview({ data, isLoading }: ReportCardPreviewProps) {
  const t = useTranslations()

  if (isLoading) {
    return <PreviewSkeleton />
  }

  if (!data) {
    return null
  }

  const weightedSum = data.grades.reduce(
    (sum, g) => sum + g.average * g.coefficient,
    0,
  )
  const totalCoefficients = data.grades.reduce((sum, g) => sum + g.coefficient, 0)
  const calculatedAverage = totalCoefficients > 0 ? weightedSum / totalCoefficients : 0

  return (
    <Card className="print:shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              {data.student.photoUrl
                ? (
                    <img
                      src={data.student.photoUrl}
                      alt={data.student.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )
                : (
                    <IconUser className="h-8 w-8 text-muted-foreground" />
                  )}
            </div>
            <div>
              <CardTitle className="text-xl">{data.student.name}</CardTitle>
              {data.student.matricule && (
                <p className="text-sm text-muted-foreground">
                  {t.students.matricule()}
                  :
                  {data.student.matricule}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {data.class.name}
                {' '}
                •
                {data.term.name}
              </p>
            </div>
          </div>
          <ReportCardStatusBadge status={data.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Results */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-4">
            <IconSchool className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{t.reportCards.average()}</p>
              <p className="text-2xl font-bold">
                {calculatedAverage.toFixed(2)}
                /20
              </p>
            </div>
          </div>
          {data.rank && data.totalStudents && (
            <div className="flex items-center gap-3 rounded-lg bg-secondary p-4">
              <IconAward className="h-8 w-8 text-secondary-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.reportCards.rank()}</p>
                <p className="text-2xl font-bold">
                  {data.rank}
                  /
                  {data.totalStudents}
                </p>
              </div>
            </div>
          )}
          {data.attendance && (
            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <div>
                <p className="text-sm text-muted-foreground">{t.reportCards.attendance()}</p>
                <p className="text-sm">
                  {t.reportCards.absences()}
                  :
                  {data.attendance.absences}
                  {' '}
                  •
                  {' '}
                  {t.reportCards.lates()}
                  :
                  {data.attendance.lates}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Grades Table */}
        <div>
          <h3 className="mb-3 font-semibold">{t.reportCards.grades()}</h3>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">
                    {t.subjects.subject()}
                  </th>
                  <th className="px-4 py-2 text-center font-medium">
                    {t.grades.coefficient()}
                  </th>
                  <th className="px-4 py-2 text-center font-medium">
                    {t.grades.average()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.grades.map(grade => (
                  <tr key={grade.subjectId} className="border-b last:border-0">
                    <td className="px-4 py-2">{grade.subjectName}</td>
                    <td className="px-4 py-2 text-center">{grade.coefficient}</td>
                    <td className="px-4 py-2 text-center font-medium">
                      {grade.average.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-semibold">
                  <td className="px-4 py-2">{t.reportCards.overallAverage()}</td>
                  <td className="px-4 py-2 text-center">{totalCoefficients}</td>
                  <td className="px-4 py-2 text-center">{calculatedAverage.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Comments */}
        {(data.homeroomComment || data.conductSummary) && (
          <>
            <Separator />
            <div className="space-y-4">
              {data.homeroomComment && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <IconMessage className="h-4 w-4" />
                    {t.reportCards.homeroomComment()}
                  </h3>
                  <p className="rounded-md bg-muted p-3 text-sm italic">
                    "
                    {data.homeroomComment}
                    "
                  </p>
                </div>
              )}
              {data.conductSummary && (
                <div>
                  <h3 className="mb-2 font-semibold">{t.reportCards.conduct()}</h3>
                  <p className="text-sm">{data.conductSummary}</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
