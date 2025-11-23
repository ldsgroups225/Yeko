import {
  bulkCreateSeries,
  bulkCreateSubjects,
  bulkUpdateGradesOrder,
  createGrade,
  createSerie,
  createSubject,
  createTrack,
  deleteGrade,
  deleteSerie,
  deleteSubject,
  deleteTrack,
  getCatalogStats,
  getEducationLevels,
  getGradeById,
  getGrades,
  getSerieById,
  getSeries,
  getSubjectById,
  getSubjects,
  getTrackById,
  getTracks,
  updateGrade,
  updateSerie,
  updateSubject,
  updateTrack,
} from '@repo/data-ops/queries/catalogs'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { exampleMiddlewareWithContext } from '@/core/middleware/example-middleware'
import {
  CreateGradeSchema,
  CreateSerieSchema,
  CreateSubjectSchema,
  CreateTrackSchema,
  GetGradesSchema,
  GetSeriesSchema,
  GetSubjectsSchema,
  GradeIdSchema,
  SerieIdSchema,
  SubjectIdSchema,
  TrackIdSchema,
  UpdateGradeSchema,
  UpdateSerieSchema,
  UpdateSubjectSchema,
  UpdateTrackSchema,
} from '@/schemas/catalog'

// ===== EDUCATION LEVELS =====

export const educationLevelsQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .handler(async () => {
    return await getEducationLevels()
  })

// ===== TRACKS =====

export const tracksQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .handler(async () => {
    return await getTracks()
  })

export const trackByIdQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => TrackIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getTrackById(ctx.data.id)
  })

export const createTrackMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CreateTrackSchema.parse(data))
  .handler(async (ctx) => {
    return await createTrack(ctx.data)
  })

export const updateTrackMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => UpdateTrackSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateTrack(id, updateData)
  })

export const deleteTrackMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => TrackIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteTrack(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== GRADES =====

export const gradesQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => GetGradesSchema.parse(data))
  .handler(async (ctx) => {
    return await getGrades(ctx.data)
  })

export const gradeByIdQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => GradeIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getGradeById(ctx.data.id)
  })

export const createGradeMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CreateGradeSchema.parse(data))
  .handler(async (ctx) => {
    return await createGrade(ctx.data)
  })

export const updateGradeMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => UpdateGradeSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateGrade(id, updateData)
  })

export const deleteGradeMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => GradeIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteGrade(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== SERIES =====

export const seriesQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => GetSeriesSchema.parse(data))
  .handler(async (ctx) => {
    return await getSeries(ctx.data)
  })

export const serieByIdQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => SerieIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getSerieById(ctx.data.id)
  })

export const createSerieMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CreateSerieSchema.parse(data))
  .handler(async (ctx) => {
    return await createSerie(ctx.data)
  })

export const updateSerieMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => UpdateSerieSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateSerie(id, updateData)
  })

export const deleteSerieMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => SerieIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteSerie(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== SUBJECTS =====

export const subjectsQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => GetSubjectsSchema.parse(data))
  .handler(async (ctx) => {
    return await getSubjects(ctx.data)
  })

export const subjectByIdQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => SubjectIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getSubjectById(ctx.data.id)
  })

export const createSubjectMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CreateSubjectSchema.parse(data))
  .handler(async (ctx) => {
    return await createSubject(ctx.data)
  })

export const updateSubjectMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => UpdateSubjectSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateSubject(id, updateData)
  })

export const deleteSubjectMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => SubjectIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteSubject(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== CATALOG STATS =====

export const catalogStatsQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .handler(async () => {
    return await getCatalogStats()
  })

// ===== BULK OPERATIONS =====

export const bulkUpdateGradesOrderMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => z.array(z.object({ id: z.string(), order: z.number() })).parse(data))
  .handler(async (ctx) => {
    await bulkUpdateGradesOrder(ctx.data)
    return { success: true }
  })

export const bulkCreateSeriesMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => z.array(CreateSerieSchema).parse(data))
  .handler(async (ctx) => {
    return await bulkCreateSeries(ctx.data)
  })

export const bulkCreateSubjectsMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => z.array(CreateSubjectSchema).parse(data))
  .handler(async (ctx) => {
    return await bulkCreateSubjects(ctx.data)
  })
