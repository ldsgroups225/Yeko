import type { FeeStructure } from '@repo/data-ops'
import type { FeeStructureFormData } from './fee-structures/fee-structure-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { catalogsOptions } from '@/lib/queries/catalogs'
import { feeStructuresKeys } from '@/lib/queries/fee-structures'
import { feeTypesKeys, feeTypesOptions } from '@/lib/queries/fee-types'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { createNewFeeStructure, updateExistingFeeStructure } from '@/school/functions/fee-structures'
import { getSchoolYearContext } from '@/school/middleware/school-context'
import { FeeStructureForm } from './fee-structures/fee-structure-form'
import { getFeeStructureSchema } from './fee-structures/fee-structure-schema'

export type { FeeStructure }

interface FeeStructureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<FeeStructure>
}

export function FeeStructureFormDialog({
  open,
  onOpenChange,
  initialData,
}: FeeStructureFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEditing = !!initialData

  const schema = getFeeStructureSchema(t)

  const { data: feeTypes } = useQuery(feeTypesOptions.list())
  const { data: grades } = useQuery(catalogsOptions.grades())
  const { data: series } = useQuery(catalogsOptions.series())

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      feeTypeId: '',
      gradeId: 'all',
      seriesId: 'all',
      amount: '',
      currency: 'XOF',
      newStudentAmount: '',
      effectiveDate: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          feeTypeId: initialData.feeTypeId || '',
          gradeId: initialData.gradeId || 'all',
          seriesId: initialData.seriesId || 'all',
          amount: String(initialData.amount || ''),
          currency: initialData.currency || 'XOF',
          newStudentAmount: initialData.newStudentAmount ? String(initialData.newStudentAmount) : '',
          effectiveDate: initialData.effectiveDate || '',
        })
      }
      else {
        form.reset({
          feeTypeId: '',
          gradeId: 'all',
          seriesId: 'all',
          amount: '',
          currency: 'XOF',
          newStudentAmount: '',
          effectiveDate: '',
        })
      }
    }
  }, [open, initialData, form])

  const mutation = useMutation({
    mutationKey: isEditing ? schoolMutationKeys.feeStructures.update : schoolMutationKeys.feeStructures.create,
    mutationFn: async (data: FeeStructureFormData) => {
      const yearContext = await getSchoolYearContext()
      if (!yearContext?.schoolYearId)
        throw new Error(t('errors.generic'))

      const gradeId = data.gradeId === 'all' ? null : data.gradeId
      const seriesId = data.seriesId === 'all' ? null : data.seriesId

      if (isEditing) {
        return updateExistingFeeStructure({
          data: {
            id: initialData.id!,
            feeTypeId: data.feeTypeId,
            gradeId: gradeId?.trim() || null,
            seriesId: seriesId?.trim() || null,
            amount: data.amount,
            currency: data.currency,
            newStudentAmount: data.newStudentAmount?.trim() || null,
            effectiveDate: data.effectiveDate || null,
          },
        })
      }

      return createNewFeeStructure({
        data: {
          schoolYearId: yearContext.schoolYearId,
          feeTypeId: data.feeTypeId,
          gradeId: gradeId?.trim() || null,
          seriesId: seriesId?.trim() || null,
          amount: data.amount,
          currency: data.currency,
          newStudentAmount: data.newStudentAmount?.trim() || null,
          effectiveDate: data.effectiveDate || null,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeTypesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: feeStructuresKeys.lists() })
      toast.success(isEditing ? t('finance.feeStructures.success.update') : t('finance.feeStructures.success.create'))
      form.reset()
      onOpenChange(false)
    },
    onError: (err: any) => {
      console.error('Fee creation error:', err)
      const message = err.message || t('errors.generic')
      toast.error(message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        bg-card/95 border-border/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl
        sm:max-w-[500px]
      "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? t('finance.feeStructures.edit') : t('finance.feeStructures.create')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {isEditing ? t('finance.feeStructures.editDescription') : t('finance.feeStructures.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <FeeStructureForm
          form={form}
          onSubmit={data => mutation.mutate(data)}
          onCancel={() => onOpenChange(false)}
          isPending={mutation.isPending}
          feeTypeList={feeTypes || []}
          gradesList={grades || []}
          seriesList={series || []}
        />
      </DialogContent>
    </Dialog>
  )
}
