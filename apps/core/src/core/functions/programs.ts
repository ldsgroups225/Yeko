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

// Helper to load queries dynamically from the main package
// On server, this resolves to index.js which has all exports
const loadDataOps = () => import('@repo/data-ops')

// ===== SCHOOL YEAR TEMPLATES =====

export const schoolYearTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getSchoolYearTemplates } = await loadDataOps()
    return await getSchoolYearTemplates()
  })

export const schoolYearTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SchoolYearTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getSchoolYearTemplateById } = await loadDataOps()
    return await getSchoolYearTemplateById(ctx.data.id)
  })

export const createSchoolYearTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateSchoolYearTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { createSchoolYearTemplate } = await loadDataOps()
    return await createSchoolYearTemplate(ctx.data)
  })

export const updateSchoolYearTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateSchoolYearTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { updateSchoolYearTemplate } = await loadDataOps()
    const { id, ...updateData } = ctx.data
    return await updateSchoolYearTemplate(id, updateData)
  })

export const deleteSchoolYearTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SchoolYearTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteSchoolYearTemplate } = await loadDataOps()
    await deleteSchoolYearTemplate(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== PROGRAM TEMPLATES =====

export const programTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetProgramTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramTemplates } = await loadDataOps()
    return await getProgramTemplates(ctx.data)
  })

export const programTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramTemplateById } = await loadDataOps()
    return await getProgramTemplateById(ctx.data.id)
  })

export const createProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { createProgramTemplate } = await loadDataOps()
    return await createProgramTemplate(ctx.data)
  })

export const updateProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { updateProgramTemplate } = await loadDataOps()
    const { id, ...updateData } = ctx.data
    return await updateProgramTemplate(id, updateData)
  })

export const deleteProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteProgramTemplate } = await loadDataOps()
    await deleteProgramTemplate(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

export const cloneProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CloneProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { cloneProgramTemplate } = await loadDataOps()
    return await cloneProgramTemplate(ctx.data.id, ctx.data.newSchoolYearTemplateId, ctx.data.newName)
  })

// ===== PROGRAM TEMPLATE CHAPTERS =====

export const programTemplateChaptersQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramTemplateChapters } = await loadDataOps()
    return await getProgramTemplateChapters(ctx.data.id)
  })

export const programTemplateChapterByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateChapterIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramTemplateChapterById } = await loadDataOps()
    return await getProgramTemplateChapterById(ctx.data.id)
  })

export const createProgramTemplateChapterMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateProgramTemplateChapterSchema.parse(data))
  .handler(async (ctx) => {
    const { createProgramTemplateChapter } = await loadDataOps()
    return await createProgramTemplateChapter(ctx.data)
  })

export const updateProgramTemplateChapterMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateProgramTemplateChapterSchema.parse(data))
  .handler(async (ctx) => {
    const { updateProgramTemplateChapter } = await loadDataOps()
    const { id, ...updateData } = ctx.data
    return await updateProgramTemplateChapter(id, updateData)
  })

export const deleteProgramTemplateChapterMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateChapterIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteProgramTemplateChapter } = await loadDataOps()
    await deleteProgramTemplateChapter(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

export const bulkUpdateChaptersOrderMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkUpdateChaptersOrderSchema.parse(data))
  .handler(async (ctx) => {
    const { bulkUpdateChaptersOrder } = await loadDataOps()
    await bulkUpdateChaptersOrder(ctx.data)
    return { success: true }
  })

export const bulkCreateChaptersMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkCreateChaptersSchema.parse(data))
  .handler(async (ctx) => {
    const { bulkCreateChapters } = await loadDataOps()
    return await bulkCreateChapters(ctx.data.programTemplateId, ctx.data.chapters)
  })

// ===== PROGRAM VERSIONS =====

export const publishProgramMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => PublishProgramSchema.parse(data))
  .handler(async (ctx) => {
    const { publishProgram } = await loadDataOps()
    return await publishProgram(ctx.data.id)
  })

export const getProgramVersionsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getProgramVersions } = await loadDataOps()
    return await getProgramVersions(ctx.data.id)
  })

export const restoreProgramVersionMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => RestoreProgramVersionSchema.parse(data))
  .handler(async (ctx) => {
    const { restoreProgramVersion } = await loadDataOps()
    return await restoreProgramVersion(ctx.data.versionId)
  })

// ===== PROGRAM STATS =====

export const programStatsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getProgramStats } = await loadDataOps()
    return await getProgramStats()
  })

// ===== TERM TEMPLATES =====

export const termTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetTermTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const { getTermTemplates } = await loadDataOps()
    return await getTermTemplates(ctx.data.schoolYearTemplateId)
  })

export const termTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TermTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getTermTemplateById } = await loadDataOps()
    return await getTermTemplateById(ctx.data.id)
  })

export const createTermTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateTermTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { createTermTemplate } = await loadDataOps()
    return await createTermTemplate(ctx.data)
  })

export const updateTermTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateTermTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { updateTermTemplate } = await loadDataOps()
    const { id, ...updateData } = ctx.data
    return await updateTermTemplate(id, updateData)
  })

export const deleteTermTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TermTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteTermTemplate } = await loadDataOps()
    await deleteTermTemplate(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

export const bulkCreateTermTemplatesMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkCreateTermTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const { bulkCreateTermTemplates } = await loadDataOps()
    return await bulkCreateTermTemplates(ctx.data.schoolYearTemplateId, ctx.data.terms)
  })

export const schoolYearTemplatesWithTermsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getSchoolYearTemplatesWithTerms } = await loadDataOps()
    return await getSchoolYearTemplatesWithTerms()
  })
