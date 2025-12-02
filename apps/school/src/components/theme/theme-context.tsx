import { createContext } from 'react'

export interface ThemeProviderState {
  theme: 'dark' | 'light' | 'system'
  setTheme: (theme: 'dark' | 'light' | 'system') => void
  resolvedTheme?: 'light' | 'dark'
  systemTheme?: 'light' | 'dark'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: undefined,
  systemTheme: undefined,
}

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState)
