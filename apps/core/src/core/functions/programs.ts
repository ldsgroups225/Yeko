/* eslint-disable max-lines */
import { R } from '@praha/byethrow'
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
} from '@repo/data-ops/queries/programs'
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
    const result = await getSchoolYearTemplates()
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const schoolYearTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SchoolYearTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getSchoolYearTemplateById(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const createSchoolYearTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateSchoolYearTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const result = await createSchoolYearTemplate(ctx.data)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const updateSchoolYearTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateSchoolYearTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    const result = await updateSchoolYearTemplate(id, updateData)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const deleteSchoolYearTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SchoolYearTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await deleteSchoolYearTemplate(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return { success: true, id: ctx.data.id }
  })

// ===== PROGRAM TEMPLATES =====

export const programTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetProgramTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getProgramTemplates(ctx.data)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const programTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getProgramTemplateById(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const createProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const result = await createProgramTemplate(ctx.data)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const updateProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    const result = await updateProgramTemplate(id, updateData)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const deleteProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await deleteProgramTemplate(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return { success: true, id: ctx.data.id }
  })

export const cloneProgramTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CloneProgramTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const result = await cloneProgramTemplate(ctx.data.id, ctx.data.newSchoolYearTemplateId, ctx.data.newName)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

// ===== PROGRAM TEMPLATE CHAPTERS =====

export const programTemplateChaptersQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getProgramTemplateChapters(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const programTemplateChapterByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateChapterIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getProgramTemplateChapterById(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const createProgramTemplateChapterMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateProgramTemplateChapterSchema.parse(data))
  .handler(async (ctx) => {
    const result = await createProgramTemplateChapter(ctx.data)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const updateProgramTemplateChapterMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateProgramTemplateChapterSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    const result = await updateProgramTemplateChapter(id, updateData)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const deleteProgramTemplateChapterMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateChapterIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await deleteProgramTemplateChapter(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return { success: true, id: ctx.data.id }
  })

export const bulkUpdateChaptersOrderMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkUpdateChaptersOrderSchema.parse(data))
  .handler(async (ctx) => {
    const result = await bulkUpdateChaptersOrder(ctx.data)
    if (R.isFailure(result))
      throw result.error
    return { success: true }
  })

export const bulkCreateChaptersMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkCreateChaptersSchema.parse(data))
  .handler(async (ctx) => {
    const result = await bulkCreateChapters(ctx.data.programTemplateId, ctx.data.chapters)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

// ===== PROGRAM VERSIONS =====

export const publishProgramMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => PublishProgramSchema.parse(data))
  .handler(async (ctx) => {
    const result = await publishProgram(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const getProgramVersionsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => ProgramTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getProgramVersions(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const restoreProgramVersionMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => RestoreProgramVersionSchema.parse(data))
  .handler(async (ctx) => {
    const result = await restoreProgramVersion(ctx.data.versionId)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

// ===== PROGRAM STATS =====

export const programStatsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const result = await getProgramStats()
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

// ===== TERM TEMPLATES =====

export const termTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetTermTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getTermTemplates(ctx.data.schoolYearTemplateId)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const termTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TermTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getTermTemplateById(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const createTermTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateTermTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const result = await createTermTemplate(ctx.data)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const updateTermTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateTermTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    const result = await updateTermTemplate(id, updateData)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const deleteTermTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TermTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await deleteTermTemplate(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return { success: true, id: ctx.data.id }
  })

export const bulkCreateTermTemplatesMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => BulkCreateTermTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const result = await bulkCreateTermTemplates(ctx.data.schoolYearTemplateId, ctx.data.terms)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const schoolYearTemplatesWithTermsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const result = await getSchoolYearTemplatesWithTerms()
    if (R.isFailure(result))
      throw result.error
    return result.value
  })
