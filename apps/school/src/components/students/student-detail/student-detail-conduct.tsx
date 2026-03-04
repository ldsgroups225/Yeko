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
import { cn } from '@workspace/ui/lib/utils'
import { AlertTriangle, CalendarX, Clock, FileWarning } from 'lucide-react'
import { useLocale, useTranslations } from '@/i18n'
import { studentsOptions } from '@/lib/queries/students'

export function StudentDetailConduct({ studentId }: { studentId: string }) {
  const t = useTranslations()
  const { locale } = useLocale()
  const { data, isPending } = useQuery(studentsOptions.conduct(studentId))
  const dateFormatter = new Intl.DateTimeFormat(locale)

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

  const { attendance, conduct } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t.students.attendance()}
            </CardTitle>
            <CalendarX className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendance.totalAbsences}</div>
            <p className="text-muted-foreground text-xs">
              {t.students.attendanceDaysAbsent()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t.students.attendanceExcusedAbsences()}
            </CardTitle>
            <FileWarning className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance.excusedAbsences}
            </div>
            <p className="text-muted-foreground text-xs">
              {t.students.attendanceDays()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t.students.attendanceLateness()}
            </CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendance.latenessCount}</div>
            <p className="text-muted-foreground text-xs">
              {t.students.attendanceTimesLate()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t.students.attendanceTotalMinutes()}
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance.totalLateMinutes}
            </div>
            <p className="text-muted-foreground text-xs">
              {t.students.attendanceLateMinutes()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.students.conductRecordTitle()}</CardTitle>
          <CardDescription>
            {t.students.conductRecordDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conduct.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-primary/10 rounded-full p-4">
                    <FileWarning className="text-primary h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">
                    {t.students.conductNoIncidentTitle()}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {t.students.conductNoIncidentDescription()}
                  </p>
                </div>
              )
            : (
                <div className="space-y-4">
                  {conduct.map(incident => (
                    <div
                      key={incident.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{incident.title}</p>
                        <p className="text-muted-foreground text-sm">
                          {incident.incidentDate
                            ? dateFormatter.format(new Date(incident.incidentDate))
                            : '-'}
                          {' • '}
                          {incident.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {incident.sanctionType && (
                          <Badge variant="outline">{incident.sanctionType}</Badge>
                        )}
                        <Badge
                          className={cn(
                            incident.severity === 'high'
                            && 'bg-destructive text-destructive-foreground',
                            incident.severity === 'medium'
                            && 'bg-orange-500 text-white',
                            incident.severity === 'low' && 'bg-blue-500 text-white',
                          )}
                        >
                          {incident.severity || t.students.conductSeverityNormal()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </CardContent>
      </Card>
    </div>
  )
}
