import {
  IconBrandGithub,
  IconExternalLink,
  IconLogin,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { useI18nContext } from '@/i18n/i18n-react'
import { authClient } from '@/lib/auth-client'

interface NavigationItem {
  label: string
  href: string
  isExternal?: boolean
  scrollTo?: string
}

interface MobileMenuContentProps {
  navigationItems: NavigationItem[]
  setIsOpen: (isOpen: boolean) => void
}

export default function MobileMenuContent({ navigationItems, setIsOpen }: MobileMenuContentProps) {
  const { LL } = useI18nContext()
  const { data: session } = authClient.useSession()
  const user = session?.user

  const fallbackText = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U'

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/app',
    })
  }

  const handleNavClick = (item: NavigationItem) => {
    if (item.scrollTo) {
      const element = document.getElementById(item.scrollTo)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsOpen(false)
  }

  return (
    <SheetContent
      side="right"
      className="w-[300px] bg-background/95 backdrop-blur-xl border-l border-border/50"
    >
      <SheetHeader className="text-left space-y-1 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <img
            src="/icon.png"
            alt={LL.nav.logoAlt()}
            className="h-10 w-10 object-contain"
          />
          <SheetTitle className="text-xl font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {LL.nav.menuTitle()}
          </SheetTitle>
        </div>
        <SheetDescription className="text-muted-foreground">
          {LL.nav.menuDescription()}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col space-y-2 pb-6">
        {navigationItems.map(item => (
          <div key={item.label} className="relative group">
            {item.isExternal
              ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-accent/50"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.label === 'GitHub'
                      ? (
                          <IconBrandGithub className="h-4 w-4" />
                        )
                      : (
                          <IconExternalLink className="h-4 w-4" />
                        )}
                  </a>
                )
              : (
                  <Link
                    to={item.href}
                    onClick={() => handleNavClick(item)}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-accent/50 text-left"
                  >
                    {item.label}
                  </Link>
                )}
          </div>
        ))}
      </div>

      {/* Mobile Actions */}
      <div className="pt-4 border-t border-border/50">
        {session
          ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/30">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || LL.nav.userLabel()}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {fallbackText}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {user?.name || LL.nav.userLabel()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
            )
          : (
              <div className="space-y-2">
                <Link
                  to="/demo-request"
                  className={buttonVariants({ variant: 'outline', className: 'w-full' })}
                >
                  {LL.nav.requestDemo()}
                </Link>
                <Button
                  onClick={handleGoogleSignIn}
                  variant="default"
                  className="w-full gap-2"
                >
                  <IconLogin className="h-4 w-4" />
                  {LL.nav.signInWithGoogle()}
                </Button>
              </div>
            )}
      </div>
    </SheetContent>
  )
}
