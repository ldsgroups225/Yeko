/// <reference types="vite/client" />

import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext } from '@tanstack/react-router'
import { DefaultCatchBoundary } from '@/components/default-catch-boundary'
import { NotFound } from '@/components/not-found'
import { getAuthStatus } from '@/core/functions/get-auth-status'
import { loadAllLocales } from '@/i18n/i18n-util.sync'
import appCss from '@/styles.css?url'
import { seo } from '@/utils/seo'
import { RootComponent } from './-root-component'
import { RootDocument } from './-root-document'

loadAllLocales()

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  auth?: Awaited<ReturnType<typeof getAuthStatus>>
}>()({
  beforeLoad: async () => {
    const auth = await getAuthStatus()
    return { auth }
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
