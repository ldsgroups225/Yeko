import type { ReactNode } from 'react'
import type { Locales, TranslationFunctions, Translations } from './i18n-types'
import { createContext, use, useEffect, useState } from 'react'
import { baseLocale, i18nObject, isLocale, loadedFormatters, loadedLocales } from './i18n-util'

// Import locale loaders
async function loadLocale(locale: Locales): Promise<Translations> {
  switch (locale) {
    case 'fr':
      return (await import('./fr/index.js')).default as Translations
    case 'en':
      return (await import('./en/index.js')).default as Translations
    default:
      return (await import('./fr/index.js')).default as Translations
  }
}

async function loadFormatters(locale: Locales) {
  const { initFormatters } = await import('./formatters.js')
  return initFormatters(locale)
}

// Simple locale detection for browser environment
function detectBrowserLocale(): Locales {
  if (typeof window === 'undefined')
    return baseLocale

  // Check localStorage first
  const stored = localStorage.getItem('yeko_school_language')
  if (stored && isLocale(stored))
    return stored

  // Check browser language
  const browserLang = navigator.language.split('-')[0]
  if (browserLang && isLocale(browserLang))
    return browserLang

  return baseLocale
}

interface I18nContextValue {
  locale: Locales
  t: TranslationFunctions
  setLocale: (locale: Locales) => Promise<void>
}

const I18nContext = createContext<I18nContextValue | null>(null)

interface I18nProviderProps {
  children: ReactNode
  locale?: Locales
}

export function I18nProvider({ children, locale: initialLocale }: I18nProviderProps) {
  // Detect initial locale
  const detectedLocale = initialLocale || detectBrowserLocale()

  const [locale, setLocaleState] = useState<Locales>(detectedLocale)
  const [t, setT] = useState<TranslationFunctions>(() => {
    // Return empty object initially, will be loaded in useEffect
    return {} as TranslationFunctions
  })
  const [isLoading, setIsLoading] = useState(true)

  const setLocale = async (newLocale: Locales) => {
    if (!isLocale(newLocale)) {
      console.warn(`Locale '${newLocale}' is not supported. Falling back to '${baseLocale}'.`)
      newLocale = baseLocale
    }

    setIsLoading(true)

    try {
      // Load translations if not already loaded
      if (!loadedLocales[newLocale]) {
        const translations = await loadLocale(newLocale)
        loadedLocales[newLocale] = translations
      }

      // Load formatters if not already loaded
      if (!loadedFormatters[newLocale]) {
        const formatters = await loadFormatters(newLocale)
        loadedFormatters[newLocale] = formatters
      }

      // Update state
      setLocaleState(newLocale)
      setT(i18nObject(newLocale))

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('yeko_school_language', newLocale)
      }
    }
    catch (error) {
      console.error(`Failed to load locale '${newLocale}':`, error)
    }
    finally {
      setIsLoading(false)
    }
  }

  // Load initial locale
  useEffect(() => {
    setLocale(locale)
  }, [])

  const contextValue: I18nContextValue = {
    locale,
    t,
    setLocale,
  }

  if (isLoading) {
    return <div>Loading translations...</div>
  }

  return (
    <I18nContext value={contextValue}>
      {children}
    </I18nContext>
  )
}

export function useI18nContext(): I18nContextValue {
  const context = use(I18nContext)
  if (!context) {
    throw new Error('useI18nContext must be used within an I18nProvider')
  }
  return context
}

// Convenience hook that returns just the translation functions (named 't' as user prefers)
export function useTranslations() {
  const { t } = useI18nContext()
  return t
}

// Hook that returns current locale
export function useLocale() {
  const { locale, setLocale } = useI18nContext()
  return { locale, setLocale }
}
