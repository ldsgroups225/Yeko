import { Link, useLocation } from '@tanstack/react-router'
import { Bell, Building2, Calendar, Settings } from 'lucide-react'
import * as React from 'react'
import { useTranslations } from '@/i18n'

import { cn } from '@/lib/utils'

interface SettingsNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

/**
 * Settings navigation tabs component
 * Provides a unified navigation experience for settings pages
 * Following the Tabs View pattern from PLAN.md
 */
export function SettingsNav() {
  const t = useTranslations()
  const pathname = useLocation({ select: location => location.pathname })

  const navItems: SettingsNavItem[] = [
    {
      title: t.settings.profile.title(),
      href: '/settings/profile',
      icon: Building2,
      description: t.settings.profile.description(),
    },
    {
      title: t.settings.schoolYears.title(),
      href: '/settings/school-years',
      icon: Calendar,
      description: t.settings.schoolYears.description(),
    },
    {
      title: t.settings.notifications(),
      href: '/settings/notifications',
      icon: Bell,
      description: t.settings.notificationsDescription(),
    },
  ]

  return (
    <nav className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
              'hover:bg-background/80',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon className="size-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Settings page header component
 * Provides consistent header styling for all settings pages
 */
export function SettingsHeader({
  title,
  description,
  icon: Icon = Settings,
}: {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Settings page layout wrapper
 * Provides consistent layout for all settings pages
 */
export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <SettingsHeader
        title={t.nav.settings()}
        description={t.settings.description()}
      />
      <SettingsNav />
      <div className="mt-6">{children}</div>
    </div>
  )
}
