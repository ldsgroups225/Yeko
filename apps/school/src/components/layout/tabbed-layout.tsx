import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { PageHeader } from '@workspace/ui/components/page-header'
import { motion } from 'motion/react'

import * as React from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useAuthorization } from '@/hooks/use-authorization'
import { cn } from '@/lib/utils'

interface Tab {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  permission?: { resource: string, action: string }
}

interface TabbedLayoutProps {
  title: string
  description?: string
  tabs: Tab[]
  breadcrumbs?: { label: string, href?: string }[]
  actions?: React.ReactNode
}

export function TabbedLayout({
  title,
  description,
  tabs,
  breadcrumbs,
  actions,
}: TabbedLayoutProps) {
  const pathname = useLocation({ select: l => l.pathname })
  const { can } = useAuthorization()

  const visibleTabs = React.useMemo(() => {
    return tabs.filter((tab) => {
      if (tab.permission) {
        return can(tab.permission.resource, tab.permission.action)
      }
      return true
    })
  }, [tabs, can])

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <PageHeader
        title={title}
        description={description}
      >
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </PageHeader>

      <div className="
        border-border/40 bg-muted/5 relative rounded-t-2xl border-b px-2 pb-px
      "
      >
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={cn(
                  `
                    relative flex items-center gap-2.5 px-6 py-4 text-xs
                    font-black tracking-widest uppercase transition-all
                    duration-300
                  `,
                  isActive
                    ? 'text-primary'
                    : `
                      text-muted-foreground/50
                      hover:text-foreground hover:bg-muted/50
                      rounded-t-xl
                    `,
                )}
              >
                {tab.icon && <tab.icon className="size-4" />}
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="
                      bg-primary absolute inset-x-0 -bottom-px h-1 rounded-full
                      shadow-[0_0_15px_rgba(59,130,246,0.6)]
                    "
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  )
}
