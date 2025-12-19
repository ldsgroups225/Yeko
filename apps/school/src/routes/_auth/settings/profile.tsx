import type { SchoolSettings, UpdateSchoolProfileInput } from '@/schemas/school-profile'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { SchoolProfileForm } from '@/components/settings/school-profile-form'
import { SchoolSettingsTabs } from '@/components/settings/school-settings-tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { schoolProfileOptions } from '@/lib/queries'
import {
  updateSchoolLogo,
  updateSchoolProfile,
  updateSchoolSettings,
} from '@/school/functions/school-profile'

export const Route = createFileRoute('/_auth/settings/profile')({
  component: SettingsProfilePage,
})

function SettingsProfilePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: school, isLoading } = useQuery(schoolProfileOptions.detail())

  const profileMutation = useMutation({
    mutationFn: updateSchoolProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-profile'] })
      toast.success(t('settings.profile.updateSuccess'))
    },
    onError: () => {
      toast.error(t('settings.profile.updateError'))
    },
  })

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

  const logoMutation = useMutation({
    mutationFn: updateSchoolLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-profile'] })
      toast.success(t('settings.profile.logoUpdateSuccess'))
    },
    onError: () => {
      toast.error(t('settings.profile.logoUpdateError'))
    },
  })

  const handleProfileUpdate = (data: UpdateSchoolProfileInput) => {
    profileMutation.mutate({ data })
  }

  const handleSettingsUpdate = (data: Partial<SchoolSettings>) => {
    settingsMutation.mutate({ data })
  }

  const handleLogoUpdate = (logoUrl: string) => {
    logoMutation.mutate({ data: { logoUrl } })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {t('settings.profile.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.profile.description')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.profile.schoolInfo')}</CardTitle>
            <CardDescription>
              {t('settings.profile.schoolInfoDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
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

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.profile.schoolSettings')}</CardTitle>
            <CardDescription>
              {t('settings.profile.schoolSettingsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {school && (
              <SchoolSettingsTabs
                settings={school.settings as SchoolSettings}
                onUpdate={handleSettingsUpdate}
                isSubmitting={settingsMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
