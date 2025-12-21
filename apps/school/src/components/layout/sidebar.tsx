import { Link, useLocation } from '@tanstack/react-router'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  Grid,
  LayoutDashboard,
  Percent,
  RotateCcw,
  Settings,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { motion } from 'motion/react'
import * as React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'

import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
}

// Navigation optimized by usage frequency and UX best practices
// CORE DAILY OPERATIONS → ACADEMIC → ADMINISTRATIVE → CONFIGURATION
const navigationItems: NavItem[] = [
  // CORE DAILY OPERATIONS (Top - Most Frequent)
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Élèves',
    href: '/students',
    icon: GraduationCap,
    children: [
      { title: 'Liste', href: '/students', icon: GraduationCap },
      { title: 'Parents', href: '/students/parents', icon: Users },
      { title: 'Inscriptions', href: '/students/enrollments', icon: ClipboardCheck },
      { title: 'Opérations groupées', href: '/students/bulk-operations', icon: FileText },
    ],
  },
  {
    title: 'Classes',
    href: '/classes',
    icon: BookOpen,
    children: [
      { title: 'Liste des classes', href: '/classes', icon: BookOpen },
      { title: 'Affectations', href: '/classes/assignments', icon: Users },
    ],
  },
  {
    title: 'Utilisateurs',
    href: '/users',
    icon: Users,
    children: [
      { title: 'Personnel', href: '/users/staff', icon: Users },
      { title: 'Enseignants', href: '/users/teachers', icon: GraduationCap },
      { title: 'Rôles', href: '/users/roles', icon: UserCheck },
    ],
  },

  // ACADEMIC OPERATIONS (Middle)
  {
    title: 'Notes & Moyennes',
    href: '/grades',
    icon: ClipboardCheck,
    children: [
      { title: 'Saisie des notes', href: '/grades/entry', icon: FileText },
      { title: 'Statistiques', href: '/grades/statistics', icon: Grid },
      { title: 'Validations', href: '/grades/validations', icon: ClipboardCheck },
      { title: 'Bulletins', href: '/grades/report-cards', icon: FileText },
    ],
  },
  {
    title: 'Conduites',
    href: '/conducts',
    icon: AlertTriangle,
    children: [
      { title: 'Présence Élèves', href: '/conducts/student-attendance', icon: UserCheck },
      { title: 'Présence Enseignants', href: '/conducts/teacher-attendance', icon: UserCheck },
      { title: 'Conduite', href: '/conducts/conduct', icon: AlertTriangle },
      { title: 'Alertes', href: '/conducts/alerts', icon: Bell },
    ],
  },
  {
    title: 'Emplois du temps',
    href: '/schedules',
    icon: Calendar,
  },
  {
    title: 'Programmes',
    href: '/programs',
    icon: BookOpen,
    children: [
      { title: 'Matières', href: '/programs/subjects', icon: BookOpen },
      { title: 'Coefficients', href: '/programs/coefficients', icon: Percent },
      { title: 'Progression', href: '/programs/curriculum-progress', icon: Grid },
    ],
  },

  // ADMINISTRATIVE (Lower)
  {
    title: 'Comptabilité',
    href: '/accounting',
    icon: DollarSign,
    children: [
      { title: 'Tableau de bord', href: '/accounting/dashboard', icon: LayoutDashboard },
      { title: 'Types de frais', href: '/accounting/fee-types', icon: FileText },
      { title: 'Grilles tarifaires', href: '/accounting/fee-structures', icon: Grid },
      { title: 'Frais élèves', href: '/accounting/student-fees', icon: Users },
      { title: 'Paiements', href: '/accounting/payments', icon: CreditCard },
      { title: 'Plans de paiement', href: '/accounting/payment-plans', icon: Calendar },
      { title: 'Remises', href: '/accounting/discounts', icon: Percent },
      { title: 'Remboursements', href: '/accounting/refunds', icon: RotateCcw },
      { title: 'Comptes', href: '/accounting/accounts', icon: Wallet },
    ],
  },
  {
    title: 'Espaces',
    href: '/spaces',
    icon: Building2,
    children: [
      { title: 'Salles de classe', href: '/spaces/classrooms', icon: Building2 },
      { title: 'Disponibilité', href: '/spaces/availability', icon: Calendar },
    ],
  },

  // CONFIGURATION (Bottom - Least Frequent)
  {
    title: 'Paramètres',
    href: '/settings',
    icon: Settings,
    children: [
      { title: 'Profil école', href: '/settings/profile', icon: Building2 },
      { title: 'Années scolaires', href: '/settings/school-years', icon: Calendar },
      { title: 'Notifications', href: '/settings/notifications', icon: Bell },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations()
  const pathname = useLocation({ select: location => location.pathname })
  const [openItem, setOpenItem] = React.useState<string | null>(() => {
    const activeItem = navigationItems.find(item =>
      item.children?.some(child => pathname.startsWith(child.href)),
    )
    return activeItem?.title ?? null
  })

  // Sync state if pathname changes to a new active group
  const lastPathnameRef = React.useRef(pathname)
  if (lastPathnameRef.current !== pathname) {
    lastPathnameRef.current = pathname
    const activeItem = navigationItems.find(item =>
      item.children?.some(child => pathname.startsWith(child.href)),
    )
    if (activeItem && openItem !== activeItem.title) {
      setOpenItem(activeItem.title)
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-white/70 backdrop-blur-2xl dark:bg-black/70 transition-all duration-300" {...props}>
      <SidebarHeader className="border-b border-border/10 p-5">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap className="size-6" />
          </div>
          <div className="grid flex-1 text-left">
            <span className="truncate text-base font-bold leading-none">{t.sidebar.schoolName()}</span>
            <span className="truncate text-xs font-medium text-muted-foreground">{t.sidebar.schoolSubtitle()}</span>
          </div>
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="px-2 scrollbar-none overflow-x-hidden">

        {/* CORE DAILY OPERATIONS */}
        <SidebarGroup>
          <SidebarGroupLabel>{t.sidebar.dailyOperations()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(0, 4).map(item => (
                <SidebarMenuItem key={item.href}>
                  {item.children
                    ? (
                        <SidebarMenuSubItemWrapper
                          item={item}
                          pathname={pathname}
                          isOpen={openItem === item.title}
                          onToggle={() => setOpenItem(openItem === item.title ? null : item.title)}
                        />
                      )
                    : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                          className={`transition-all duration-200 py-3 ${pathname === item.href ? 'bg-primary/10 text-primary shadow-sm font-semibold' : 'hover:bg-sidebar-accent/50 hover:pl-5 text-muted-foreground hover:text-foreground'}`}
                        >
                          <Link to={item.href} className="flex w-full items-center gap-3">
                            <item.icon className={`size-5 transition-transform duration-300 group-hover:scale-110 ${pathname === item.href ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            <span className="font-medium text-sm">{item.title}</span>
                            {pathname === item.href && (
                              <motion.div
                                layoutId="active-nav-indicator"
                                className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                              />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ACADEMIC OPERATIONS */}
        <SidebarGroup>
          <SidebarGroupLabel>{t.sidebar.academicOperations()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(4, 8).map(item => (
                <SidebarMenuItem key={item.href}>
                  {item.children
                    ? (
                        <SidebarMenuSubItemWrapper
                          item={item}
                          pathname={pathname}
                          isOpen={openItem === item.title}
                          onToggle={() => setOpenItem(openItem === item.title ? null : item.title)}
                        />
                      )
                    : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                          className={`transition-all duration-200 ${pathname === item.href ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-sidebar-accent/50 hover:pl-4'}`}
                        >
                          <Link to={item.href} className="flex w-full items-center gap-2 py-2">
                            <item.icon className={`size-4 transition-transform duration-300 group-hover:scale-110 ${pathname === item.href ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            <span className="font-medium">{item.title}</span>
                            {pathname === item.href && (
                              <motion.div
                                layoutId="active-nav-indicator"
                                className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                              />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ADMINISTRATIVE */}
        <SidebarGroup>
          <SidebarGroupLabel>{t.sidebar.administration()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(8, 10).map(item => (
                <SidebarMenuItem key={item.href}>
                  {item.children
                    ? (
                        <SidebarMenuSubItemWrapper
                          item={item}
                          pathname={pathname}
                          isOpen={openItem === item.title}
                          onToggle={() => setOpenItem(openItem === item.title ? null : item.title)}
                        />
                      )
                    : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                          className={`transition-all duration-200 ${pathname === item.href ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-sidebar-accent/50 hover:pl-4'}`}
                        >
                          <Link to={item.href} className="flex w-full items-center gap-2 py-2">
                            <item.icon className={`size-4 transition-transform duration-300 group-hover:scale-110 ${pathname === item.href ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            <span className="font-medium">{item.title}</span>
                            {pathname === item.href && (
                              <motion.div
                                layoutId="active-nav-indicator"
                                className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                              />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CONFIGURATION */}
        <SidebarGroup>
          <SidebarGroupLabel>{t.sidebar.configuration()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(10).map(item => (
                <SidebarMenuItem key={item.href}>
                  {item.children
                    ? (
                        <SidebarMenuSubItemWrapper
                          item={item}
                          pathname={pathname}
                          isOpen={openItem === item.title}
                          onToggle={() => setOpenItem(openItem === item.title ? null : item.title)}
                        />
                      )
                    : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                          className={`transition-all duration-200 ${pathname === item.href ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-sidebar-accent/50 hover:pl-4'}`}
                        >
                          <Link to={item.href} className="flex w-full items-center gap-2 py-2">
                            <item.icon className={`size-4 transition-transform duration-300 group-hover:scale-110 ${pathname === item.href ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            <span className="font-medium">{item.title}</span>
                            {pathname === item.href && (
                              <motion.div
                                layoutId="active-nav-indicator"
                                className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                              />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  )
}

function SidebarMenuSubItemWrapper({
  item,
  pathname,
  isOpen,
  onToggle,
}: {
  item: NavItem
  pathname: string
  isOpen: boolean
  onToggle: () => void
}) {
  // Check if any child is active to highlight the parent
  const hasActiveChild = item.children?.some(child => pathname.startsWith(child.href))

  return (
    <div className="flex flex-col gap-1">
      <SidebarMenuButton
        tooltip={item.title}
        onClick={onToggle}
        isActive={hasActiveChild} // Keep active style if child is active
        className={`group/collapsable w-full justify-between transition-all duration-200 ${hasActiveChild ? 'bg-primary/5 text-primary' : 'hover:bg-sidebar-accent/50'
        }`}
      >
        <div className="flex items-center gap-2">
          <item.icon className="size-4" />
          <span className="font-medium">{item.title}</span>
        </div>
        <ChevronDown
          className={cn(
            'ml-auto size-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            isOpen ? 'rotate-180 scale-110 text-primary' : 'rotate-0 scale-100 text-muted-foreground',
          )}
        />
      </SidebarMenuButton>

      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          isOpen ? 'h-auto opacity-100 mt-1 scale-100 origin-top' : 'h-0 opacity-0 mt-0 scale-95 origin-top',
        )}
      >
        <SidebarMenuSub>
          {item.children?.map((child, index) => (
            <SidebarMenuSubItem
              key={child.href}
              className={cn(
                'transition-all duration-500',
                isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0',
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              <SidebarMenuSubButton
                asChild
                isActive={pathname === child.href}
                className={`transition-all duration-200 ${pathname === child.href
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:pl-4 hover:text-foreground'
                }`}
              >
                <Link to={child.href}>
                  <child.icon className={cn(
                    'size-3.5 transition-transform duration-300 group-hover:scale-110',
                    pathname === child.href && 'scale-110',
                  )}
                  />
                  <span>{child.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </div>
    </div>
  )
}
