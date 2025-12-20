'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { useTranslations } from '@/i18n'
import { feeTypesKeys } from '@/lib/queries/fee-types'
import { feeCategories, feeCategoryLabels } from '@/schemas/fee-type'
import { createNewFeeType } from '@/school/functions/fee-types'

const feeTypeFormSchema = z.object({
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
}

export function FeeTypeFormDialog({ open, onOpenChange }: FeeTypeFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

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

  const mutation = useMutation({
    mutationFn: (data: FeeTypeFormData) =>
      createNewFeeType({
        data: {
          code: data.code,
          name: data.name,
          nameEn: data.nameEn,
          category: data.category,
          isMandatory: data.isMandatory,
          isRecurring: data.isRecurring,
          displayOrder: data.displayOrder,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeTypesKeys.all })
      toast.success(t.finance.feeTypes.created())
      form.reset()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: FeeTypeFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.finance.feeTypes.create()}</DialogTitle>
          <DialogDescription>
            {t.finance.feeTypes.createDescription()}
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
                      {t.common.code()}
                      {' '}
                      *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t.finance.feeTypes.placeholders.code()} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.finance.feeTypes.category()}
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
                        {feeCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {feeCategoryLabels[cat]}
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
                    {t.common.name()}
                    {' '}
                    *
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.finance.feeTypes.placeholders.name()} />
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
                  <FormLabel>{t.common.nameEn()}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.finance.feeTypes.placeholders.nameEn()} />
                  </FormControl>
                  <FormDescription>
                    {t.common.optionalEnglishName()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.common.displayOrder()}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="isMandatory"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t.finance.feeTypes.mandatory()}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t.finance.feeTypes.recurring()}
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
                {t.common.cancel()}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
