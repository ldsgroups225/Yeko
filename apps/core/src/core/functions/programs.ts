import { createServerFn } from '@tanstack/react-start'
import { databaseMiddleware } from '@/core/middleware/database'
import {
  BulkCreateChaptersSchema,
  BulkCreateTermTemplatesSchema,
  BulkUpdateChaptersOrderSchema,
  CloneProgramTemplateSchema,
  CreateProgramTemplateChapterSchema,
  CreateProgramTemplateSchema,
  CreateSchoolYearTemplateSchema,
  CreateTermTemplateSchema,
  GetProgramTemplatesSchema,
  GetTermTemplatesSchema,
  ProgramTemplateChapterIdSchema,
  ProgramTemplateIdSchema,
  PublishProgramSchema,
  RestoreProgramVersionSchema,
  SchoolYearTemplateIdSchema,
  TermTemplateIdSchema,
  UpdateProgramTemplateChapterSchema,
  UpdateProgramTemplateSchema,
  UpdateSchoolYearTemplateSchema,
  UpdateTermTemplateSchema,
} from '@/schemas/programs'

// ===== SCHOOL YEAR TEMPLATES =====

export const schoolYearTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getSchoolYearTemplates } = await import('@repo/data-ops/queries/programs')
    const result = await getSchoolYearTemplates()
    if (result.isErr())
      throw result.error
    return result.value
  })

export const schoolYearTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SchoolYearTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getSchoolYearTemplateById } = await import('@repo/data-ops/queries/programs')
    const result = await getSchoolYearTemplateById(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const createSchoolYearTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateSchoolYearTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { createSchoolYearTemplate } = await import('@repo/data-ops/queries/programs')
    const result = await createSchoolYearTemplate(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const updateSchoolYearTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateSchoolYearTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { updateSchoolYearTemplate } = await import('@repo/data-ops/queries/programs')
    const { id, ...updateData } = ctx.data
    const result = await updateSchoolYearTemplate(id, updateData)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const deleteSchoolYearTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SchoolYearTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteSchoolYearTemplate } = await import('@repo/data-ops/queries/programs')
    const result = await deleteSchoolYearTemplate(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

// ===== PROGRAM TEMPLATES =====

export const programTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetProgramTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramTemplates } = await import('@repo/data-ops/queries/programs')
    const result = await getProgramTemplates(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const programTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramTemplateById } = await import('@repo/data-ops/queries/programs')
    const result = await getProgramTemplateById(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const createProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { createProgramTemplate } = await import('@repo/data-ops/queries/programs')
    const result = await createProgramTemplate(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const updateProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { updateProgramTemplate } = await import('@repo/data-ops/queries/programs')
    const { id, ...updateData } = ctx.data
    const result = await updateProgramTemplate(id, updateData)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const deleteProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteProgramTemplate } = await import('@repo/data-ops/queries/programs')
    const result = await deleteProgramTemplate(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

export const cloneProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CloneProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { cloneProgramTemplate } = await import('@repo/data-ops/queries/programs')
    const result = await cloneProgramTemplate(ctx.data.id, ctx.data.newSchoolYearTemplateId, ctx.data.newName)
    if (result.isErr())
      throw result.error
    return result.value
  })

// ===== PROGRAM TEMPLATE CHAPTERS =====

export const programTemplateChaptersQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramTemplateChapters } = await import('@repo/data-ops/queries/programs')
    const result = await getProgramTemplateChapters(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const programTemplateChapterByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateChapterIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramTemplateChapterById } = await import('@repo/data-ops/queries/programs')
    const result = await getProgramTemplateChapterById(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const createProgramTemplateChapterMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateProgramTemplateChapterSchema.parse(data))
  .handler(async (ctx) => {
    const { createProgramTemplateChapter } = await import('@repo/data-ops/queries/programs')
    const result = await createProgramTemplateChapter(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const updateProgramTemplateChapterMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateProgramTemplateChapterSchema.parse(data))
  .handler(async (ctx) => {
    const { updateProgramTemplateChapter } = await import('@repo/data-ops/queries/programs')
    const { id, ...updateData } = ctx.data
    const result = await updateProgramTemplateChapter(id, updateData)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const deleteProgramTemplateChapterMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateChapterIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteProgramTemplateChapter } = await import('@repo/data-ops/queries/programs')
    const result = await deleteProgramTemplateChapter(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

export const bulkUpdateChaptersOrderMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkUpdateChaptersOrderSchema.parse(data))
  .handler(async (ctx) => {
    const { bulkUpdateChaptersOrder } = await import('@repo/data-ops/queries/programs')
    const result = await bulkUpdateChaptersOrder(ctx.data)
    if (result.isErr())
      throw result.error
    return { success: true }
  })

export const bulkCreateChaptersMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkCreateChaptersSchema.parse(data))
  .handler(async (ctx) => {
    const { bulkCreateChapters } = await import('@repo/data-ops/queries/programs')
    const result = await bulkCreateChapters(ctx.data.programTemplateId, ctx.data.chapters)
    if (result.isErr())
      throw result.error
    return result.value
  })

// ===== PROGRAM VERSIONS =====

export const publishProgramMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => PublishProgramSchema.parse(data))
  .handler(async (ctx) => {
    const { publishProgram } = await import('@repo/data-ops/queries/programs')
    const result = await publishProgram(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const getProgramVersionsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramVersions } = await import('@repo/data-ops/queries/programs')
    const result = await getProgramVersions(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const restoreProgramVersionMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => RestoreProgramVersionSchema.parse(data))
  .handler(async (ctx) => {
    const { restoreProgramVersion } = await import('@repo/data-ops/queries/programs')
    const result = await restoreProgramVersion(ctx.data.versionId)
    if (result.isErr())
      throw result.error
    return result.value
  })

// ===== PROGRAM STATS =====

export const programStatsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getProgramStats } = await import('@repo/data-ops/queries/programs')
    const result = await getProgramStats()
    if (result.isErr())
      throw result.error
    return result.value
  })

// ===== TERM TEMPLATES =====

export const termTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetTermTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const { getTermTemplates } = await import('@repo/data-ops/queries/programs')
    const result = await getTermTemplates(ctx.data.schoolYearTemplateId)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const termTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TermTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getTermTemplateById } = await import('@repo/data-ops/queries/programs')
    const result = await getTermTemplateById(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const createTermTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateTermTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { createTermTemplate } = await import('@repo/data-ops/queries/programs')
    const result = await createTermTemplate(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const updateTermTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateTermTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { updateTermTemplate } = await import('@repo/data-ops/queries/programs')
    const { id, ...updateData } = ctx.data
    const result = await updateTermTemplate(id, updateData)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const deleteTermTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TermTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteTermTemplate } = await import('@repo/data-ops/queries/programs')
    const result = await deleteTermTemplate(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

export const bulkCreateTermTemplatesMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkCreateTermTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const { bulkCreateTermTemplates } = await import('@repo/data-ops/queries/programs')
    const result = await bulkCreateTermTemplates(ctx.data.schoolYearTemplateId, ctx.data.terms)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const schoolYearTemplatesWithTermsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getSchoolYearTemplatesWithTerms } = await import('@repo/data-ops/queries/programs')
    const result = await getSchoolYearTemplatesWithTerms()
    if (result.isErr())
      throw result.error
    return result.value
  })
