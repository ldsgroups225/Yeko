# Migration Guide: Adding i18n to Existing Components

This guide helps you migrate existing components to use i18n translations.

## Quick Migration Steps

### 1. Import the hook

```tsx
// Add this import at the top of your component
import { useTranslation } from 'react-i18next';
```

### 2. Use the hook in your component

```tsx
export function MyComponent() {
  // Add this line at the beginning of your component
  const { t } = useTranslation();
  
  // ... rest of your component
}
```

### 3. Replace hardcoded text with translation keys

```tsx
// Before
<h1>Modernize Your School</h1>

// After
<h1>{t('hero.title')}</h1>
```

## Example Migration

### Before (Hardcoded Text)

```tsx
import { Button } from "@/components/ui/button";

export function PricingCard() {
  return (
    <div>
      <h2>Professional Plan</h2>
      <p>For growing schools</p>
      <Button>Get Started</Button>
    </div>
  );
}
```

### After (With i18n)

```tsx
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

export function PricingCard() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('pricing.plans.professional.name')}</h2>
      <p>{t('pricing.plans.professional.description')}</p>
      <Button>{t('pricing.cta')}</Button>
    </div>
  );
}
```

## Components to Migrate

Here's a checklist of components that should be migrated:

### Landing Page Components

- [x] `hero-section.tsx` - ✅ Already migrated
- [ ] `social-proof-section.tsx`
- [ ] `use-cases-section.tsx`
- [ ] `pain-points-section.tsx`
- [ ] `why-yeko-section.tsx`
- [ ] `how-it-works-section.tsx`
- [ ] `benefits-section.tsx`
- [ ] `pricing-section.tsx`
- [ ] `testimonials-section.tsx`
- [ ] `faq-section.tsx`
- [ ] `cta-section.tsx`
- [ ] `footer.tsx`

### Navigation Components

- [x] `navigation-bar.tsx` - ✅ Language switcher added

### Auth Components

- [ ] `account-dialog.tsx`
- [ ] Login/Signup forms

### Dashboard Components

- [ ] All dashboard components

## Common Patterns

### Pattern 1: Simple Text Replacement

```tsx
// Before
<p>Welcome to Yeko</p>

// After
<p>{t('welcome.message')}</p>
```

### Pattern 2: Text with Variables

```tsx
// Before
<p>Welcome, {userName}!</p>

// After
<p>{t('welcome.greeting', { name: userName })}</p>

// In translation file:
// welcome: { greeting: 'Bienvenue, {{name}}!' }
```

### Pattern 3: Lists/Arrays

```tsx
// Before
const features = ['Feature 1', 'Feature 2', 'Feature 3'];

// After
const { t } = useTranslation();
const features = [
  t('features.feature1'),
  t('features.feature2'),
  t('features.feature3'),
];
```

### Pattern 4: Button Text

```tsx
// Before
<Button>Click Me</Button>

// After
<Button>{t('common.clickMe')}</Button>
```

### Pattern 5: Placeholder Text

```tsx
// Before
<input placeholder="Enter your email" />

// After
<input placeholder={t('form.emailPlaceholder')} />
```

### Pattern 6: Alt Text for Images

```tsx
// Before
<img src="/logo.png" alt="Company Logo" />

// After
<img src="/logo.png" alt={t('common.logoAlt')} />
```

## Step-by-Step Component Migration

### Step 1: Identify all text content

Go through your component and mark all hardcoded text:
- Headings
- Paragraphs
- Button labels
- Placeholder text
- Alt text
- Error messages
- Success messages

### Step 2: Create translation keys

Add the translations to both `locales/fr.ts` and `locales/en.ts`:

```typescript
// In fr.ts
export const fr = {
  myComponent: {
    title: 'Mon Titre',
    description: 'Ma Description',
    button: 'Cliquer Ici',
  },
};

// In en.ts
export const en = {
  myComponent: {
    title: 'My Title',
    description: 'My Description',
    button: 'Click Here',
  },
};
```

### Step 3: Update the component

```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('myComponent.title')}</h1>
      <p>{t('myComponent.description')}</p>
      <button>{t('myComponent.button')}</button>
    </div>
  );
}
```

### Step 4: Test both languages

1. Run the app: `pnpm dev`
2. Switch between French and English using the language switcher
3. Verify all text displays correctly in both languages

## Tips for Efficient Migration

1. **Start with high-visibility components** (landing page, navigation)
2. **Migrate one component at a time** to avoid overwhelming changes
3. **Test immediately after migration** to catch issues early
4. **Use consistent naming** for translation keys
5. **Group related translations** under the same namespace
6. **Keep the translation files in sync** - always update both fr.ts and en.ts

## Handling Edge Cases

### Dynamic Content

```tsx
// For content that comes from API/database
const { t, i18n } = useTranslation();
const content = apiData[i18n.language] || apiData.fr;
```

### Conditional Text

```tsx
const { t } = useTranslation();
const statusText = isActive 
  ? t('status.active') 
  : t('status.inactive');
```

### Formatted Dates

```tsx
const { i18n } = useTranslation();
const formattedDate = new Date().toLocaleDateString(i18n.language);
```

## Validation Checklist

After migrating a component, verify:

- [ ] All visible text is translated
- [ ] Both French and English versions display correctly
- [ ] No console errors related to missing translation keys
- [ ] Component still functions as expected
- [ ] Styling is not broken by translated text (some languages may be longer)
- [ ] Accessibility attributes (aria-label, etc.) are also translated

## Need Help?

- Check `USAGE_EXAMPLES.md` for more examples
- Review `README.md` for general i18n documentation
- Look at `hero-section.tsx` for a complete migration example
