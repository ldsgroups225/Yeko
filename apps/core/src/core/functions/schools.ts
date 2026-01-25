import type { School } from '@repo/data-ops'
import { databaseMiddleware } from '@/core/middleware/database'
import { createServerFn } from '@tanstack/react-start'
// Helper to load queries dynamically
const loadDataOps = () => import('@repo/data-ops')
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
    const { createSchool: createSchoolQuery } = await loadDataOps()
    const newSchool = await createSchoolQuery({
      ...ctx.data,
      settings: (ctx.data.settings as Record<string, object>) || {},
    })

    return {
      ...newSchool,
      settings: (newSchool.settings as Record<string, object>) || {},
    }
  })

// Get paginated list of schools with filters
export const getSchools = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => GetSchoolsSchema.parse(data))
  .handler(async (ctx) => {
    const { getSchools: getSchoolsQuery } = await loadDataOps()
    const result = await getSchoolsQuery(ctx.data)

    return {
      data: result.schools.map((s: School) => ({
        ...s,
        settings: (s.settings as Record<string, object>) || {},
      })),
      meta: result.pagination,
    }
  })

// Get a single school by ID
export const getSchoolById = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => SchoolIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getSchoolById: getSchoolByIdQuery } = await loadDataOps()
    const school = await getSchoolByIdQuery(ctx.data.id)

    if (!school) {
      throw new Error('School not found')
    }

    return {
      ...school,
      settings: (school.settings as Record<string, object>) || {},
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

    try {
      const { updateSchool: updateSchoolQuery } = await loadDataOps()
      const updatedSchool = await updateSchoolQuery(id, updateData)
      return {
        ...updatedSchool,
        settings: (updatedSchool.settings as Record<string, object>) || {},
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
    databaseMiddleware,
  ])
  .inputValidator(data => SchoolIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteSchool: deleteSchoolQuery } = await loadDataOps()
    await deleteSchoolQuery(ctx.data.id)
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

    // Update each school individually since we don't have bulk operations in the queries
    for (const id of schoolIds) {
      try {
        const { updateSchool: updateSchoolQuery } = await loadDataOps()
        await updateSchoolQuery(id, { status })
      }
      catch {
        // Skip schools that don't exist
        continue
      }
    }

    return { success: true, count: schoolIds.length }
  })

// Bulk create schools from import
export const bulkCreateSchools = createServerFn()
  .middleware([
    databaseMiddleware,
  ])
  .inputValidator(data => ImportSchoolsSchema.parse(data))
  .handler(async (ctx) => {
    const { schools, skipDuplicates } = ctx.data

    const { bulkCreateSchools: bulkCreateSchoolsQuery } = await loadDataOps()

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

    return {
      success: result.success,
      created: result.created.length,
      errors: result.errors,
      schools: result.created.map(s => ({
        ...s,
        settings: (s.settings as Record<string, object>) || {},
      })),
    }
  })
