import type { ThemeProviderState } from './theme-provider'
import { createContext } from 'react'

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: undefined,
  systemTheme: undefined,
}

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState)
