import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle, BarChart3, BookOpen, CheckCircle, ChevronRight, Clock, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolContext } from '@/hooks/use-school-context'
import { gradesOptions } from '@/lib/queries/grades'

export const Route = createFileRoute('/_auth/app/academic/grades/')({
  component: GradesIndexPage,
})

function GradesIndexPage() {
  const { t } = useTranslation()
  const { schoolId } = useSchoolContext()

  const { data: pendingValidations, isLoading: pendingLoading } = useQuery(
    gradesOptions.pending(schoolId ?? ''),
  )

  const pendingCount = pendingValidations?.length ?? 0
  const totalPendingGrades = pendingValidations?.reduce(
    (sum: number, v: any) => sum + (v.pendingCount || 0),
    0,
  ) ?? 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('academic.grades.title')}</h1>
          <p className="text-muted-foreground">
            {t('academic.grades.description')}
          </p>
        </div>
        <Link to="/app/academic/grades/entry" className="[&.active]:font-bold">
          <Button>
            <Plus className="mr-2 size-4" />
            {t('academic.grades.entry.enterGrade')}
          </Button>
        </Link>
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('academic.grades.validations.title')}
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pendingLoading
              ? (
                  <Skeleton className="h-8 w-16" />
                )
              : (
                  <>
                    <div className="text-2xl font-bold">{pendingCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {t('academic.grades.validations.pendingCount', { count: totalPendingGrades })}
                    </p>
                  </>
                )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('academic.grades.statistics.classAverage')}
            </CardTitle>
            <BarChart3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              {t('academic.grades.statistics.description')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('academic.grades.statistics.passRate')}
            </CardTitle>
            <CheckCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              {t('academic.grades.statistics.above15')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Validations Alert */}
      {pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="size-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                {t('academic.grades.validations.pendingCount', { count: totalPendingGrades })}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {t('academic.grades.validations.description')}
              </p>
            </div>
            <Link to="/app/academic/grades/validations">
              <Button variant="outline" size="sm">
                {t('academic.grades.validations.viewDetails')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          title={t('academic.grades.quickActions.entry')}
          description={t('academic.grades.quickActions.entryDescription')}
          icon={BookOpen}
          href="/app/academic/grades/entry"
        />
        <QuickActionCard
          title={t('academic.grades.quickActions.validations')}
          description={t('academic.grades.quickActions.validationsDescription')}
          icon={CheckCircle}
          href="/app/academic/grades/validations"
          badge={pendingCount > 0 ? pendingCount : undefined}
        />
        <QuickActionCard
          title={t('academic.grades.quickActions.statistics')}
          description={t('academic.grades.quickActions.statisticsDescription')}
          icon={BarChart3}
          href="/app/academic/grades/statistics"
        />
      </div>
    </div>
  )
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  badge,
}: {
  title: string
  description: string
  icon: React.ElementType
  href: string
  badge?: number
}) {
  const { t } = useTranslation()

  return (
    <Link to={href} className="[&.active]:font-bold">
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {badge !== undefined && badge > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <Icon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="mt-2 flex items-center text-sm text-primary">
            {t('academic.grades.quickActions.access')}
            <ChevronRight className="ml-1 size-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
