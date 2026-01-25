# Internationalization (i18n) Setup

This project uses **react-i18next** for internationalization with French as the default language.

## Supported Languages

- 🇫🇷 **French (fr)** - Default
- 🇬🇧 **English (en)**

## Structure

```
src/i18n/
├── config.ts          # i18next configuration
├── locales/
│   ├── fr.ts         # French translations
│   └── en.ts         # English translations
└── README.md         # This file
```

## Usage

### In Components

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  )
}
```

### Change Language Programmatically

```tsx
import { useTranslation } from 'react-i18next'

function LanguageButton() {
  const { i18n } = useTranslation()

  const changeToEnglish = () => {
    i18n.changeLanguage('en')
  }

  return <button onClick={changeToEnglish}>Switch to English</button>
}
```

### Language Switcher Component

A pre-built `<LanguageSwitcher />` component is available in `src/components/language-switcher.tsx` and is already integrated into the navigation bar.

## Adding New Translations

1. Add the translation key to both `locales/fr.ts` and `locales/en.ts`
2. Use the key in your component with `t('your.key')`

Example:

```typescript
// In locales/fr.ts
export const fr = {
  // ... existing translations
  newSection: {
    title: 'Nouveau Titre',
    description: 'Nouvelle Description',
  },
};

// In locales/en.ts
export const en = {
  // ... existing translations
  newSection: {
    title: 'New Title',
    description: 'New Description',
  },
};

// In your component
const { t } = useTranslation();
<h1>{t('newSection.title')}</h1>
```

## Features

- ✅ Automatic language detection from browser
- ✅ Language persistence in localStorage
- ✅ French as default language
- ✅ Smooth language switching without page reload
- ✅ Type-safe translations (TypeScript support)
- ✅ Integrated language switcher in navigation

## Configuration

The i18n configuration is in `src/i18n/config.ts`:

- **Default language**: French (fr)
- **Fallback language**: French (fr)
- **Detection order**: localStorage → browser language
- **Storage**: localStorage (key: `i18nextLng`)

## Translation Keys Structure

```
nav.*              - Navigation items
hero.*             - Hero section
socialProof.*      - Social proof section
useCases.*         - Use cases section
painPoints.*       - Pain points section
whyYeko.*          - Why Yeko section
howItWorks.*       - How it works section
benefits.*         - Benefits section
pricing.*          - Pricing section
testimonials.*     - Testimonials section
faq.*              - FAQ section
cta.*              - Call-to-action section
footer.*           - Footer section
common.*           - Common UI elements
```

## Best Practices

1. **Always add translations to both language files** to avoid missing translations
2. **Use nested keys** for better organization (e.g., `hero.title` instead of `heroTitle`)
3. **Keep keys descriptive** and follow the existing naming convention
4. **Test both languages** after adding new translations
5. **Use the `common.*` namespace** for reusable UI text (buttons, labels, etc.)

## Adding a New Language

To add a new language (e.g., Spanish):

1. Create `src/i18n/locales/es.ts` with all translation keys
2. Import it in `src/i18n/config.ts`:
   ```typescript
   import { es } from './locales/es'
   ```
3. Add it to the resources:
   ```typescript
   resources: {
     fr: { translation: fr },
     en: { translation: en },
     es: { translation: es },
   },
   ```
4. Add it to supported languages:
   ```typescript
   supportedLngs: ['fr', 'en', 'es'],
   ```
5. Update the language switcher in `src/components/language-switcher.tsx`:
   ```typescript
   const languages = [
     { code: 'fr', name: 'Français', flag: '🇫🇷' },
     { code: 'en', name: 'English', flag: '🇬🇧' },
     { code: 'es', name: 'Español', flag: '🇪🇸' },
   ]
   ```
