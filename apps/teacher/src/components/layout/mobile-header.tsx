import { IconArrowLeft, IconBell, IconMenu2 } from '@tabler/icons-react'
import { Link, useRouter } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

import { useI18nContext } from '@/i18n/i18n-react'
import { cn } from '@/lib/utils'

interface MobileHeaderProps {
  title?: string
  showBack?: boolean
  showMenu?: boolean
  showNotifications?: boolean
  notificationCount?: number
  className?: string
  rightAction?: React.ReactNode
}

export function MobileHeader({
  title,
  showBack = false,
  showMenu = false,
  showNotifications = true,
  notificationCount = 0,
  className,
  rightAction,
}: MobileHeaderProps) {
  const { LL } = useI18nContext()
  const router = useRouter()

  const handleBack = () => {
    router.history.back()
  }

  return (
    <header
      className={cn(
        `
          bg-background/95
          supports-backdrop-filter:bg-background/60
          sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4
          backdrop-blur-sm
        `,
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="touch-target"
            onClick={handleBack}
            aria-label={LL.common.back()}
          >
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        )}
        {showMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="touch-target"
            aria-label={LL.nav.menu()}
          >
            <IconMenu2 className="h-5 w-5" />
          </Button>
        )}
        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-1">
        {rightAction}
        {showNotifications && (
          <Link to="/app/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="touch-target relative"
              aria-label={LL.notifications.title()}
            >
              <IconBell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="
                  bg-destructive text-destructive-foreground absolute top-1
                  right-1 flex h-4 min-w-4 items-center justify-center
                  rounded-full px-1 text-[10px] font-medium
                "
                >
                  {notificationCount > 99
                    ? '99+'
                    : notificationCount}
                </span>
              )}
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
