import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { discountsKeys } from '@/lib/queries/discounts'
import {
  calculationTypeLabels,
  calculationTypes,
  discountTypeLabels,
  discountTypes,
} from '@/schemas/discount'
import {
  createNewDiscount,
  updateExistingDiscount,
} from '@/school/functions/discounts'

const discountFormSchema = z
  .object({
    code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
    name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
    nameEn: z.string().max(100).optional(),
    type: z.enum(discountTypes, { message: 'Type de réduction invalide' }),
    calculationType: z.enum(calculationTypes, {
      message: 'Type de calcul invalide',
    }),
    value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valeur invalide'),
    requiresApproval: z.boolean(),
    autoApply: z.boolean(),
  })
  .refine(
    data =>
      data.calculationType !== 'percentage'
      || Number.parseFloat(data.value) <= 100,
    { message: 'Le pourcentage ne peut pas dépasser 100%', path: ['value'] },
  )

type DiscountFormData = z.infer<typeof discountFormSchema>

export interface Discount extends DiscountFormData {
  id: string
}

interface DiscountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<Discount>
}

export function DiscountFormDialog({
  open,
  onOpenChange,
  initialData,
}: DiscountFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {},
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          code: initialData.code || '',
          name: initialData.name || '',
          nameEn: initialData.nameEn || '',
          type: initialData.type || 'sibling',
          calculationType: initialData.calculationType || 'percentage',
          value: String(initialData.value || ''),
          requiresApproval: !!initialData.requiresApproval,
          autoApply: !!initialData.autoApply,
        })
      }
      else {
        form.reset({
          code: '',
          name: '',
          nameEn: '',
          type: 'sibling',
          calculationType: 'percentage',
          value: '',
          requiresApproval: false,
          autoApply: false,
        })
      }
    }
  }, [open, initialData, form])

  const isEditing = !!initialData

  const mutation = useMutation({
    mutationFn: (data: DiscountFormData) => {
      if (isEditing) {
        return updateExistingDiscount({
          data: {
            id: initialData.id!,
            ...data,
          },
        })
      }
      return createNewDiscount({
        data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountsKeys.all })
      toast.success(
        isEditing ? 'Réduction mise à jour' : t.finance.discounts.created(),
      )
      form.reset()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: DiscountFormData) => {
    mutation.mutate(data)
  }

  const watchCalculationType = form.watch('calculationType')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? 'Modifier la réduction' : t.finance.discounts.create()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {isEditing
              ? 'Modifier les paramètres de cette réduction'
              : t.finance.discounts.createDescription()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t.common.code()}
                      {' '}
                      *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t.finance.discounts.placeholders.code()}
                        className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t.finance.discounts.type()}
                      {' '}
                      *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                          <SelectValue>
                            {field.value ? discountTypeLabels[field.value as keyof typeof discountTypeLabels] : ''}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                        {discountTypes.map(type => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="rounded-lg cursor-pointer focus:bg-primary/10"
                          >
                            {discountTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t.common.name()}
                    {' '}
                    *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t.finance.discounts.placeholders.name()}
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
                    {t.common.nameEn()}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t.finance.discounts.placeholders.nameEn()}
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    {t.common.optionalEnglishName()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="calculationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t.finance.discounts.calculationType()}
                      {' '}
                      *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                          <SelectValue>
                            {field.value ? calculationTypeLabels[field.value as keyof typeof calculationTypeLabels] : ''}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                        {calculationTypes.map(type => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="rounded-lg cursor-pointer focus:bg-primary/10"
                          >
                            {calculationTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t.finance.discounts.value()}
                      {' '}
                      *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          {...field}
                          className="pr-12 rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors font-bold text-lg"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                          {watchCalculationType === 'percentage' ? '%' : 'FCFA'}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requiresApproval"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 p-3 rounded-xl border border-border/40 bg-muted/10 h-full">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-bold text-xs cursor-pointer w-full truncate">
                      {t.finance.discounts.requiresApproval()}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoApply"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 p-3 rounded-xl border border-border/40 bg-muted/10 h-full">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-bold text-x                          s cursor-pointer w-full truncate">
                      {t.finance.discounts.autoApply()}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-border/40"
              >
                {t.common.cancel()}
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="rounded-xl shadow-lg shadow-primary/20"
              >
                {mutation.isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t.common.save()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
