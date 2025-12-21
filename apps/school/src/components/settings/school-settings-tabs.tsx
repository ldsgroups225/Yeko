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
      <TabsList className="grid w-full grid-cols-2 bg-muted/20 backdrop-blur-md border border-border/40 p-1 rounded-2xl h-auto">
        <TabsTrigger value="grading" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg py-2.5 transition-all duration-300">
          {t.settings.profile.gradingScale()}
        </TabsTrigger>
        <TabsTrigger value="notifications" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg py-2.5 transition-all duration-300">
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
