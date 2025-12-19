import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">{t('app.name')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('app.tagline')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          School context middleware is ready!
        </p>
      </div>
    </div>
  )
}
