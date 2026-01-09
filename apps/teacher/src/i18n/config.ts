import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { fr } from './locales/fr'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Initialize i18next with French as default (SSR-compatible)
i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    defaultNS: 'translation',
    lng: 'fr', // Default language is French
    supportedLngs: ['fr', 'en'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

// Only run language detection on the client side
if (isBrowser) {
  // Detect and set language from localStorage or navigator
  const detectedLng = localStorage.getItem('i18nextLng')
    || (navigator.language?.startsWith('en') ? 'en' : 'fr')

  if (detectedLng && detectedLng !== i18n.language) {
    i18n.changeLanguage(detectedLng)
  }
}

export default i18n
