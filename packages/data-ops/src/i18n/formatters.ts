import type { FormattersInitializer } from 'typesafe-i18n'
import type { Formatters, Locales } from './i18n-types'

import { formatDate, formatNumber, formatCurrency, formatPercent, formatTime } from '../utils/formatters'

export const initFormatters: FormattersInitializer<Locales, Formatters> = (locale: Locales) => {
  const formatters: Formatters = {
    date: (value: Date | string | number) => formatDate(value, 'LONG', locale),
    dateShort: (value: Date | string | number) => formatDate(value, 'SHORT', locale),
    time: (value: Date | string | number) => formatTime(value, locale),
    number: (value: number) => formatNumber(value, {}, locale),
    currency: (value: number) => formatCurrency(value, {}, locale),
    percent: (value: number) => formatPercent(value, {}, locale),
  } as Formatters

  return formatters
}
