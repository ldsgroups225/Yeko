import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
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

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardHeader>
        <CardTitle>{t.students.enrollmentByGrade()}</CardTitle>
        <CardDescription>{t.students.enrollmentByGradeDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0
            ? (
                <p className="text-center text-sm text-muted-foreground">{t.students.noEnrollmentData()}</p>
              )
            : (
                data.map(grade => (
                  <div key={grade.gradeId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{grade.gradeName}</span>
                      <span className="text-muted-foreground">
                        {grade.count}
                        {' '}
                        (
                        {grade.boys}
                        M /
                        {' '}
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
  )
}
