import type { NotificationSettings, SchoolSettings } from '@/schemas/school-profile'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { useForm } from 'react-hook-form'
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      <div className="space-y-4">
        {notificationOptions.map(option => (
          <div
            key={option.id}
            className="
              border-border/40 bg-muted/20
              hover:bg-muted/30
              flex items-center justify-between rounded-2xl border p-5
              transition-all
            "
          >
            <div className="space-y-1">
              <Label htmlFor={option.id} className="text-base font-semibold">{option.label}</Label>
              <p className="text-muted-foreground text-sm">
                {option.description}
              </p>
            </div>
            <Switch
              id={option.id}
              checked={form.watch(option.id)}
              onCheckedChange={checked => form.setValue(option.id, checked)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="shadow-primary/20 rounded-xl px-8 shadow-lg"
        >
          {isSubmitting ? t.common.saving() : t.common.save()}
        </Button>
      </div>
    </form>
  )
}
