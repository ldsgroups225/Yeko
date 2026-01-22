import type { I18nContextValue } from './i18n-react'
import type { TranslationFunctions } from './i18n-types'
import { use } from 'react'
import { I18nContext } from './i18n-react'

export function useI18nContext(): I18nContextValue {
  const context = use(I18nContext)
  if (!context) {
    throw new Error('useI18nContext must be used within an I18nProvider')
  }
  return context
}

// Convenience hook that returns just translation functions (named 't' as user prefers)
export function useTranslations(): TranslationFunctions {
  const { t } = useI18nContext()
  return t
}

// Hook that returns current locale
export function useLocale() {
  const { locale, setLocale } = useI18nContext()
  return { locale, setLocale }
}
