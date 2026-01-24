import {
  IconAlertTriangle,
  IconBook,
  IconBuilding,
  IconCalendar,
  IconChartBar,
  IconChevronDown,
  IconClipboardCheck,
  IconCreditCard,
  IconCurrencyDollar,
  IconFileSearch,
  IconFileText,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconReportAnalytics,
  IconSchool,
  IconSettings,
  IconShieldCheck,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
  IconHome,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
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
} from "@workspace/ui/components/sidebar";
import { motion } from "motion/react";
import * as React from "react";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });

  /*
     UX 2.0: Consolidated Hubs Navigation
     Reflecting the "Mission-Based Success" model.
  */
  const sections = [
    // 1. PILOTAGE
    {
      title: t.sidebar.pilotage(),
      items: [
        {
          title: t.nav.dashboard(),
          href: "/dashboard",
          icon: IconLayoutDashboard,
        },
      ],
    },
    // 2. COMMUNAUTÉ (People & Structure)
    {
      title: t.sidebar.community(),
      items: [
        {
          title: t.nav.students(),
          href: "/students",
          icon: IconSchool,
          children: [
            {
              title: t.nav.studentsList(),
              href: "/students",
              icon: IconSchool,
            },
            {
              title: t.nav.parents(),
              href: "/students/parents",
              icon: IconUsers,
            },
            {
              title: t.nav.enrollments(),
              href: "/students/enrollments",
              icon: IconClipboardCheck,
            },
            {
              title: t.students.bulkOperations.title(),
              href: "/students/bulk-operations",
              icon: IconFileText,
            },
          ],
        },
        {
          title: t.nav.users(),
          href: "/users",
          icon: IconUsers,
          children: [
            { title: t.nav.staff(), href: "/users/staff", icon: IconUserCheck },
            {
              title: t.nav.teachers(),
              href: "/users/teachers",
              icon: IconBook,
            },
            {
              title: t.nav.roles(),
              href: "/users/roles",
              icon: IconShieldCheck,
            },
          ],
        },
      ],
    },
    // 3. PÉDAGOGIE (Academic)
    {
      title: t.sidebar.pedagogy(),
      items: [
        {
          title: t.nav.classes(),
          href: "/classes",
          icon: IconLayoutGrid,
          children: [
            { title: t.nav.classes(), href: "/classes", icon: IconLayoutGrid },
            {
              title: t.nav.assignments(),
              href: "/classes/assignments",
              icon: IconFileText,
            },
          ],
        },
        {
          title: t.nav.subjects(),
          href: "/programs/subjects",
          icon: IconBook,
        },
        {
          title: t.nav.timetables(),
          href: "/schedules",
          icon: IconCalendar,
        },
        {
          title: t.nav.schoolLife(),
          href: "/conducts",
          icon: IconUsersGroup,
          children: [
            {
              title: t.nav.attendance(),
              href: "/conducts/student-attendance",
              icon: IconUserCheck,
            },
            {
              title: t.nav.conduct(),
              href: "/conducts/conduct",
              icon: IconAlertTriangle,
            },
          ],
        },
        {
          title: t.nav.spaces(),
          href: "/spaces",
          icon: IconHome,
          children: [
            {
              title: t.nav.classrooms(),
              href: "/spaces/classrooms",
              icon: IconBuilding,
            },
            {
              title: t.spaces.availability.title(),
              href: "/spaces/availability",
              icon: IconCalendarEvent,
            },
          ],
        },
      ],
    },
    // 4. EXAMENS
    {
      title: t.sidebar.exams(),
      items: [
        {
          title: t.nav.grades(),
          href: "/grades",
          icon: IconClipboardCheck,
          children: [
            {
              title: t.nav.grades(),
              href: "/grades/entry",
              icon: IconFileText,
            },
            { title: t.common.view(), href: "/grades", icon: IconFileSearch },
            {
              title: t.grades.validations.title(),
              href: "/grades/validations",
              icon: IconClipboardCheck,
            },
          ],
        },
        {
          title: t.nav.reportCards(),
          href: "/grades/report-cards",
          icon: IconReportAnalytics,
        },
        {
          title: t.grades.statistics.title(),
          href: "/grades/statistics",
          icon: IconChartBar,
        },
      ],
    },
    // 5. TRÉSORERIE
    {
      title: t.sidebar.treasury(),
      items: [
        {
          title: t.nav.accounting(),
          href: "/accounting",
          icon: IconCurrencyDollar,
          children: [
            {
              title: t.nav.dashboard(),
              href: "/accounting/dashboard",
              icon: IconLayoutDashboard,
            },
            {
              title: t.nav.payments(),
              href: "/accounting/payments",
              icon: IconCreditCard,
            },
            {
              title: t.finance.feeStructures.title(),
              href: "/accounting/fee-structures",
              icon: IconLayoutGrid,
            },
            {
              title: t.finance.studentFees.title(),
              href: "/accounting/student-fees",
              icon: IconUsers,
            },
          ],
        },
      ],
    },
    // 6. CONFIGURATION
    {
      title: t.sidebar.configuration(),
      items: [
        {
          title: t.nav.settings(),
          href: "/settings",
          icon: IconSettings,
          children: [
            {
              title: t.sidebar.schoolName(),
              href: "/settings/profile",
              icon: IconBuilding,
            },
            {
              title: t.nav.schoolYears(),
              href: "/settings/school-years",
              icon: IconCalendar,
            },
          ],
        },
      ],
    },
  ];

  // Flatten items for state management logic
  const navigationItems = sections.flatMap((s) => s.items);

  const [openItem, setOpenItem] = React.useState<string | null>(() => {
    const activeItem = navigationItems.find((item) =>
      item.children?.some((child) => pathname.startsWith(child.href)),
    );
    return activeItem?.title ?? null;
  });

  // Sync state if pathname changes to a new active group
  const lastPathnameRef = React.useRef(pathname);
  if (lastPathnameRef.current !== pathname) {
    lastPathnameRef.current = pathname;
    const activeItem = navigationItems.find((item) =>
      item.children?.some((child) => pathname.startsWith(child.href)),
    );
    if (activeItem && openItem !== activeItem.title) {
      setOpenItem(activeItem.title);
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
        {sections.map((section, idx) => (
          <SidebarGroup key={section.title + idx}>
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 px-4 mb-2 mt-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    {item.children ? (
                      <SidebarMenuSubItemWrapper
                        item={item}
                        pathname={pathname}
                        isOpen={openItem === item.title}
                        onToggle={() =>
                          setOpenItem(
                            openItem === item.title ? null : item.title,
                          )
                        }
                      />
                    ) : (
                      <SidebarMenuButton
                        onClick={() => navigate({ to: item.href })}
                        isActive={pathname === item.href}
                        tooltip={item.title}
                        className={`transition-all duration-200 ${pathname === item.href ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-sidebar-accent/50 hover:pl-4"}`}
                      >
                        <item.icon
                          className={`size-4 transition-transform duration-300 group-hover:scale-110 ${pathname === item.href ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"}`}
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
  );
}

function SidebarMenuSubItemWrapper({
  item,
  pathname,
  isOpen,
  onToggle,
}: {
  item: NavItem;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  const hasActiveChild = item.children?.some((child) =>
    pathname.startsWith(child.href),
  );

  return (
    <div className="flex flex-col gap-1">
      <SidebarMenuButton
        tooltip={item.title}
        onClick={onToggle}
        isActive={hasActiveChild} // Keep active style if child is active
        className={`group/collapsable w-full justify-between transition-all duration-200 ${
          hasActiveChild
            ? "bg-primary/5 text-primary"
            : "hover:bg-sidebar-accent/50"
        }`}
      >
        <div className="flex items-center gap-2">
          <item.icon className="size-4" />
          <span className="font-medium">{item.title}</span>
        </div>
        <IconChevronDown
          className={cn(
            "ml-auto size-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            isOpen
              ? "rotate-180 scale-110 text-primary"
              : "rotate-0 scale-100 text-muted-foreground",
          )}
        />
      </SidebarMenuButton>

      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isOpen
            ? "h-auto opacity-100 mt-1 scale-100 origin-top"
            : "h-0 opacity-0 mt-0 scale-95 origin-top",
        )}
      >
        <SidebarMenuSub>
          {item.children?.map((child, index) => (
            <SidebarMenuSubItem
              key={child.href}
              className={cn(
                "transition-all duration-500",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-4 opacity-0",
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
              }}
            >
              <SidebarMenuSubButton
                onClick={() => navigate({ to: child.href })}
                isActive={pathname === child.href}
                className={`transition-all duration-200 ${
                  pathname === child.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:pl-4 hover:text-foreground"
                }`}
              >
                <child.icon
                  className={cn(
                    "size-3.5 transition-transform duration-300 group-hover:scale-110",
                    pathname === child.href && "scale-110",
                  )}
                />
                <span>{child.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </div>
    </div>
  );
}
