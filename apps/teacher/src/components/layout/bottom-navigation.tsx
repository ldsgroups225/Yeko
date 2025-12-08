import { Link, useLocation } from '@tanstack/react-router'
import { BookOpen, Calendar, GraduationCap, Home, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'home', labelKey: 'nav.home', icon: Home, href: '/app' },
  { id: 'schedule', labelKey: 'nav.schedule', icon: Calendar, href: '/app/schedule' },
  { id: 'grades', labelKey: 'nav.grades', icon: GraduationCap, href: '/app/grades' },
  { id: 'sessions', labelKey: 'nav.sessions', icon: BookOpen, href: '/app/sessions' },
  { id: 'messages', labelKey: 'nav.messages', icon: MessageSquare, href: '/app/messages' },
] as const

export function BottomNavigation() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
            || (item.href !== '/app' && location.pathname.startsWith(item.href))
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
