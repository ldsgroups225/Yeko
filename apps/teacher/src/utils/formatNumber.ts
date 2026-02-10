import { baseLocale } from '@/i18n/i18n-util'

export type NumberLocale = 'en' | 'fr'

const supportedLocales: NumberLocale[] = ['en', 'fr']

function getCurrentLocale(): NumberLocale {
  const lang = baseLocale.substring(0, 2) as NumberLocale
  return supportedLocales.includes(lang) ? lang : 'fr'
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: NumberLocale,
): string {
  const resolvedLocale = locale ?? getCurrentLocale()
  return new Intl.NumberFormat(resolvedLocale, options).format(value)
}

export function formatCurrency(
  value: number,
  options?: Intl.NumberFormatOptions & { currency?: string },
  locale?: NumberLocale,
): string {
  const { currency = 'XOF', ...rest } = options ?? {}
  const resolvedLocale = locale ?? getCurrentLocale()
  return new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    ...rest,
  }).format(value)
}

export function formatPercent(
  value: number,
  options?: Intl.NumberFormatOptions & { input?: '0-100' | '0-1' },
  locale?: NumberLocale,
): string {
  const { input = '0-100', ...rest } = options ?? {}
  const normalizedValue = input === '0-100' ? value / 100 : value
  const resolvedLocale = locale ?? getCurrentLocale()
  return new Intl.NumberFormat(resolvedLocale, {
    style: 'percent',
    ...rest,
  }).format(normalizedValue)
}

export function formatCompact(
  value: number,
  locale?: NumberLocale,
): string {
  const resolvedLocale = locale ?? getCurrentLocale()
  return new Intl.NumberFormat(resolvedLocale, {
    notation: 'compact',
  }).format(value)
}
