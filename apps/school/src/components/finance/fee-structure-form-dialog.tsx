'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
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
import { feeTypesKeys, feeTypesOptions } from '@/lib/queries/fee-types'
import { createNewFeeStructure } from '@/school/functions/fee-structures'
import { getSchoolYearContext } from '@/school/middleware/school-context'

const feeStructureFormSchema = z.object({
  feeTypeId: z.string().min(1, 'Type de frais requis'),
  gradeId: z.string().optional().nullable(),
  seriesId: z.string().optional().nullable(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide').min(1, 'Montant requis'),
  currency: z.string().default('XOF'),
  newStudentAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide').optional().nullable(),
})

type FeeStructureFormData = z.infer<typeof feeStructureFormSchema>

interface FeeStructureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeeStructureFormDialog({ open, onOpenChange }: FeeStructureFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const { data: feeTypes } = useQuery(feeTypesOptions.list())

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureFormSchema) as never,
    defaultValues: {
      feeTypeId: '',
      gradeId: null,
      seriesId: null,
      amount: '',
      currency: 'XOF',
      newStudentAmount: null,
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: FeeStructureFormData) => {
      const yearContext = await getSchoolYearContext()
      if (!yearContext?.schoolYearId) {
        throw new Error('Année scolaire non définie')
      }
      return createNewFeeStructure({
        data: {
          schoolYearId: yearContext.schoolYearId,
          feeTypeId: data.feeTypeId,
          gradeId: data.gradeId,
          seriesId: data.seriesId,
          amount: data.amount,
          currency: data.currency,
          newStudentAmount: data.newStudentAmount,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeTypesKeys.all })
      toast.success('Structure de frais créée avec succès')
      form.reset()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: FeeStructureFormData) => {
    mutation.mutate(data)
  }

  const isPending = mutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Créer une structure de frais
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Définir les frais pour une classe ou série
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="feeTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Type de frais
                    {' '}
                    *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                        <SelectValue placeholder="Sélectionner un type de frais" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                      {feeTypes?.map(ft => (
                        <SelectItem key={ft.id} value={ft.id} className="rounded-lg cursor-pointer focus:bg-primary/10">
                          {ft.name} ({ft.code})
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Montant
                    {' '}
                    *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="0.00"
                      value={field.value ?? ''}
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newStudentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Montant nouvel élève
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="0.00"
                      value={field.value ?? ''}
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-border/40"
              >
                {t.common.cancel()}
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-xl shadow-lg shadow-primary/20">
                {isPending && (
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
