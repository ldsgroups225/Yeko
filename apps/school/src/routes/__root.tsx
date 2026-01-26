import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useMemo } from 'react'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { I18nProvider } from '@/i18n'
import appCss from '@/styles.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Yeko School - Smart School Management',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <I18nProvider>
        <ThemeProvider defaultTheme="system" storageKey="school-ui-theme">
          <Outlet />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </I18nProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const themeScriptContent = useMemo(
    () => `
      (function() {
        const storageKey = 'school-ui-theme';
        const theme = localStorage.getItem(storageKey);
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const resolved = theme === 'dark' || theme === 'light' ? theme : (theme === 'system' || !theme) ? (systemDark ? 'dark' : 'light') : 'light';
        document.documentElement.classList.add(resolved);
      })();
    `,
    [],
  )

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml */}
        <script dangerouslySetInnerHTML={{ __html: themeScriptContent }} />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}
