---
inclusion: fileMatch
fileMatchPattern: "**/routes/**/*.tsx"
description: TanStack Router patterns, file-based routing, and navigation standards
---

# Routing & Navigation for Yeko

## TanStack Router (File-Based)

### Route File Structure
```
apps/core/src/routes/
  __root.tsx           # Root layout
  index.tsx            # Landing page (/)
  demo-request.tsx     # /demo-request
  _auth/               # Auth layout group
    app/               # /app routes
      index.tsx        # /app (dashboard)
      schools.tsx      # /app/schools
      schools.$schoolId.tsx  # /app/schools/:schoolId
      catalogs/
        index.tsx      # /app/catalogs
        programs.tsx   # /app/catalogs/programs
        coefficients.tsx
      analytics.tsx    # /app/analytics
  api/                 # API routes
    auth.$.ts          # /api/auth/*
```

### Route Component Pattern
```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/schools')({
  component: SchoolsPage,
  loader: async () => {
    // Prefetch data
    return { schools: await getSchools() }
  },
})

function SchoolsPage() {
  const { schools } = Route.useLoaderData()
  return <SchoolsList initialData={schools} />
}
```

### Dynamic Routes
```typescript
// schools.$schoolId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/schools/$schoolId')({
  component: SchoolDetailPage,
  loader: async ({ params }) => {
    return { school: await getSchoolById({ id: params.schoolId }) }
  },
})

function SchoolDetailPage() {
  const { schoolId } = Route.useParams()
  const { school } = Route.useLoaderData()
  // ...
}
```

### Layout Routes
```typescript
// _auth.tsx - Protected layout
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Header />
        <Outlet />
      </main>
    </div>
  )
}
```

## Navigation

### Link Component
```typescript
import { Link } from '@tanstack/react-router'

// Basic link
<Link to="/app/schools">{t('navigation.schools')}</Link>

// With params
<Link to="/app/schools/$schoolId" params={{ schoolId: school.id }}>
  {school.name}
</Link>

// With search params
<Link to="/app/schools" search={{ status: 'active' }}>
  {t('schools.activeOnly')}
</Link>

// Active state styling
<Link
  to="/app/schools"
  className="text-muted-foreground"
  activeProps={{ className: 'text-foreground font-medium' }}
>
  {t('navigation.schools')}
</Link>
```

### Programmatic Navigation
```typescript
import { useNavigate, useRouter } from '@tanstack/react-router'

function Component() {
  const navigate = useNavigate()
  const router = useRouter()
  
  // Navigate to route
  const handleClick = () => {
    navigate({ to: '/app/schools/$schoolId', params: { schoolId: '123' } })
  }
  
  // Go back
  const handleBack = () => {
    router.history.back()
  }
  
  // Replace current route
  const handleReplace = () => {
    navigate({ to: '/app/schools', replace: true })
  }
}
```

### Search Params
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  search: z.string().optional(),
  page: z.number().optional().default(1),
})

export const Route = createFileRoute('/_auth/app/schools')({
  validateSearch: searchSchema,
  component: SchoolsPage,
})

function SchoolsPage() {
  const { status, search, page } = Route.useSearch()
  const navigate = useNavigate()
  
  // Update search params
  const setStatus = (newStatus: string) => {
    navigate({
      search: (prev) => ({ ...prev, status: newStatus, page: 1 }),
    })
  }
}
```

## Breadcrumbs

```typescript
import { useMatches } from '@tanstack/react-router'

function Breadcrumbs() {
  const matches = useMatches()
  const { t } = useTranslation()
  
  const breadcrumbs = matches
    .filter(match => match.context?.breadcrumb)
    .map(match => ({
      label: t(match.context.breadcrumb),
      path: match.pathname,
    }))
  
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {index === breadcrumbs.length - 1 ? (
              <span>{crumb.label}</span>
            ) : (
              <Link to={crumb.path}>{crumb.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

## Error Handling

```typescript
// Route error boundary
export const Route = createFileRoute('/_auth/app/schools')({
  component: SchoolsPage,
  errorComponent: SchoolsError,
  pendingComponent: SchoolsLoading,
})

function SchoolsError({ error }: { error: Error }) {
  const { t } = useTranslation()
  return (
    <div className="p-4">
      <h2>{t('errors.loadFailed')}</h2>
      <p>{error.message}</p>
      <Button onClick={() => window.location.reload()}>
        {t('common.retry')}
      </Button>
    </div>
  )
}
```

## API Routes

```typescript
// routes/api/schools.ts
import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/schools')({
  GET: async ({ request }) => {
    const schools = await getSchools()
    return json(schools)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const school = await createSchool(body)
    return json(school, { status: 201 })
  },
})
```
