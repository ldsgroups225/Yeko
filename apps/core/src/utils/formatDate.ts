import type { Locale as DateFnsLocale } from 'date-fns/locale'
import { format as dateFnsFormat } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'
import i18n from '@/i18n/config'

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

const formatMap: Record<DateFormatStyle, string> = {
  SHORT: 'yyyy-MM-dd',
  MEDIUM: 'd MMM yyyy',
  LONG: 'd MMMM yyyy',
  FULL: 'EEEE d MMMM yyyy',
}

/**
 * Gets the current locale from i18next.
 */
function getCurrentLocale(): DateLocale {
  const lang = i18n.language?.substring(0, 2) as DateLocale
  return lang in localeMap ? lang : 'fr'
}

/**
 * Formats a date according to the specified format style.
 * Locale is auto-detected from i18next.
 *
 * @param date - The date object or ISO string to format.
 * @param style - The desired format style. Defaults to 'SHORT'.
 * @param locale - Optional locale override. Auto-detected from i18next if not provided.
 * @returns The formatted date string.
 *
 * @example
 * formatDate(new Date(2025, 11, 18), 'MEDIUM')
 * // => '18 Déc 2025' (if i18n locale is 'fr')
 */
export function formatDate(
  date: Date | string,
  style: DateFormatStyle = 'SHORT',
  locale?: DateLocale,
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const resolvedLocale = locale ?? getCurrentLocale()

  return dateFnsFormat(dateObj, formatMap[style], { locale: localeMap[resolvedLocale] })
}
