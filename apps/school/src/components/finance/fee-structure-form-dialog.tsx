import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { DatePicker } from '@workspace/ui/components/date-picker'
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
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import {
  feeStructuresKeys,
  feeTypesKeys,
  feeTypesOptions,
} from '@/lib/queries'
import {
  createNewFeeStructure,
  updateExistingFeeStructure,
} from '@/school/functions/fee-structures'
import { getGrades } from '@/school/functions/grades'
import { getSeries } from '@/school/functions/series'
import { getSchoolYearContext } from '@/school/middleware/school-context'

const feeStructureFormSchema = z.object({
  feeTypeId: z.string().min(1, 'Type de frais requis'),
  gradeId: z.string().optional().nullable(),
  seriesId: z.string().optional().nullable(),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide')
    .min(1, 'Montant requis'),
  currency: z.string(),
  newStudentAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide')
    .optional()
    .nullable(),
  effectiveDate: z.string().optional().nullable(),
})

type FeeStructureFormData = z.infer<typeof feeStructureFormSchema>

interface FeeStructureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any
}

export function FeeStructureFormDialog({
  open,
  onOpenChange,
  initialData,
}: FeeStructureFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const { data: feeTypes } = useQuery(feeTypesOptions.list())
  const { data: grades } = useQuery({
    queryKey: ['grades', 'list'],
    queryFn: () => getGrades({ data: {} }),
  })
  const { data: series } = useQuery({
    queryKey: ['series', 'list'],
    queryFn: () => getSeries({ data: {} }),
  })

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureFormSchema),
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
          newStudentAmount: initialData.newStudentAmount
            ? String(initialData.newStudentAmount)
            : '',
          effectiveDate: initialData.effectiveDate
            ? new Date(initialData.effectiveDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
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
          effectiveDate: new Date().toISOString().split('T')[0],
        })
      }
    }
  }, [open, initialData, form])

  const isEditing = !!initialData

  // Get selected fee type for display
  const selectedFeeType = feeTypes?.find(
    ft => ft.id === form.watch('feeTypeId'),
  )

  const mutation = useMutation({
    mutationFn: async (data: FeeStructureFormData) => {
      const yearContext = await getSchoolYearContext()
      if (!yearContext?.schoolYearId) {
        throw new Error('Année scolaire non définie')
      }

      const gradeId = data.gradeId === 'all' ? null : data.gradeId
      const seriesId = data.seriesId === 'all' ? null : data.seriesId

      if (isEditing) {
        return updateExistingFeeStructure({
          data: {
            id: initialData.id,
            feeTypeId: data.feeTypeId,
            gradeId: gradeId?.trim() || null,
            seriesId: seriesId?.trim() || null,
            amount: data.amount,
            currency: data.currency,
            newStudentAmount:
              data.newStudentAmount && data.newStudentAmount.trim() !== ''
                ? data.newStudentAmount.trim()
                : null,
            effectiveDate: data.effectiveDate || null,
          } as any,
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
          newStudentAmount:
            data.newStudentAmount && data.newStudentAmount.trim() !== ''
              ? data.newStudentAmount.trim()
              : null,
          effectiveDate: data.effectiveDate || null,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeTypesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: feeStructuresKeys.lists() })
      toast.success(
        isEditing
          ? 'Structure de frais modifiée avec succès'
          : 'Structure de frais créée avec succès',
      )
      form.reset()
      onOpenChange(false)
    },
    onError: (err: any) => {
      console.error('Fee creation error:', err)
      let message = err.message || 'Une erreur est survenue'

      try {
        const serverError
          = err?.p?.v?.[1]?.s?.message?.s || err?.p?.v?.[1]?.s?.message
        if (serverError && typeof serverError === 'string') {
          message = serverError
        }
      }
      catch {
        // Keep original
      }

      if (message.includes('unique_fee_structure')) {
        message = 'Cette structure de frais existe déjà pour ce niveau/série'
      }
      else if (message.includes('foreign key constraint')) {
        message = 'Données de référence invalides'
      }
      else if (message.includes('Failed query')) {
        message = 'Erreur lors de l\'enregistrement dans la base de données'
      }

      toast.error(message, {
        duration: 5000,
      })
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
            {isEditing
              ? 'Modifier une structure de frais'
              : 'Créer une structure de frais'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {isEditing
              ? 'Modifier les paramètres de cette structure'
              : 'Définir les frais pour une classe ou série'}
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
                    Type de frais *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                        <SelectValue>
                          {selectedFeeType
                            ? (
                                <span className="flex items-center gap-2">
                                  {selectedFeeType.name}
                                  {' '}
                                  (
                                  {selectedFeeType.code}
                                  )
                                </span>
                              )
                            : (
                                <span className="text-muted-foreground">
                                  Sélectionner un type de frais
                                </span>
                              )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                      {feeTypes?.map(ft => (
                        <SelectItem
                          key={ft.id}
                          value={ft.id}
                          className="rounded-lg cursor-pointer focus:bg-primary/10"
                        >
                          {ft.name}
                          {' '}
                          (
                          {ft.code}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      Niveau (Optionnel)
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? 'all'}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                          <SelectValue
                            placeholder={t.finance.feeStructures.allLevels()}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl backdrop-blur-xl">
                        <SelectItem value="all">
                          {t.finance.feeStructures.allLevels()}
                        </SelectItem>
                        {grades?.map(g => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
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
                name="seriesId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      Série (Optionnel)
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? 'all'}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                          <SelectValue placeholder="Toutes les séries" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl backdrop-blur-xl">
                        <SelectItem value="all">Toutes les séries</SelectItem>
                        {series?.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Montant *
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

            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Date d'effet
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) => field.onChange(date ? (date.toISOString().split('T')[0] ?? '') : null)}
                      placeholder="Date d'effet"
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
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl shadow-lg shadow-primary/20"
              >
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
