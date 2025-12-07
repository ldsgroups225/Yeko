---
inclusion: fileMatch
fileMatchPattern: "**/functions/**/*.ts"
description: TanStack Start server functions, API patterns, and React Query integration
---

# API & Server Function Patterns for Yeko

## TanStack Start Server Functions

### Basic Server Function
```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSchools as querySchools } from '@repo/data-ops/queries/schools'

export const getSchools = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      status: z.enum(['active', 'inactive', 'suspended']).optional(),
      search: z.string().optional(),
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
    })
  )
  .handler(async ({ data }) => {
    return await querySchools(data)
  })
```

### POST/Mutation Server Function
```typescript
import { createServerFn } from '@tanstack/react-start'
import { schoolSchema } from '@/schemas/school'
import { insertSchool } from '@repo/data-ops/queries/schools'

export const createSchool = createServerFn({ method: 'POST' })
  .validator(schoolSchema)
  .handler(async ({ data }) => {
    const school = await insertSchool(data)
    return { success: true, data: school }
  })
```

### Server Function with Auth
```typescript
import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { auth } from '@repo/data-ops/auth/server'

export const getProtectedData = createServerFn({ method: 'GET' })
  .handler(async () => {
    const request = getWebRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      throw new Error('Unauthorized')
    }
    
    return await fetchProtectedData(session.user.id)
  })
```

## File Organization

```
apps/core/src/core/
  functions/
    schools.ts      # School-related server functions
    programs.ts     # Program server functions
    coefficients.ts # Coefficient server functions
    analytics.ts    # Analytics server functions
  middleware/
    activity-logger.ts  # Request logging
```

## Error Handling

```typescript
export const updateSchool = createServerFn({ method: 'POST' })
  .validator(updateSchoolSchema)
  .handler(async ({ data }) => {
    try {
      const school = await updateSchoolQuery(data)
      return { success: true, data: school }
    } catch (error) {
      if (error instanceof Error) {
        // Log error for debugging
        console.error('Update school failed:', error.message)
        
        // Return user-friendly error
        return {
          success: false,
          error: 'Failed to update school',
        }
      }
      throw error
    }
  })
```

## React Query Integration

### Query Options Factory
```typescript
// integrations/tanstack-query/schools-options.ts
import { queryOptions } from '@tanstack/react-query'
import { getSchools, getSchoolById } from '@/core/functions/schools'

export const schoolsQueryOptions = (params?: {
  status?: string
  search?: string
  page?: number
}) =>
  queryOptions({
    queryKey: ['schools', params],
    queryFn: () => getSchools(params ?? {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

export const schoolQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['school', id],
    queryFn: () => getSchoolById({ id }),
    enabled: !!id,
  })
```

### Using in Components
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolsQueryOptions } from '@/integrations/tanstack-query/schools-options'
import { createSchool, deleteSchool } from '@/core/functions/schools'

function SchoolsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(schoolsQueryOptions())
  
  const createMutation = useMutation({
    mutationFn: createSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] })
    },
  })
  
  const deleteMutation = useMutation({
    mutationFn: deleteSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] })
    },
  })
}
```

## Validation Schemas

```typescript
// schemas/school.ts
import { z } from 'zod'

export const schoolSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
})

export type SchoolInput = z.infer<typeof schoolSchema>

export const updateSchoolSchema = schoolSchema.extend({
  id: z.string(),
})
```

## Bulk Operations

```typescript
export const bulkUpdateCoefficients = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      updates: z.array(
        z.object({
          id: z.string(),
          weight: z.number().min(0).max(20),
        })
      ),
    })
  )
  .handler(async ({ data }) => {
    // Use transaction for bulk updates
    await db.transaction(async (tx) => {
      for (const update of data.updates) {
        await tx
          .update(coefficientTemplates)
          .set({ weight: update.weight })
          .where(eq(coefficientTemplates.id, update.id))
      }
    })
    
    return { success: true, count: data.updates.length }
  })
```
