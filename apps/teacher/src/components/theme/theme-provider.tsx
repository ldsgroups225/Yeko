import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { ThemeProviderContext } from './theme-context'

type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

// Hydration-safe mounted state using useSyncExternalStore
const emptySubscribe = () => () => { }
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'yeko-teacher-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  // Use useSyncExternalStore for hydration-safe mounted detection
  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)

  const [theme, setThemeState] = useState<Theme>(() => {
    // During SSR, always return the default theme to avoid hydration mismatch
    if (typeof window === 'undefined') {
      return defaultTheme
    }

    // Client-side: try to get theme from localStorage
    try {
      const stored = localStorage.getItem(storageKey) as Theme
      return stored || defaultTheme
    }
    catch {
      return defaultTheme
    }
  })

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | undefined>(() => {
    // During SSR, return undefined
    if (typeof window === 'undefined') {
      return undefined
    }

    // Client-side: detect system theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  const setTheme = useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
      }
      catch {
        // Ignore localStorage errors
      }
      setThemeState(newTheme)
    },
    [storageKey],
  )

  const applyTheme = useCallback(
    (targetTheme: 'light' | 'dark' | undefined) => {
      if (!targetTheme || typeof document === 'undefined')
        return

      const root = document.documentElement

      if (disableTransitionOnChange) {
        const css = document.createElement('style')
        css.appendChild(
          document.createTextNode(
            `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
          ),
        )
        document.head.appendChild(css);

        // Force reflow
        (() => window.getComputedStyle(document.body))()

        setTimeout(() => {
          document.head.removeChild(css)
        }, 1)
      }

      if (attribute === 'class') {
        root.classList.remove('light', 'dark')
        root.classList.add(targetTheme)
      }
      else {
        root.setAttribute(attribute, targetTheme)
      }
    },
    [attribute, disableTransitionOnChange],
  )

  // Apply theme when resolvedTheme changes (after initial mount)
  useEffect(() => {
    if (isMounted) {
      applyTheme(resolvedTheme)
    }
  }, [resolvedTheme, applyTheme, isMounted])

  // Handle system theme changes
  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined')
      return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [enableSystem])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme: isMounted ? resolvedTheme : undefined,
      systemTheme: isMounted ? systemTheme : undefined,
    }),
    [theme, setTheme, resolvedTheme, systemTheme, isMounted],
  )

  return (
    <ThemeProviderContext {...props} value={value}>
      {children}
    </ThemeProviderContext>
  )
}
