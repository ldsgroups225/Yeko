# i18n Usage Examples

## Basic Translation

```tsx
import { useTranslation } from 'react-i18next';

function WelcomeMessage() {
  const { t } = useTranslation();
  
  return <h1>{t('hero.title')}</h1>;
}
```

## Translation with Variables (Interpolation)

```tsx
// In your translation file
export const fr = {
  welcome: 'Bienvenue, {{name}}!',
};

// In your component
function Greeting({ userName }: { userName: string }) {
  const { t } = useTranslation();
  
  return <p>{t('welcome', { name: userName })}</p>;
}
```

## Pluralization

```tsx
// In your translation file
export const fr = {
  itemCount: '{{count}} élève',
  itemCount_plural: '{{count}} élèves',
};

// In your component
function StudentCount({ count }: { count: number }) {
  const { t } = useTranslation();
  
  return <p>{t('itemCount', { count })}</p>;
}
```

## Accessing Current Language

```tsx
import { useTranslation } from 'react-i18next';

function LanguageInfo() {
  const { i18n } = useTranslation();
  
  return (
    <div>
      <p>Current language: {i18n.language}</p>
      <p>Is French: {i18n.language === 'fr' ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Changing Language

```tsx
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

function LanguageToggle() {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };
  
  return (
    <Button onClick={toggleLanguage}>
      Switch to {i18n.language === 'fr' ? 'English' : 'Français'}
    </Button>
  );
}
```

## Translation in Arrays

```tsx
import { useTranslation } from 'react-i18next';

function FeatureList() {
  const { t } = useTranslation();
  
  const features = [
    t('whyYeko.features.allInOne.title'),
    t('whyYeko.features.easyToUse.title'),
    t('whyYeko.features.secure.title'),
    t('whyYeko.features.support.title'),
  ];
  
  return (
    <ul>
      {features.map((feature, index) => (
        <li key={index}>{feature}</li>
      ))}
    </ul>
  );
}
```

## Conditional Translation

```tsx
import { useTranslation } from 'react-i18next';

function StatusMessage({ isSuccess }: { isSuccess: boolean }) {
  const { t } = useTranslation();
  
  return (
    <div>
      {isSuccess ? t('common.success') : t('common.error')}
    </div>
  );
}
```

## Translation with HTML

```tsx
import { useTranslation } from 'react-i18next';

function RichTextContent() {
  const { t } = useTranslation();
  
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: t('richContent.description') 
      }} 
    />
  );
}
```

## Using Trans Component for Complex Content

```tsx
import { Trans, useTranslation } from 'react-i18next';

// In translation file:
// termsAgreement: 'I agree to the <1>Terms of Service</1> and <3>Privacy Policy</3>'

function TermsCheckbox() {
  return (
    <label>
      <Trans i18nKey="termsAgreement">
        I agree to the 
        <a href="/terms">Terms of Service</a> 
        and 
        <a href="/privacy">Privacy Policy</a>
      </Trans>
    </label>
  );
}
```

## Namespace Usage (for large apps)

```tsx
// If you organize translations by namespace
import { useTranslation } from 'react-i18next';

function DashboardComponent() {
  const { t } = useTranslation('dashboard');
  
  return <h1>{t('title')}</h1>;
}
```

## Loading State

```tsx
import { useTranslation } from 'react-i18next';

function LoadingComponent() {
  const { t, ready } = useTranslation();
  
  if (!ready) {
    return <div>Loading translations...</div>;
  }
  
  return <div>{t('content')}</div>;
}
```

## Server-Side Translation (if needed)

```tsx
import i18n from '@/i18n/config';

// In a server function or API route
async function getServerSideTranslation() {
  const translation = i18n.t('hero.title', { lng: 'fr' });
  return translation;
}
```

## Testing Components with Translations

```tsx
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

function renderWithI18n(component: ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
}

// Usage in tests
test('renders translated text', () => {
  const { getByText } = renderWithI18n(<MyComponent />);
  expect(getByText('Modernisez Votre École')).toBeInTheDocument();
});
```

## Best Practices

1. **Always provide fallback text**:
   ```tsx
   {t('key', 'Fallback text if key is missing')}
   ```

2. **Use constants for repeated keys**:
   ```tsx
   const TRANSLATION_KEYS = {
     TITLE: 'hero.title',
     DESCRIPTION: 'hero.description',
   } as const;
   
   {t(TRANSLATION_KEYS.TITLE)}
   ```

3. **Keep translation keys organized**:
   - Use dot notation for nesting
   - Group related translations
   - Use descriptive names

4. **Handle missing translations gracefully**:
   ```tsx
   const { t, i18n } = useTranslation();
   const text = i18n.exists('key') ? t('key') : 'Default text';
   ```

5. **Avoid inline translations**:
   ```tsx
   // ❌ Bad
   <button>{i18n.language === 'fr' ? 'Cliquer' : 'Click'}</button>
   
   // ✅ Good
   <button>{t('common.click')}</button>
   ```
