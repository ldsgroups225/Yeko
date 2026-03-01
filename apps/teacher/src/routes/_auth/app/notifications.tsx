import { IconBell, IconCheck } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { toast } from 'sonner'

import { MobileHeader } from '@/components/layout/mobile-header'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { notificationsMutations } from '@/lib/queries/notifications'

export const Route = createFileRoute('/_auth/app/notifications')({
  component: NotificationsPage,
})

function NotificationsPage() {
  const { LL } = useI18nContext()
  const { context: teacherContext } = useRequiredTeacherContext()

  const markAllReadMutation = useMutation({
    ...notificationsMutations.markAllRead,
    onSuccess: () => {
      toast.success(LL.notifications.markedAllRead())
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error')
    },
  })

  return (
    <div className="flex flex-col pb-20">
      <MobileHeader
        title={LL.notifications.title()}
        showBack
        showNotifications={false}
        rightAction={(
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => markAllReadMutation.mutate({ teacherId: teacherContext?.teacherId || '' })}
            disabled={markAllReadMutation.isPending}
          >
            <IconCheck className="mr-1 h-3 w-3" />
            {LL.notifications.markAllRead()}
          </Button>
        )}
      />

      <div className="flex flex-col gap-4 p-4">
        <Card>
          <CardContent className="
            flex flex-col items-center justify-center py-12
          "
          >
            <IconBell className="text-muted-foreground/50 h-12 w-12" />
            <p className="text-muted-foreground mt-4 text-sm">
              {LL.notifications.noNotifications()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
