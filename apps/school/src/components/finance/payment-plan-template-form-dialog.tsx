import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Switch } from '@workspace/ui/components/switch'
import { useCallback, useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { paymentPlanTemplatesKeys } from '@/lib/queries/payment-plan-templates'
import { createPaymentPlanTemplate, updatePaymentPlanTemplate } from '@/school/functions/payment-plan-templates'

const installmentSchema = z.object({
  number: z.number().int().min(1),
  percentage: z.number().min(0).max(100),
  dueDaysFromStart: z.number().int().min(0),
  label: z.string().min(1, 'Label requis'),
})

const paymentPlanTemplateFormSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  nameEn: z.string().optional(),
  installmentsCount: z.number().int().min(1, 'Minimum 1 échéance'),
  schedule: z.array(installmentSchema).min(1, 'Au moins une échéance requise'),
  isDefault: z.boolean().default(false),
})

type PaymentPlanTemplateFormData = z.output<typeof paymentPlanTemplateFormSchema>

interface PaymentPlanTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolYearId: string
  initialData?: PaymentPlanTemplateFormData & { id: string }
}

export function PaymentPlanTemplateFormDialog({
  open,
  onOpenChange,
  schoolYearId,
  initialData,
}: PaymentPlanTemplateFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const form = useForm<PaymentPlanTemplateFormData>({
    resolver: zodResolver(paymentPlanTemplateFormSchema) as never,
    defaultValues: {
      name: '',
      nameEn: '',
      installmentsCount: 3,
      schedule: [
        { number: 1, percentage: 33.33, dueDaysFromStart: 0, label: 'Premier acompte' },
        { number: 2, percentage: 33.33, dueDaysFromStart: 30, label: 'Deuxième acompte' },
        { number: 3, percentage: 33.34, dueDaysFromStart: 60, label: 'Solde' },
      ],
      isDefault: false,
      ...initialData,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'schedule',
  })

  const installmentsCount = form.watch('installmentsCount')

  useEffect(() => {
    const currentSchedule = form.getValues('schedule')
    const currentCount = currentSchedule.length

    if (installmentsCount > currentCount) {
      const newInstallments = Array.from({ length: installmentsCount - currentCount }, (_, i) => ({
        number: currentCount + i + 1,
        percentage: Number((100 / installmentsCount).toFixed(2)),
        dueDaysFromStart: (currentCount + i) * 30,
        label: `Échéance ${currentCount + i + 1}`,
      }))
      append(newInstallments)
    }
    else if (installmentsCount < currentCount) {
      const installmentsToRemove = currentCount - installmentsCount
      for (let i = 0; i < installmentsToRemove; i++) {
        remove(currentCount - 1 - i)
      }
    }
  }, [installmentsCount, append, remove, form])

  const resetForm = useCallback(() => {
    form.reset({
      name: '',
      nameEn: '',
      installmentsCount: 3,
      schedule: [
        { number: 1, percentage: 33.33, dueDaysFromStart: 0, label: 'Premier acompte' },
        { number: 2, percentage: 33.33, dueDaysFromStart: 30, label: 'Deuxième acompte' },
        { number: 3, percentage: 33.34, dueDaysFromStart: 60, label: 'Solde' },
      ],
      isDefault: false,
      ...initialData,
    })
  }, [form, initialData])

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, resetForm])

  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.paymentPlanTemplates.create,
    mutationFn: async (data: PaymentPlanTemplateFormData) => {
      const result = await createPaymentPlanTemplate({
        data: {
          schoolYearId,
          name: data.name,
          nameEn: data.nameEn,
          installmentsCount: data.installmentsCount,
          schedule: data.schedule,
          isDefault: data.isDefault,
        },
      })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentPlanTemplatesKeys.all })
      toast.success('Modèle de plan de paiement créé avec succès')
      resetForm()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const updateMutation = useMutation({
    mutationKey: schoolMutationKeys.paymentPlanTemplates.update,
    mutationFn: async (data: PaymentPlanTemplateFormData) => {
      if (!initialData?.id)
        return

      const result = await updatePaymentPlanTemplate({
        data: {
          id: initialData.id,
          name: data.name,
          nameEn: data.nameEn,
          installmentsCount: data.installmentsCount,
          schedule: data.schedule,
          isDefault: data.isDefault,
        },
      })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentPlanTemplatesKeys.all })
      toast.success('Modèle de plan de paiement mis à jour avec succès')
      resetForm()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: PaymentPlanTemplateFormData) => {
    if (initialData) {
      updateMutation.mutate(data)
    }
    else {
      createMutation.mutate(data)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {initialData ? 'Modifier le modèle de plan de paiement' : 'Créer un modèle de plan de paiement'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {initialData ? 'Modifiez les informations du modèle' : 'Définissez les échéances et le calendrier de paiement pour ce modèle'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Nom
                    {' '}
                    *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Plan trimestriel"
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Nom (English)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Quarterly Plan"
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Optionnel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="installmentsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      Nombre d'échéances
                      {' '}
                      *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 rounded-xl border border-border/40 p-3 bg-muted/10 mt-6">
                    <FormLabel className="font-medium cursor-pointer">
                      Modèle par défaut
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t border-border/40 pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-3">Calendrier des échéances</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 md:grid-cols-4 items-end p-3 rounded-xl border border-border/40 bg-muted/5">
                    <FormField
                      control={form.control}
                      name={`schedule.${index}.label`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                            Label
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={`Échéance ${index + 1}`}
                              className="rounded-lg border-border/40 bg-muted/20 text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`schedule.${index}.percentage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                            %
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              max={100}
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="rounded-lg border-border/40 bg-muted/20 text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`schedule.${index}.dueDaysFromStart`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                            Jours
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="rounded-lg border-border/40 bg-muted/20 text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="rounded-xl border-border/40"
              >
                {t.common.cancel()}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl shadow-lg shadow-primary/20"
              >
                {isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {initialData ? 'Mettre à jour' : 'Créer le modèle'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
