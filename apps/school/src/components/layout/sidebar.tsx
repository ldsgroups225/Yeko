import { Link, useLocation } from '@tanstack/react-router'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  Calendar,
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
  children?: NavItem[]
}

// TODO: This will be role-based navigation
const navigationItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Ressources Humaines',
    href: '/app/hr',
    icon: Users,
    children: [
      { title: 'Utilisateurs', href: '/app/hr/users', icon: Users },
      { title: 'Enseignants', href: '/app/hr/teachers', icon: GraduationCap },
      { title: 'Personnel', href: '/app/hr/staff', icon: Users },
      { title: 'Rôles', href: '/app/hr/roles', icon: Users },
    ],
  },
  {
    title: 'Élèves',
    href: '/app/students',
    icon: GraduationCap,
    children: [
      { title: 'Liste des élèves', href: '/app/students', icon: GraduationCap },
      { title: 'Parents', href: '/app/students/parents', icon: Users },
      { title: 'Inscriptions', href: '/app/students/enrollments', icon: ClipboardCheck },
      { title: 'Opérations en masse', href: '/app/students/bulk-operations', icon: FileText },
    ],
  },
  {
    title: 'Académique',
    href: '/app/academic',
    icon: BookOpen,
    children: [
      { title: 'Classes', href: '/app/academic/classes', icon: BookOpen },
      { title: 'Affectations', href: '/app/academic/assignments', icon: Users },
      { title: 'Matières', href: '/app/academic/subjects', icon: BookOpen },
      { title: 'Coefficients', href: '/app/academic/coefficients', icon: ClipboardCheck },
      { title: 'Notes', href: '/app/academic/grades', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Espaces',
    href: '/app/spaces',
    icon: Building2,
    children: [
      { title: 'Salles de classe', href: '/app/spaces/classrooms', icon: Building2 },
      { title: 'Disponibilité', href: '/app/spaces/availability', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Vie Scolaire',
    href: '/app/school-life',
    icon: UserCheck,
    children: [
      { title: 'Tableau de bord', href: '/app/school-life', icon: LayoutDashboard },
      { title: 'Présence Enseignants', href: '/app/school-life/teacher-attendance', icon: UserCheck },
      { title: 'Présence Élèves', href: '/app/school-life/student-attendance', icon: Users },
      { title: 'Conduite', href: '/app/school-life/conduct', icon: AlertTriangle },
    ],
  },
  {
    title: 'Finance',
    href: '/app/finance',
    icon: DollarSign,
    children: [
      { title: 'Tableau de bord', href: '/app/finance/dashboard', icon: LayoutDashboard },
      { title: 'Types de frais', href: '/app/finance/fee-types', icon: FileText },
      { title: 'Grilles tarifaires', href: '/app/finance/fee-structures', icon: Grid },
      { title: 'Frais élèves', href: '/app/finance/student-fees', icon: Users },
      { title: 'Paiements', href: '/app/finance/payments', icon: CreditCard },
      { title: 'Plans de paiement', href: '/app/finance/payment-plans', icon: Calendar },
      { title: 'Remises', href: '/app/finance/discounts', icon: Percent },
      { title: 'Remboursements', href: '/app/finance/refunds', icon: RotateCcw },
      { title: 'Comptes', href: '/app/finance/accounts', icon: Wallet },
    ],
  },
  {
    title: 'Paramètres',
    href: '/app/settings',
    icon: Settings,
    children: [
      { title: 'Profil école', href: '/app/settings/profile', icon: Building2 },
      { title: 'Années scolaires', href: '/app/settings/school-years', icon: Calendar },
      { title: 'Notifications', href: '/app/settings/notifications', icon: Bell },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = useLocation({ select: location => location.pathname })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Yeko School</span>
            <span className="truncate text-xs">Administration</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => (
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
  return (
    <>
      <SidebarMenuButton tooltip={item.title}>
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
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
    </>
  )
}
