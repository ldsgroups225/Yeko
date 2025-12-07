---
inclusion: fileMatch
fileMatchPattern: "**/*.tsx"
description: React component development standards, shadcn/ui patterns, and state management
---

# React Component Standards for Yeko

## Component Structure

### File Organization
```
components/
  schools/
    school-card.tsx       # Single component per file
    school-list.tsx
    school-form.tsx
    index.ts              # Re-exports
  ui/
    button.tsx            # shadcn/ui primitives
    card.tsx
```

### Component Template
```typescript
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export function Component({ className, children }: ComponentProps) {
  const { t } = useTranslation()
  
  return (
    <div className={cn('base-styles', className)}>
      {children}
    </div>
  )
}
```

## shadcn/ui Usage

### Import from @/components/ui
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
```

### Button Variants
```typescript
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Icon /></Button>
```

### Form Pattern with React Hook Form
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<SchoolInput>({
  resolver: zodResolver(schoolSchema),
  defaultValues: { name: '', code: '', status: 'active' },
})

<form onSubmit={form.handleSubmit(onSubmit)}>
  <Input {...form.register('name')} />
  {form.formState.errors.name && (
    <span className="text-destructive text-sm">
      {form.formState.errors.name.message}
    </span>
  )}
</form>
```

## State Management

### TanStack Query for Server State
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolsQueryOptions } from '@/integrations/tanstack-query/schools-options'

function SchoolList() {
  const { data, isLoading, error } = useQuery(schoolsQueryOptions())
  
  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />
  
  return <div>{data?.map(school => <SchoolCard key={school.id} school={school} />)}</div>
}
```

### Mutations with Optimistic Updates
```typescript
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: createSchool,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['schools'] })
    toast.success(t('schools.created'))
  },
  onError: (error) => {
    toast.error(t('errors.createFailed'))
  },
})
```

### Local State
```typescript
// Simple state
const [isOpen, setIsOpen] = useState(false)

// Debounced search
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 500)
```

## Internationalization

### Always Use useTranslation
```typescript
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('schools.title')}</h1>
      <p>{t('schools.description', { count: 10 })}</p>
    </div>
  )
}
```

### Translation Key Structure
```json
{
  "schools": {
    "title": "Écoles",
    "create": "Créer une école",
    "edit": "Modifier",
    "delete": "Supprimer",
    "confirmDelete": "Êtes-vous sûr de vouloir supprimer {{name}} ?"
  },
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "loading": "Chargement..."
  }
}
```

## Loading & Error States

### Skeleton Loading
```typescript
import { Skeleton } from '@/components/ui/skeleton'

function SchoolCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardContent>
    </Card>
  )
}
```

### Error Boundaries
```typescript
import { ErrorBoundary } from '@/components/error-boundary'

<ErrorBoundary fallback={<ErrorFallback />}>
  <SchoolList />
</ErrorBoundary>
```

## Animations with Motion

```typescript
import { motion, AnimatePresence } from 'motion/react'

<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <ItemCard item={item} />
    </motion.div>
  ))}
</AnimatePresence>
```

## Accessibility

- Use semantic HTML elements
- Include aria-labels for icon buttons
- Ensure keyboard navigation works
- Use proper heading hierarchy
- Test with screen readers

```typescript
<Button variant="ghost" size="icon" aria-label={t('common.delete')}>
  <Trash2 className="h-4 w-4" />
</Button>
```
