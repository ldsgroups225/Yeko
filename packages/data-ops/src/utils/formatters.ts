import type { Locales } from '../i18n/i18n-types'

/**
 * Shared formatting utilities to be used across the project.
 * Unifies logic from apps/school and apps/teacher.
 */

// --- Date Formatters ---

export type DateFormatStyle = 'SHORT' | 'MEDIUM' | 'LONG' | 'FULL'

export function formatDate(
  date: Date | string | number,
  style: DateFormatStyle = 'SHORT',
  locale: Locales = 'fr',
): string {
  const dateObj = new Date(date)
  if (Number.isNaN(dateObj.getTime()))
    return String(date)

  switch (style) {
    case 'MEDIUM':
      return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(dateObj)
    case 'LONG':
      return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj)
    case 'FULL':
      return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj)
    case 'SHORT':
    default:
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj)
  }
}

export function formatTime(
  date: Date | string | number,
  locale: Locales = 'fr',
): string {
  const dateObj = new Date(date)
  if (Number.isNaN(dateObj.getTime()))
    return String(date)

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

// --- Number & Currency Formatters ---

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: Locales = 'fr',
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

export function formatCurrency(
  value: number,
  options?: Intl.NumberFormatOptions & { currency?: string },
  locale: Locales = 'fr',
): string {
  const { currency = 'XOF', ...rest } = options ?? {}
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    ...rest,
  }).format(value)
}

export function formatPercent(
  value: number,
  options?: Intl.NumberFormatOptions & { input?: '0-100' | '0-1' },
  locale: Locales = 'fr',
): string {
  const { input = '0-100', ...rest } = options ?? {}
  const normalizedValue = input === '0-100' ? value / 100 : value
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...rest,
  }).format(normalizedValue)
}

export function formatCompact(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: Locales = 'fr',
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    ...options,
  }).format(value)
}

// --- Phone Formatter ---

/**
 * Basic phone formatting.
 * Note: For full international support with metadata,
 * use react-phone-number-input in UI components.
 */
export function formatPhone(
  phone: string | null | undefined,
): string {
  if (!phone)
    return ''

  // Clean the number
  const cleaned = phone.replace(/\D/g, '')

  // Basic format for Ivory Coast (10 digits) if it matches the pattern
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }

  // Fallback to original or basic spacing
  return phone
}
