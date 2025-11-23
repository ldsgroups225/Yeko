import type { ComponentType } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Home,
  School,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

// Import cn utility from lib/utils
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  icon: ComponentType<{ className?: string }>
  href: string
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Tableau de bord',
    icon: Home,
    href: '/dashboard',
    description: 'Vue d\'ensemble du système',
  },
  {
    name: 'Écoles',
    icon: School,
    href: '/schools',
    description: 'Écoles partenaires',
  },
  {
    name: 'Catalogues',
    icon: BookOpen,
    href: '/catalogs',
    description: 'Catalogues globaux',
  },
  {
    name: 'Programmes',
    icon: GraduationCap,
    href: '/programs',
    description: 'Programmes ministériels',
  },
  {
    name: 'Analytiques',
    icon: BarChart3,
    href: '/analytics',
    description: 'Analytiques du système',
  },
  {
    name: 'Support',
    icon: HelpCircle,
    href: '/support',
    description: 'CRM & tickets',
  },
]

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const handleNavigation = (href: string) => {
    navigate({ to: href })
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center gap-2">
            <img
              src="/icon.png"
              alt="Yeko Logo"
              className="h-8 w-8 object-contain"
            />
            <div>
              <SheetTitle className="text-lg">Yeko Core</SheetTitle>
              <p className="text-xs text-muted-foreground">Super Administrateur</p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.href
                || (item.href !== '/dashboard' && currentPath.startsWith(item.href))

              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-14 flex-col items-start',
                    isActive && 'bg-primary text-primary-foreground shadow-sm',
                    !isActive && 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs text-left w-full opacity-70">
                    {item.description}
                  </span>
                </Button>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto pt-6 border-t">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Utilisateur Admin</span>
                <span className="text-xs text-muted-foreground">Super Administrateur</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
