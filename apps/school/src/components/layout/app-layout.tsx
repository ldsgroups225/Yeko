import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Header } from './header'
import { AppSidebar } from './sidebar'

const CommandPalette = lazy(() =>
  import('./command-palette').then(mod => ({
    default: mod.CommandPalette,
  })),
)

/**
 * Lightweight wrapper that defers CommandPalette loading until ⌘K / Ctrl+K.
 * The keyboard listener and state live here so the heavy component
 * (dialog primitives, icons, useSearch hook) is never parsed at initial load.
 */
function LazyCommandPalette() {
  const [activated, setActivated] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setActivated(true)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!activated)
    return null

  return (
    <Suspense>
      <CommandPalette initialOpen />
    </Suspense>
  )
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <LazyCommandPalette />
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="w-full p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
