import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Route-based navigation tabs for section pages
 * Following the Tabs View pattern from PLAN.md
 */
export interface RouteTab {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: number | string
}

interface RouteTabsProps {
  tabs: RouteTab[]
  className?: string
}

export function RouteTabs({ tabs, className }: RouteTabsProps) {
  const pathname = useLocation({ select: location => location.pathname })

  return (
    <nav className={cn('flex gap-1 p-1 bg-muted rounded-lg w-fit', className)}>
      {tabs.map((tab) => {
        // Exact match or check if pathname starts with the tab href for child routes
        const isActive = pathname === tab.href
          || (tab.href !== tabs[0]?.href && pathname.startsWith(tab.href))

        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
              'hover:bg-background/80',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.icon && <tab.icon className="size-4" />}
            <span>{tab.title}</span>
            {tab.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                {tab.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Page header with icon and description
 */
interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="size-6" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}

/**
 * Section header for sub-pages within a tabbed layout
 */
interface SectionHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}

/**
 * Card section for grouping content
 */
interface CardSectionProps {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function CardSection({ title, description, icon: Icon, actions, children, className }: CardSectionProps) {
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
      {(title || description) && (
        <div className="flex items-center justify-between gap-4 p-6 pb-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="size-5 text-muted-foreground" />}
            <div>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={cn('p-6', (title || description) && 'pt-0')}>
        {children}
      </div>
    </div>
  )
}

/**
 * Page layout wrapper with consistent spacing
 */
interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  )
}

/**
 * Stats card for displaying metrics
 */
interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <span className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600',
              )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}
                %
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Quick action card with link
 */
interface QuickActionProps {
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number | string
  className?: string
}

export function QuickAction({ title, description, icon: Icon, href, badge, className }: QuickActionProps) {
  return (
    <Link to={href} className={cn('block', className)}>
      <div className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50 h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{title}</p>
                {badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-destructive/10 text-destructive">
                    {badge}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}

/**
 * Empty state component
 */
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && <Icon className="size-12 text-muted-foreground" />}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
