import { loadLocale } from '../i18n/i18n-util.sync'
import { i18nObject } from '../i18n/i18n-util'
import type { Locales } from '../i18n/i18n-types'

export const getServerTranslations = (locale: Locales = 'fr') => {
  loadLocale(locale)
  return i18nObject(locale)
}
