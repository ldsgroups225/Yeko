import {
  IconBook,
  IconBuilding,
  IconCalendar,
  IconClipboardCheck,
  IconCurrencyDollar,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconSchool,
  IconSettings,
  IconUserCheck,
  IconUsers,
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

  const sections = React.useMemo(() => {
    const rawSections = [
      {
        title: 'Essentiel',
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
            icon: IconSchool,
            permission: { resource: 'students', action: 'view' },
          },
          {
            title: t.nav.classes(),
            href: '/classes',
            icon: IconLayoutGrid,
            permission: { resource: 'classes', action: 'view' },
          },
          {
            title: 'Personnel',
            href: '/users',
            icon: IconUsers,
            permission: { resource: 'users', action: 'view' },
          },
        ],
      },
      {
        title: 'Opérations',
        items: [
          {
            title: 'Emploi du temps',
            href: '/schedules',
            icon: IconCalendar,
            permission: { resource: 'timetables', action: 'view' },
          },
          {
            title: 'Assiduité & Conduite',
            href: '/conducts',
            icon: IconUserCheck,
            permission: { resource: 'attendance', action: 'view' },
          },
          {
            title: 'Notes et moyennes',
            href: '/grades',
            icon: IconClipboardCheck,
            permission: { resource: 'grades', action: 'view' },
          },
          {
            title: 'Comptabilité',
            href: '/accounting',
            icon: IconCurrencyDollar,
            permission: { resource: 'finance', action: 'view' },
          },
        ],
      },
      {
        title: 'Système',
        items: [
          {
            title: 'Programmes',
            href: '/programs/subjects',
            icon: IconBook,
            permission: { resource: 'school_subjects', action: 'view' },
          },
          {
            title: 'Espaces',
            href: '/spaces',
            icon: IconBuilding,
            permission: { resource: 'classrooms', action: 'view' },
          },
          {
            title: 'Configurations',
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
      className="border-r border-border/40 bg-white/70 backdrop-blur-2xl dark:bg-card/70 transition-all duration-300"
      {...props}
    >
      <SidebarHeader className="p-6 border-b border-border/5">
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="relative group shrink-0">
            <img
              src="/icon.png"
              alt="Yeko logo"
              className="size-12 rounded-lg object-contain shadow-lg shadow-primary/20 ring-1 ring-border/10 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="truncate text-lg font-black tracking-tight text-foreground/90 font-outfit uppercase">
              {t.sidebar.schoolName()}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 size-1.5 rounded-full bg-primary animate-pulse" />
              <span className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                {t.sidebar.schoolSubtitle()}
              </span>
            </div>
          </div>
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="px-2 scrollbar-none overflow-x-hidden">
        {sections.map(section => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 px-4 mb-2 mt-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        onClick={() => navigate({ to: item.href })}
                        isActive={isActive}
                        tooltip={item.title}
                        className={`transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-sidebar-accent/50 hover:pl-4'}`}
                      >
                        <item.icon
                          className={`size-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`}
                        />
                        <span className="font-medium">{item.title}</span>
                        {isActive && (
                          <motion.div
                            layoutId="active-nav-indicator"
                            className="absolute left-0 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-l-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]"
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
