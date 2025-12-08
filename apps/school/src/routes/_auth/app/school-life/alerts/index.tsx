import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AttendanceAlertCard } from '@/components/attendance/alerts/attendance-alert-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import {
  acknowledgeAlert,
  dismissAlert,
  getActiveAlerts,
} from '@/school/functions/attendance-alerts'

export const Route = createFileRoute('/_auth/app/school-life/alerts/')({
  component: AlertsPage,
})

interface AlertData {
  alert: {
    id: string
    alertType: string
    severity: string
    status: string
    title: string
    message: string
    createdAt: Date
  }
  teacherName: string | null
  studentName: string | null
}

function AlertsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['attendance-alerts', 'active'],
    queryFn: () => getActiveAlerts({ data: {} }),
  })

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => acknowledgeAlert({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-alerts'] })
      toast.success(t('alerts.acknowledged'))
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => dismissAlert({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-alerts'] })
      toast.success(t('alerts.dismissed'))
    },
  })

  const handleAcknowledge = (id: string) => {
    acknowledgeMutation.mutate(id)
  }

  const handleDismiss = (id: string) => {
    dismissMutation.mutate(id)
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('schoolLife.alerts')}</h1>
        <p className="text-muted-foreground">{t('alerts.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('alerts.activeAlerts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading
            ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={`skeleton-${i}`} className="h-32 w-full" />
                  ))}
                </div>
              )
            : alerts && alerts.length > 0
              ? (
                  <div className="space-y-4">
                    {alerts.map((item: AlertData) => (
                      <AttendanceAlertCard
                        key={item.alert.id}
                        alert={{
                          id: item.alert.id,
                          alertType: item.alert.alertType,
                          severity: item.alert.severity as 'info' | 'warning' | 'critical',
                          status: item.alert.status as 'active' | 'acknowledged' | 'resolved' | 'dismissed',
                          title: item.alert.title,
                          message: item.alert.message,
                          createdAt: item.alert.createdAt.toISOString(),
                          teacherName: item.teacherName,
                          studentName: item.studentName,
                        }}
                        onAcknowledge={handleAcknowledge}
                        onDismiss={handleDismiss}
                      />
                    ))}
                  </div>
                )
              : (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Bell className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>{t('alerts.noAlerts')}</EmptyTitle>
                      <EmptyDescription>{t('alerts.noAlertsDescription')}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
        </CardContent>
      </Card>
    </div>
  )
}
