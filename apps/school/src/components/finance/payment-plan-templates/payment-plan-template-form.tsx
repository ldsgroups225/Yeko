import type { UseFormReturn } from 'react-hook-form'
import type { PaymentPlanTemplateFormData } from './payment-plan-template-schema'
import { IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
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
import { useEffect } from 'react'
import { useFieldArray } from 'react-hook-form'
import { useTranslations } from '@/i18n'

interface PaymentPlanTemplateFormProps {
  form: UseFormReturn<PaymentPlanTemplateFormData>
  onSubmit: (data: PaymentPlanTemplateFormData) => void
  onCancel: () => void
  isPending: boolean
  isEditMode: boolean
}

export function PaymentPlanTemplateForm({
  form,
  onSubmit,
  onCancel,
  isPending,
  isEditMode,
}: PaymentPlanTemplateFormProps) {
  const t = useTranslations()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'schedule',
  })

  const installmentsCount = form.watch('installmentsCount')

  useEffect(() => {
    const currentSchedule = form.getValues('schedule')
    const currentCount = currentSchedule.length

    if (installmentsCount > currentCount) {
      const newInstallments = Array.from(
        { length: installmentsCount - currentCount },
        (_, i) => ({
          number: currentCount + i + 1,
          percentage: Number((100 / installmentsCount).toFixed(2)),
          dueDaysFromStart: (currentCount + i) * 30,
          label: `Échéance ${currentCount + i + 1}`,
        }),
      )
      append(newInstallments)
    }
    else if (installmentsCount < currentCount) {
      const installmentsToRemove = currentCount - installmentsCount
      for (let i = 0; i < installmentsToRemove; i++) {
        remove(currentCount - 1 - i)
      }
    }
  }, [installmentsCount, append, remove, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                Nom *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Plan trimestriel"
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                Nom (English)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Quarterly Plan"
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
                />
              </FormControl>
              <FormDescription className="text-[11px]">
                Optionnel
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="
          grid gap-4
          md:grid-cols-2
        "
        >
          <FormField
            control={form.control}
            name="installmentsCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
                  Nombre d'échéances *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    className="
                      border-border/40 bg-muted/20
                      focus:bg-background
                      rounded-xl transition-colors
                    "
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
              <FormItem className="
                border-border/40 bg-muted/10 mt-6 flex items-center
                justify-between space-y-0 rounded-xl border p-3
              "
              >
                <FormLabel className="cursor-pointer font-medium">
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

        <div className="border-border/40 mt-4 border-t pt-4">
          <h4 className="mb-3 text-sm font-semibold">Calendrier des échéances</h4>
          <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="
                  border-border/40 bg-muted/5 grid items-end gap-2 rounded-xl
                  border p-3
                  md:grid-cols-4
                "
              >
                <FormField
                  control={form.control}
                  name={`schedule.${index}.label`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="
                        text-muted-foreground text-[10px] font-bold
                        tracking-wider uppercase
                      "
                      >
                        Label
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`Échéance ${index + 1}`}
                          className="
                            border-border/40 bg-muted/20 rounded-lg text-sm
                          "
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
                      <FormLabel className="
                        text-muted-foreground text-[10px] font-bold
                        tracking-wider uppercase
                      "
                      >
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
                          className="
                            border-border/40 bg-muted/20 rounded-lg text-sm
                          "
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
                      <FormLabel className="
                        text-muted-foreground text-[10px] font-bold
                        tracking-wider uppercase
                      "
                      >
                        Jours
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                          className="
                            border-border/40 bg-muted/20 rounded-lg text-sm
                          "
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-border/10 flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border/40 rounded-xl"
          >
            {t.common.cancel()}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="shadow-primary/20 rounded-xl shadow-lg"
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Mettre à jour' : 'Créer le modèle'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
