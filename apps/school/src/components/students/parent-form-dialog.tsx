import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Form } from '@workspace/ui/components/form'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { parentsKeys } from '@/lib/queries/parents'
import { createParent, updateParent } from '@/school/functions/parents'
import { ParentFormFields } from './parents/parent-form-fields'

const phoneRegex = /^(\+225)?\d{10}$/
const parentFormSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100),
  lastName: z.string().min(1, 'Le nom est requis').max(100),
  phone: z.string().min(10, 'Le téléphone est requis').regex(phoneRegex, 'Format: +2250701020304 ou 0701020304'),
  phone2: z.string().regex(phoneRegex, 'Format invalide').optional().or(z.literal('')),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  occupation: z.string().max(100).optional(),
  workplace: z.string().max(200).optional(),
})

type ParentFormValues = z.infer<typeof parentFormSchema>

interface ParentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parent?: ParentFormValues & { id: string }
}

export function ParentFormDialog({ open, onOpenChange, parent }: ParentFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isEditing = !!parent

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      firstName: parent?.firstName || '',
      lastName: parent?.lastName || '',
      phone: parent?.phone || '',
      phone2: parent?.phone2 || '',
      email: parent?.email || '',
      address: parent?.address || '',
      occupation: parent?.occupation || '',
      workplace: parent?.workplace || '',
    },
  })

  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.parents.create,
    mutationFn: (data: ParentFormValues) => createParent({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
      toast.success(t.parents.createSuccess())
      onOpenChange(false)
      form.reset()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationKey: schoolMutationKeys.parents.update,
    mutationFn: (data: ParentFormValues) => updateParent({ data: { id: parent!.id, updates: data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
      toast.success(t.parents.updateSuccess())
      onOpenChange(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        bg-card/95 border-border/40 max-w-lg backdrop-blur-xl
      "
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? t.parents.editParent() : t.parents.addParent()}</DialogTitle>
          <DialogDescription>{isEditing ? t.parents.editParentDescription() : t.parents.addParentDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => isEditing ? updateMutation.mutate(d) : createMutation.mutate(d))}
            className="space-y-4"
          >
            <ParentFormFields form={form} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel()}</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? t.common.loading() : t.common.save()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
