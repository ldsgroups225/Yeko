---
inclusion: fileMatch
fileMatchPattern: "**/*.{ts,tsx}"
description: TypeScript best practices, type patterns, and compiler configuration for Yeko
---

# TypeScript Standards for Yeko

## Compiler Configuration

The project uses strict TypeScript with these key settings:
- `strict: true` - All strict checks enabled
- `noUncheckedIndexedAccess: true` - Safe array/object access
- `noUnusedLocals: true` - No unused variables
- `noUnusedParameters: true` - No unused parameters
- Target: ES2022, Module: ESNext

## Type Patterns

### Prefer Type Inference
```typescript
// ✅ Good - let TypeScript infer
const schools = await getSchools()
const [isOpen, setIsOpen] = useState(false)

// ❌ Avoid - unnecessary explicit types
const schools: School[] = await getSchools()
const [isOpen, setIsOpen] = useState<boolean>(false)
```

### Use Zod for Runtime Validation
```typescript
import { z } from 'zod'

// Define schema
export const schoolSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  status: z.enum(['active', 'inactive', 'suspended']),
  email: z.string().email().optional(),
})

// Infer type from schema
export type SchoolInput = z.infer<typeof schoolSchema>
```

### Drizzle ORM Types
```typescript
// Use $inferSelect for query results
type School = typeof schools.$inferSelect

// Use $inferInsert for insert operations
type SchoolInsert = typeof schools.$inferInsert

// Create data types without auto-generated fields
type SchoolData = Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>
```

### Server Function Types
```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Input validation schema
const createSchoolSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  status: z.enum(['active', 'inactive']),
})

export const createSchool = createServerFn({ method: 'POST' })
  .validator(createSchoolSchema)
  .handler(async ({ data }) => {
    // data is automatically typed from validator
    try {
      const result = await insertSchool(data)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: 'Failed to create school' }
    }
  })

// Type-safe response handling
type ServerFnResult<T> = { success: true; data: T } | { success: false; error: string }
```

### React Component Props
```typescript
// Use interface for component props
interface SchoolCardProps {
  school: School
  onEdit?: (id: string) => void
  className?: string
}

// Destructure with defaults
export function SchoolCard({ school, onEdit, className }: SchoolCardProps) {
  // ...
}
```

### Generic Patterns
```typescript
// Pagination response type
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Query options factory
export function createQueryOptions<T>(
  key: string[],
  fn: () => Promise<T>,
  staleTime = 5 * 60 * 1000
) {
  return queryOptions({ queryKey: key, queryFn: fn, staleTime })
}
```

## Import Organization

```typescript
// 1. React/Framework imports
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. External libraries
import { z } from 'zod'
import { motion } from 'motion/react'

// 3. Internal aliases (@/)
import { Button } from '@/components/ui/button'
import { schoolsQueryOptions } from '@/integrations/tanstack-query/schools-options'

// 4. Relative imports
import { SchoolCard } from './school-card'
```

## Enum Alternatives

Prefer union types over enums:
```typescript
// ✅ Good - union type
type SchoolStatus = 'active' | 'inactive' | 'suspended'
type SubjectCategory = 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'

// ❌ Avoid - TypeScript enum
enum SchoolStatus {
  Active = 'active',
  Inactive = 'inactive',
}
```

## Null Handling

```typescript
// Use optional chaining
const name = school?.name ?? 'Unknown'

// Type guards for narrowing
function isSchool(item: unknown): item is School {
  return typeof item === 'object' && item !== null && 'id' in item
}

// Early returns for null checks
if (!school) return null
```

## Async Patterns

```typescript
// Prefer async/await over .then()
async function fetchSchools() {
  try {
    const schools = await getSchools()
    return schools
  } catch (error) {
    console.error('Failed to fetch schools:', error)
    throw error
  }
}
```
