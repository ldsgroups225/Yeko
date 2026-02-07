import type { SchoolSettings } from '@/schemas/school-profile'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { NotificationSettingsForm } from '@/components/settings/notification-settings-form'
import { useTranslations } from '@/i18n'
import { schoolProfileOptions } from '@/lib/queries'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { updateSchoolSettings } from '@/school/functions/school-profile'

export const Route = createFileRoute('/_auth/settings/notifications')({
  component: NotificationsSettingsPage,
})

function NotificationsSettingsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const { data: result, isLoading } = useQuery(schoolProfileOptions.detail())

  const settingsMutation = useMutation({
    mutationKey: schoolMutationKeys.schoolProfile.updateSettings,
    mutationFn: updateSchoolSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-profile'] })
      toast.success(t.settings.profile.settingsUpdateSuccess())
    },
    onError: () => {
      toast.error(t.settings.profile.settingsUpdateError())
    },
  })

  const handleSettingsUpdate = (data: Partial<SchoolSettings>) => {
    settingsMutation.mutate({ data })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    )
  }

  const school = result || null
  const settings = school?.settings as SchoolSettings | undefined

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="text-xl font-bold uppercase tracking-wider text-muted-foreground">{t.settings.profile.schoolSettings()}</CardTitle>
            <CardDescription>
              {t.settings.profile.schoolSettingsDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {settings && (
              <NotificationSettingsForm
                notifications={settings.notifications}
                onUpdate={handleSettingsUpdate}
                isSubmitting={settingsMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
