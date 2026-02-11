import { R } from '@praha/byethrow'
import {
  bulkCreateSchools as bulkCreateSchoolsQuery,
  createSchool as createSchoolQuery,
  deleteSchool as deleteSchoolQuery,
  getSchoolById as getSchoolByIdQuery,
  getSchools as getSchoolsQuery,
  updateSchool as updateSchoolQuery,
} from '@repo/data-ops/queries/schools'
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
    const result = await createSchoolQuery({
      ...ctx.data,
      settings: (ctx.data.settings as Record<string, object>) || {},
    })

    if (R.isFailure(result)) {
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
    const result = await getSchoolsQuery(ctx.data)
    if (R.isFailure(result)) {
      throw result.error
    }

    return {
      data: result.value.schools.map(s => ({
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
    const result = await getSchoolByIdQuery(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    const s = result.value

    if (!s) {
      // Return null or throw error depending on expected behavior.
      // The original code passed 's' which could be null?
      // "const s = result.value; if (!s) throw..."
      // The query getSchoolById returns School | null (Result<School | null> ?)
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

    const result = await updateSchoolQuery(id, updateData)
    if (R.isFailure(result)) {
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
    const result = await deleteSchoolQuery(ctx.data.id)
    if (R.isFailure(result))
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

    const BATCH_SIZE = 10
    let successCount = 0

    for (let i = 0; i < schoolIds.length; i += BATCH_SIZE) {
      const batch = schoolIds.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(
        batch.map(id => updateSchoolQuery(id, { status })),
      )
      successCount += results.filter(r => R.isSuccess(r)).length
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

    if (R.isFailure(result))
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
