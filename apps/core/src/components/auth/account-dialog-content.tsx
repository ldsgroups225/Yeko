import { IconLanguage, IconLogout, IconPalette } from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { authClient } from '@/lib/auth-client'

export default function AccountDialogContent() {
  const { data: session } = authClient.useSession()

  const signOut = async () => {
    await authClient.signOut()
  }

  if (!session)
    return null

  const user = session.user
  const fallbackText = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader className="pb-4 text-center">
        <DialogTitle>Account</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center space-y-6 py-6">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={user.image || undefined}
            alt={user.name || 'User'}
          />
          <AvatarFallback className="text-2xl font-semibold">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 text-center">
          {user.name && (
            <div className="text-lg font-semibold">{user.name}</div>
          )}
          {user.email && (
            <div className="text-muted-foreground text-sm">{user.email}</div>
          )}
        </div>
        <div className="mt-6 flex w-full flex-col gap-4">
          <div className="
            bg-card flex w-full items-center justify-between rounded-lg border
            px-4 py-3
          "
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <IconPalette className="h-4 w-4" />
              Theme
            </span>
            <ThemeToggle />
          </div>
          <div className="
            bg-card flex w-full items-center justify-between rounded-lg border
            px-4 py-3
          "
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <IconLanguage className="h-4 w-4" />
              Language
            </span>
            <LanguageSwitcher />
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            size="lg"
            className="w-full gap-2"
          >
            <IconLogout className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
