import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useTranslations } from '@/i18n'

interface StatusStats {
  status: string
  count: number
}

interface StatusBreakdownCardProps {
  data: StatusStats[]
}

export function StatusBreakdownCard({ data }: StatusBreakdownCardProps) {
  const t = useTranslations()

  const statusColors: Record<string, string> = {
    confirmed: 'bg-success/10 text-success',
    pending: 'bg-accent/10 text-accent-foreground',
    cancelled: 'bg-destructive/10 text-destructive',
    transferred: 'bg-secondary/10 text-secondary',
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardHeader>
        <CardTitle>{t.students.enrollmentStatusBreakdown()}</CardTitle>
        <CardDescription>{t.students.enrollmentStatusDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {data.map(status => (
            <div
              key={status.status}
              className={`rounded-xl px-4 py-2 backdrop-blur-sm border border-border/20 ${statusColors[status.status] || 'bg-card/50 text-foreground'}`}
            >
              <p className="text-2xl font-bold">{status.count}</p>
              <p className="text-xs capitalize">
                {{
                  pending: t.enrollments.statusPending,
                  confirmed: t.enrollments.statusConfirmed,
                  cancelled: t.enrollments.statusCancelled,
                  transferred: t.enrollments.statusTransferred,
                }[status.status as 'pending' | 'confirmed' | 'cancelled' | 'transferred']()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
