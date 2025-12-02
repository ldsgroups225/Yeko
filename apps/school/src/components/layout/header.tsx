import { Bell, Menu } from 'lucide-react'
import { SchoolSwitcher } from '@/components/school/school-switcher'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { AccountMenu } from '@/components/auth/account-menu'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'lg:hidden',
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">Y</span>
          </div>
          <span className="hidden font-semibold sm:inline-block">Yeko School</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* School Switcher */}
        <SchoolSwitcher />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <button
          type="button"
          className={cn(
            'relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          {/* Notification badge */}
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
        </button>

        {/* User menu */}
        <AccountMenu />
      </div>
    </header>
  );
}
