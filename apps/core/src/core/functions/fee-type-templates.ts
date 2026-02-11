import { R } from '@praha/byethrow'
import {
  createFeeTypeTemplate,
  deleteFeeTypeTemplate,
  getFeeTypeTemplateById,
  getFeeTypeTemplates,
  getTemplateCategoriesWithCounts,
  updateFeeTypeTemplate,
} from '@repo/data-ops/queries/fee-type-templates'
import { createServerFn } from '@tanstack/react-start'
import { databaseMiddleware } from '@/core/middleware/database'
import {
  CreateFeeTypeTemplateSchema,
  FeeTypeTemplateIdSchema,
  GetFeeTypeTemplatesSchema,
  UpdateFeeTypeTemplateSchema,
} from '@/schemas/catalog'

export const feeTypeTemplatesQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => GetFeeTypeTemplatesSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getFeeTypeTemplates(ctx.data)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const feeTypeTemplateByIdQuery = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => FeeTypeTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await getFeeTypeTemplateById(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const createFeeTypeTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => CreateFeeTypeTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const result = await createFeeTypeTemplate(ctx.data)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const updateFeeTypeTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => UpdateFeeTypeTemplateSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    const result = await updateFeeTypeTemplate(id, updateData)
    if (R.isFailure(result))
      throw result.error
    return result.value
  })

export const deleteFeeTypeTemplateMutation = createServerFn()
  .middleware([databaseMiddleware])
  .inputValidator(data => FeeTypeTemplateIdSchema.parse(data))
  .handler(async (ctx) => {
    const result = await deleteFeeTypeTemplate(ctx.data.id)
    if (R.isFailure(result))
      throw result.error
    return { success: true, id: ctx.data.id }
  })

export const feeTypeCategoriesWithCountsQuery = createServerFn()
  .middleware([databaseMiddleware])
  .handler(async () => {
    const result = await getTemplateCategoriesWithCounts()
    if (R.isFailure(result))
      throw result.error
    return result.value
  })
