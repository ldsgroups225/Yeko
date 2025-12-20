---
inclusion: fileMatch
fileMatchPattern: "**/i18n/**/*"
description: Typesafe i18n configuration, translation patterns, and localization standards
---

# Internationalization Guide for Yeko (Typesafe Edition)

> **Key Reminder**  
> Typesafe-i18n generation is already running in watch mode. **Never run `npx typesafe-i18n` manually.** Edits to translation files will be picked up automatically.

## Configuration Overview

- Default language: **French (`fr`)**
- Supported languages: **French, English**
- Translation tooling: **[typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)** with generated helpers and typed keys.
- Import point: `import { useTranslations } from '@/i18n'`

### Generated File Layout

```
apps/<app>/src/i18n/
  fr/index.ts          # French translations (default, typed)
  en/index.ts          # English translations
  formatters.ts        # shared formatter helpers
  i18n-types.ts        # generated types (do not edit)
  i18n-util*.ts        # generated runtime helpers (do not edit)
  i18n-react.tsx       # typed hooks/providers for React
```

> **Do not edit generated files.** Only adjust `en/index.ts`, `fr/index.ts`, and the modular translation object; the watcher will regenerate the rest.

## Using Typed Translations in React

```typescript
import { useTranslations } from '@/i18n'

function Component() {
  const t = useTranslations()
  
  return (
    <div>
      <h1>{t.schools.title()}</h1>
      <Button>{t.common.save()}</Button>
    </div>
  )
}
```

### Access Rules

1. **Only call existing typed functions.** If `t.settings.notifications` is typed as a function, call it as `t.settings.notifications()` — it isn’t an object with `title`.
2. **No dynamic key strings.** Replace `t(\`students.status.${status}\`)` with a `switch` or pre-mapped object referencing typed helpers.
3. **Pass required params explicitly.**

```typescript
// t.classes.deleteConfirmDescription expects { name: string }
<p>{t.classes.deleteConfirmDescription({ name: classroom.name })}</p>
```

### Strongly-Typed Switches

```typescript
const statusLabel = (status: Student['status']) => {
  switch (status) {
    case 'active':
      return t.students.status.active()
    case 'inactive':
      return t.students.status.inactive()
    default:
      return status // fallback string only if no typed key exists
  }
}
```

## Adding / Updating Keys

1. **Add to `fr/index.ts`** – this drives the contract.
2. Run (or wait for) the typesafe watcher to regenerate `i18n-types.ts`.
3. Add to `en/index.ts` once the typing exists.
4. Update React usage by calling the new typed function/property.

### Checklist for New Features
- [ ] `fr/index.ts` contains the new key with correct namespace.
- [ ] `en/index.ts` replicates the structure (or fallback).
- [ ] React components call typed functions (`t.namespace.key()`).
- [ ] Dynamic variations handled through typed unions / switches.
- [ ] Delete strings or fallback plain text **only** when a key truly doesn’t exist in contract.

## Formatting & Utilities

- Add locale-aware helpers to `formatters.ts`. They are imported into the generated translator.
- Prefer `Intl.DateTimeFormat` / `Intl.NumberFormat` using `locale` from the hook.

## Common Pitfalls

1. **Treating translator as callable** – never `t('path')`; always `t.namespace.key()`.
2. **Incorrect namespaces** – match `i18n-types.ts` exactly (e.g., `t.spaces.classroom`, not `t.spaces.classrooms`).
3. **Missing params** – fix TypeScript errors instead of ignoring them.
4. **Dynamic template literals** – convert to typed switches to keep Fast Refresh working.
5. **Editing generated files** – regenerate via watcher; do not hand-edit `i18n-types.ts`.

## Language Switcher Contract

- `LanguageProvider` is created in `i18n-react.tsx`.
- Use the provided `useCurrentLocale()` / `setLocale()` helpers to change language.
- Persisted preference lives in local storage; always update both storage and provider.

```typescript
const { locale, setLocale } = useLocaleContext()
setLocale('fr') // triggers lazy loading via typesafe runtime helpers
```

---

Keep this guide aligned with the current `typesafe-i18n` contract whenever translations or namespaces change. When major migrations occur (e.g., moving keys from `t.parents` to `t.students`), update this document immediately so the steering hints stay accurate.
