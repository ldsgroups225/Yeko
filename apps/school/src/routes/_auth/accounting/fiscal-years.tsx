import {
  IconCalendar,
  IconLock,
} from '@tabler/icons-react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import { FiscalYearsTable } from '@/components/finance/fiscal-years-table'
import { useTranslations } from '@/i18n'
import { fiscalYearsKeys, fiscalYearsOptions } from '@/lib/queries/fiscal-years'
import { closeFiscalYear } from '@/school/functions/fiscal-years'

export const Route = createFileRoute('/_auth/accounting/fiscal-years')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(fiscalYearsOptions()),
  component: FiscalYearsPage,
})

function FiscalYearsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { data: fiscalYears } = useSuspenseQuery(fiscalYearsOptions())
  const [closingYear, setClosingYear] = useState<any>(null)

  const closeMutation = useMutation({
    mutationFn: (id: string) => closeFiscalYear({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalYearsKeys.all })
      toast.success('Année fiscale clôturée avec succès')
      setClosingYear(null)
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erreur lors de la clôture'
      toast.error(message)
    },
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <IconCalendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t.finance.fiscalYears.title()}
              </h1>
              <p className="text-muted-foreground">
                {t.finance.fiscalYears.description()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <FiscalYearsTable
          fiscalYears={fiscalYears.map(fy => ({ ...fy, status: fy.status || 'open' }))}
          onClose={fy => setClosingYear(fy)}
        />
      </div>

      <AlertDialog open={!!closingYear} onOpenChange={open => !open && setClosingYear(null)}>
        <AlertDialogContent className="backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <IconLock className="h-5 w-5" />
              {t.finance.fiscalYears.close()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.finance.fiscalYears.closeConfirm()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-border/40">
              {t.common.cancel()}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => closingYear && closeMutation.mutate(closingYear.id)}
              disabled={closeMutation.isPending}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {closeMutation.isPending ? t.common.loading() : t.finance.fiscalYears.close()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
