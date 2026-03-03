import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { lazy, Suspense, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { I18nProvider, useI18nContext } from '@/i18n'
import i18n from '@/i18n/config'
import appCss from '@/styles.css?url'

// DevTools are only loaded in development — fully tree-shaken in production
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then(mod => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then(mod => ({
        default: mod.ReactQueryDevtools,
      })),
    )
  : () => null

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
    <I18nextProvider i18n={i18n}>
      <I18nProvider>
        <RootDocument>
          <ThemeProvider defaultTheme="system" storageKey="school-ui-theme">
            <Outlet />
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </RootDocument>
      </I18nProvider>
    </I18nextProvider>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const { locale } = useI18nContext()
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml */}
        <script dangerouslySetInnerHTML={{ __html: themeScriptContent }} />
      </head>
      <body>
        {children}
        {import.meta.env.DEV && (
          <Suspense>
            <TanStackRouterDevtools position="bottom-right" />
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  )
}
