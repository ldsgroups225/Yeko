import type { SchoolSettings } from '@/schemas/school-profile'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { NotificationSettingsForm } from '@/components/settings/notification-settings-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { schoolProfileOptions } from '@/lib/queries'
import { updateSchoolSettings } from '@/school/functions/school-profile'

export const Route = createFileRoute('/_auth/settings/notifications')({
  component: NotificationsSettingsPage,
})

function NotificationsSettingsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: school, isLoading } = useQuery(schoolProfileOptions.detail())

  const settingsMutation = useMutation({
    mutationFn: updateSchoolSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-profile'] })
      toast.success(t('settings.profile.settingsUpdateSuccess'))
    },
    onError: () => {
      toast.error(t('settings.profile.settingsUpdateError'))
    },
  })

  const handleSettingsUpdate = (data: Partial<SchoolSettings>) => {
    settingsMutation.mutate({ data })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const settings = school?.settings as SchoolSettings | undefined

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {t('settings.notifications.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.notificationsDescription')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile.notifications')}</CardTitle>
          <CardDescription>
            {t('settings.notificationsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings && (
            <NotificationSettingsForm
              notifications={settings.notifications}
              onUpdate={handleSettingsUpdate}
              isSubmitting={settingsMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
