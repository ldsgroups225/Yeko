import type { ReactNode } from 'react'
import { HeadContent, Scripts } from '@tanstack/react-router'
import { lazy, Suspense, useMemo } from 'react'
import { generateStructuredData } from '@/utils/structuredData'

const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const [{ TanStackRouterDevtools }, { ReactQueryDevtools }] = await Promise.all([
        import('@tanstack/react-router-devtools'),
        import('@tanstack/react-query-devtools'),
      ])

      const DevtoolsComponent = () => (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </>
      )

      return { default: DevtoolsComponent }
    })
  : null

export function RootDocument({ children }: { children: ReactNode }) {
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
    <html lang="fr" suppressHydrationWarning>
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
        {Devtools
          ? (
              <Suspense fallback={null}>
                <Devtools />
              </Suspense>
            )
          : null}
        <Scripts />
      </body>
    </html>
  )
}
