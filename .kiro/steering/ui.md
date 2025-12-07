---
inclusion: manual
description: UI design system, component patterns, and visual design standards for creating beautiful interfaces
---

# UI Designer Agent Steering

Use this guide when you need expert UI design assistance: `#ui`

## When to Use the UI Designer Agent

- Component design and creation
- Design system development
- Visual consistency
- Accessibility compliance
- Design system documentation
- Design-to-code handoff

## Design System for Yeko

### shadcn/ui Configuration
- **Style**: new-york
- **Base Color**: zinc
- **CSS Variables**: Enabled
- **Icons**: Lucide React

### Color Palette
```css
/* Light Mode */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--primary: 240 5.9% 10%;
--secondary: 240 4.8% 95.9%;
--muted: 240 4.8% 95.9%;
--accent: 240 4.8% 95.9%;
--destructive: 0 84.2% 60.2%;

/* Dark Mode */
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
```

## Component Design Patterns

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
  </div>
  <div className="flex justify-end gap-2">
    <Button type="button" variant="outline">
      {t('common.cancel')}
    </Button>
    <Button type="submit">
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
```

## Loading States

### Skeleton Patterns
```typescript
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

## Accessibility Requirements

- Use semantic HTML elements
- Include aria-labels for icon buttons
- Ensure keyboard navigation works
- Use proper heading hierarchy
- Test with screen readers

```typescript
<Button 
  variant="ghost" 
  size="icon" 
  aria-label={t('common.delete')}
>
  <Trash2 className="h-4 w-4" />
</Button>
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
```

## Design Deliverables

- Component specifications
- Design tokens
- Interaction guidelines
- Accessibility annotations
- Implementation notes
- Asset packages
- Figma component library
- Developer handoff documentation

## Integration with Other Agents

- **UX Researcher**: Provides user insights
- **Frontend Developer**: Implements designs
- **QA Expert**: Tests visual aspects
- **Accessibility Tester**: Validates compliance
