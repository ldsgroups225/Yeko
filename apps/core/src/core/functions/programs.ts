import {
  bulkCreateChapters,
  bulkCreateTermTemplates,
  bulkUpdateChaptersOrder,
  cloneProgramTemplate,
  createProgramTemplate,
  createProgramTemplateChapter,
  createSchoolYearTemplate,
  createTermTemplate,
  deleteProgramTemplate,
  deleteProgramTemplateChapter,
  deleteSchoolYearTemplate,
  deleteTermTemplate,
  getProgramStats,
  getProgramTemplateById,
  getProgramTemplateChapterById,
  getProgramTemplateChapters,
  getProgramTemplates,
  getProgramVersions,
  getSchoolYearTemplateById,
  getSchoolYearTemplates,
  getSchoolYearTemplatesWithTerms,
  getTermTemplateById,
  getTermTemplates,
  publishProgram,
  restoreProgramVersion,
  updateProgramTemplate,
  updateProgramTemplateChapter,
  updateSchoolYearTemplate,
  updateTermTemplate,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { exampleMiddlewareWithContext } from '@/core/middleware/example-middleware'
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
  .middleware([exampleMiddlewareWithContext])
  .handler(async () => {
    return await getSchoolYearTemplates()
  })

export const schoolYearTemplateByIdQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => SchoolYearTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getSchoolYearTemplateById(ctx.data.id)
  })

export const createSchoolYearTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CreateSchoolYearTemplateSchema.parse(data))
  .handler(async (ctx) => {
    return await createSchoolYearTemplate(ctx.data)
  })

export const updateSchoolYearTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => UpdateSchoolYearTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateSchoolYearTemplate(id, updateData)
  })

export const deleteSchoolYearTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => SchoolYearTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteSchoolYearTemplate(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== PROGRAM TEMPLATES =====

export const programTemplatesQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => GetProgramTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    return await getProgramTemplates(ctx.data)
  })

export const programTemplateByIdQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getProgramTemplateById(ctx.data.id)
  })

export const createProgramTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CreateProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    return await createProgramTemplate(ctx.data)
  })

export const updateProgramTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => UpdateProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateProgramTemplate(id, updateData)
  })

export const deleteProgramTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteProgramTemplate(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

export const cloneProgramTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CloneProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    return await cloneProgramTemplate(ctx.data.id, ctx.data.newSchoolYearTemplateId, ctx.data.newName)
  })

// ===== PROGRAM TEMPLATE CHAPTERS =====

export const programTemplateChaptersQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getProgramTemplateChapters(ctx.data.id)
  })

export const programTemplateChapterByIdQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => ProgramTemplateChapterIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getProgramTemplateChapterById(ctx.data.id)
  })

export const createProgramTemplateChapterMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CreateProgramTemplateChapterSchema.parse(data))
  .handler(async (ctx) => {
    return await createProgramTemplateChapter(ctx.data)
  })

export const updateProgramTemplateChapterMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => UpdateProgramTemplateChapterSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateProgramTemplateChapter(id, updateData)
  })

export const deleteProgramTemplateChapterMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => ProgramTemplateChapterIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteProgramTemplateChapter(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

export const bulkUpdateChaptersOrderMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => BulkUpdateChaptersOrderSchema.parse(data))
  .handler(async (ctx) => {
    await bulkUpdateChaptersOrder(ctx.data)
    return { success: true }
  })

export const bulkCreateChaptersMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => BulkCreateChaptersSchema.parse(data))
  .handler(async (ctx) => {
    return await bulkCreateChapters(ctx.data.programTemplateId, ctx.data.chapters)
  })

// ===== PROGRAM VERSIONS =====

export const publishProgramMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => PublishProgramSchema.parse(data))
  .handler(async (ctx) => {
    return await publishProgram(ctx.data.id)
  })

export const getProgramVersionsQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getProgramVersions(ctx.data.id)
  })

export const restoreProgramVersionMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => RestoreProgramVersionSchema.parse(data))
  .handler(async (ctx) => {
    return await restoreProgramVersion(ctx.data.versionId)
  })

// ===== PROGRAM STATS =====

export const programStatsQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .handler(async () => {
    return await getProgramStats()
  })

// ===== TERM TEMPLATES =====

export const termTemplatesQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => GetTermTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    return await getTermTemplates(ctx.data.schoolYearTemplateId)
  })

export const termTemplateByIdQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => TermTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getTermTemplateById(ctx.data.id)
  })

export const createTermTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CreateTermTemplateSchema.parse(data))
  .handler(async (ctx) => {
    return await createTermTemplate(ctx.data)
  })

export const updateTermTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => UpdateTermTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateTermTemplate(id, updateData)
  })

export const deleteTermTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => TermTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteTermTemplate(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

export const bulkCreateTermTemplatesMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => BulkCreateTermTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    return await bulkCreateTermTemplates(ctx.data.schoolYearTemplateId, ctx.data.terms)
  })

export const schoolYearTemplatesWithTermsQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .handler(async () => {
    return await getSchoolYearTemplatesWithTerms()
  })
