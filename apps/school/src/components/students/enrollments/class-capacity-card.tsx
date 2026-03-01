import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
import { useTranslations } from '@/i18n'

interface ClassStats {
  classId: string
  className: string
  maxStudents: number
  count: number
}

interface ClassCapacityCardProps {
  data: ClassStats[]
}

export function ClassCapacityCard({ data }: ClassCapacityCardProps) {
  const t = useTranslations()

  return (
    <Card className="border-border/40 bg-card/50 shadow-sm backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{t.students.enrollmentByClass()}</CardTitle>
        <CardDescription>{t.students.classCapacityOverview()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[300px] space-y-3 overflow-y-auto">
          {data.length === 0
            ? (
                <p className="text-muted-foreground text-center text-sm">{t.students.noEnrollmentData()}</p>
              )
            : (
                data.map((cls) => {
                  const fillPercent = (Number(cls.count) / cls.maxStudents) * 100
                  const isNearCapacity = fillPercent >= 90
                  const isOverCapacity = fillPercent > 100

                  return (
                    <div key={cls.classId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cls.className}</span>
                        <span className={`
                          text-xs
                          ${isOverCapacity
                      ? `text-destructive`
                      : isNearCapacity
                        ? `text-accent-foreground`
                        : `text-muted-foreground`}
                        `}
                        >
                          {cls.count}
                          /
                          {cls.maxStudents}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(fillPercent, 100)}
                        className={`
                          h-2
                          ${isOverCapacity
                      ? `[&>div]:bg-destructive`
                      : isNearCapacity
                        ? `[&>div]:bg-accent`
                        : ''}
                        `}
                      />
                    </div>
                  )
                })
              )}
        </div>
      </CardContent>
    </Card>
  )
}
