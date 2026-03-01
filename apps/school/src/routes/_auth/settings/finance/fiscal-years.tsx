import {
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
import { FinanceSubpageToolbar } from '@/components/finance/finance-subpage-toolbar'
import { FiscalYearsTable } from '@/components/finance/fiscal-years-table'
import { useTranslations } from '@/i18n'
import { fiscalYearsKeys, fiscalYearsOptions } from '@/lib/queries/fiscal-years'
import { closeFiscalYear } from '@/school/functions/fiscal-years'

export const Route = createFileRoute('/_auth/settings/finance/fiscal-years')({
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
    <div className="space-y-8 p-1">
      <FinanceSubpageToolbar />

      <div className="
        border-border/40 bg-card/30 overflow-hidden rounded-2xl border
        backdrop-blur-md
      "
      >
        <FiscalYearsTable
          fiscalYears={fiscalYears.map(fy => ({ ...fy, status: fy.status || 'open' }))}
          onClose={fy => setClosingYear(fy)}
        />
      </div>

      <AlertDialog open={!!closingYear} onOpenChange={open => !open && setClosingYear(null)}>
        <AlertDialogContent className="
          bg-card/95 border-border/40 rounded-2xl shadow-2xl backdrop-blur-xl
        "
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="
              text-destructive flex items-center gap-2
            "
            >
              <IconLock className="h-5 w-5" />
              {t.finance.fiscalYears.close()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.finance.fiscalYears.closeConfirm()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/40 rounded-xl">
              {t.common.cancel()}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => closingYear && closeMutation.mutate(closingYear.id)}
              disabled={closeMutation.isPending}
              className="
                bg-destructive text-destructive-foreground
                hover:bg-destructive/90
                rounded-xl
              "
            >
              {closeMutation.isPending ? t.common.loading() : t.finance.fiscalYears.close()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
