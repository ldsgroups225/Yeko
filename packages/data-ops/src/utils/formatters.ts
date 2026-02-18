import type { Locales } from '../i18n/i18n-types'
import { clientAppLogger, isServer, serverAppLogger } from '@repo/logger'
import { parsePhoneNumberWithError } from 'libphonenumber-js'

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
 * Improved phone formatting using libphonenumber-js.
 * Defaults to Ivory Coast (CI) for national numbers.
 */
export function formatPhone(
  phone: string | null | undefined,
): string {
  if (!phone)
    return ''

  try {
    // Attempt to parse with CI as default country
    const phoneNumber = parsePhoneNumberWithError(phone, 'CI')

    if (phoneNumber && phoneNumber.isValid()) {
      // If it's a valid number for the default country or international, format it
      return phoneNumber.formatInternational()
    }
  }
  catch (error) {
    // Log at debug level for traceability
    const logger = isServer() ? serverAppLogger : clientAppLogger
    logger.debug('[formatPhone] Parse failed for input', { phone, error })
  }

  // Fallback: Clean the number but keep it as is if it doesn't match standard patterns
  const cleaned = phone.replace(/\D/g, '')

  // Legacy fallback for 10-digit CI numbers if parsing somehow failed
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }

  return phone
}
