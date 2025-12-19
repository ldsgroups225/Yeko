import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AlertsTable } from '@/components/attendance/alerts/alerts-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  acknowledgeAlert,
  dismissAlert,
  getActiveAlerts,
} from '@/school/functions/attendance-alerts'

export const Route = createFileRoute('/_auth/conducts/alerts/')({
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
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.schoolLife'), href: '/conducts' },
          { label: t('schoolLife.alerts') },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('schoolLife.alerts')}</h1>
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
          <AlertsTable
            alerts={alerts?.map((item: AlertData) => ({
              id: item.alert.id,
              alertType: item.alert.alertType,
              severity: item.alert.severity as 'info' | 'warning' | 'critical',
              status: item.alert.status as 'active' | 'acknowledged' | 'resolved' | 'dismissed',
              title: item.alert.title,
              message: item.alert.message,
              createdAt: item.alert.createdAt.toISOString(),
              teacherName: item.teacherName,
              studentName: item.studentName,
            })) || []}
            isLoading={isLoading}
            onAcknowledge={handleAcknowledge}
            onDismiss={handleDismiss}
          />
        </CardContent>
      </Card>
    </div>
  )
}
