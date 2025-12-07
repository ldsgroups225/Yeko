---
inclusion: fileMatch
fileMatchPattern: "**/data-ops/**/*.ts"
description: Drizzle ORM patterns, database queries, and PostgreSQL best practices
---

# Database Patterns for Yeko

## Drizzle ORM Conventions

### Schema Definition
```typescript
import { pgTable, text, timestamp, smallint, jsonb, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const schools = pgTable('schools', {
  id: text('id').primaryKey(), // Use text for UUIDs/CUIDs
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active').notNull(),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
```

### Relations
```typescript
export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(userSchools),
  classes: many(classes),
}))

export const gradesRelations = relations(grades, ({ one }) => ({
  track: one(tracks, {
    fields: [grades.trackId],
    references: [tracks.id],
  }),
}))
```

### Indexes for Performance
```typescript
export const coefficientTemplates = pgTable('coefficient_templates', {
  // ... columns
}, table => ({
  // Composite index for frequent lookups
  coefficientLookupIdx: index('idx_coeff_lookup').on(
    table.schoolYearTemplateId,
    table.gradeId,
    table.seriesId,
    table.subjectId,
  ),
  // Individual indexes for filtering
  yearIdx: index('idx_coeff_year').on(table.schoolYearTemplateId),
}))
```

## Query Patterns

### Basic CRUD
```typescript
import { db } from '@repo/data-ops/database/client'
import { schools } from '@repo/data-ops'
import { eq, and, like, desc } from 'drizzle-orm'

// Select all
const allSchools = await db.select().from(schools)

// Select with filter
const activeSchools = await db
  .select()
  .from(schools)
  .where(eq(schools.status, 'active'))

// Select with multiple conditions
const filtered = await db
  .select()
  .from(schools)
  .where(and(
    eq(schools.status, 'active'),
    like(schools.name, `%${search}%`)
  ))
  .orderBy(desc(schools.createdAt))
  .limit(10)
  .offset(0)

// Insert
const [newSchool] = await db
  .insert(schools)
  .values({ id: generateId(), name, code, status })
  .returning()

// Update
await db
  .update(schools)
  .set({ name, updatedAt: new Date() })
  .where(eq(schools.id, id))

// Delete
await db.delete(schools).where(eq(schools.id, id))
```

### Joins with Relations
```typescript
// Using Drizzle relations
const gradesWithTrack = await db.query.grades.findMany({
  with: {
    track: true,
  },
})

// Manual join
const result = await db
  .select({
    grade: grades,
    trackName: tracks.name,
  })
  .from(grades)
  .leftJoin(tracks, eq(grades.trackId, tracks.id))
```

### Transactions
```typescript
await db.transaction(async (tx) => {
  const [school] = await tx
    .insert(schools)
    .values(schoolData)
    .returning()
  
  await tx
    .insert(schoolYears)
    .values({ schoolId: school.id, ...yearData })
})
```

## Query File Organization

```
packages/data-ops/src/queries/
  schools.ts      # School CRUD operations
  programs.ts     # Program templates
  coefficients.ts # Coefficient management
  analytics.ts    # Analytics queries
```

### Query Function Pattern
```typescript
// packages/data-ops/src/queries/schools.ts
import { db } from '../database/client'
import { schools } from '../drizzle/core-schema'

export async function getSchools(params?: {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  const { status, search, page = 1, pageSize = 10 } = params ?? {}
  
  const conditions = []
  if (status) conditions.push(eq(schools.status, status))
  if (search) conditions.push(like(schools.name, `%${search}%`))
  
  const [data, countResult] = await Promise.all([
    db.select()
      .from(schools)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)` })
      .from(schools)
      .where(conditions.length ? and(...conditions) : undefined),
  ])
  
  return {
    data,
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}
```

## Migration Workflow

```bash
# Generate migration after schema changes
pnpm run drizzle:generate

# Apply migrations
pnpm run drizzle:migrate

# Open Drizzle Studio for debugging
pnpm run studio
```

## Type Exports

Always export types from schema:
```typescript
// Select types (query results)
export type School = typeof schools.$inferSelect

// Insert types (for inserts)
export type SchoolInsert = typeof schools.$inferInsert

// Data types (without auto-generated fields)
export type SchoolData = Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>
```

## ID Generation

Use nanoid for generating IDs:
```typescript
import { nanoid } from 'nanoid'

const id = nanoid() // 21 character unique ID
```
