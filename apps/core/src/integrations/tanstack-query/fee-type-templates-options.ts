import type {
  CreateFeeTypeTemplateInput,
  FeeTypeTemplateIdInput,
  GetFeeTypeTemplatesInput,
  UpdateFeeTypeTemplateInput,
} from '@/schemas/catalog'
import { queryOptions } from '@tanstack/react-query'
import {
  createFeeTypeTemplateMutation,
  deleteFeeTypeTemplateMutation,
  feeTypeCategoriesWithCountsQuery,
  feeTypeTemplateByIdQuery,
  feeTypeTemplatesQuery,
  updateFeeTypeTemplateMutation,
} from '@/core/functions/fee-type-templates'

export const feeTypeTemplatesMutationKeys = {
  create: ['fee-type-templates', 'create'] as const,
  update: ['fee-type-templates', 'update'] as const,
  delete: ['fee-type-templates', 'delete'] as const,
}

export function feeTypeTemplatesQueryOptions(params: GetFeeTypeTemplatesInput = {}) {
  return queryOptions({
    queryKey: ['fee-type-templates', params],
    queryFn: () => feeTypeTemplatesQuery({ data: params }),
    staleTime: 1000 * 60 * 5,
  })
}

export function feeTypeTemplateByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['fee-type-template', id],
    queryFn: () => feeTypeTemplateByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  })
}

export function feeTypeCategoriesWithCountsQueryOptions() {
  return queryOptions({
    queryKey: ['fee-type-categories-counts'],
    queryFn: () => feeTypeCategoriesWithCountsQuery(),
    staleTime: 1000 * 60 * 10,
  })
}

export const createFeeTypeTemplateMutationOptions = {
  mutationKey: feeTypeTemplatesMutationKeys.create,
  mutationFn: (data: CreateFeeTypeTemplateInput) => createFeeTypeTemplateMutation({ data }),
}

export const updateFeeTypeTemplateMutationOptions = {
  mutationKey: feeTypeTemplatesMutationKeys.update,
  mutationFn: (data: UpdateFeeTypeTemplateInput) => updateFeeTypeTemplateMutation({ data }),
}

export const deleteFeeTypeTemplateMutationOptions = {
  mutationKey: feeTypeTemplatesMutationKeys.delete,
  mutationFn: (data: FeeTypeTemplateIdInput) => deleteFeeTypeTemplateMutation({ data }),
}
