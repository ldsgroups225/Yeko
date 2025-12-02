import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    ],
  },
  {
    title: 'Académique',
    href: '/app/academic',
    icon: BookOpen,
    children: [
      { title: 'Classes', href: '/app/academic/classes', icon: BookOpen },
      { title: 'Matières', href: '/app/academic/subjects', icon: BookOpen },
      { title: 'Notes', href: '/app/academic/grades', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Finance',
    href: '/app/finance',
    icon: DollarSign,
    children: [
      { title: 'Comptabilité', href: '/app/finance/accounting', icon: DollarSign },
      { title: 'Paiements', href: '/app/finance/payments', icon: DollarSign },
    ],
  },
  {
    title: 'Paramètres',
    href: '/app/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-border/40 bg-background lg:block">
      <div className="flex h-full flex-col gap-2">
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {navigationItems.map(item => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}

function NavItemComponent({ item }: { item: NavItem }) {
  const Icon = item.icon

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="flex-1 text-left">{item.title}</span>
          <ChevronRight className="h-4 w-4 opacity-50" />
        </button>
        <div className="ml-4 space-y-1 border-l border-border/40 pl-4">
          {item.children.map(child => (
            <Link
              key={child.href}
              to={child.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <child.icon className="h-4 w-4" />
              <span>{child.title}</span>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Link
      to={item.href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.title}</span>
    </Link>
  )
}
