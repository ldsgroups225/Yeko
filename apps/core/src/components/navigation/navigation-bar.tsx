import {
  IconBrandGithub,
  IconExternalLink,
  IconLogin,
  IconMenu,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  Sheet,
  SheetTrigger,
} from '@workspace/ui/components/sheet'
import { domAnimation, LazyMotion, m } from 'motion/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { AccountDialog } from '@/components/auth/account-dialog'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme'
import { useI18nContext } from '@/i18n/i18n-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const MobileMenuContent = lazy(() => import('./mobile-menu-content'))

interface NavigationItem {
  label: string
  href: string
  isExternal?: boolean
  scrollTo?: string
}

export function NavigationBar() {
  const { LL } = useI18nContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session } = authClient.useSession()

  const navigationItems: NavigationItem[] = [
    { label: LL.nav.solutions(), href: '/#solutions', scrollTo: 'solutions' },
    { label: LL.nav.benefits.title(), href: '/#benefits', scrollTo: 'benefits' },
    { label: LL.nav.pricing.title(), href: '/#pricing', scrollTo: 'pricing' },
    { label: LL.footerNav.product.about(), href: '/about', isExternal: false },
  ]

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

  const user = session?.user
  const fallbackText = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      <m.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 right-0 left-0 z-50 transition-all duration-500 ease-out',
          isScrolled
            ? `
              bg-background/80 border-border/50 shadow-primary/5 border-b
              shadow-lg backdrop-blur-xl
            `
            : 'bg-transparent',
        )}
      >
        <div className="
          container mx-auto px-4
          sm:px-6
          lg:px-8
        "
        >
          <div className="
            flex h-16 items-center justify-between
            lg:h-20
          "
          >
            {/* Logo and Brand */}
            <Link
              to="/"
              className="group flex items-center space-x-3 no-underline"
            >
              <m.img
                src="/icon.png"
                alt={LL.nav.logoAlt()}
                className="
                  h-10 w-10 object-contain
                  lg:h-12 lg:w-12
                "
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              />
              <div className="flex flex-col">
                <span className="
                  from-foreground to-foreground/80
                  group-hover:from-primary group-hover:to-primary/80
                  bg-linear-to-r bg-clip-text text-lg font-bold text-transparent
                  transition-all duration-300
                  lg:text-xl
                "
                >
                  {LL.nav.brandName()}
                </span>
                <span className="
                  text-muted-foreground text-xs font-medium tracking-wider
                "
                >
                  {LL.nav.tagline()}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <m.div
              className="
                hidden items-center space-x-1
                lg:flex
              "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, staggerChildren: 0.1 }}
            >
              {navigationItems.map((item, index) => (
                <m.div
                  key={item.label}
                  className="group relative"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  {item.isExternal
                    ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            text-muted-foreground
                            hover:text-foreground hover:bg-accent/50
                            group flex items-center space-x-2 rounded-lg px-4
                            py-2 text-sm font-medium transition-all duration-300
                          "
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
                          className="
                            text-muted-foreground
                            hover:text-foreground hover:bg-accent/50
                            block rounded-lg px-4 py-2 text-sm font-medium
                            transition-all duration-300
                          "
                        >
                          {item.label}
                        </Link>
                      )}
                  <m.div
                    className="
                      from-primary to-primary/80 absolute bottom-0 left-1/2
                      h-0.5 -translate-x-1/2 transform bg-linear-to-r
                    "
                    initial={{ width: 0 }}
                    whileHover={{ width: '75%' }}
                    transition={{ duration: 0.3 }}
                  />
                </m.div>
              ))}

              {/* Theme Toggle & Language Switcher */}
              <div className="
                border-border/30 ml-2 flex items-center gap-1 border-l pl-2
              "
              >
                <LanguageSwitcher />
                <ThemeToggle variant="ghost" align="end" />
              </div>
            </m.div>

            {/* Action Buttons - Desktop */}
            <div className="
              hidden
              lg:block
            "
            >
              {session
                ? (
                    <div className="flex flex-row items-center gap-4">
                      <Link
                        to="/app"
                        className={buttonVariants({ variant: 'secondary' })}
                      >
                        {LL.nav.dashboard()}
                      </Link>

                      <AccountDialog>
                        <button
                          type="button"
                          className={buttonVariants({ variant: 'ghost', className: 'flex items-center gap-2 px-3' })}
                        >
                          <Avatar className="h-7 w-7">
                            <AvatarImage
                              src={user?.image || undefined}
                              alt={user?.name || LL.nav.userLabel()}
                            />
                            <AvatarFallback className="
                              bg-primary text-primary-foreground text-xs
                            "
                            >
                              {fallbackText}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {user?.name || LL.nav.accountLabel()}
                          </span>
                        </button>
                      </AccountDialog>
                    </div>
                  )
                : (
                    <div className="flex items-center gap-2">
                      <Link
                        to="/demo-request"
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        {LL.nav.requestDemo()}
                      </Link>
                      <Button
                        onClick={handleGoogleSignIn}
                        variant="default"
                        size="sm"
                        className="gap-2"
                      >
                        <IconLogin className="h-4 w-4" />
                        {LL.nav.signIn()}
                      </Button>

                    </div>
                  )}
            </div>

            {/* Mobile Menu Button + Language + Theme Toggle */}
            <div className="
              flex items-center space-x-1
              lg:hidden
            "
            >
              <LanguageSwitcher />
              <ThemeToggle variant="ghost" align="end" />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger
                  render={(
                    <button
                      type="button"
                      className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'relative h-10 w-10 hover:bg-accent/50' })}
                    >
                      <IconMenu className="h-5 w-5" />
                      <span className="sr-only">{LL.nav.openMenu()}</span>
                    </button>
                  )}
                />
                <Suspense fallback={null}>
                  {isOpen && (
                    <MobileMenuContent
                      navigationItems={navigationItems}
                      setIsOpen={setIsOpen}
                    />
                  )}
                </Suspense>
              </Sheet>
            </div>
          </div>
        </div>
      </m.nav>
    </LazyMotion>
  )
}
