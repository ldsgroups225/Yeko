import { createFileRoute } from '@tanstack/react-router'
import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_auth/app/schedule')({
  component: SchedulePage,
})

function SchedulePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{t('schedule.title')}</h1>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            {t('schedule.noSessions')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
