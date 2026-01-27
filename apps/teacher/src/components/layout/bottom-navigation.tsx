import { IconBook, IconCalendar, IconMessageCircle, IconSchool, IconUser } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'planning', labelKey: 'nav.planning', icon: IconCalendar, href: '/app' },
  { id: 'ecole', labelKey: 'nav.ecole', icon: IconSchool, href: '/app/schools' },
  { id: 'session', labelKey: 'nav.session', icon: IconBook, href: '/app/session' },
  { id: 'chat', labelKey: 'nav.chat', icon: IconMessageCircle, href: '/app/chat' },
  { id: 'profile', labelKey: 'nav.profile', icon: IconUser, href: '/app/profile' },
] as const

export function BottomNavigation() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href)
          const Icon = item.icon

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
              aria-label={t(item.labelKey)}
              data-nav={item.id}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
