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
import * as React from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const pathname = useLocation({ select: location => location.pathname })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{t('sidebar.schoolName')}</span>
            <span className="truncate text-xs">{t('sidebar.schoolSubtitle')}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* CORE DAILY OPERATIONS */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.dailyOperations')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(0, 4).map(item => (
                <SidebarMenuItem key={item.href}>
                  {item.children
                    ? (
                        <SidebarMenuSubItemWrapper item={item} pathname={pathname} />
                      )
                    : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                        >
                          <Link to={item.href}>
                            <item.icon />
                            <span>{item.title}</span>
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
          <SidebarGroupLabel>{t('sidebar.academicOperations')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(4, 8).map(item => (
                <SidebarMenuItem key={item.href}>
                  {item.children
                    ? (
                        <SidebarMenuSubItemWrapper item={item} pathname={pathname} />
                      )
                    : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                        >
                          <Link to={item.href}>
                            <item.icon />
                            <span>{item.title}</span>
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
          <SidebarGroupLabel>{t('sidebar.administration')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(8, 10).map(item => (
                <SidebarMenuItem key={item.href}>
                  {item.children
                    ? (
                        <SidebarMenuSubItemWrapper item={item} pathname={pathname} />
                      )
                    : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                        >
                          <Link to={item.href}>
                            <item.icon />
                            <span>{item.title}</span>
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
          <SidebarGroupLabel>{t('sidebar.configuration')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.slice(10).map(item => (
                <SidebarMenuItem key={item.href}>
                  {item.children
                    ? (
                        <SidebarMenuSubItemWrapper item={item} pathname={pathname} />
                      )
                    : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                        >
                          <Link to={item.href}>
                            <item.icon />
                            <span>{item.title}</span>
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

function SidebarMenuSubItemWrapper({ item, pathname }: { item: NavItem, pathname: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Auto-expand if any child is active
  const hasActiveChild = item.children?.some(child => pathname.startsWith(child.href))

  React.useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true)
    }
  }, [hasActiveChild])

  return (
    <>
      <SidebarMenuButton
        tooltip={item.title}
        onClick={() => setIsOpen(!isOpen)}
        isActive={hasActiveChild}
        className="group/collapsable"
      >
        <item.icon />
        <span>{item.title}</span>
        <ChevronDown className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </SidebarMenuButton>
      {isOpen && (
        <SidebarMenuSub>
          {item.children?.map(child => (
            <SidebarMenuSubItem key={child.href}>
              <SidebarMenuSubButton asChild isActive={pathname === child.href}>
                <Link to={child.href}>
                  <child.icon />
                  <span>{child.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </>
  )
}
