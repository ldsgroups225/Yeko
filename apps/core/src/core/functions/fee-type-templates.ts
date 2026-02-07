import { createServerFn } from '@tanstack/react-start'
import { databaseMiddleware } from '@/core/middleware/database'
import {
  CreateFeeTypeTemplateSchema,
  FeeTypeTemplateIdSchema,
  GetFeeTypeTemplatesSchema,
  UpdateFeeTypeTemplateSchema,
} from '@/schemas/catalog'

// Helper to load queries dynamically
const loadFeeTypeQueries = () => import('@repo/data-ops/queries/fee-type-templates')

export const feeTypeTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetFeeTypeTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const { getFeeTypeTemplates } = await loadFeeTypeQueries()
    const result = await getFeeTypeTemplates(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const feeTypeTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => FeeTypeTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { getFeeTypeTemplateById } = await loadFeeTypeQueries()
    const result = await getFeeTypeTemplateById(ctx.data.id)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const createFeeTypeTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateFeeTypeTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { createFeeTypeTemplate } = await loadFeeTypeQueries()
    const result = await createFeeTypeTemplate(ctx.data)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const updateFeeTypeTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateFeeTypeTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { updateFeeTypeTemplate } = await loadFeeTypeQueries()
    const { id, ...updateData } = ctx.data
    const result = await updateFeeTypeTemplate(id, updateData)
    if (result.isErr())
      throw result.error
    return result.value
  })

export const deleteFeeTypeTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => FeeTypeTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const { deleteFeeTypeTemplate } = await loadFeeTypeQueries()
    const result = await deleteFeeTypeTemplate(ctx.data.id)
    if (result.isErr())
      throw result.error
    return { success: true, id: ctx.data.id }
  })

export const feeTypeCategoriesWithCountsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const { getTemplateCategoriesWithCounts } = await loadFeeTypeQueries()
    const result = await getTemplateCategoriesWithCounts()
    if (result.isErr())
      throw result.error
    return result.value
  })
