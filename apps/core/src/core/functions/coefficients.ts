import {
  bulkCreateCoefficients,
  bulkUpdateCoefficients,
  copyCoefficientTemplates,
  createCoefficientTemplate,
  deleteCoefficientTemplate,
  getCoefficientStats,
  getCoefficientTemplateById,
  getCoefficientTemplates,
  updateCoefficientTemplate,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { exampleMiddlewareWithContext } from '@/core/middleware/example-middleware'
import {
  BulkCreateCoefficientsSchema,
  BulkUpdateCoefficientsSchema,
  CoefficientTemplateIdSchema,
  CopyCoefficientsSchema,
  CreateCoefficientTemplateSchema,
  GetCoefficientTemplatesSchema,
  UpdateCoefficientTemplateSchema,
} from '@/schemas/coefficients'

// ===== COEFFICIENT TEMPLATES =====

export const coefficientTemplatesQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => GetCoefficientTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    return await getCoefficientTemplates(ctx.data)
  })

export const coefficientTemplateByIdQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CoefficientTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    return await getCoefficientTemplateById(ctx.data.id)
  })

export const createCoefficientTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CreateCoefficientTemplateSchema.parse(data))
  .handler(async (ctx) => {
    return await createCoefficientTemplate(ctx.data)
  })

export const updateCoefficientTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => UpdateCoefficientTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateCoefficientTemplate(id, updateData)
  })

export const deleteCoefficientTemplateMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CoefficientTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    await deleteCoefficientTemplate(ctx.data.id)
    return { success: true, id: ctx.data.id }
  })

export const bulkCreateCoefficientsMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => BulkCreateCoefficientsSchema.parse(data))
  .handler(async (ctx) => {
    return await bulkCreateCoefficients(ctx.data.coefficients)
  })

export const bulkUpdateCoefficientsMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => BulkUpdateCoefficientsSchema.parse(data))
  .handler(async (ctx) => {
    await bulkUpdateCoefficients(ctx.data)
    return { success: true }
  })

export const copyCoefficientsMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .inputValidator(data => CopyCoefficientsSchema.parse(data))
  .handler(async (ctx) => {
    return await copyCoefficientTemplates(ctx.data.sourceYearId, ctx.data.targetYearId)
  })

export const coefficientStatsQuery = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .handler(async () => {
    return await getCoefficientStats()
  })

export const validateCoefficientImportMutation = createServerFn()
  .middleware([exampleMiddlewareWithContext])
  .handler(async (ctx) => {
    // This will be called from the client with parsed Excel data
    // to validate against existing data in the database
    // const { data: _data } = ctx.data as { data: any[] }

    // TODO: Implement validation logic
    // - Check if school years exist
    // - Check if subjects exist
    // - Check if grades exist
    // - Check if series exist
    // - Check for duplicates

    return { valid: true, errors: [] }
  })
