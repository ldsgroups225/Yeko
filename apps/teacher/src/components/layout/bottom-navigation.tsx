import type { TranslationFunctions } from '@/i18n/i18n-types'
import { IconCalendar, IconMessageCircle, IconSchool, IconUser } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useI18nContext } from '@/i18n/i18n-react'
import { cn } from '@/lib/utils'

const navItems: Array<{ id: keyof TranslationFunctions['nav'], icon: typeof IconCalendar, href: string }> = [
  { id: 'planning', icon: IconCalendar, href: '/app' },
  { id: 'ecole', icon: IconSchool, href: '/app/schools' },
  { id: 'chat', icon: IconMessageCircle, href: '/app/chat' },
  { id: 'profile', icon: IconUser, href: '/app/profile' },
]

export function BottomNavigation() {
  const { LL } = useI18nContext()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = item.href === '/app'
            ? location.pathname === '/app' || location.pathname === '/app/'
            : location.pathname.startsWith(item.href)
          const Icon = item.icon
          const label = LL.nav[item.id]()

          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors touch-target',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={label}
              data-nav={item.id}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
