import { IconBell, IconSparkles } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { AlertsTable } from '@/components/attendance/alerts/alerts-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
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
  const t = useTranslations()
  const queryClient = useQueryClient()

  const { data: alertsResult, isLoading } = useQuery({
    queryKey: ['attendance-alerts', 'active'],
    queryFn: () => getActiveAlerts({ data: {} }),
  })

  const alerts = alertsResult?.success ? alertsResult.data : []

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => acknowledgeAlert({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-alerts'] })
      toast.success(t.alerts.acknowledged(), {
        className: 'rounded-2xl backdrop-blur-xl bg-background/80 border-border/40 font-bold',
      })
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => dismissAlert({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-alerts'] })
      toast.success(t.alerts.dismissed(), {
        className: 'rounded-2xl backdrop-blur-xl bg-background/80 border-border/40 font-bold',
      })
    },
  })

  const handleAcknowledge = (id: string) => {
    acknowledgeMutation.mutate(id)
  }

  const handleDismiss = (id: string) => {
    dismissMutation.mutate(id)
  }

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.schoolLife.alerts() },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
          <IconBell className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.schoolLife.alerts()}</h1>
          <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.alerts.description()}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <IconSparkles className="size-32" />
          </div>
          <CardHeader className="relative border-b border-border/10 bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              <IconBell className="h-3 w-3" />
              {t.alerts.activeAlerts()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AlertsTable
              alerts={alerts.map((item: AlertData) => ({
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
      </motion.div>
    </div>
  )
}
