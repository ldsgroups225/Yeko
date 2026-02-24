import {
  IconCalendar,
  IconPlus,
} from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { useTranslations } from '@/i18n'
import { EnrollmentTimeline } from '../enrollment-timeline'

interface StudentDetailHistoryProps {
  enrollmentHistory: any[]
  onEnroll: () => void
}

export function StudentDetailHistory({ enrollmentHistory, onEnroll }: StudentDetailHistoryProps) {
  const t = useTranslations()

  return (
    <Card className="border-border/20 bg-white/50 backdrop-blur-xl dark:bg-card/20">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-white/30 px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconCalendar className="h-5 w-5 text-primary" />
          {t.students.enrollmentHistory()}
        </CardTitle>
        <Button
          size="sm"
          onClick={onEnroll}
          className="shadow-sm"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          {t.students.enrollStudent()}
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <EnrollmentTimeline
          enrollments={
            enrollmentHistory?.map(item => ({
              ...item,
              enrollment: {
                ...item.enrollment,
                confirmedAt:
                  item.enrollment.confirmedAt?.toISOString() || null,
                cancelledAt:
                  item.enrollment.cancelledAt?.toISOString() || null,
                transferredAt:
                  item.enrollment.transferredAt?.toISOString() || null,
              },
            })) || []
          }
        />
      </CardContent>
    </Card>
  )
}
