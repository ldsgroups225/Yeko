import type { DateFormatStyle, DateLocale } from '@/utils/formatDate'
import { useEffect, useState } from 'react'
import { formatDate } from '@/utils/formatDate'

/**
 * Hook to format dates with client-side hydration safety.
 * Returns a formatter function that uses the current locale.
 */
export function useDateFormatter() {
  const [locale, setLocale] = useState<DateLocale>('fr')

  useEffect(() => {
    // Client-side only: detect locale from storage or browser
    const stored = localStorage.getItem('yeko_core_language') as DateLocale | null
    if (stored === 'en' || stored === 'fr') {
      setLocale(stored)
      return
    }

    const browserLang = navigator.language.split('-')[0] as DateLocale
    if (browserLang === 'en' || browserLang === 'fr') {
      setLocale(browserLang)
    }
  }, [])

  const format = (date: Date | string, style: DateFormatStyle = 'SHORT') => {
    return formatDate(date, style, locale)
  }

  return { format, locale }
}
