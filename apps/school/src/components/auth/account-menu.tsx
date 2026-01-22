import { IconLanguage, IconLogout, IconPalette, IconSettings, IconUser } from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { toast } from 'sonner'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { useTranslations } from '@/i18n'
import { authClient, signOutWithCache } from '@/lib/auth-client'

export function AccountMenu() {
  const session = authClient.useSession()
  const t = useTranslations()

  const handleSignOut = async () => {
    try {
      await signOutWithCache()
      toast.success(t.auth.signOutSuccess())
    }
    catch (error) {
      toast.error(t.auth.signOutError())
      console.error('Sign out error:', error)
    }
  }

  if (!session.data)
    return null

  const user = session.data.user
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <IconUser className="mr-2 h-4 w-4" />
            <span>{t.account.profile()}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconSettings className="mr-2 h-4 w-4" />
            <span>{t.account.settings()}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Theme Toggle */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between py-2 px-2 rounded-lg border bg-card pointer-events-none">
            <span className="text-sm font-medium flex items-center gap-2">
              <IconPalette className="h-4 w-4" />
              {t.account.theme()}
            </span>
            <div className="pointer-events-auto">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="px-2 pb-2">
          <div className="flex items-center justify-between py-2 px-2 rounded-lg border bg-card pointer-events-none">
            <span className="text-sm font-medium flex items-center gap-2">
              <IconLanguage className="h-4 w-4" />
              {t.account.language()}
            </span>
            <div className="pointer-events-auto">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <IconLogout className="mr-2 h-4 w-4" />
          <span>{t.auth.signOut()}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
