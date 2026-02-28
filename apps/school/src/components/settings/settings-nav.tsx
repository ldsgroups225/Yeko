import { IconBell, IconBuilding, IconCalendar, IconFileText, IconSettings } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { motion } from 'motion/react'
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
 * IconSettings navigation tabs component
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
      icon: IconBuilding,
      description: t.settings.profile.description(),
    },
    {
      title: t.settings.schoolYears.title(),
      href: '/settings/school-years',
      icon: IconCalendar,
      description: t.settings.schoolYears.description(),
    },
    {
      title: t.settings.notifications(),
      href: '/settings/notifications',
      icon: IconBell,
      description: t.settings.notificationsDescription(),
    },
    {
      title: t.settings.reportCards.title(),
      href: '/settings/report-cards',
      icon: IconFileText,
      description: t.settings.reportCards.description(),
    },
  ]

  return (
    <nav className="
      bg-muted/20 border-border/40 flex w-fit gap-1 rounded-xl border p-1
      backdrop-blur-md
    "
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              `
                relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm
                font-medium transition-all duration-300 outline-none
              `,
              'hover:text-foreground',
              isActive
                ? 'text-foreground shadow-sm'
                : `
                  text-muted-foreground
                  hover:bg-muted/30
                `,
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeSettingsTab"
                className="bg-background absolute inset-0 rounded-lg"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * IconSettings page header component
 * Provides consistent header styling for all settings pages
 */
export function SettingsHeader({
  title,
  description,
  icon: Icon = IconSettings,
}: {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-4 flex items-start gap-4"
    >
      <div className="
        bg-primary/10 border-primary/20 text-primary flex size-12 items-center
        justify-center rounded-2xl border p-3 shadow-lg backdrop-blur-xl
      "
      >
        <Icon className="size-6" />
      </div>
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase italic">{title}</h1>
        {description && (
          <p className="
            text-muted-foreground mt-1 max-w-lg text-sm font-medium italic
          "
          >
            {description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/**
 * IconSettings page layout wrapper
 * Provides consistent layout for all settings pages
 */
export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations()

  return (
    <div className="space-y-8 p-1">
      <SettingsHeader
        title={t.nav.settings()}
        description={t.settings.description()}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SettingsNav />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        {children}
      </motion.div>
    </div>
  )
}
