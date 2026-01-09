'use client'

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
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
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
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t.finance.feeTypes.create()}</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
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
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t.common.code()}
                      {' '}
                      *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t.finance.feeTypes.placeholders.code()} className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors" />
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
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t.finance.feeTypes.category()}
                      {' '}
                      *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                        {feeCategories.map(cat => (
                          <SelectItem key={cat} value={cat} className="rounded-lg cursor-pointer focus:bg-primary/10">
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
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t.common.name()}
                    {' '}
                    *
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.finance.feeTypes.placeholders.name()} className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors" />
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
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.common.nameEn()}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.finance.feeTypes.placeholders.nameEn()} className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors" />
                  </FormControl>
                  <FormDescription className="text-[11px]">
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
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.common.displayOrder()}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6 pt-2">
              <FormField
                control={form.control}
                name="isMandatory"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 rounded-xl border border-border/40 p-3 bg-muted/10">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-border/60 rounded-md"
                      />
                    </FormControl>
                    <FormLabel className="font-medium cursor-pointer">
                      {t.finance.feeTypes.mandatory()}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 rounded-xl border border-border/40 p-3 bg-muted/10">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-border/60 rounded-md"
                      />
                    </FormControl>
                    <FormLabel className="font-medium cursor-pointer">
                      {t.finance.feeTypes.recurring()}
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
              <Button type="submit" disabled={mutation.isPending} className="rounded-xl shadow-lg shadow-primary/20">
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
