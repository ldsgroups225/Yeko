import type { SchoolSettings } from '@/schemas/school-profile'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
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
      <TabsList className="
        bg-muted/20 border-border/40 grid h-auto w-full grid-cols-2 rounded-2xl
        border p-1 backdrop-blur-md
      "
      >
        <TabsTrigger
          value="grading"
          className="
            data-[state=active]:bg-card
            rounded-xl py-2.5 transition-all duration-300
            data-[state=active]:shadow-lg
          "
        >
          {t.settings.profile.gradingScale()}
        </TabsTrigger>
        <TabsTrigger
          value="notifications"
          className="
            data-[state=active]:bg-card
            rounded-xl py-2.5 transition-all duration-300
            data-[state=active]:shadow-lg
          "
        >
          {t.settings.notifications()}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="grading" className="mt-6">
        <GradingScaleConfig
          gradingScale={settings.gradingScale}
          academic={settings.academic}
          onUpdate={onUpdate}
          isSubmitting={isSubmitting}
        />
      </TabsContent>

      <TabsContent value="notifications" className="mt-6">
        <NotificationSettingsForm
          notifications={settings.notifications}
          onUpdate={onUpdate}
          isSubmitting={isSubmitting}
        />
      </TabsContent>
    </Tabs>
  )
}
