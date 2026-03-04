import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useTranslations } from '@/i18n'

interface StatusStats {
  status: string
  count: number
}

interface StatusDistributionChartCardProps {
  data: StatusStats[]
}

interface ChartDatum {
  key: string
  name: string
  value: number
  color: string
}

export function StatusDistributionChartCard({ data }: StatusDistributionChartCardProps) {
  const t = useTranslations()

  const statusOrder = ['confirmed', 'pending', 'cancelled', 'transferred']
  const statusColors: Record<string, string> = {
    confirmed: 'var(--success)',
    pending: 'var(--primary)',
    cancelled: 'var(--destructive)',
    transferred: 'var(--secondary)',
  }
  const statusLabels: Record<string, string> = {
    confirmed: t.enrollments.statusConfirmed(),
    pending: t.enrollments.statusPending(),
    cancelled: t.enrollments.statusCancelled(),
    transferred: t.enrollments.statusTransferred(),
  }

  const chartData = statusOrder
    .map((status): ChartDatum => {
      const entry = data.find(item => item.status === status)
      return {
        key: status,
        name: statusLabels[status] || status,
        value: Number(entry?.count ?? 0),
        color: statusColors[status] || 'var(--muted)',
      }
    })
    .filter(item => item.value > 0)

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border-border/40 bg-card/50 shadow-sm backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{t.students.enrollmentStatusBreakdown()}</CardTitle>
        <CardDescription>{t.students.enrollmentStatusDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0
          ? (
              <p className="text-muted-foreground text-center text-sm">{t.students.noEnrollmentData()}</p>
            )
          : (
              <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={90}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {chartData.map(item => (
                          <Cell key={item.key} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                        }}
                        formatter={(value: number | string | Array<number | string> | undefined) => [Number(value ?? 0), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col justify-center gap-3">
                  {chartData.map((item) => {
                    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
                    return (
                      <div key={item.key} className="border-border/30 bg-background/40 rounded-lg border p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <p className="text-sm font-medium">{item.name}</p>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <p className="text-2xl font-bold">{item.value}</p>
                          <p className="text-muted-foreground text-xs">
                            {percentage}
                            %
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
      </CardContent>
    </Card>
  )
}
