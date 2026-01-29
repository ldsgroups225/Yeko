/// <reference types="vite/client" />

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
import { useEffect, useMemo } from 'react'
import { DefaultCatchBoundary } from '@/components/default-catch-boundary'
import { NotFound } from '@/components/not-found'
import { ThemeProvider } from '@/components/theme'
import { getAuthStatus } from '@/core/functions/get-auth-status'
import { initializeLogger } from '@/lib/logger'
import TypesafeI18n from '@/i18n/i18n-react'
import { loadAllLocales } from '@/i18n/i18n-util.sync'
import appCss from '@/styles.css?url'
import { seo } from '@/utils/seo'
import { generateStructuredData } from '@/utils/structuredData'

loadAllLocales()

loadAllLocales()

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  auth?: Awaited<ReturnType<typeof getAuthStatus>>
}>()({
  beforeLoad: async () => {
    const auth = await getAuthStatus()
    return {
      auth,
    }
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Yeko | Smart School Management Platform',
        description: `Yeko is a comprehensive school management platform designed to streamline educational operations and enhance learning experiences.`,
        canonical: 'https://yeko.com',
        keywords: 'school management, education platform, student information system, school administration, education technology, SIS, LMS',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  // Initialize logger on app startup
  useEffect(() => {
    initializeLogger().catch((error) => {
      console.error('Failed to initialize logger:', error)
    })
  }, [])

  return (
    <RootDocument>
      <TypesafeI18n locale="fr">
        <ThemeProvider

          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Outlet />
        </ThemeProvider>
      </TypesafeI18n>
    </RootDocument>

  )
}

function RootDocument({ children }: { children: ReactNode }) {
  // Generate structured data JSON (no sanitization needed - we control the data)
  const organizationData = useMemo(
    () => JSON.stringify(generateStructuredData('organization')),
    [],
  )
  const softwareData = useMemo(
    () => JSON.stringify(generateStructuredData('software')),
    [],
  )
  const websiteData = useMemo(
    () => JSON.stringify(generateStructuredData('website')),
    [],
  )

  // Theme initialization script (static, trusted code)
  const themeScript = useMemo(
    () => `
      (function() {
        try {
          var theme = localStorage.getItem('ui-theme') || 'system';
          var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          var resolvedTheme = theme === 'system' ? systemTheme : theme;

          if (resolvedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.add('light');
          }
        } catch (e) {}
      })();
    `,
    [],
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* eslint-disable react-dom/no-dangerously-set-innerhtml */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: organizationData,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: softwareData,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: websiteData,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
        {/* eslint-enable react-dom/no-dangerously-set-innerhtml */}
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
