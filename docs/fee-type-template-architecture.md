# Fee Type Template Architecture - Design Document

**Date:** 2026-02-05
**Author:** AI Engineering Assistant
**Status:** Design Complete - Ready for Implementation

---

## Executive Summary

This document describes the proper architectural pattern for fee types, aligning them with the existing SaaS template pattern used throughout the Yeko codebase. This design separates core-level fee type definitions (managed by SaaS admins) from school-level instances (customized by each school).

---

## Current State Analysis

### Existing Template Pattern (Academic Data)

| Level | Core Templates | School Instances |
|-------|--------------|-----------------|
| **Structure** | `schoolYearTemplates` | `schoolYears` |
| **Terms** | `termTemplates` | `terms` |
| **Programs** | `programTemplates` | `schoolPrograms` |
| **Coefficients** | `coefficientTemplates` | `schoolSubjectCoefficients` |

**Key Characteristics:**
- Templates defined at core level (apps/core)
- Schools reference templates via foreign keys
- Each school can customize template instances
- SaaS admin manages core templates

### Current Fee Types (Deviation)

| Current State | Problem |
|--------------|---------|
| `fee_types` directly in school-schema.ts | No template separation |
| Seeded directly to schools | Schools can't select from templates |
| No core-level management | SaaS admin can't control standard types |

---

## Proposed Architecture

### 1. Core-Level Templates (apps/core)

#### Fee Type Template Table

```typescript
// packages/data-ops/src/drizzle/core-schema.ts

export const feeTypeCategories = [
  'tuition',
  'registration',
  'exam',
  'books',
  'transport',
  'uniform',
  'meals',
  'activities',
  'other',
] as const

export type FeeTypeCategory = typeof feeTypeCategories[number]

export const feeTypeTemplates = pgTable('fee_type_templates', {
  id: text('id').primaryKey(),
  code: text('code').notNull(), // UNIQUE across all templates
  name: text('name').notNull(), // e.g., "Frais de Scolarité"
  nameEn: text('name_en'), // e.g., "Tuition Fee"
  category: text('category', { enum: feeTypeCategories }).notNull(),
  description: text('description'),
  defaultAmount: integer('default_amount'), // In XOF (cents)
  isMandatory: boolean('is_mandatory').default(false).notNull(),
  isRecurring: boolean('is_recurring').default(false).notNull(),
  displayOrder: smallint('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  codeIdx: uniqueIndex('idx_fee_template_code').on(table.code),
  categoryIdx: index('idx_fee_template_category').on(table.category),
  activeIdx: index('idx_fee_template_active').on(table.isActive),
}))

export const feeTypeTemplatesRelations = relations(feeTypeTemplates, ({ many }) => ({
  schoolFeeTypes: many(schoolFeeTypes),
}))
```

#### Seed Data (Core Templates)

```typescript
// packages/data-ops/src/seed/feeTypeTemplatesData.ts

export const feeTypeTemplatesData: typeof feeTypeTemplates.$inferInsert[] = [
  {
    id: 'ftpl-tuition-001',
    code: 'TUITION',
    name: 'Frais de Scolarité',
    nameEn: 'Tuition Fee',
    category: 'tuition',
    description: 'Annual tuition fees for academic enrollment',
    defaultAmount: 150000, // 150,000 XOF
    isMandatory: true,
    isRecurring: true,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'ftpl-registration-001',
    code: 'REGISTRATION',
    name: "Frais d'Inscription",
    nameEn: 'Registration Fee',
    category: 'registration',
    description: 'One-time registration and enrollment fees',
    defaultAmount: 50000,
    isMandatory: true,
    isRecurring: false,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'ftpl-exam-001',
    code: 'EXAM',
    name: "Frais d'Examen",
    nameEn: 'Exam Fee',
    category: 'exam',
    description: 'Fees for official examinations and assessments',
    defaultAmount: 25000,
    isMandatory: true,
    isRecurring: false,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'ftpl-books-001',
    code: 'BOOKS',
    name: 'Frais de Livres',
    nameEn: 'Books Fee',
    category: 'books',
    description: 'Textbooks and educational materials',
    defaultAmount: 30000,
    isMandatory: false,
    isRecurring: false,
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'ftpl-transport-001',
    code: 'TRANSPORT',
    name: 'Frais de Transport',
    nameEn: 'Transport Fee',
    category: 'transport',
    description: 'School bus and transportation services',
    defaultAmount: 45000,
    isMandatory: false,
    isRecurring: true,
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'ftpl-uniform-001',
    code: 'UNIFORM',
    name: 'Frais de Uniforme',
    nameEn: 'Uniform Fee',
    category: 'uniform',
    description: 'School uniform and sportswear',
    defaultAmount: 20000,
    isMandatory: false,
    isRecurring: false,
    displayOrder: 6,
    isActive: true,
  },
  {
    id: 'ftpl-meals-001',
    code: 'MEALS',
    name: 'Frais de Cantine',
    nameEn: 'Meals Fee',
    category: 'meals',
    description: 'School cafeteria and meal plans',
    defaultAmount: 35000,
    isMandatory: false,
    isRecurring: true,
    displayOrder: 7,
    isActive: true,
  },
  {
    id: 'ftpl-activities-001',
    code: 'ACTIVITIES',
    name: 'Frais d Activités',
    nameEn: 'Activities Fee',
    category: 'activities',
    description: 'Extracurricular activities and sports',
    defaultAmount: 15000,
    isMandatory: false,
    isRecurring: false,
    displayOrder: 8,
    isActive: true,
  },
]
```

---

### 2. School-Level Instances (apps/school)

#### School Fee Type Table

```typescript
// packages/data-ops/src/drizzle/school-schema.ts

export const schoolFeeTypes = pgTable('school_fee_types', {
  id: text('id').primaryKey(),
  schoolId: text('school_id')
    .notNull()
    .references(() => schools.id, { onDelete: 'cascade' }),
  feeTypeTemplateId: text('fee_type_template_id')
    .notNull()
    .references(() => feeTypeTemplates.id),
  // Override template values
  name: text('name').notNull(), // Can customize from template
  nameEn: text('name_en'),
  description: text('description'),
  defaultAmount: integer('default_amount'), // Can override template
  // Additional fields
  revenueAccountId: text('revenue_account_id')
    .references(() => accounts.id, { onDelete: 'set null' }),
  receivableAccountId: text('receivable_account_id')
    .references(() => accounts.id, { onDelete: 'set null' }),
  status: text('status', { enum: feeTypeStatuses })
    .default('active')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolIdx: index('idx_school_fee_types_school').on(table.schoolId),
  templateIdx: index('idx_school_fee_types_template').on(table.feeTypeTemplateId),
  schoolTemplateIdx: uniqueIndex('idx_school_fee_type_unique')
    .on(table.schoolId, table.feeTypeTemplateId),
  statusIdx: index('idx_school_fee_types_status').on(table.status),
}))

export const schoolFeeTypesRelations = relations(schoolFeeTypes, ({ one }) => ({
  school: one(schools, {
    fields: [schoolFeeTypes.schoolId],
    references: [schools.id],
  }),
  template: one(feeTypeTemplates, {
    fields: [schoolFeeTypes.feeTypeTemplateId],
    references: [feeTypeTemplates.id],
  }),
  revenueAccount: one(accounts, {
    fields: [schoolFeeTypes.revenueAccountId],
    references: [accounts.id],
  }),
  receivableAccount: one(accounts, {
    fields: [schoolFeeTypes.receivableAccountId],
    references: [accounts.id],
  }),
}))
```

#### School Fee Structure Table (Updated)

```typescript
// packages/data-ops/src/drizzle/school-schema.ts

export const feeStructures = pgTable('fee_structures', {
  id: text('id').primaryKey(),
  schoolId: text('school_id')
    .notNull()
    .references(() => schools.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id')
    .notNull()
    .references(() => schoolYears.id),
  schoolFeeTypeId: text('school_fee_type_id')
    .notNull()
    .references(() => schoolFeeTypes.id),
  gradeId: text('grade_id')
    .references(() => grades.id),
  seriesId: text('series_id')
    .references(() => series.id),
  amount: integer('amount').notNull(), // In XOF (cents)
  currency: text('currency').default('XOF').notNull(),
  newStudentAmount: integer('new_student_amount'),
  effectiveDate: date('effective_date'),
  status: text('status', { enum: feeStructureStatuses })
    .default('active')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolIdx: index('idx_fee_structures_school').on(table.schoolId),
  yearIdx: index('idx_fee_structures_year').on(table.schoolYearId),
  feeTypeIdx: index('idx_fee_structures_fee_type').on(table.schoolFeeTypeId),
  schoolYearFeeTypeIdx: uniqueIndex('idx_fee_structure_unique')
    .on(table.schoolId, table.schoolYearId, table.schoolFeeTypeId, table.gradeId, table.seriesId),
}))
```

---

## 3. API Functions (Query Layer)

### Get Available Fee Type Templates

```typescript
// packages/data-ops/src/queries/fee-type-templates.ts

export const getFeeTypeTemplates = createServerFunction()
  .args(
    z.object({
      activeOnly: z.boolean().default(true),
      category: z.enum(feeTypeCategories).optional(),
    }).optional()
  )
  .returns<FeeTypeTemplate[]>()
  .query(async ({ input }) => {
    const conditions = []

    if (input?.activeOnly !== false) {
      conditions.push(eq(feeTypeTemplates.isActive, true))
    }

    if (input?.category) {
      conditions.push(eq(feeTypeTemplates.category, input.category))
    }

    return await db.query.feeTypeTemplates.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [asc(feeTypeTemplates.displayOrder)],
    })
  })
```

### Create School Fee Type from Template

```typescript
// packages/data-ops/src/queries/school-fee-types.ts

export const createSchoolFeeType = createServerFunction()
  .args(
    z.object({
      schoolId: z.string(),
      feeTypeTemplateId: z.string(),
      customName: z.string().optional(),
      customAmount: z.number().optional(),
    })
  )
  .returns<SchoolFeeType>()
  .mutation(async ({ input }) => {
    // Get template
    const template = await db.query.feeTypeTemplates.findFirst({
      where: eq(feeTypeTemplates.id, input.feeTypeTemplateId),
    })

    if (!template) {
      throw new Error('Template not found')
    }

    // Create school fee type from template
    const [schoolFeeType] = await db.insert(schoolFeeTypes).values({
      id: crypto.randomUUID(),
      schoolId: input.schoolId,
      feeTypeTemplateId: input.feeTypeTemplateId,
      name: input.customName ?? template.name,
      nameEn: input.customNameEn ?? template.nameEn,
      description: template.description,
      defaultAmount: input.customAmount ?? template.defaultAmount,
      status: 'active',
    }).returning()

    return schoolFeeType
  })
```

### Get School Fee Types

```typescript
// packages/data-ops/src/queries/school-fee-types.ts

export const getSchoolFeeTypes = createServerFunction()
  .args(
    z.object({
      schoolId: z.string(),
      includeInactive: z.boolean().default(false),
    })
  )
  .returns<SchoolFeeTypeWithTemplate[]>()
  .query(async ({ input }) => {
    const conditions = [eq(schoolFeeTypes.schoolId, input.schoolId)]

    if (!input.includeInactive) {
      conditions.push(eq(schoolFeeTypes.status, 'active'))
    }

    return await db.query.schoolFeeTypes.findMany({
      where: conditions.length > 1 ? and(...conditions) : conditions[0],
      with: {
        template: true,
      },
      orderBy: [asc(schoolFeeTypes.name)],
    })
  })
```

---

## 4. Migration Strategy

### Phase 1: Add New Schema (Non-Breaking)

1. Add `feeTypeTemplates` table to core-schema.ts
2. Add `schoolFeeTypes` table to school-schema.ts  
3. Update `feeStructures` to reference `schoolFeeTypes`
4. Seed `feeTypeTemplates` with standard definitions
5. Create API functions for template management

### Phase 2: Data Migration (One-Time)

```sql
-- Migrate existing fee_types to school_fee_types
INSERT INTO school_fee_types (id, school_id, fee_type_template_id, name, name_en, description, default_amount, status, created_at, updated_at)
SELECT 
  id,
  school_id,
  -- Map existing categories to new templates
  CASE 
    WHEN category = 'tuition' THEN 'ftpl-tuition-001'
    WHEN category = 'registration' THEN 'ftpl-registration-001'
    WHEN category = 'exam' THEN 'ftpl-exam-001'
    WHEN category = 'books' THEN 'ftpl-books-001'
    WHEN category = 'transport' THEN 'ftpl-transport-001'
    WHEN category = 'uniform' THEN 'ftpl-uniform-001'
    WHEN category = 'meals' THEN 'ftpl-meals-001'
    WHEN category = 'activities' THEN 'ftpl-activities-001'
    ELSE 'ftpl-other-001'
  END AS fee_type_template_id,
  name,
  name_en,
  NULL,
  COALESCE(default_amount, 0),
  status,
  created_at,
  updated_at
FROM fee_types;
```

### Phase 3: Update UI (Gradual)

1. Update fee type selection to use template dropdown
2. Show template origin in fee type list
3. Add "Create from Template" action
4. Display template information in fee type details

---

## 5. Benefits of This Architecture

### For SaaS Administrators
- ✅ Centralized management of standard fee types
- ✅ Easy to add new fee categories
- ✅ Consistent naming across all schools
- ✅ Control mandatory vs optional fees

### For Schools  
- ✅ Choose from pre-defined fee types
- ✅ Customize names and amounts per school
- ✅ Maintain flexibility within standards
- ✅ Clear visibility into fee structure

### For Developers
- ✅ Follows existing architectural patterns
- ✅ Easier to maintain and extend
- ✅ Better data integrity via FKs
- ✅ Consistent with other modules

---

## 6. Implementation Roadmap

### Sprint 1: Core Infrastructure
- [ ] Add `feeTypeTemplates` table to core-schema.ts
- [ ] Create seed data for standard fee types
- [ ] Add API functions for template management
- [ ] Write unit tests for new functions

### Sprint 2: School Layer
- [ ] Add `schoolFeeTypes` table to school-schema.ts
- [ ] Update `feeStructures` FK relationships
- [ ] Create school fee type API functions
- [ ] Write integration tests

### Sprint 3: Migration
- [ ] Create data migration script
- [ ] Test migration on staging
- [ ] Deploy to production
- [ ] Verify data integrity

### Sprint 4: UI Updates
- [ ] Update fee type creation form
- [ ] Add template selection dropdown
- [ ] Display template information
- [ ] Add template management UI (apps/core)

---

## 7. Files to Modify

### New Files
- `packages/data-ops/src/drizzle/fee-type-template-schema.ts`
- `packages/data-ops/src/queries/fee-type-templates.ts`
- `packages/data-ops/src/seed/feeTypeTemplatesData.ts`

### Modified Files
- `packages/data-ops/src/drizzle/core-schema.ts`
- `packages/data-ops/src/drizzle/school-schema.ts`
- `packages/data-ops/src/index.ts`
- `packages/data-ops/src/seed/index.ts`

### New Pages (apps/core)
- `/catalogs/fee-types` - Manage core templates
- `/catalogs/fee-types/new` - Create new template

### Modified Pages (apps/school)
- `/accounting/fee-types` - Use template selection
- `/accounting/fee-types/new` - Create from template

---

## 8. Conclusion

This architectural pattern aligns fee types with the existing SaaS template pattern, providing:
- **Better separation of concerns** between core and school data
- **Easier maintenance** through consistent patterns
- **Greater flexibility** for schools while maintaining standards
- **Clear upgrade path** for future enhancements

**Recommendation:** Implement this architecture in Phase 2 of the Yeko roadmap.

---

**Document Version:** 1.0.0
**Last Updated:** 2026-02-05
**Status:** Ready for Implementation
