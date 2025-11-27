import type { ComponentType } from 'react'
import type { FileRoutesByTo } from '@/routeTree.gen'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  Home,
  School,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Sidebar as SidebarRoot,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  icon: ComponentType<{ className?: string }>
  href: keyof FileRoutesByTo
  badge?: string | number
  description?: string
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Tableau de bord',
    icon: Home,
    href: '/app/dashboard',
    description: 'Vue d\'ensemble du système',
  },
  {
    name: 'Écoles',
    icon: School,
    href: '/app/schools',
    description: 'Écoles partenaires',
  },
  {
    name: 'Catalogues',
    icon: BookOpen,
    href: '/app/catalogs',
    description: 'Catalogues globaux',
    children: [
      {
        name: 'Programmes',
        icon: GraduationCap,
        href: '/app/catalogs/programs',
        description: 'Programmes ministériels',
      },
    ],
  },
  {
    name: 'Analytiques',
    icon: BarChart3,
    href: '/app/analytics',
    description: 'Analytiques du système',
  },
  {
    name: 'Support',
    icon: HelpCircle,
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
  const currentPath = routerState.location.pathname
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set())
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

  const renderNavigationItem = (item: NavigationItem) => {
    const itemPath = item.href
    const isActive = currentPath === itemPath
      || (item.href !== '/app/dashboard' && currentPath.startsWith(itemPath))
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.href)

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          isActive={isActive && !hasChildren}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.href)
            }
            else {
              navigate({ to: item.href })
            }
          }}
          tooltip={isCollapsed ? item.name : undefined}
          className="h-12"
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
              <span className="text-xs text-muted-foreground">{item.description}</span>
            )}
          </div>
          {hasChildren && !isCollapsed && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          )}
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
        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SidebarMenuSub>
                {item.children?.map(child => (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton
                      isActive={currentPath === child.href}
                      onClick={() => navigate({ to: child.href })}
                    >
                      <child.icon className="h-4 w-4" />
                      <span>{child.name}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarMenuItem>
    )
  }

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
              <p className="text-xs text-muted-foreground">Super Administrateur</p>
            </motion.div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => renderNavigationItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Add footer content if needed */}
      </SidebarFooter>
    </SidebarRoot>
  )
}
