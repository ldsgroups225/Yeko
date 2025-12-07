---
inclusion: fileMatch
fileMatchPattern: "**/i18n/**/*"
description: i18next configuration, translation patterns, and localization standards
---

# Internationalization Guide for Yeko

## Configuration

Default language: French (fr)
Supported languages: French, English

```typescript
// apps/core/src/i18n/config.ts
i18n.init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  fallbackLng: 'fr',
  lng: 'fr',
  supportedLngs: ['fr', 'en'],
})
```

## Translation File Structure

```
apps/core/src/i18n/locales/
  fr.ts    # French translations (default)
  en.ts    # English translations
```

### Translation Object Structure
```typescript
// locales/fr.ts
export const fr = {
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    search: 'Rechercher',
    loading: 'Chargement...',
    noResults: 'Aucun résultat',
    actions: 'Actions',
  },
  
  navigation: {
    dashboard: 'Tableau de bord',
    schools: 'Écoles',
    catalogs: 'Catalogues',
    programs: 'Programmes',
    analytics: 'Analytiques',
    settings: 'Paramètres',
  },
  
  schools: {
    title: 'Gestion des écoles',
    create: 'Créer une école',
    edit: 'Modifier l\'école',
    name: 'Nom',
    code: 'Code',
    status: 'Statut',
    address: 'Adresse',
    phone: 'Téléphone',
    email: 'Email',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer {{name}} ?',
    created: 'École créée avec succès',
    updated: 'École mise à jour',
    deleted: 'École supprimée',
  },
  
  status: {
    active: 'Actif',
    inactive: 'Inactif',
    suspended: 'Suspendu',
    draft: 'Brouillon',
    published: 'Publié',
    archived: 'Archivé',
  },
  
  errors: {
    required: 'Ce champ est requis',
    invalidEmail: 'Email invalide',
    createFailed: 'Échec de la création',
    updateFailed: 'Échec de la mise à jour',
    deleteFailed: 'Échec de la suppression',
    loadFailed: 'Échec du chargement',
    unauthorized: 'Non autorisé',
  },
  
  validation: {
    minLength: 'Minimum {{count}} caractères',
    maxLength: 'Maximum {{count}} caractères',
    unique: 'Cette valeur existe déjà',
  },
}
```

## Usage in Components

### Basic Translation
```typescript
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('schools.title')}</h1>
      <Button>{t('common.save')}</Button>
    </div>
  )
}
```

### With Interpolation
```typescript
// Translation: "Êtes-vous sûr de vouloir supprimer {{name}} ?"
<p>{t('schools.confirmDelete', { name: school.name })}</p>

// Translation: "Minimum {{count}} caractères"
<p>{t('validation.minLength', { count: 3 })}</p>
```

### Pluralization
```typescript
// Translation file
{
  items: {
    count_one: '{{count}} élément',
    count_other: '{{count}} éléments',
  }
}

// Usage
<p>{t('items.count', { count: items.length })}</p>
// Output: "1 élément" or "5 éléments"
```

### Nested Keys
```typescript
// Access nested translations
{t('navigation.dashboard')}
{t('errors.createFailed')}
{t('status.active')}
```

## Language Switcher

```typescript
import { useTranslation } from 'react-i18next'

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('i18nextLng', lng)
  }
  
  return (
    <Select value={i18n.language} onValueChange={changeLanguage}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

## Adding New Translations

1. Add key to French file first (default language)
2. Add corresponding key to English file
3. Use the key in component with `t('key.path')`

### Checklist for New Features
- [ ] All UI text uses `t()` function
- [ ] Keys added to both fr.ts and en.ts
- [ ] Keys follow naming convention (feature.action)
- [ ] Interpolation used for dynamic values
- [ ] Error messages translated

## Date/Number Formatting

```typescript
// Use Intl for date formatting
const formatDate = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)

// Usage
const { i18n } = useTranslation()
formatDate(new Date(), i18n.language) // "7 décembre 2025" or "December 7, 2025"
```
