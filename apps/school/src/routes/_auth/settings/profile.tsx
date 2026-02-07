import type { SchoolSettings, UpdateSchoolProfileInput } from '@/schemas/school-profile'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { SchoolProfileForm } from '@/components/settings/school-profile-form'
import { SchoolSettingsTabs } from '@/components/settings/school-settings-tabs'
import { useTranslations } from '@/i18n'
import { schoolProfileKeys, schoolProfileMutations, schoolProfileOptions } from '@/lib/queries/school-profile'

export const Route = createFileRoute('/_auth/settings/profile')({
  component: SettingsProfilePage,
})

function SettingsProfilePage() {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const { data: result, isPending } = useQuery(schoolProfileOptions.detail())

  const profileMutation = useMutation({
    ...schoolProfileMutations.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolProfileKeys.all })
      toast.success(t.settings.profile.updateSuccess())
    },
    onError: () => {
      toast.error(t.settings.profile.updateError())
    },
  })

  const settingsMutation = useMutation({
    ...schoolProfileMutations.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolProfileKeys.all })
      toast.success(t.settings.profile.settingsUpdateSuccess())
    },
    onError: () => {
      toast.error(t.settings.profile.settingsUpdateError())
    },
  })

  const logoMutation = useMutation({
    ...schoolProfileMutations.updateLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolProfileKeys.all })
      toast.success(t.settings.profile.logoUpdateSuccess())
    },
    onError: () => {
      toast.error(t.settings.profile.logoUpdateError())
    },
  })

  const handleProfileUpdate = (data: UpdateSchoolProfileInput) => {
    profileMutation.mutate(data)
  }

  const handleSettingsUpdate = (data: Partial<SchoolSettings>) => {
    settingsMutation.mutate(data)
  }

  const handleLogoUpdate = (logoUrl: string) => {
    logoMutation.mutate({ logoUrl })
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] w-full rounded-3xl" />
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </div>
      </div>
    )
  }

  const school = result

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="border-b border-border/40 bg-muted/5">
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-muted-foreground">{t.settings.profile.schoolInfo()}</CardTitle>
              <CardDescription>
                {t.settings.profile.schoolInfoDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {school && (
                <SchoolProfileForm
                  school={school}
                  onSubmit={handleProfileUpdate}
                  onLogoUpdate={handleLogoUpdate}
                  isSubmitting={profileMutation.isPending || logoMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="border-b border-border/40 bg-muted/5">
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-muted-foreground">{t.settings.profile.schoolSettings()}</CardTitle>
              <CardDescription>
                {t.settings.profile.schoolSettingsDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {school && (
                <SchoolSettingsTabs
                  settings={school.settings as SchoolSettings}
                  onUpdate={handleSettingsUpdate}
                  isSubmitting={settingsMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
