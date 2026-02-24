import {
  IconChartBar,
  IconLoader2,
  IconTrendingUp,
  IconUsers,
  IconUserX,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { enrollmentsOptions } from '@/lib/queries/enrollments'
import { generateUUID } from '@/utils/generateUUID'
import { ClassCapacityCard } from './enrollments/class-capacity-card'
import { GradeEnrollmentCard } from './enrollments/grade-enrollment-card'
import { StatusBreakdownCard } from './enrollments/status-breakdown-card'

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: React.ReactNode
  trend?: number
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend !== undefined && (
          <div className={`flex items-center text-xs ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
            <IconTrendingUp className={`mr-1 h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}
            % vs last month
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function EnrollmentStats() {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()
  const { data, isPending, error } = useQuery({ ...enrollmentsOptions.statistics(schoolYearId || ''), enabled: !!schoolYearId })

  if (!schoolYearId) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/30 p-8 text-center">
        <p className="text-muted-foreground">{t.students.selectSchoolYearForStats()}</p>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(() => (
            <Card key={generateUUID()} className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-1 h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map(() => (
            <Card key={generateUUID()}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/30 p-8 text-center">
        <IconUserX className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!data)
    return null
  const totalBoys = (data.byGrade as any[]).reduce((sum, g) => sum + Number(g.boys), 0)
  const totalGirls = (data.byGrade as any[]).reduce((sum, g) => sum + Number(g.girls), 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t.students.totalEnrollments()} value={data.total} icon={<IconUsers className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title={t.students.confirmedEnrollments()} value={data.confirmed} description={`${data.total > 0 ? Math.round((data.confirmed / data.total) * 100) : 0}% ${t.students.ofTotal()}`} icon={<IconChartBar className="h-4 w-4 text-success" />} />
        <StatCard title={t.students.pendingEnrollments()} value={data.pending} description={t.students.awaitingConfirmation()} icon={<IconLoader2 className="h-4 w-4 text-accent-foreground" />} />
        <StatCard title={t.students.genderRatio()} value={`${totalBoys}/${totalGirls}`} description={t.students.boysGirls()} icon={<IconUsers className="h-4 w-4 text-secondary" />} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <GradeEnrollmentCard data={data.byGrade as any[]} />
        <ClassCapacityCard data={data.byClass as any[]} />
      </div>
      <StatusBreakdownCard data={data.byStatus as any[]} />
    </div>
  )
}
