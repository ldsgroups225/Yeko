import { IconBell } from '@tabler/icons-react'
import { SidebarTrigger } from '@workspace/ui/components/sidebar'
import { AccountMenu } from '@/components/auth/account-menu'
import { SchoolSwitcher } from '@/components/school/school-switcher'
import { SchoolYearSwitcher } from '@/components/school/school-year-switcher'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

export function Header() {
  const t = useTranslations()

  return (
    <header className="
      border-border/40 bg-background/95
      supports-backdrop-filter:bg-background/60
      sticky top-0 z-50 w-full border-b backdrop-blur-sm
    "
    >
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Mobile menu button */}
        <SidebarTrigger className="lg:hidden" />

        {/* School Switcher */}
        <SchoolSwitcher />

        {/* School Year Switcher */}
        <SchoolYearSwitcher />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Notifications */}
        <button
          type="button"
          className={cn(
            `
              relative inline-flex h-9 w-9 items-center justify-center
              rounded-md text-sm font-medium transition-colors
            `,
            'hover:bg-accent hover:text-accent-foreground',
            `
              focus-visible:ring-ring focus-visible:ring-2
              focus-visible:outline-none
            `,
          )}
        >
          <IconBell className="h-5 w-5" />
          <span className="sr-only">{t.common.notifications()}</span>
          {/* Notification badge */}
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="
              bg-destructive absolute inline-flex h-full w-full animate-ping
              rounded-full opacity-75
            "
            />
            <span className="
              bg-destructive relative inline-flex h-2 w-2 rounded-full
            "
            />
          </span>
        </button>

        {/* IconUser menu */}
        <AccountMenu />
      </div>
    </header>
  )
}
