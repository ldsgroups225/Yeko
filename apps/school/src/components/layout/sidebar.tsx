import {
  IconAlertTriangle,
  IconBook,
  IconBuilding,
  IconCalendar,
  IconCalendarEvent,
  IconChartBar,
  IconChevronDown,
  IconClipboardCheck,
  IconCreditCard,
  IconCurrencyDollar,
  IconFileSearch,
  IconFileText,
  IconHome,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconPin,
  IconReceipt,
  IconReportAnalytics,
  IconSchool,
  IconSettings,
  IconShieldCheck,
  IconUpload,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
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
  SidebarSeparator,
} from '@workspace/ui/components/sidebar'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

import { useAuthorization } from '@/hooks/use-authorization'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'


interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  permission?: { resource: string, action?: string }
  children?: NavItem[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations()
  const navigate = useNavigate()
  const pathname = useLocation({ select: location => location.pathname })
  const { can } = useAuthorization()

  const shortcuts = React.useMemo<NavItem[]>(() => {
    return [
      {
        title: t.nav.dashboard(),
        href: '/dashboard',
        icon: IconLayoutDashboard,
        permission: { resource: 'dashboard', action: 'view' },
      },
      {
        title: t.nav.attendance(),
        href: '/conducts/student-attendance',
        icon: IconUserCheck,
        permission: { resource: 'attendance', action: 'view' },
      },
      {
        title: t.nav.grades(),
        href: '/grades/entry',
        icon: IconClipboardCheck,
        permission: { resource: 'grades', action: 'view' },
      },
      {
        title: t.nav.payments(),
        href: '/accounting/payments',
        icon: IconCreditCard,
        permission: { resource: 'finance', action: 'view' },
      },
    ].filter(item => !item.permission || can(item.permission.resource, item.permission.action))
  }, [can, t])

  const sections = React.useMemo(() => {
    /*
       UX 3.0: Mission-Based Navigation
       Organized by what the director DOES daily, not by data entity.
       All 46 routes accessible — 0 hidden.
    */
    const rawSections = [
      // 1. PILOTAGE — what's happening now
      {
        title: t.sidebar.pilotage(),
        items: [
          {
            title: t.nav.dashboard(),
            href: '/dashboard',
            icon: IconLayoutDashboard,
            permission: { resource: 'dashboard', action: 'view' },
          },
          {
            title: t.schoolLife.alerts(),
            href: '/conducts/alerts',
            icon: IconAlertTriangle,
            permission: { resource: 'conduct', action: 'view' },
          },
          {
            title: t.grades.statistics.title(),
            href: '/grades/statistics',
            icon: IconChartBar,
            permission: { resource: 'grades', action: 'view' },
          },
        ],
      },
      // 2. VIE SCOLAIRE — daily attendance & discipline
      {
        title: t.sidebar.schoolLife(),
        items: [
          {
            title: t.nav.attendance(),
            href: '/conducts/student-attendance',
            icon: IconUserCheck,
            permission: { resource: 'attendance', action: 'view' },
            children: [
              {
                title: t.nav.pointage(),
                href: '/conducts/student-attendance',
                icon: IconClipboardCheck,
                permission: { resource: 'attendance', action: 'view' },
              },
              {
                title: t.nav.studentAttendanceHistory(),
                href: '/conducts/student-attendance/history',
                icon: IconFileSearch,
                permission: { resource: 'attendance', action: 'view' },
              },
              {
                title: t.nav.studentAttendanceStatistics(),
                href: '/conducts/student-attendance/statistics',
                icon: IconChartBar,
                permission: { resource: 'attendance', action: 'view' },
              },
            ],
          },
          {
            title: t.nav.teacherAttendance(),
            href: '/conducts/teacher-attendance',
            icon: IconUsers,
            permission: { resource: 'attendance', action: 'view' },
            children: [
              {
                title: t.nav.pointage(),
                href: '/conducts/teacher-attendance',
                icon: IconClipboardCheck,
                permission: { resource: 'attendance', action: 'view' },
              },
              {
                title: t.nav.teacherAttendanceReports(),
                href: '/conducts/teacher-attendance/reports',
                icon: IconReportAnalytics,
                permission: { resource: 'attendance', action: 'view' },
              },
            ],
          },
          {
            title: t.nav.conduct(),
            href: '/conducts/conduct',
            icon: IconAlertTriangle,
            permission: { resource: 'conduct', action: 'view' },
            children: [
              {
                title: t.nav.conductIncidents(),
                href: '/conducts/conduct',
                icon: IconAlertTriangle,
                permission: { resource: 'conduct', action: 'view' },
              },
              {
                title: t.nav.conductReports(),
                href: '/conducts/conduct/reports',
                icon: IconReportAnalytics,
                permission: { resource: 'conduct', action: 'view' },
              },
            ],
          },
          {
            title: t.schoolLife.settings(),
            href: '/conducts/settings',
            icon: IconSettings,
            permission: { resource: 'conduct', action: 'manage' },
          },
        ],
      },
      // 3. PÉDAGOGIE — classes, programs, spaces
      {
        title: t.sidebar.pedagogy(),
        items: [
          {
            title: t.nav.classes(),
            href: '/classes',
            icon: IconLayoutGrid,
            permission: { resource: 'classes', action: 'view' },
            children: [
              { title: t.nav.classes(), href: '/classes', icon: IconLayoutGrid },
              {
                title: t.nav.assignments(),
                href: '/classes/assignments',
                icon: IconFileText,
                permission: { resource: 'teacher_assignments', action: 'view' },
              },
            ],
          },
          {
            title: t.nav.programs(),
            href: '/programs/subjects',
            icon: IconBook,
            permission: { resource: 'school_subjects', action: 'view' },
            children: [
              {
                title: t.nav.subjects(),
                href: '/programs/subjects',
                icon: IconBook,
                permission: { resource: 'school_subjects', action: 'view' },
              },
              {
                title: t.nav.coefficients(),
                href: '/programs/coefficients',
                icon: IconChartBar,
                permission: { resource: 'coefficients', action: 'view' },
              },
              {
                title: t.nav.curriculumProgress(),
                href: '/programs/curriculum-progress',
                icon: IconReportAnalytics,
                permission: { resource: 'school_subjects', action: 'view' },
              },
            ],
          },
          {
            title: t.nav.timetables(),
            href: '/schedules',
            icon: IconCalendar,
            permission: { resource: 'timetables', action: 'view' },
          },
          {
            title: t.nav.spaces(),
            href: '/spaces',
            icon: IconHome,
            permission: { resource: 'classrooms', action: 'view' },
            children: [
              {
                title: t.nav.classrooms(),
                href: '/spaces/classrooms',
                icon: IconBuilding,
                permission: { resource: 'classrooms', action: 'view' },
              },
              {
                title: t.spaces.availability.title(),
                href: '/spaces/availability',
                icon: IconCalendarEvent,
                permission: { resource: 'classrooms', action: 'view' },
              },
            ],
          },
        ],
      },
      // 4. EXAMENS & BULLETINS
      {
        title: t.sidebar.examsBulletins(),
        items: [
          {
            title: t.nav.grades(),
            href: '/grades',
            icon: IconClipboardCheck,
            permission: { resource: 'grades', action: 'view' },
            children: [
              {
                title: t.nav.grades(),
                href: '/grades/entry',
                icon: IconFileText,
                permission: { resource: 'grades', action: 'create' },
              },
              { title: t.common.view(), href: '/grades', icon: IconFileSearch },
              {
                title: t.grades.validations.title(),
                href: '/grades/validations',
                icon: IconClipboardCheck,
                permission: { resource: 'grades', action: 'validate' },
              },
            ],
          },
          {
            title: t.nav.reportCards(),
            href: '/grades/report-cards',
            icon: IconReportAnalytics,
            permission: { resource: 'report_cards', action: 'view' },
            children: [
              {
                title: t.nav.reportCards(),
                href: '/grades/report-cards',
                icon: IconReportAnalytics,
                permission: { resource: 'report_cards', action: 'view' },
              },
              {
                title: t.nav.reportCardConfig(),
                href: '/settings/report-cards',
                icon: IconSettings,
                permission: { resource: 'settings', action: 'edit' },
              },
            ],
          },
        ],
      },
      // 5. TRÉSORERIE — enriched with missing routes
      {
        title: t.sidebar.treasury(),
        items: [
          {
            title: t.nav.accounting(),
            href: '/accounting',
            icon: IconCurrencyDollar,
            permission: { resource: 'finance', action: 'view' },
            children: [
              {
                title: t.nav.dashboard(),
                href: '/accounting/dashboard',
                icon: IconLayoutDashboard,
              },
              {
                title: t.nav.payments(),
                href: '/accounting/payments',
                icon: IconCreditCard,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.finance.studentFees.title(),
                href: '/accounting/student-fees',
                icon: IconUsers,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.finance.refunds.title(),
                href: '/accounting/refunds',
                icon: IconReceipt,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.nav.paymentPlans(),
                href: '/accounting/payment-plans',
                icon: IconFileText,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.finance.paymentPlanTemplates.title(),
                href: '/accounting/payment-plan-templates',
                icon: IconFileText,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.finance.feeTypes.title(),
                href: '/accounting/fee-types',
                icon: IconReceipt,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.finance.feeStructures.title(),
                href: '/accounting/fee-structures',
                icon: IconLayoutGrid,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.finance.discounts.title(),
                href: '/accounting/discounts',
                icon: IconCreditCard,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.finance.accounts.title(),
                href: '/accounting/accounts',
                icon: IconBuilding,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.finance.fiscalYears.title(),
                href: '/accounting/fiscal-years',
                icon: IconCalendar,
                permission: { resource: 'finance', action: 'view' },
              },
              {
                title: t.finance.wizard.title(),
                href: '/accounting/setup',
                icon: IconSettings,
                permission: { resource: 'finance', action: 'edit' },
              },
            ],
          },
        ],
      },
      // 6. COMMUNAUTÉ — people & records
      {
        title: t.sidebar.community(),
        items: [
          {
            title: t.nav.students(),
            href: '/students',
            icon: IconSchool,
            permission: { resource: 'students', action: 'view' },
            children: [
              {
                title: t.nav.studentsList(),
                href: '/students',
                icon: IconSchool,
                permission: { resource: 'students', action: 'view' },
              },
              {
                title: t.nav.parents(),
                href: '/students/parents',
                icon: IconUsers,
                permission: { resource: 'parents', action: 'view' },
              },
              {
                title: t.nav.enrollments(),
                href: '/students/enrollments',
                icon: IconClipboardCheck,
                permission: { resource: 'enrollments', action: 'view' },
              },
              {
                title: t.students.bulkOperations.title(),
                href: '/students/bulk-operations',
                icon: IconFileText,
                permission: { resource: 'students', action: 'create' },
              },
            ],
          },
          {
            title: t.nav.users(),
            href: '/users',
            icon: IconUsers,
            permission: { resource: 'users', action: 'view' },
            children: [
              {
                title: t.nav.staff(),
                href: '/users/staff',
                icon: IconUserCheck,
                permission: { resource: 'staff', action: 'view' },
              },
              {
                title: t.nav.teachers(),
                href: '/users/teachers',
                icon: IconBook,
                permission: { resource: 'teachers', action: 'view' },
              },
              {
                title: t.nav.allUsers(),
                href: '/users/users',
                icon: IconUsersGroup,
                permission: { resource: 'users', action: 'view' },
              },
              {
                title: t.nav.importUsers(),
                href: '/users/users/import',
                icon: IconUpload,
                permission: { resource: 'users', action: 'create' },
              },
              {
                title: t.nav.roles(),
                href: '/users/roles',
                icon: IconShieldCheck,
                permission: { resource: 'roles', action: 'view' },
              },
            ],
          },
        ],
      },
      // 7. CONFIGURATION — enriched with missing settings
      {
        title: t.sidebar.configuration(),
        items: [
          {
            title: t.nav.settings(),
            href: '/settings',
            icon: IconSettings,
            permission: { resource: 'settings', action: 'view' },
            children: [
              {
                title: t.sidebar.schoolName(),
                href: '/settings/profile',
                icon: IconBuilding,
              },
              {
                title: t.nav.schoolYears(),
                href: '/settings/school-years',
                icon: IconCalendar,
              },
              {
                title: t.settings.pedagogicalStructure.title(),
                href: '/settings/pedagogical-structure',
                icon: IconLayoutGrid,
                permission: { resource: 'settings', action: 'edit' },
              },
              {
                title: t.common.notifications(),
                href: '/settings/notifications',
                icon: IconAlertTriangle,
                permission: { resource: 'settings', action: 'view' },
              },
            ],
          },
        ],
      },
    ]

    return rawSections.map(section => ({
      ...section,
      items: section.items.filter((item) => {
        // Check item permission
        if (item.permission && !can(item.permission.resource, item.permission.action)) {
          return false
        }

        // Check children permissions
        if (item.children) {
          const filteredChildren = item.children.filter(child =>
            !child.permission || can(child.permission.resource, child.permission.action),
          )
          // If item has children but all are filtered out, hide the item
          // UNLESS the item itself has a specific href that is accessible
          item.children = filteredChildren
        }
        return true
      }),
    })).filter(section => section.items.length > 0)
  }, [can, t])

  // Flatten items for state management logic
  const navigationItems = sections.flatMap(s => s.items)

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
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40 bg-white/70 backdrop-blur-2xl dark:bg-black/70 transition-all duration-300"
      {...props}
    >
      <SidebarHeader className="border-b border-border/10 p-5">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
            <IconSchool className="size-6" />
          </div>
          <div className="grid flex-1 text-left">
            <span className="truncate text-base font-bold leading-none">
              {t.sidebar.schoolName()}
            </span>
            <span className="truncate text-xs font-medium text-muted-foreground">
              {t.sidebar.schoolSubtitle()}
            </span>
          </div>
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="px-2 scrollbar-none overflow-x-hidden">
        {shortcuts.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 px-4 mb-2 mt-2">
              <IconPin className="mr-1 inline size-3" />
              {t.sidebar.shortcuts()}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {shortcuts.map(item => (
                  <SidebarMenuItem key={`shortcut-${item.href}`}>
                    <SidebarMenuButton
                      onClick={() => navigate({ to: item.href })}
                      isActive={pathname === item.href || pathname.startsWith(item.href)}
                      tooltip={item.title}
                      className={`transition-all duration-200 ${pathname === item.href || pathname.startsWith(item.href) ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-sidebar-accent/50 hover:pl-4'}`}
                    >
                      <item.icon
                        className={`size-4 transition-transform duration-300 group-hover:scale-110 ${pathname === item.href || pathname.startsWith(item.href) ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`}
                      />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            <SidebarSeparator className="mx-4 my-1" />
          </SidebarGroup>
        )}
        {sections.map(section => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 px-4 mb-2 mt-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(item => (
                  <SidebarMenuItem key={item.href}>
                    {item.children
                      ? (
                          <SidebarMenuSubItemWrapper
                            item={item}
                            pathname={pathname}
                            isOpen={openItem === item.title}
                            onToggle={() =>
                              setOpenItem(
                                openItem === item.title ? null : item.title,
                              )}
                          />
                        )
                      : (
                          <SidebarMenuButton
                            onClick={() => navigate({ to: item.href })}
                            isActive={pathname === item.href}
                            tooltip={item.title}
                            className={`transition-all duration-200 ${pathname === item.href ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-sidebar-accent/50 hover:pl-4'}`}
                          >
                            <item.icon
                              className={`size-4 transition-transform duration-300 group-hover:scale-110 ${pathname === item.href ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`}
                            />
                            <span className="font-medium">{item.title}</span>
                            {pathname === item.href && (
                              <motion.div
                                layoutId="active-nav-indicator"
                                className="absolute left-0 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-l-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                              />
                            )}
                          </SidebarMenuButton>
                        )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
  const navigate = useNavigate()
  const hasActiveChild = item.children?.some(child =>
    pathname.startsWith(child.href),
  )

  return (
    <div className="flex flex-col gap-1">
      <SidebarMenuButton
        tooltip={item.title}
        onClick={onToggle}
        isActive={hasActiveChild} // Keep active style if child is active
        className={`group/collapsable w-full justify-between transition-all duration-200 ${
          hasActiveChild
            ? 'bg-primary/5 text-primary'
            : 'hover:bg-sidebar-accent/50'
        }`}
      >
        <div className="flex items-center gap-2">
          <item.icon className="size-4" />
          <span className="font-medium">{item.title}</span>
        </div>
        <IconChevronDown
          className={cn(
            'ml-auto size-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            isOpen
              ? 'rotate-180 scale-110 text-primary'
              : 'rotate-0 scale-100 text-muted-foreground',
          )}
        />
      </SidebarMenuButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <SidebarMenuSub className="ml-4 border-l border-border/10 space-y-0.5 mt-1">
              {item.children?.map(child => (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton
                    onClick={() => navigate({ to: child.href })}
                    isActive={pathname === child.href}
                    className={cn(
                      'transition-all duration-200 rounded-lg',
                      pathname === child.href
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:bg-primary/5 hover:text-primary',
                    )}
                  >
                    <child.icon
                      className={cn(
                        'size-3.5',
                        pathname === child.href && 'text-primary',
                      )}
                    />
                    <span>{child.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
