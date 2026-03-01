import {
  IconBook,
  IconBuilding,
  IconCalendar,
  IconClipboardCheck,
  IconCurrencyDollar,
  IconLayoutDashboard,
  IconSettings,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
  IconUserScreen,
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
  SidebarRail,
  useSidebar,
} from '@workspace/ui/components/sidebar'
import { motion } from 'motion/react'
import * as React from 'react'

import { useAuthorization } from '@/hooks/use-authorization'
import { useTranslations } from '@/i18n'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations()
  const navigate = useNavigate()
  const pathname = useLocation({ select: location => location.pathname })
  const { can } = useAuthorization()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const sections = React.useMemo(() => {
    const rawSections = [
      {
        title: t.sidebar.essential(),
        items: [
          {
            title: t.nav.dashboard(),
            href: '/dashboard',
            icon: IconLayoutDashboard,
            permission: { resource: 'dashboard', action: 'view' },
          },
          {
            title: t.nav.students(),
            href: '/students',
            icon: IconUsers,
            permission: { resource: 'students', action: 'view' },
          },
          {
            title: t.nav.classes(),
            href: '/classes',
            icon: IconUserScreen,
            permission: { resource: 'classes', action: 'view' },
          },
          {
            title: t.nav.teachers(),
            href: '/teachers',
            icon: IconUserCheck,
            permission: { resource: 'teachers', action: 'view' },
          },
        ],
      },
      {
        title: t.sidebar.operations(),
        items: [
          {
            title: t.nav.timetables(),
            href: '/schedules',
            icon: IconCalendar,
            permission: { resource: 'timetables', action: 'view' },
          },
          {
            title: t.sidebar.attendanceAndConduct(),
            href: '/conducts',
            icon: IconUserCheck,
            permission: { resource: 'attendance', action: 'view' },
          },
          {
            title: t.sidebar.gradesAndAverages(),
            href: '/grades',
            icon: IconClipboardCheck,
            permission: { resource: 'grades', action: 'view' },
          },
          {
            title: t.nav.accounting(),
            href: '/accounting',
            icon: IconCurrencyDollar,
            permission: { resource: 'finance', action: 'view' },
          },
        ],
      },
      {
        title: t.sidebar.system(),
        items: [
          {
            title: t.nav.approbations(),
            href: '/approbations',
            icon: IconUserPlus,
            permission: { resource: 'students', action: 'view' },
          },
          {
            title: t.nav.programs(),
            href: '/programs/curriculum-progress',
            icon: IconBook,
            permission: { resource: 'school_subjects', action: 'view' },
          },
          {
            title: t.nav.spaces(),
            href: '/spaces',
            icon: IconBuilding,
            permission: { resource: 'classrooms', action: 'view' },
          },
          {
            title: t.sidebar.configurations(),
            href: '/settings',
            icon: IconSettings,
            permission: { resource: 'settings', action: 'view' },
          },
        ],
      },
    ]

    return rawSections.map(section => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.permission && !can(item.permission.resource, item.permission.action)) {
          return false
        }
        return true
      }),
    })).filter(section => section.items.length > 0)
  }, [can, t])

  return (
    <Sidebar
      collapsible="icon"
      className="
        border-border/40
        dark:bg-card/70
        border-r bg-white/70 backdrop-blur-2xl transition-all duration-300
      "
      {...props}
    >
      <SidebarHeader className={`
        border-border/5 border-b transition-all duration-200
        ${isCollapsed
      ? `flex items-center justify-center p-2`
      : `p-6`}
      `}
      >
        <motion.div
          className={`
            flex items-center transition-all duration-200
            ${isCollapsed
      ? `justify-center`
      : `gap-4`}
          `}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="group relative shrink-0">
            <img
              src="/icon.png"
              alt="Yeko logo"
              className={`
                shadow-primary/20 ring-border/10 rounded-lg object-contain
                shadow-lg ring-1 transition-all duration-200
                group-hover:scale-110
                ${isCollapsed
      ? `size-8`
      : `size-12`}
              `}
            />
            <div className="
              bg-primary/5 absolute inset-0 rounded-lg opacity-0
              transition-opacity
              group-hover:opacity-100
            "
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <span className="
                text-foreground/90 font-outfit truncate text-lg font-black
                tracking-tight uppercase
              "
              >
                {t.sidebar.schoolName()}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="
                  bg-primary size-1.5 shrink-0 animate-pulse rounded-full
                "
                />
                <span className="
                  text-muted-foreground/60 truncate text-[10px] font-bold
                  tracking-[0.2em] uppercase
                "
                >
                  {t.sidebar.schoolSubtitle()}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </SidebarHeader>
      <SidebarContent className={`
        scrollbar-none overflow-x-hidden
        ${isCollapsed
      ? ''
      : `px-2`}
      `}
      >
        {sections.map(section => (
          <SidebarGroup key={section.title} className={isCollapsed ? 'px-1' : undefined}>
            <SidebarGroupLabel className="
              text-muted-foreground/70 mt-2 mb-2 px-4 text-xs font-bold
              tracking-wider uppercase
            "
            >
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const rootPath = `/${item.href.split('/')[1]}`
                  const isActive = pathname === rootPath || pathname.startsWith(`${rootPath}/`)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        onClick={() => navigate({ to: item.href })}
                        isActive={isActive}
                        tooltip={item.title}
                        className={`
                          transition-all duration-200
                          ${isActive
                      ? `bg-primary/10 text-primary shadow-sm`
                      : `
                        hover:bg-sidebar-accent/50
                        ${isCollapsed
                      ? ''
                      : `hover:pl-4`}
                      `}
                        `}
                      >
                        <item.icon
                          className={`
                            size-4 shrink-0 transition-transform duration-300
                            group-hover:scale-110
                            ${isActive
                      ? `text-primary scale-110`
                      : `
                        text-muted-foreground
                        group-hover:text-foreground
                      `}
                          `}
                        />
                        <span className="font-medium">{item.title}</span>
                        {(isActive && !isCollapsed) && (
                          <motion.div
                            layoutId="active-nav-indicator"
                            className="
                              bg-primary absolute top-1/2 left-0 h-7 w-1.5
                              -translate-y-1/2 rounded-l-full
                              shadow-[0_0_12px_rgba(59,130,246,0.6)]
                            "
                          />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
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
