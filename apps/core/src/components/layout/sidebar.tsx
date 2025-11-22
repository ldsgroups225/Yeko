import type { FileRoutesByTo } from '@/routeTree.gen'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  Home,
  Menu,
  School,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

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

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const itemPath = item.href
    const isActive = currentPath === itemPath
      || (item.href !== '/app/dashboard' && currentPath.startsWith(itemPath))
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.href)

    return (
      <motion.div
        key={item.href}
        className="group"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ x: 4 }}
      >
        <div className="flex items-center gap-1">
          <Button
            variant={isActive && !hasChildren ? 'default' : 'ghost'}
            className={cn(
              'flex-1 justify-start gap-3 h-12 relative overflow-hidden',
              isCollapsed && 'px-2 justify-center',
              level > 0 && !isCollapsed && 'pl-12',
              isActive && !hasChildren && 'bg-primary text-primary-foreground shadow-sm',
              !isActive && 'text-muted-foreground hover:text-foreground hover:bg-accent',
            )}
            onClick={() => navigate({ to: item.href })}
            title={isCollapsed ? item.name : undefined}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <item.icon className="h-5 w-5 shrink-0" />
            </motion.div>
            {!isCollapsed && (
              <motion.div
                className="flex items-center justify-between w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
                {item.badge && (
                  <motion.span
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>
            )}
          </Button>
          {hasChildren && !isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-8 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(item.href)
              }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isExpanded
                  ? (
                    <ChevronDown className="h-4 w-4" />
                  )
                  : (
                    <ChevronRight className="h-4 w-4" />
                  )}
              </motion.div>
            </Button>
          )}
        </div>
        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              className="mt-1 space-y-1 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'hidden lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-background',
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          'transition-all duration-300 ease-in-out',
          className,
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <motion.img
              src="/icon.png"
              alt="Yeko Logo"
              className="h-8 w-8 object-contain"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            />
            <AnimatePresence>
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
            </AnimatePresence>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Menu className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigationItems.map(item => renderNavigationItem(item))}
          </nav>
        </ScrollArea>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <div className="lg:hidden">
        {/* Mobile implementation can be added here with a sheet/drawer */}
      </div>
    </>
  )
}
