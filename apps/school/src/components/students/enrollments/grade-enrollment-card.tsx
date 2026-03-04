import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTranslations } from '@/i18n'

interface GradeStats {
  gradeId: string
  gradeName: string
  count: number
  boys: number
  girls: number
}

interface GradeEnrollmentCardProps {
  data: GradeStats[]
}

export function GradeEnrollmentCard({ data }: GradeEnrollmentCardProps) {
  const t = useTranslations()
  const chartData = data.map(grade => ({
    name: grade.gradeName,
    boys: Number(grade.boys),
    girls: Number(grade.girls),
    total: Number(grade.count),
  }))

  return (
    <Card className="border-border/40 bg-card/50 shadow-sm backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{t.students.enrollmentByGrade()}</CardTitle>
        <CardDescription>{t.students.enrollmentByGradeDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0
          ? (
              <p className="text-muted-foreground text-center text-sm">{t.students.noEnrollmentData()}</p>
            )
          : (
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <ComposedChart
                    data={chartData}
                    margin={{
                      top: 16,
                      right: 12,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="boys" stackId="gender" fill="#3b82f6" name={t.students.male()} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="girls" stackId="gender" fill="#ec4899" name={t.students.female()} radius={[3, 3, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: 'var(--primary)' }}
                      name={t.common.total()}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
      </CardContent>
    </Card>
  )
}
