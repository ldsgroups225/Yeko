import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { databaseMiddleware } from '@/core/middleware/database'
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

// Helper to load queries dynamically
const loadCatalogQueries = () => import('@repo/data-ops/queries/catalogs')

// ===== EDUCATION LEVELS =====

export const educationLevelsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getEducationLevels } = await loadCatalogQueries()
    return await getEducationLevels()
  })

// ===== TRACKS =====

export const tracksQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getTracks } = await loadCatalogQueries()
    return await getTracks()
  })

export const trackByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TrackIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getTrackById } = await loadCatalogQueries()
    return await getTrackById(ctx.data.id)
  })

export const createTrackMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateTrackSchema.parse(data))
  .handler(async (ctx) => {
    const { createTrack } = await loadCatalogQueries()
    return await createTrack(ctx.data)
  })

export const updateTrackMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateTrackSchema.parse(data))
  .handler(async (ctx) => {
    const { updateTrack } = await loadCatalogQueries()
    const { id, ...updateData } = ctx.data
    return await updateTrack(id, updateData)
  })

export const deleteTrackMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TrackIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteTrack } = await loadCatalogQueries()
    await deleteTrack(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== GRADES =====

export const gradesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetGradesSchema.parse(data))
  .handler(async (ctx) => {
    const { getGrades } = await loadCatalogQueries()
    return await getGrades(ctx.data)
  })

export const gradeByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GradeIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getGradeById } = await loadCatalogQueries()
    return await getGradeById(ctx.data.id)
  })

export const createGradeMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateGradeSchema.parse(data))
  .handler(async (ctx) => {
    const { createGrade } = await loadCatalogQueries()
    return await createGrade(ctx.data)
  })

export const updateGradeMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateGradeSchema.parse(data))
  .handler(async (ctx) => {
    const { updateGrade } = await loadCatalogQueries()
    const { id, ...updateData } = ctx.data
    return await updateGrade(id, updateData)
  })

export const deleteGradeMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GradeIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteGrade } = await loadCatalogQueries()
    await deleteGrade(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== SERIES =====

export const seriesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetSeriesSchema.parse(data))
  .handler(async (ctx) => {
    const { getSeries } = await loadCatalogQueries()
    return await getSeries(ctx.data)
  })

export const serieByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SerieIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getSerieById } = await loadCatalogQueries()
    return await getSerieById(ctx.data.id)
  })

export const createSerieMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateSerieSchema.parse(data))
  .handler(async (ctx) => {
    const { createSerie } = await loadCatalogQueries()
    return await createSerie(ctx.data)
  })

export const updateSerieMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateSerieSchema.parse(data))
  .handler(async (ctx) => {
    const { updateSerie } = await loadCatalogQueries()
    const { id, ...updateData } = ctx.data
    return await updateSerie(id, updateData)
  })

export const deleteSerieMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SerieIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteSerie } = await loadCatalogQueries()
    await deleteSerie(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== SUBJECTS =====

export const subjectsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetSubjectsSchema.parse(data))
  .handler(async (ctx) => {
    const { getSubjects } = await loadCatalogQueries()
    return await getSubjects(ctx.data)
  })

export const subjectByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SubjectIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getSubjectById } = await loadCatalogQueries()
    return await getSubjectById(ctx.data.id)
  })

export const createSubjectMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateSubjectSchema.parse(data))
  .handler(async (ctx) => {
    const { createSubject } = await loadCatalogQueries()
    return await createSubject(ctx.data)
  })

export const updateSubjectMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateSubjectSchema.parse(data))
  .handler(async (ctx) => {
    const { updateSubject } = await loadCatalogQueries()
    const { id, ...updateData } = ctx.data
    return await updateSubject(id, updateData)
  })

export const deleteSubjectMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SubjectIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteSubject } = await loadCatalogQueries()
    await deleteSubject(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

// ===== CATALOG STATS =====

export const catalogStatsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getCatalogStats } = await loadCatalogQueries()
    return await getCatalogStats()
  })

// ===== BULK OPERATIONS =====

export const bulkUpdateGradesOrderMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => z.array(z.object({ id: z.string(), order: z.number() })).parse(data))
  .handler(async (ctx) => {
    const { bulkUpdateGradesOrder } = await loadCatalogQueries()
    await bulkUpdateGradesOrder(ctx.data)
    return { success: true }
  })

export const bulkCreateSeriesMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => z.array(CreateSerieSchema).parse(data))
  .handler(async (ctx) => {
    const { bulkCreateSeries } = await loadCatalogQueries()
    return await bulkCreateSeries(ctx.data)
  })

export const bulkCreateSubjectsMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => z.array(CreateSubjectSchema).parse(data))
  .handler(async (ctx) => {
    const { bulkCreateSubjects } = await loadCatalogQueries()
    return await bulkCreateSubjects(ctx.data)
  })
