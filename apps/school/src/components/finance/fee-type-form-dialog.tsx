import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { feeTypesKeys, feeTypesOptions } from '@/lib/queries/fee-types'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { feeCategories } from '@/schemas/fee-type'
import { createNewFeeType, updateExistingFeeType } from '@/school/functions/fee-types'
import { FeeTypeForm } from './fee-types/fee-type-form'

const feeTypeFormSchema = z.object({
  id: z.string().optional(),
  templateId: z.string().optional(),
  code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  nameEn: z.string().max(100).optional(),
  category: z.enum(feeCategories, { message: 'Catégorie invalide' }),
  isMandatory: z.boolean(),
  isRecurring: z.boolean(),
  displayOrder: z.coerce.number().int().min(0),
})

type FeeTypeFormData = z.output<typeof feeTypeFormSchema>

interface FeeTypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editData?: FeeTypeFormData | null
}

export function FeeTypeFormDialog({
  open,
  onOpenChange,
  editData,
}: FeeTypeFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isEditMode = !!editData

  const { data: templates } = useQuery(feeTypesOptions.templates())

  const form = useForm<FeeTypeFormData>({
    resolver: zodResolver(feeTypeFormSchema) as never,
    defaultValues: {
      code: '',
      name: '',
      nameEn: '',
      category: 'tuition',
      isMandatory: true,
      isRecurring: true,
      displayOrder: 0,
    },
  })

  // Pre-fill form when template is selected
  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = templates?.find(t => t.id === templateId)
    if (template) {
      form.setValue('templateId', templateId)
      form.setValue('code', template.code)
      form.setValue('name', template.name)
      form.setValue('nameEn', template.nameEn || '')
      form.setValue('category', template.category)
      form.setValue('isMandatory', template.isMandatory)
      form.setValue('isRecurring', template.isRecurring)
      form.setValue('displayOrder', template.displayOrder)
    }
  }, [templates, form])

  const resetForm = useCallback(() => {
    if (editData) {
      form.reset({
        id: editData.id,
        code: editData.code,
        name: editData.name,
        nameEn: editData.nameEn,
        category: editData.category,
        isMandatory: editData.isMandatory,
        isRecurring: editData.isRecurring,
        displayOrder: editData.displayOrder,
      })
    }
    else {
      form.reset({
        code: '',
        name: '',
        nameEn: '',
        category: 'tuition',
        isMandatory: true,
        isRecurring: true,
        displayOrder: 0,
      })
    }
  }, [editData, form])

  useEffect(() => {
    if (open)
      resetForm()
  }, [open, resetForm])

  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.feeTypes.create,
    mutationFn: async (data: FeeTypeFormData) => {
      const result = await createNewFeeType({
        data: {
          code: data.code,
          name: data.name,
          nameEn: data.nameEn,
          category: data.category,
          isMandatory: data.isMandatory,
          isRecurring: data.isRecurring,
          displayOrder: data.displayOrder,
          feeTypeTemplateId: data.templateId || null,
        },
      })
      if (!result.success)
        throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeTypesKeys.all })
      toast.success(t.finance.feeTypes.created())
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationKey: schoolMutationKeys.feeTypes.update,
    mutationFn: async (data: FeeTypeFormData) => {
      const result = await updateExistingFeeType({
        data: {
          id: data.id!,
          code: data.code,
          name: data.name,
          nameEn: data.nameEn,
          category: data.category,
          isMandatory: data.isMandatory,
          isRecurring: data.isRecurring,
          displayOrder: data.displayOrder,
        },
      })
      if (!result.success)
        throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeTypesKeys.all })
      toast.success('Type de frais mis à jour')
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const onSubmit = (data: FeeTypeFormData) => {
    if (isEditMode)
      updateMutation.mutate(data)
    else createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? 'Modifier le type de frais' : t.finance.feeTypes.create()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {isEditMode ? 'Modifier les informations du type de frais' : t.finance.feeTypes.createDescription()}
          </DialogDescription>
        </DialogHeader>

        <FeeTypeForm
          form={form}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={createMutation.isPending || updateMutation.isPending}
          isEditMode={isEditMode}
          templates={templates}
          onTemplateSelect={handleTemplateSelect}
        />
      </DialogContent>
    </Dialog>
  )
}
