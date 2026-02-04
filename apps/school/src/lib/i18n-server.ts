import type { Locales } from '../i18n/i18n-types'
import { i18nObject } from '../i18n/i18n-util'
import { loadLocale } from '../i18n/i18n-util.sync'

export function getServerTranslations(locale: Locales = 'fr') {
  loadLocale(locale)
  return i18nObject(locale)
}
