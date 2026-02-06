import type { Locale as DateFnsLocale } from 'date-fns/locale'
import { format as dateFnsFormat } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'

import { useSyncExternalStore } from 'react'

// Removed i18n import to avoid stream errors

/**
 * Supported locales for date formatting.
 */
export type DateLocale = 'en' | 'fr'

/**
 * Date format styles with locale-aware output.
 *
 * - `SHORT`: Numeric date only (e.g., 2021-01-01)
 * - `MEDIUM`: Abbreviated month with day and year (e.g., 18 Déc 2025)
 * - `LONG`: Full month name with day and year (e.g., 18 décembre 2025)
 * - `FULL`: Complete date with day of week (e.g., jeudi 18 décembre 2025)
 */
export type DateFormatStyle = 'SHORT' | 'MEDIUM' | 'LONG' | 'FULL'

const localeMap: Record<DateLocale, DateFnsLocale> = {
  en: enUS,
  fr,
}

const formatMap: Record<DateFormatStyle, Record<DateLocale, string>> = {
  SHORT: {
    en: 'yyyy-MM-dd',
    fr: 'yyyy-MM-dd',
  },
  MEDIUM: {
    en: 'MMM d, yyyy',
    fr: 'd MMM yyyy',
  },
  LONG: {
    en: 'd MMMM yyyy',
    fr: 'd MMMM yyyy',
  },
  FULL: {
    en: 'EEEE d MMMM yyyy',
    fr: 'EEEE d MMMM yyyy',
  },
}

const DEFAULT_LOCALE: DateLocale = 'fr'

function getStoredLocale(): DateLocale {
  try {
    const stored = localStorage.getItem('yeko_core_language')
    if (stored === 'en' || stored === 'fr')
      return stored

    const browserLang = navigator.language.split('-')[0]
    if (browserLang === 'en' || browserLang === 'fr')
      return browserLang
  }
  catch {
    // Ignore storage errors
  }
  return DEFAULT_LOCALE
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getServerSnapshot(): DateLocale {
  return DEFAULT_LOCALE
}

export function useCurrentLocale(): DateLocale {
  return useSyncExternalStore(subscribe, getStoredLocale, getServerSnapshot)
}

/**
 * Gets the current locale. For components, prefer useCurrentLocale() hook.
 * This function is safe for non-React contexts only.
 */
function getCurrentLocale(): DateLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }
  return getStoredLocale()
}

/**
 * Formats a date according to the specified format style.
 * Locale is auto-detected from localStorage if not provided.
 *
 * @param date - The date object or ISO string to format.
 * @param style - The desired format style. Defaults to 'SHORT'.
 * @param locale - Optional locale override. Auto-detected if not provided.
 * @returns The formatted date string.
 *
 * @example
 * formatDate(new Date(2025, 11, 18), 'MEDIUM')
 * // => '18 Déc 2025' (if locale is 'fr')
 */
export function formatDate(
  date: Date | string,
  style: DateFormatStyle = 'SHORT',
  locale?: DateLocale,
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const resolvedLocale = locale ?? getCurrentLocale()

  return dateFnsFormat(dateObj, formatMap[style][resolvedLocale], { locale: localeMap[resolvedLocale] })
}
