import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { IconHome } from '@tabler/icons-react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Button } from '@workspace/ui/components/button'
import { domAnimation, LazyMotion } from 'motion/react'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { useSyncInitializer } from '@/hooks'
import TypesafeI18n, { useI18nContext } from '@/i18n/i18n-react'
import { loadAllLocales } from '@/i18n/i18n-util.sync'
import appCss from '@/styles.css?url'

loadAllLocales()

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
      },
      { title: 'Yeko Enseignant' },
      {
        name: 'description',
        content: 'Application mobile pour les enseignants Yeko',
      },
      { name: 'theme-color', content: '#2563eb' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },

    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  useSyncInitializer()

  return (
    <TypesafeI18n locale="fr">
      <LazyMotion features={domAnimation}>
        <RootDocument>
          <ThemeProvider>
            <Outlet />
          </ThemeProvider>
        </RootDocument>
      </LazyMotion>
    </TypesafeI18n>
  )
}

function NotFoundComponent() {
  const { LL } = useI18nContext()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <h1 className="text-muted-foreground text-6xl font-bold">404</h1>
        <p className="text-muted-foreground text-xl">{LL.errors.notFound()}</p>
        <Button
          render={(
            <Link to="/login">
              <IconHome className="mr-2 h-4 w-4" />
              {LL.nav.home()}
            </Link>
          )}
        />
      </div>
    </div>
  )
}

// Inline script to prevent theme flash (FOUC) - runs before paint
const themeScript = `
(function() {
  var storageKey = 'yeko-teacher-theme';
  var theme;
  try {
    theme = localStorage.getItem(storageKey);
  } catch (e) {}
  
  if (!theme || theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  document.documentElement.classList.add(theme);
})();
`

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <HeadContent />
      </head>
      <body className="bg-background min-h-screen font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors closeButton />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}
