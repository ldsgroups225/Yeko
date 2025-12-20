# Typesafe i18n Implementation

## Quick Start

### 1. Import and Use
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

### 2. With Parameters
```typescript
const LL = useTranslations()

// Interpolation
<p>{LL.schools.confirmDelete({ name: 'École Test' })}</p>

// Multiple parameters
<p>{LL.errors.minLength({ count: 3 })}</p>
```

### 3. Language Switching
```typescript
import { useLocale } from '@/i18n'

function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  
  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="fr">Français</option>
      <option value="en">English</option>
    </select>
  )
}
```

## Key Features

✅ **100% Type Safe** - All keys and parameters validated at compile time
✅ **Auto-completion** - Full IDE support
✅ **Refactoring Safe** - Rename keys safely
✅ **Lightweight** - ~1KB bundle size
✅ **Fast** - Optimized performance

## File Structure

```
src/i18n/
├── fr/index.ts           # French (base locale)
├── en/index.ts           # English
├── i18n-types.ts         # Generated types
├── i18n-util.ts          # Generated utilities
├── i18n-react.tsx        # React integration
├── formatters.ts         # Custom formatters
└── index.ts              # Main exports
```

## Adding New Translations

### 1. Add to Base Locale (French)
```typescript
// src/i18n/fr/index.ts
const fr = {
  myFeature: {
    title: 'Mon Titre',
    description: 'Description avec {param}',
  },
} satisfies BaseTranslation
```

### 2. Run Generator
```bash
npm run typesafe-i18n
```

### 3. Add to Other Locales
```typescript
// src/i18n/en/index.ts
const en = {
  myFeature: {
    title: 'My Title',
    description: 'Description with {param}',
  },
} satisfies Translation
```

### 4. Use in Components
```typescript
const LL = useTranslations()
<h1>{LL.myFeature.title()}</h1>
<p>{LL.myFeature.description({ param: 'value' })}</p>
```

## Custom Formatters

Available formatters:
- `date(value)` - Long date format
- `dateShort(value)` - Short date format
- `time(value)` - Time format
- `number(value)` - Number format
- `currency(value)` - Currency (XOF)
- `percent(value)` - Percentage

```typescript
const LL = useTranslations()

<p>{LL.formatters.date(new Date())}</p>
<p>{LL.formatters.currency(1000)}</p>
<p>{LL.formatters.percent(75)}</p>
```

## Configuration

`.typesafe-i18n.json`:
```json
{
  "baseLocale": "fr",
  "outputPath": "./src/i18n",
  "esmImports": true
}
```

## Scripts

```bash
# Generate types (watch mode)
npm run typesafe-i18n

# Type check
npm run typecheck

# Lint
npm run lint
```

## Documentation

- [Full Usage Guide](./TYPESAFE_I18N_GUIDE.md)
- [Migration Guide](../../TYPESAFE_I18N_MIGRATION.md)
- [typesafe-i18n Docs](https://github.com/ivanhofer/typesafe-i18n)
