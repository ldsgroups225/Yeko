import { IconBell, IconMenu, IconSearch, IconSettings } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { SidebarTrigger } from '@workspace/ui/components/sidebar'
import { useState } from 'react'
import { AccountDialog } from '@/components/auth/account-dialog'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Breadcrumbs } from './breadcrumbs'

interface HeaderProps {
  className?: string
  onMobileMenuToggle?: () => void
}

export function Header({ className, onMobileMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: session } = authClient.useSession()

  const user = session?.user
  const fallbackText = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'A'

  return (
    <header
      className={cn(
        'flex flex-col border-b border-border bg-background',
        className,
      )}
    >
      {/* Top bar with search and user menu */}
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center gap-4">
          {/* Desktop sidebar trigger */}
          <SidebarTrigger className="hidden lg:flex" />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileMenuToggle}
          >
            <IconMenu className="h-5 w-5" />
          </Button>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher des écoles, programmes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <IconBell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive"></span>
          </Button>

          <Button variant="ghost" size="icon">
            <IconSettings className="h-5 w-5" />
          </Button>

          <AccountDialog>
            <Button variant="ghost" className="flex items-center gap-2 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || undefined} alt={user?.name || 'Administrateur'} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {fallbackText}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium">{user?.name || 'Utilisateur Admin'}</span>
                <span className="text-xs text-muted-foreground">Super Administrateur</span>
              </div>
            </Button>
          </AccountDialog>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-6 py-2 border-t border-border/50">
        <Breadcrumbs />
      </div>
    </header>
  )
}
