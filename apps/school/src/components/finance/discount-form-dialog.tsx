'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { discountsKeys } from '@/lib/queries/discounts'
import {
  calculationTypeLabels,
  calculationTypes,
  discountTypeLabels,
  discountTypes,
} from '@/schemas/discount'
import { createNewDiscount } from '@/school/functions/discounts'

const discountFormSchema = z.object({
  code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  nameEn: z.string().max(100).optional(),
  type: z.enum(discountTypes, { message: 'Type de réduction invalide' }),
  calculationType: z.enum(calculationTypes, { message: 'Type de calcul invalide' }),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valeur invalide'),
  requiresApproval: z.boolean(),
  autoApply: z.boolean(),
}).refine(
  data => data.calculationType !== 'percentage' || Number.parseFloat(data.value) <= 100,
  { message: 'Le pourcentage ne peut pas dépasser 100%', path: ['value'] },
)

type DiscountFormData = z.infer<typeof discountFormSchema>

interface DiscountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DiscountFormDialog({ open, onOpenChange }: DiscountFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      code: '',
      name: '',
      nameEn: '',
      type: 'sibling',
      calculationType: 'percentage',
      value: '',
      requiresApproval: false,
      autoApply: false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: DiscountFormData) =>
      createNewDiscount({
        data: {
          code: data.code,
          name: data.name,
          nameEn: data.nameEn,
          type: data.type,
          calculationType: data.calculationType,
          value: data.value,
          requiresApproval: data.requiresApproval,
          autoApply: data.autoApply,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountsKeys.all })
      toast.success(t('finance.discounts.created'))
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('finance.discounts.create')}</DialogTitle>
          <DialogDescription>
            {t('finance.discounts.createDescription')}
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
                    <FormLabel>
                      {t('common.code')}
                      {' '}
                      *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('finance.discounts.placeholders.code')} />
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
                    <FormLabel>
                      {t('finance.discounts.type')}
                      {' '}
                      *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {discountTypes.map(type => (
                          <SelectItem key={type} value={type}>
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
                  <FormLabel>
                    {t('common.name')}
                    {' '}
                    *
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('finance.discounts.placeholders.name')} />
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
                  <FormLabel>{t('common.nameEn')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('finance.discounts.placeholders.nameEn')} />
                  </FormControl>
                  <FormDescription>
                    {t('common.optionalEnglishName')}
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
                    <FormLabel>
                      {t('finance.discounts.calculationType')}
                      {' '}
                      *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {calculationTypes.map(type => (
                          <SelectItem key={type} value={type}>
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
                    <FormLabel>
                      {t('finance.discounts.value')}
                      {' '}
                      *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          {...field}
                          className="pr-12"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {watchCalculationType === 'percentage' ? '%' : 'FCFA'}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="requiresApproval"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('finance.discounts.requiresApproval')}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoApply"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('finance.discounts.autoApply')}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
