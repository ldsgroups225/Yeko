import type { ComponentType } from 'react'
import { IconBook, IconChartBar, IconHelpCircle, IconHome, IconSchool } from '@tabler/icons-react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar'

interface NavigationItem {
  name: string
  icon: ComponentType<{ className?: string }>
  href: string
  description?: string
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
  },
  {
    name: 'Catalogues',
    icon: IconBook,
    href: '/app/catalogs',
    description: 'Catalogues globaux',
  },
  {
    name: 'Programmes',
    icon: IconSchool,
    href: '/app/catalogs/programs',
    description: 'Programmes ministériels',
  },
  {
    name: 'Analytiques',
    icon: IconChartBar,
    href: '/app/analytics',
    description: 'Analytiques du système',
  },
  {
    name: 'Support',
    icon: IconHelpCircle,
    href: '/app/support',
    description: 'CRM & tickets',
  },
]

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const handleNavigation = (href: string) => {
    navigate({ to: href })
    onClose()
  }

  return (
    <Sidebar collapsible="none" className="lg:hidden">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2">
          <img
            src="/icon.png"
            alt="Yeko Logo"
            className="h-8 w-8 object-contain"
          />
          <div>
            <h1 className="text-lg font-semibold">Yeko Core</h1>
            <p className="text-xs text-muted-foreground">Super Administrateur</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = currentPath === item.href
                  || (item.href !== '/app/dashboard' && currentPath.startsWith(item.href))

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleNavigation(item.href)}
                      className="h-14 flex-col items-start"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-xs text-left w-full opacity-70">
                        {item.description}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Utilisateur Admin</span>
            <span className="text-xs text-muted-foreground">Super Administrateur</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
