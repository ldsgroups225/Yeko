---
inclusion: fileMatch
fileMatchPattern: "**/components/**/*.tsx"
description: shadcn/ui design system, component patterns, and accessibility standards
---

# UI Design Standards for Yeko

## Design System

### shadcn/ui Configuration
- Style: new-york
- Base color: zinc
- CSS variables enabled
- Icon library: Lucide React

### Color Palette (CSS Variables)
```css
/* Light mode */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--primary: 240 5.9% 10%;
--secondary: 240 4.8% 95.9%;
--muted: 240 4.8% 95.9%;
--accent: 240 4.8% 95.9%;
--destructive: 0 84.2% 60.2%;

/* Dark mode */
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
```

## Component Patterns

### Card Layout
```typescript
<Card>
  <CardHeader>
    <CardTitle>{t('schools.title')}</CardTitle>
    <CardDescription>{t('schools.description')}</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="outline">{t('common.cancel')}</Button>
    <Button>{t('common.save')}</Button>
  </CardFooter>
</Card>
```

### Data Table
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>{t('schools.name')}</TableHead>
      <TableHead>{t('schools.status')}</TableHead>
      <TableHead className="text-right">{t('common.actions')}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {schools.map(school => (
      <TableRow key={school.id}>
        <TableCell>{school.name}</TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(school.status)}>
            {t(`status.${school.status}`)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <ActionButtons school={school} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Form Layout
```typescript
<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
  <div className="grid gap-4 md:grid-cols-2">
    <div className="space-y-2">
      <Label htmlFor="name">{t('schools.name')}</Label>
      <Input id="name" {...form.register('name')} />
      {form.formState.errors.name && (
        <p className="text-sm text-destructive">
          {form.formState.errors.name.message}
        </p>
      )}
    </div>
    {/* More fields */}
  </div>
  
  <div className="flex justify-end gap-2">
    <Button type="button" variant="outline" onClick={onCancel}>
      {t('common.cancel')}
    </Button>
    <Button type="submit" disabled={form.formState.isSubmitting}>
      {form.formState.isSubmitting ? t('common.saving') : t('common.save')}
    </Button>
  </div>
</form>
```

## Status Badges

```typescript
function getStatusVariant(status: string) {
  switch (status) {
    case 'active': return 'default'
    case 'inactive': return 'secondary'
    case 'suspended': return 'destructive'
    case 'draft': return 'outline'
    case 'published': return 'default'
    default: return 'secondary'
  }
}

<Badge variant={getStatusVariant(status)}>
  {t(`status.${status}`)}
</Badge>
```

## Loading States

### Skeleton Patterns
```typescript
// Card skeleton
function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}

// Table skeleton
function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
```

## Responsive Design

### Breakpoints
```typescript
// Mobile first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// Hide on mobile
<div className="hidden md:block">Desktop only</div>

// Show on mobile
<div className="md:hidden">Mobile only</div>
```

### Sidebar Layout
```typescript
<div className="flex min-h-screen">
  <Sidebar className="hidden lg:flex" />
  <MobileSidebar className="lg:hidden" />
  <main className="flex-1 p-4 lg:p-6">
    {children}
  </main>
</div>
```

## Animations

### Motion Patterns
```typescript
import { motion, AnimatePresence } from 'motion/react'

// List animations
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

// Page transitions
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  <PageContent />
</motion.div>
```

## Accessibility

### Required Attributes
```typescript
// Icon buttons need aria-label
<Button variant="ghost" size="icon" aria-label={t('common.delete')}>
  <Trash2 className="h-4 w-4" />
</Button>

// Form inputs need labels
<Label htmlFor="email">{t('form.email')}</Label>
<Input id="email" type="email" aria-describedby="email-error" />
<p id="email-error" className="text-destructive">{error}</p>

// Dialogs need proper structure
<Dialog>
  <DialogTrigger asChild>
    <Button>{t('common.open')}</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{t('dialog.title')}</DialogTitle>
      <DialogDescription>{t('dialog.description')}</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

## Toast Notifications

```typescript
import { toast } from 'sonner'

// Success
toast.success(t('schools.created'))

// Error
toast.error(t('errors.createFailed'))

// With description
toast.success(t('schools.created'), {
  description: t('schools.createdDescription'),
})

// Loading state
const promise = createSchool(data)
toast.promise(promise, {
  loading: t('common.saving'),
  success: t('schools.created'),
  error: t('errors.createFailed'),
})
```
