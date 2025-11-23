import {
  createSchool as createSchoolQuery,
  deleteSchool as deleteSchoolQuery,
  getSchoolById as getSchoolByIdQuery,
  getSchools as getSchoolsQuery,
  updateSchool as updateSchoolQuery,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { exampleMiddlewareWithContext } from '@/core/middleware/example-middleware'
import {
  BulkUpdateSchoolsSchema,
  CreateSchoolSchema,
  GetSchoolsSchema,
  SchoolIdSchema,
  UpdateSchoolSchema,
} from '@/schemas/school'

// Create a new school
export const createSchool = createServerFn()
  .middleware([
    exampleMiddlewareWithContext,
  ])
  .inputValidator(data => CreateSchoolSchema.parse(data))
  .handler(async (ctx) => {
    const newSchool = await createSchoolQuery({
      ...ctx.data,
      settings: (ctx.data.settings as Record<string, any>) || {},
    })

    return {
      ...newSchool,
      settings: (newSchool.settings as Record<string, any>) || {},
    }
  })

// Get paginated list of schools with filters
export const getSchools = createServerFn()
  .middleware([
    exampleMiddlewareWithContext,
  ])
  .inputValidator(data => GetSchoolsSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getSchoolsQuery(ctx.data)

    return {
      data: result.schools.map(s => ({
        ...s,
        settings: (s.settings as Record<string, any>) || {},
      })),
      meta: result.pagination,
    }
  })

// Get a single school by ID
export const getSchoolById = createServerFn()
  .middleware([
    exampleMiddlewareWithContext,
  ])
  .inputValidator(data => SchoolIdSchema.parse(data))
  .handler(async (ctx) => {
    const school = await getSchoolByIdQuery(ctx.data.id)

    if (!school) {
      throw new Error('School not found')
    }

    return {
      ...school,
      settings: (school.settings as Record<string, any>) || {},
    }
  })

// Update a school
export const updateSchool = createServerFn()
  .middleware([
    exampleMiddlewareWithContext,
  ])
  .inputValidator(data => UpdateSchoolSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data

    try {
      const updatedSchool = await updateSchoolQuery(id, updateData)
      return {
        ...updatedSchool,
        settings: (updatedSchool.settings as Record<string, any>) || {},
      }
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new Error('School not found')
      }
      throw error
    }
  })

// Delete a school
export const deleteSchool = createServerFn()
  .middleware([
    exampleMiddlewareWithContext,
  ])
  .inputValidator(data => SchoolIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteSchoolQuery(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// Bulk update schools status
export const bulkUpdateSchools = createServerFn()
  .middleware([
    exampleMiddlewareWithContext,
  ])
  .inputValidator(data => BulkUpdateSchoolsSchema.parse(data))
  .handler(async (ctx) => {
    const { schoolIds, status } = ctx.data

    // Update each school individually since we don't have bulk operations in the queries
    for (const id of schoolIds) {
      try {
        await updateSchoolQuery(id, { status })
      }
      catch {
        // Skip schools that don't exist
        continue
      }
    }

    return { success: true, count: schoolIds.length }
  })
