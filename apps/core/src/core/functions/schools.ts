import type { School } from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { databaseMiddleware } from '@/core/middleware/database'
import {
  BulkUpdateSchoolsSchema,
  CreateSchoolSchema,
  GetSchoolsSchema,
  ImportSchoolsSchema,
  SchoolIdSchema,
  UpdateSchoolSchema,
} from '@/schemas/school'

// Create a new school
export const createSchool = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => CreateSchoolSchema.parse(data))
  .handler(async (ctx) => {
    const { createSchool: createSchoolQuery } = await import('@repo/data-ops/queries/schools')
    const result = await createSchoolQuery({
      ...ctx.data,
      settings: (ctx.data.settings as Record<string, object>) || {},
    })

    if (result.isErr()) {
      throw result.error
    }

    return {
      ...result.value,
      settings: (result.value.settings as Record<string, object>) || {},
    }
  })

// Get paginated list of schools with filters
export const getSchools = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => GetSchoolsSchema.parse(data))
  .handler(async (ctx) => {
    const { getSchools: getSchoolsQuery } = await import('@repo/data-ops/queries/schools')
    const result = await getSchoolsQuery(ctx.data)
    if (result.isErr()) {
      throw result.error
    }

    return {
      data: result.value.schools.map((s: School) => ({
        ...s,
        settings: (s.settings as Record<string, object>) || {},
      })),
      meta: result.value.pagination,
    }
  })

// Get a single school by ID
export const getSchoolById = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => SchoolIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getSchoolById: getSchoolByIdQuery } = await import('@repo/data-ops/queries/schools')
    const result = await getSchoolByIdQuery(ctx.data.id)
    if (result.isErr())
      throw result.error
    const s = result.value

    if (!s) {
      throw new Error('School not found')
    }
    return {
      ...s,
      settings: (s.settings as Record<string, object>) || {},
    }
  })

// Update a school
export const updateSchool = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => UpdateSchoolSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data

    const { updateSchool: updateSchoolQuery } = await import('@repo/data-ops/queries/schools')
    const result = await updateSchoolQuery(id, updateData)
    if (result.isErr()) {
      const error = result.error
      if (error instanceof Error && error.message?.includes('not found')) {
        throw new Error('School not found')
      }
      throw error
    }

    const updatedSchool = result.value
    return {
      ...updatedSchool,
      settings: (updatedSchool.settings as Record<string, object>) || {},
    }
  })

// Delete a school
export const deleteSchool = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => SchoolIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteSchool: deleteSchoolQuery } = await import('@repo/data-ops/queries/schools')
    const result = await deleteSchoolQuery(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

// Bulk update schools status
export const bulkUpdateSchools = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => BulkUpdateSchoolsSchema.parse(data))
  .handler(async (ctx) => {
    const { schoolIds, status } = ctx.data

    const { updateSchool: updateSchoolQuery } = await import('@repo/data-ops/queries/schools')

    const BATCH_SIZE = 10
    let successCount = 0

    for (let i = 0; i < schoolIds.length; i += BATCH_SIZE) {
      const batch = schoolIds.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(
        batch.map(id => updateSchoolQuery(id, { status })),
      )
      successCount += results.filter(r => r.isOk()).length
    }

    return { success: true, count: successCount }
  })

// Bulk create schools from import
export const bulkCreateSchools = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => ImportSchoolsSchema.parse(data))
  .handler(async (ctx) => {
    const { schools, skipDuplicates } = ctx.data

    const { bulkCreateSchools: bulkCreateSchoolsQuery } = await import('@repo/data-ops/queries/schools')

    const result = await bulkCreateSchoolsQuery(
      schools.map(school => ({
        name: school.name,
        code: school.code,
        address: school.address,
        phone: school.phone,
        email: school.email,
        status: 'active' as const,
        settings: {},
      })),
      { skipDuplicates },
    )

    if (result.isErr())
      throw result.error
    const res = result.value

    return {
      success: res.success,
      created: res.created.length,
      errors: res.errors,
      schools: res.created.map(s => ({
        ...s,
        settings: (s.settings as Record<string, object>) || {},
      })),
    }
  })
