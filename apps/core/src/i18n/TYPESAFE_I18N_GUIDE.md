# Typesafe i18n Guide for Yeko

## Overview

Yeko now uses **typesafe-i18n** for internationalization, providing full TypeScript type safety for all translations. This ensures that translation keys, parameters, and locales are validated at compile time.

## Key Benefits

✅ **100% Type Safe** - All translation keys and parameters are type-checked
✅ **Auto-completion** - Full IDE support for translation keys
✅ **Refactoring Safe** - Renaming keys updates all usages
✅ **No Runtime Errors** - Missing translations caught at compile time
✅ **Lightweight** - ~1KB bundle size
✅ **Fast** - Optimized for performance

## Configuration

### Base Configuration

- **Base Locale**: French (fr)
- **Supported Locales**: French (fr), English (en)
- **Output Path**: `src/i18n`
- **Config File**: `.typesafe-i18n.json`

### File Structure

```text
src/i18n/
├── fr/
│   └── index.ts          # French translations (base)
├── en/
│   └── index.ts          # English translations
├── i18n-types.ts         # Generated TypeScript types
├── i18n-util.ts          # Generated utilities
├── i18n-react.tsx        # React integration
├── formatters.ts         # Custom formatters
└── index.ts              # Main exports
```

## Usage

### 1. Basic Translation

```typescript
import { useTranslations } from '@/i18n'

function MyComponent() {
  const LL = useTranslations()

  return (
    <div>
      <h1>{LL.hero.title()}</h1>
      <p>{LL.hero.description()}</p>
      <button>{LL.common.save()}</button>
    </div>
  )
}
```

### 2. With Interpolation

```typescript
import { useTranslations } from '@/i18n'

function SchoolCard({ school }) {
  const LL = useTranslations()

  return (
    <div>
      <h2>{school.name}</h2>
      <p>{LL.schools.confirmDelete({ name: school.name })}</p>
      <p>{LL.errors.minLength({ count: 3 })}</p>
    </div>
  )
}
```

### 3. Language Switching

```typescript
import { useLocale } from '@/i18n'

function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as 'fr' | 'en')}
    >
      <option value="fr">Français</option>
      <option value="en">English</option>
    </select>
  )
}
```

### 4. Setup Provider

Wrap your app with the I18nProvider:

```typescript
import { I18nProvider } from '@/i18n'

function App() {
  return (
    <I18nProvider>
      <YourApp />
    </I18nProvider>
  )
}
```

## Adding New Translations

### Step 1: Add to Base Locale (French)

Edit `src/i18n/fr/index.ts`:

```typescript
const fr = {
  // ... existing translations

  newFeature: {
    title: 'Nouveau Titre',
    description: 'Description avec {param}',
    action: 'Action',
  },
} satisfies BaseTranslation
```

### Step 2: Run Generator

The generator watches for changes automatically, or run manually:

```bash
npm run typesafe-i18n
```

This generates TypeScript types from your base locale.

### Step 3: Add to Other Locales

Edit `src/i18n/en/index.ts`:

```typescript
const en = {
  // ... existing translations

  newFeature: {
    title: 'New Title',
    description: 'Description with {param}',
    action: 'Action',
  },
} satisfies Translation
```

### Step 4: Use in Components

```typescript
function NewFeature() {
  const LL = useTranslations()

  return (
    <div>
      <h1>{LL.newFeature.title()}</h1>
      <p>{LL.newFeature.description({ param: 'value' })}</p>
      <button>{LL.newFeature.action()}</button>
    </div>
  )
}
```

## Formatters

Custom formatters are available for common formatting needs:

### Date Formatting

```typescript
const LL = useTranslations()

// Long date format
LL.formatters.date(new Date()) // "15 janvier 2024" (fr) or "January 15, 2024" (en)

// Short date format
LL.formatters.dateShort(new Date()) // "15/01/2024"

// Time format
LL.formatters.time(new Date()) // "14:30"
```

### Number Formatting

```typescript
const LL = useTranslations()

// Number
LL.formatters.number(1234567) // "1 234 567" (fr) or "1,234,567" (en)

// Currency (West African CFA franc)
LL.formatters.currency(1000) // "1 000 XOF"

// Percentage
LL.formatters.percent(75) // "75 %"
```

## Type Safety Features

### 1. Required Parameters

```typescript
// ❌ TypeScript Error: Missing required parameter
LL.schools.confirmDelete()

// ✅ Correct
LL.schools.confirmDelete({ name: 'École Test' })
```

### 2. Invalid Keys

```typescript
// ❌ TypeScript Error: Property 'invalidKey' does not exist
LL.invalidKey.title()

// ✅ Correct
LL.hero.title()
```

### 3. Locale Type Safety

```typescript
const { setLocale } = useLocale()

// ❌ TypeScript Error: Type '"es"' is not assignable to type 'Locales'
setLocale('es')

// ✅ Correct
setLocale('fr')
setLocale('en')
```

## Migration from react-i18next

### Before (react-i18next)

```typescript
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('schools.confirmDelete', { name: school.name })}</p>
    </div>
  )
}
```

### After (typesafe-i18n)

```typescript
import { useTranslations } from '@/i18n'

function Component() {
  const LL = useTranslations()

  return (
    <div>
      <h1>{LL.hero.title()}</h1>
      <p>{LL.schools.confirmDelete({ name: school.name })}</p>
    </div>
  )
}
```

### Key Differences

1. **Import**: `useTranslation()` → `useTranslations()`
2. **Usage**: `t('key')` → `LL.key()`
3. **Nested keys**: `t('hero.title')` → `LL.hero.title()`
4. **Parameters**: `t('key', { param })` → `LL.key({ param })`
5. **Type safety**: String keys → Typed object access

## Best Practices

### 1. Always Use the Generator

Run `npm run typesafe-i18n` in watch mode during development:

```bash
npm run typesafe-i18n
```

### 2. Update Base Locale First

Always add translations to the base locale (French) first, then to other locales.

### 3. Use Descriptive Keys

```typescript
// ❌ Bad
const fr = {
  btn1: 'Enregistrer',
  txt2: 'Erreur',
}

// ✅ Good
const fr = {
  common: {
    save: 'Enregistrer',
  },
  errors: {
    saveFailed: 'Échec de l\'enregistrement',
  },
}
```

### 4. Group Related Translations

```typescript
const fr = {
  schools: {
    title: 'Gestion des écoles',
    create: 'Créer une école',
    edit: 'Modifier l\'école',
    delete: 'Supprimer l\'école',
    // ... all school-related translations
  },
}
```

### 5. Use Interpolation for Dynamic Content

```typescript
// ❌ Bad - String concatenation
const message = `${LL.schools.delete()} ${school.name}?`

// ✅ Good - Interpolation
const message = LL.schools.confirmDelete({ name: school.name })
```

## Testing

### Test Component with Translations

```typescript
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '@/i18n'

function renderWithI18n(component: ReactElement, locale?: 'fr' | 'en') {
  return render(
    <I18nProvider locale={locale}>
      {component}
    </I18nProvider>
  )
}

test('renders French translations', async () => {
  renderWithI18n(<MyComponent />)

  await waitFor(() => {
    expect(screen.getByText('Accueil')).toBeInTheDocument()
  })
})

test('renders English translations', async () => {
  renderWithI18n(<MyComponent />, 'en')

  await waitFor(() => {
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Types Not Updating

If types aren't updating after adding translations:

1. Make sure the generator is running: `npm run typesafe-i18n`
2. Restart your TypeScript server in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
3. Check that your base locale file has `satisfies BaseTranslation`

### Missing Translations

If you see "Property does not exist" errors:

1. Ensure the translation exists in your base locale (French)
2. Run the generator: `npm run typesafe-i18n`
3. Check that the translation file exports default

### Locale Not Loading

If translations don't appear:

1. Ensure the I18nProvider wraps your component
2. Check browser console for loading errors
3. Verify locale files are in the correct directory structure

## Performance Considerations

### Lazy Loading

Locales are loaded asynchronously only when needed:

```typescript
// Locale files are loaded on-demand
const { setLocale } = useLocale()
await setLocale('en') // Loads English translations if not already loaded
```

### Bundle Size

- Core library: ~1KB gzipped
- Each locale: ~2-5KB depending on translation count
- Only active locale is loaded in memory

## Demo

Visit `/typesafe-i18n-demo` to see a live demo of all features.

## Resources

- [typesafe-i18n Documentation](https://github.com/ivanhofer/typesafe-i18n)
- [Yeko i18n Tests](./test/i18n/typesafe-i18n.test.tsx)
- [Demo Component](../components/typesafe-i18n-demo.tsx)
