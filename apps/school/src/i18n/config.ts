import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

// Only import French (base locale) eagerly
import { fr as frTranslation } from './locales/fr'

const resources = {
  fr: {
    translation: frTranslation,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    lng: 'fr',
    debug: false,
    partialBundledLanguages: true,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'yeko_school_language',
    },

    react: {
      useSuspense: false,
    },
  })

export default i18n
