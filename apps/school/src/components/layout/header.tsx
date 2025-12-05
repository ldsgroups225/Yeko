import { Bell } from 'lucide-react'
import { AccountMenu } from '@/components/auth/account-menu'
import { SchoolSwitcher } from '@/components/school/school-switcher'
import { SchoolYearSwitcher } from '@/components/school/school-year-switcher'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
            'relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          {/* Notification badge */}
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
        </button>

        {/* User menu */}
        <AccountMenu />
      </div>
    </header>
  )
}
