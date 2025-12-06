'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart3, Loader2, TrendingUp, Users, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { enrollmentsOptions } from '@/lib/queries/enrollments'
import { generateUUID } from '@/utils/generateUUID'

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: React.ReactNode
  trend?: number
}

interface GradeStats {
  gradeId: string
  gradeName: string
  gradeOrder: number
  count: number
  boys: number
  girls: number
}

interface ClassStats {
  classId: string
  className: string
  maxStudents: number
  count: number
  boys: number
  girls: number
}

interface StatusStats {
  status: string
  count: number
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend !== undefined && (
          <div className={`flex items-center text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`mr-1 h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}
            % vs last month
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function EnrollmentStats() {
  const { t } = useTranslation()
  const { schoolYearId } = useSchoolYearContext()

  const { data, isLoading, error } = useQuery({
    ...enrollmentsOptions.statistics(schoolYearId || ''),
    enabled: !!schoolYearId,
  })

  if (!schoolYearId) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">{t('students.selectSchoolYearForStats')}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, () => (
            <Card key={`stat-${generateUUID()}`}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-1 h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <UserX className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!data)
    return null

  const byGrade = data.byGrade as GradeStats[]
  const byClass = data.byClass as ClassStats[]
  const byStatus = data.byStatus as StatusStats[]

  const totalBoys = byGrade.reduce((sum, g) => sum + Number(g.boys), 0)
  const totalGirls = byGrade.reduce((sum, g) => sum + Number(g.girls), 0)

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('students.totalEnrollments')}
          value={data.total}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title={t('students.confirmedEnrollments')}
          value={data.confirmed}
          description={`${data.total > 0 ? Math.round((data.confirmed / data.total) * 100) : 0}% ${t('students.ofTotal')}`}
          icon={<BarChart3 className="h-4 w-4 text-green-600" />}
        />
        <StatCard
          title={t('students.pendingEnrollments')}
          value={data.pending}
          description={t('students.awaitingConfirmation')}
          icon={<Loader2 className="h-4 w-4 text-yellow-600" />}
        />
        <StatCard
          title={t('students.genderRatio')}
          value={`${totalBoys}/${totalGirls}`}
          description={t('students.boysGirls')}
          icon={<Users className="h-4 w-4 text-blue-600" />}
        />
      </div>

      {/* Enrollment by Grade */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('students.enrollmentByGrade')}</CardTitle>
            <CardDescription>{t('students.enrollmentByGradeDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {byGrade.length === 0
                ? (
                  <p className="text-center text-sm text-muted-foreground">{t('students.noEnrollmentData')}</p>
                )
                : (
                  byGrade.map(grade => (
                    <div key={grade.gradeId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{grade.gradeName}</span>
                        <span className="text-muted-foreground">
                          {grade.count}
                          {' '}
                          (
                          {grade.boys}
                          M /
                          {grade.girls}
                          F)
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Progress
                          value={(Number(grade.boys) / Math.max(Number(grade.count), 1)) * 100}
                          className="h-2 flex-1 bg-pink-100"
                        />
                      </div>
                    </div>
                  ))
                )}
            </div>
          </CardContent>
        </Card>

        {/* Enrollment by Class */}
        <Card>
          <CardHeader>
            <CardTitle>{t('students.enrollmentByClass')}</CardTitle>
            <CardDescription>{t('students.classCapacityOverview')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] space-y-3 overflow-y-auto">
              {byClass.length === 0
                ? (
                  <p className="text-center text-sm text-muted-foreground">{t('students.noEnrollmentData')}</p>
                )
                : (
                  byClass.map((cls) => {
                    const fillPercent = (Number(cls.count) / cls.maxStudents) * 100
                    const isNearCapacity = fillPercent >= 90
                    const isOverCapacity = fillPercent > 100

                    return (
                      <div key={cls.classId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{cls.className}</span>
                          <span className={`text-xs ${isOverCapacity ? 'text-red-600' : isNearCapacity ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                            {cls.count}
                            /
                            {cls.maxStudents}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(fillPercent, 100)}
                          className={`h-2 ${isOverCapacity ? '[&>div]:bg-red-500' : isNearCapacity ? '[&>div]:bg-yellow-500' : ''}`}
                        />
                      </div>
                    )
                  })
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t('students.enrollmentStatusBreakdown')}</CardTitle>
          <CardDescription>{t('students.enrollmentStatusDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {byStatus.map((status) => {
              const statusColors: Record<string, string> = {
                confirmed: 'bg-green-100 text-green-800',
                pending: 'bg-yellow-100 text-yellow-800',
                cancelled: 'bg-red-100 text-red-800',
                transferred: 'bg-blue-100 text-blue-800',
              }
              return (
                <div
                  key={status.status}
                  className={`rounded-lg px-4 py-2 ${statusColors[status.status] || 'bg-gray-100 text-gray-800'}`}
                >
                  <p className="text-2xl font-bold">{status.count}</p>
                  <p className="text-xs capitalize">{t(`enrollments.status${status.status.charAt(0).toUpperCase() + status.status.slice(1)}`)}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
