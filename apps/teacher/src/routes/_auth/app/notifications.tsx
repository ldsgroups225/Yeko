import { createFileRoute } from '@tanstack/react-router'
import { Bell, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_auth/app/notifications')({
  component: NotificationsPage,
})

function NotificationsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col pb-20">
      <MobileHeader
        title={t('notifications.title')}
        showBack
        showNotifications={false}
        rightAction={(
          <Button variant="ghost" size="sm" className="text-xs">
            <Check className="mr-1 h-3 w-3" />
            {t('notifications.markAllRead')}
          </Button>
        )}
      />

      <div className="flex flex-col gap-4 p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t('notifications.noNotifications')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
