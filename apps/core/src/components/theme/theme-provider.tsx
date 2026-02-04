import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

export interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme?: 'light' | 'dark'
  systemTheme?: 'light' | 'dark'
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | undefined>(undefined)
  const [isMounted, setIsMounted] = useState(false)

  // Initialize theme from storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey) as Theme
        if (stored) {
          setThemeState(stored)
        }
      }
      catch {
        // Ignore
      }
      setSystemTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
  }, [storageKey])

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

  // Apply theme on mount and when resolvedTheme changes
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

  // Hydration effect - apply theme immediately on client
  useEffect(() => {
    // Use a timeout to avoid synchronous setState during hydration
    const timeoutId = setTimeout(() => {
      setIsMounted(true)

      // Apply the correct theme on hydration
      const currentTheme = theme === 'system' ? systemTheme : theme
      applyTheme(currentTheme)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [theme, systemTheme, applyTheme])

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
