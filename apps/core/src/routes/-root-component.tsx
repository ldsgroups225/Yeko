import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ThemeProvider } from '@/components/theme'
import TypesafeI18n from '@/i18n/i18n-react'
import { initializeLogger } from '@/lib/logger'
import { RootDocument } from './-root-document'

export function RootComponent() {
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
