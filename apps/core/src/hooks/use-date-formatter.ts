import type { DateFormatStyle, Locales as DateLocale } from '@repo/data-ops'
import { formatDate } from '@repo/data-ops/utils/formatters'
import { useEffect, useState } from 'react'

/**
 * Hook to format dates with client-side hydration safety.
 * Returns a formatter function that uses the current locale.
 */
export function useDateFormatter() {
  const [locale] = useState<DateLocale>(() => {
    if (typeof window === 'undefined')
      return 'fr'
    const stored = localStorage.getItem('yeko_core_language') as DateLocale | null
    if (stored === 'en' || stored === 'fr') {
      return stored
    }

    const browserLang = navigator.language.split('-')[0] as DateLocale
    if (browserLang === 'en' || browserLang === 'fr') {
      return browserLang
    }
    return 'fr'
  })

  useEffect(() => {
    // Keep locale in sync with storage changes if needed, but for now we just initialize once
  }, [])

  const format = (date: Date | string, style: DateFormatStyle = 'SHORT') => {
    return formatDate(date, style, locale)
  }

  return { format, locale }
}
