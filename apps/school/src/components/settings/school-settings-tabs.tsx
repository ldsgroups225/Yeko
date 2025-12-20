import type { SchoolSettings } from '@/schemas/school-profile'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from '@/i18n'
import { GradingScaleConfig } from './grading-scale-config'
import { NotificationSettingsForm } from './notification-settings-form'

interface SchoolSettingsTabsProps {
  settings: SchoolSettings
  onUpdate: (data: Partial<SchoolSettings>) => void
  isSubmitting: boolean
}

export function SchoolSettingsTabs({
  settings,
  onUpdate,
  isSubmitting,
}: SchoolSettingsTabsProps) {
  const t = useTranslations()

  return (
    <Tabs defaultValue="grading" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="grading">
          {t.settings.profile.gradingScale()}
        </TabsTrigger>
        <TabsTrigger value="notifications">
          {t.settings.notifications()}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="grading" className="mt-4">
        <GradingScaleConfig
          gradingScale={settings.gradingScale}
          academic={settings.academic}
          onUpdate={onUpdate}
          isSubmitting={isSubmitting}
        />
      </TabsContent>

      <TabsContent value="notifications" className="mt-4">
        <NotificationSettingsForm
          notifications={settings.notifications}
          onUpdate={onUpdate}
          isSubmitting={isSubmitting}
        />
      </TabsContent>
    </Tabs>
  )
}
