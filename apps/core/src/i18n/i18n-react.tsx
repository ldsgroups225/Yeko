import type { ReactNode } from 'react'
import type { Locales, TranslationFunctions, Translations } from './i18n-types'
import { createContext, use, useEffect, useMemo, useState } from 'react'
import { initFormatters as initBaseFormatters } from './formatters.js'
import baseTranslations from './fr/index.js'
import { baseLocale, i18nObject, isLocale, loadedFormatters, loadedLocales } from './i18n-util'

// Helper function to ensure locale is initialized and create i18n object
function getI18nObject(locale: Locales): TranslationFunctions {
  // Ensure translations are loaded
  if (!loadedLocales[locale]) {
    if (locale === baseLocale) {
      loadedLocales[locale] = baseTranslations as Translations
    }
    else {
      // For non-base locales without loaded translations, fall back to base
      if (!loadedLocales[baseLocale]) {
        loadedLocales[baseLocale] = baseTranslations as Translations
      }
      console.warn(`Translations for '${locale}' not loaded, using '${baseLocale}'`)
      locale = baseLocale
    }
  }

  // Ensure formatters are loaded
  if (!loadedFormatters[locale]) {
    loadedFormatters[locale] = initBaseFormatters(locale)
  }

  return i18nObject(locale)
}

// Initialize base locale immediately (synchronously)
loadedLocales[baseLocale] = baseTranslations as Translations
loadedFormatters[baseLocale] = initBaseFormatters(baseLocale)

// Import locale loaders for dynamic locales
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
  const stored = localStorage.getItem('yeko_core_language')
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
  // Always use baseLocale for initial render to ensure hydration consistency
  const [locale, setLocaleState] = useState<Locales>(baseLocale)
  const [t, setT] = useState<TranslationFunctions>(() => getI18nObject(baseLocale))

  const setLocale = async (newLocale: Locales) => {
    if (!isLocale(newLocale)) {
      console.warn(`Locale '${newLocale}' is not supported. Falling back to '${baseLocale}'.`)
      newLocale = baseLocale
    }

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

      // Update state with the new translation object
      setLocaleState(newLocale)
      setT(getI18nObject(newLocale))

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('yeko_core_language', newLocale)
      }
    }
    catch (error) {
      console.error(`Failed to load locale '${newLocale}':`, error)
    }
  }

  // Detect and apply user's preferred locale ONLY on client after hydration
  useEffect(() => {
    const targetLocale = initialLocale || detectBrowserLocale()
    if (targetLocale !== baseLocale) {
      setLocale(targetLocale)
    }
  }, [initialLocale])

  const contextValue: I18nContextValue = useMemo(() => ({
    locale,
    t,
    setLocale,
  }), [locale, t])

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
