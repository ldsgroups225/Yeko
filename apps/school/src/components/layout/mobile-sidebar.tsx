import { Link } from '@tanstack/react-router';
import { X } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  DollarSign,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Utilisateurs',
    href: '/app/hr/users',
    icon: Users,
  },
  {
    title: 'Enseignants',
    href: '/app/hr/teachers',
    icon: GraduationCap,
  },
  {
    title: 'Élèves',
    href: '/app/students',
    icon: GraduationCap,
  },
  {
    title: 'Classes',
    href: '/app/academic/classes',
    icon: BookOpen,
  },
  {
    title: 'Notes',
    href: '/app/academic/grades',
    icon: ClipboardCheck,
  },
  {
    title: 'Finance',
    href: '/app/finance',
    icon: DollarSign,
  },
  {
    title: 'Paramètres',
    href: '/app/settings',
    icon: Settings,
  },
];

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/40 bg-background lg:hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-border/40 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">Y</span>
              </div>
              <span className="font-semibold">Yeko School</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid gap-1 px-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
