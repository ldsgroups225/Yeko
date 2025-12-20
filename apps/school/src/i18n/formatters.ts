import type { FormattersInitializer } from 'typesafe-i18n'
import type { Formatters, Locales } from './i18n-types.js'

export const initFormatters: FormattersInitializer<Locales, Formatters> = (locale: Locales) => {
  const formatters: Formatters = {
    // Date formatter
    date: (value: Date | string | number) => {
      const date = new Date(value)
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    },

    // Short date formatter
    dateShort: (value: Date | string | number) => {
      const date = new Date(value)
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date)
    },

    // Time formatter
    time: (value: Date | string | number) => {
      const date = new Date(value)
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    },

    // Number formatter
    number: (value: number) => {
      return new Intl.NumberFormat(locale).format(value)
    },

    // Currency formatter (West African CFA franc)
    currency: (value: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'XOF', // West African CFA franc
      }).format(value)
    },

    // Percentage formatter
    percent: (value: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(value / 100)
    },
  }

  return formatters
}
