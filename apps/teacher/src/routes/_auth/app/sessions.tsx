import { createFileRoute } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_auth/app/sessions')({
  component: SessionsPage,
})

function SessionsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{t('session.title')}</h1>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            {t('session.history')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
