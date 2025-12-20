import type { NotificationSettings, SchoolSettings } from '@/schemas/school-profile'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from '@/i18n'

interface NotificationSettingsFormProps {
  notifications?: NotificationSettings
  onUpdate: (data: Partial<SchoolSettings>) => void
  isSubmitting: boolean
}

const defaultNotifications: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: false,
  paymentReminders: true,
  attendanceAlerts: true,
}

export function NotificationSettingsForm({
  notifications = defaultNotifications,
  onUpdate,
  isSubmitting,
}: NotificationSettingsFormProps) {
  const t = useTranslations()

  const form = useForm<NotificationSettings>({
    defaultValues: notifications,
  })

  const handleSubmit = (data: NotificationSettings) => {
    onUpdate({ notifications: data })
  }

  const notificationOptions = [
    {
      id: 'emailEnabled',
      label: t.settings.profile.emailNotifications(),
      description: t.settings.profile.emailNotificationsDescription(),
    },
    {
      id: 'smsEnabled',
      label: t.settings.profile.smsNotifications(),
      description: t.settings.profile.smsNotificationsDescription(),
    },
    {
      id: 'paymentReminders',
      label: t.settings.profile.paymentReminders(),
      description: t.settings.profile.paymentRemindersDescription(),
    },
    {
      id: 'attendanceAlerts',
      label: t.settings.profile.attendanceAlerts(),
      description: t.settings.profile.attendanceAlertsDescription(),
    },
  ] as const

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-4">
        {notificationOptions.map(option => (
          <div
            key={option.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-0.5">
              <Label htmlFor={option.id}>{option.label}</Label>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
            <Switch
              id={option.id}
              checked={form.watch(option.id)}
              onCheckedChange={checked => form.setValue(option.id, checked)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t.common.saving() : t.common.save()}
        </Button>
      </div>
    </form>
  )
}
