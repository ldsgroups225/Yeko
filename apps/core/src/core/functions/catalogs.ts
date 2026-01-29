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
    const result = await getEducationLevels()
    if (result.isErr())
      throw result.error
    return result.value
  })

// ===== TRACKS =====

export const tracksQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getTracks } = await loadCatalogQueries()
    const result = await getTracks()
    if (result.isErr())
      throw result.error
    return result.value
  })

export const trackByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TrackIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getTrackById } = await loadCatalogQueries()
    const result = await getTrackById(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const createTrackMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateTrackSchema.parse(data))
  .handler(async (ctx) => {
    const { createTrack } = await loadCatalogQueries()
    const result = await createTrack(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const updateTrackMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateTrackSchema.parse(data))
  .handler(async (ctx) => {
    const { updateTrack } = await loadCatalogQueries()
    const { id, ...updateData } = ctx.data
    const result = await updateTrack(id, updateData)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const deleteTrackMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => TrackIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteTrack } = await loadCatalogQueries()
    const result = await deleteTrack(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

// ===== GRADES =====

export const gradesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetGradesSchema.parse(data))
  .handler(async (ctx) => {
    const { getGrades } = await loadCatalogQueries()
    const result = await getGrades(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const gradeByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GradeIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getGradeById } = await loadCatalogQueries()
    const result = await getGradeById(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const createGradeMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateGradeSchema.parse(data))
  .handler(async (ctx) => {
    const { createGrade } = await loadCatalogQueries()
    const result = await createGrade(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const updateGradeMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateGradeSchema.parse(data))
  .handler(async (ctx) => {
    const { updateGrade } = await loadCatalogQueries()
    const { id, ...updateData } = ctx.data
    const result = await updateGrade(id, updateData)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const deleteGradeMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GradeIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteGrade } = await loadCatalogQueries()
    const result = await deleteGrade(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

// ===== SERIES =====

export const seriesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetSeriesSchema.parse(data))
  .handler(async (ctx) => {
    const { getSeries } = await loadCatalogQueries()
    const result = await getSeries(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const serieByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SerieIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getSerieById } = await loadCatalogQueries()
    const result = await getSerieById(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const createSerieMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateSerieSchema.parse(data))
  .handler(async (ctx) => {
    const { createSerie } = await loadCatalogQueries()
    const result = await createSerie(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const updateSerieMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateSerieSchema.parse(data))
  .handler(async (ctx) => {
    const { updateSerie } = await loadCatalogQueries()
    const { id, ...updateData } = ctx.data
    const result = await updateSerie(id, updateData)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const deleteSerieMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SerieIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteSerie } = await loadCatalogQueries()
    const result = await deleteSerie(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

// ===== SUBJECTS =====

export const subjectsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetSubjectsSchema.parse(data))
  .handler(async (ctx) => {
    const { getSubjects } = await loadCatalogQueries()
    const result = await getSubjects(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const subjectByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SubjectIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getSubjectById } = await loadCatalogQueries()
    const result = await getSubjectById(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const createSubjectMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateSubjectSchema.parse(data))
  .handler(async (ctx) => {
    const { createSubject } = await loadCatalogQueries()
    const result = await createSubject(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const updateSubjectMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateSubjectSchema.parse(data))
  .handler(async (ctx) => {
    const { updateSubject } = await loadCatalogQueries()
    const { id, ...updateData } = ctx.data
    const result = await updateSubject(id, updateData)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const deleteSubjectMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => SubjectIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteSubject } = await loadCatalogQueries()
    const result = await deleteSubject(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

// ===== CATALOG STATS =====

export const catalogStatsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getCatalogStats } = await loadCatalogQueries()
    const result = await getCatalogStats()
    if (result.isErr())
      throw result.error
    return result.value
  })

// ===== BULK OPERATIONS =====

export const bulkUpdateGradesOrderMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => z.array(z.object({ id: z.string(), order: z.number() })).parse(data))
  .handler(async (ctx) => {
    const { bulkUpdateGradesOrder } = await loadCatalogQueries()
    const result = await bulkUpdateGradesOrder(ctx.data)
    if (result.isErr())
      throw result.error
    return { success: true }
  })

export const bulkCreateSeriesMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => z.array(CreateSerieSchema).parse(data))
  .handler(async (ctx) => {
    const { bulkCreateSeries } = await loadCatalogQueries()
    const result = await bulkCreateSeries(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const bulkCreateSubjectsMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => z.array(CreateSubjectSchema).parse(data))
  .handler(async (ctx) => {
    const { bulkCreateSubjects } = await loadCatalogQueries()
    const result = await bulkCreateSubjects(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })
