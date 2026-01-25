import type { SystemAction } from '@repo/data-ops'
import type { ComponentType } from 'react'
import type { FileRoutesByTo } from '@/routeTree.gen'
import { Button } from '@repo/ui/src/components/button'
import {
  IconAward,
  IconBook,
  IconBookmark,
  IconCalculator,
  IconCalendar,
  IconChartBar,
  IconChevronDown,
  IconHelpCircle,
  IconHome,
  IconRoute,
  IconSchool,
} from '@tabler/icons-react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  Sidebar as SidebarRoot,
  useSidebar,
} from '@workspace/ui/components/sidebar'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useAuthorization } from '@/hooks/use-authorization'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  icon: ComponentType<{ className?: string }>
  href: keyof FileRoutesByTo
  badge?: string | number
  description?: string
  permission?: { resource: string, action?: SystemAction }
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Tableau de bord',
    icon: IconHome,
    href: '/app/dashboard',
    description: 'Vue d\'ensemble du système',
  },
  {
    name: 'Écoles',
    icon: IconSchool,
    href: '/app/schools',
    description: 'Écoles partenaires',
    permission: { resource: 'schools', action: 'view' },
  },
  {
    name: 'Catalogues',
    icon: IconBook,
    href: '/app/catalogs',
    description: 'Catalogues globaux',
    permission: { resource: 'academic_catalogs', action: 'view' },
    children: [
      {
        name: 'Programmes',
        icon: IconSchool,
        href: '/app/catalogs/programs',
        description: 'Programmes ministériels',
      },
      {
        name: 'Matières',
        icon: IconBookmark,
        href: '/app/catalogs/subjects',
        description: 'Matières académiques',
      },
      {
        name: 'Filières',
        icon: IconRoute,
        href: '/app/catalogs/tracks',
        description: 'Filières d\'études',
      },
      {
        name: 'Niveaux',
        icon: IconAward,
        href: '/app/catalogs/grades',
        description: 'Niveaux et séries',
      },
      {
        name: 'Coefficients',
        icon: IconCalculator,
        href: '/app/catalogs/coefficients',
        description: 'Coefficients des matières',
      },
      {
        name: 'Années Scolaires',
        icon: IconCalendar,
        href: '/app/catalogs/school-years',
        description: 'Modèles et périodes',
      },
    ],
  },
  {
    name: 'Analytiques',
    icon: IconChartBar,
    href: '/app/analytics',
    description: 'Analytiques du système',
    permission: { resource: 'system_monitoring', action: 'view' },
  },
  {
    name: 'Support',
    icon: IconHelpCircle,
    href: '/app/support',
    description: 'CRM & tickets',
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const { auth, can } = useAuthorization()
  const currentPath = routerState.location.pathname
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () => new Set(),
  )
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const toggleExpanded = (href: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(href)) {
      newExpanded.delete(href)
    }
    else {
      newExpanded.add(href)
    }
    setExpandedItems(newExpanded)
  }

  // Filter items based on permissions
  const filteredItems = useMemo(() => {
    return navigationItems.filter((item) => {
      // If no permission specified, item is public for authorized users
      if (!item.permission)
        return true
      return can(item.permission.resource, item.permission.action || 'view')
    })
  }, [can])

  const renderNavigationItem = (item: NavigationItem) => {
    const itemPath = item.href
    const isActive
      = currentPath === itemPath
        || (item.href !== '/app/dashboard' && currentPath.startsWith(itemPath))
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.href)

    return (
      <SidebarMenuItem key={item.href}>
        <div className="flex items-center w-full">
          <SidebarMenuButton
            isActive={isActive && !hasChildren}
            onClick={() => navigate({ to: item.href })}
            tooltip={isCollapsed ? item.name : undefined}
            className="h-12 flex-1"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <item.icon className="h-5 w-5" />
            </motion.div>
            <div className="flex flex-col items-start flex-1">
              <span className="text-sm font-medium">{item.name}</span>
              {!isCollapsed && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </div>
            {item.badge && !isCollapsed && (
              <motion.span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {item.badge}
              </motion.span>
            )}
          </SidebarMenuButton>
          {hasChildren && !isCollapsed && (
            <Button
              variant="link"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(item.href)
              }}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <IconChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          )}
        </div>
        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <SidebarMenuSub className="border-l-2 border-border/40 ml-2 mt-1 py-1">
                {item.children?.map((child) => {
                  const isChildActive = currentPath === child.href
                  return (
                    <SidebarMenuSubItem key={child.href} className="px-1">
                      <Link
                        to={child.href}
                        className={cn(
                          'flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-200 text-sm',
                          'hover:bg-accent/80 hover:translate-x-1',
                          isChildActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <child.icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isChildActive
                              ? 'text-primary'
                              : 'text-muted-foreground group-hover/menu-sub-item:text-foreground',
                          )}
                        />
                        <span className="truncate">{child.name}</span>
                      </Link>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarMenuItem>
    )
  }

  const roleName = auth?.isSuperAdmin ? 'Super Administrateur' : 'Administrateur Système'

  return (
    <SidebarRoot collapsible="icon" className={cn('hidden lg:flex', className)}>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2">
          <motion.img
            src="/icon.png"
            alt="Yeko Logo"
            className="h-8 w-8 object-contain"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Yeko Core
              </h1>
              <p className="text-xs text-muted-foreground">
                {roleName}
              </p>
            </motion.div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item: NavigationItem) => renderNavigationItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>{/* Add footer content if needed */}</SidebarFooter>
    </SidebarRoot>
  )
}
