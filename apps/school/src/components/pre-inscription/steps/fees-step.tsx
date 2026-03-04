import type { WizardAcademic, WizardFeeSummary } from '../wizard-shell'
import { IconChevronRight, IconInfoCircle, IconReceipt } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Spinner } from '@workspace/ui/components/spinner'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { calculatePreInscriptionFees } from '../../../lib/api/pre-inscription'

interface FeesStepProps {
  schoolId: string
  schoolYearId: string
  academic: WizardAcademic
  isNewStudent: boolean
  onSuccess: (summary: WizardFeeSummary) => void
}

export function FeesStep({ schoolId, schoolYearId, academic, isNewStudent, onSuccess }: FeesStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState<WizardFeeSummary | null>(null)

  useEffect(() => {
    const fetchFees = async () => {
      setIsLoading(true)
      try {
        const response = await calculatePreInscriptionFees({
          data: { schoolId, schoolYearId, academic, isNewStudent },
        })
        if (response.success) {
          setSummary(response.data)
        }
        else {
          toast.error(response.error)
        }
      }
      catch {
        toast.error('Erreur lors du calcul des frais')
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchFees()
  }, [schoolId, schoolYearId, academic, isNewStudent])

  if (isLoading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Spinner className="w-10 h-10 border-primary/20 border-t-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Calcul des frais...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black text-foreground">Récapitulatif des Frais</h2>
        <p className="text-muted-foreground">Vérifiez les frais de scolarité pour l'année scolaire.</p>
      </div>

      <div className="space-y-4">
        <Card className="bg-card border-border/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-secondary opacity-50" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <IconReceipt className="w-4 h-4" />
              Détails des frais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              {summary?.fees.length
                ? summary.fees.map(fee => (
                    <div key={fee.id} className="flex justify-between items-center py-3 border-b border-border/40 last:border-0">
                      <div>
                        <p className="font-bold text-foreground">{fee.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{fee.code}</p>
                        {fee.discountAmount > 0 && (
                          <p className="text-[10px] text-secondary font-bold mt-1 uppercase tracking-widest">
                            Réduction:
                            {' '}
                            -
                            {fee.discountAmount.toLocaleString('fr-FR')}
                            {' '}
                            CFA
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {fee.discountAmount > 0 && (
                          <p className="text-xs text-muted-foreground line-through font-mono">
                            {fee.originalAmount.toLocaleString('fr-FR')}
                            {' '}
                            CFA
                          </p>
                        )}
                        <p className="font-mono font-bold text-lg text-foreground">
                          {fee.amount.toLocaleString('fr-FR')}
                          {' '}
                          <span className="text-[10px] text-muted-foreground">CFA</span>
                        </p>
                      </div>
                    </div>
                  ))
                : (
                    <div className="rounded-lg border border-border/40 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      Aucun frais applicable avec les options sélectionnées.
                    </div>
                  )}
            </div>

            <div className="bg-muted/40 rounded-xl p-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest font-bold text-muted-foreground">
                <span>Total brut</span>
                <span className="font-mono">
                  {summary?.totalOriginal.toLocaleString('fr-FR')}
                  {' '}
                  CFA
                </span>
              </div>
              <div className="flex items-center justify-between text-xs uppercase tracking-widest font-bold text-secondary mt-2">
                <span>Réductions</span>
                <span className="font-mono">
                  -
                  {summary?.totalDiscount.toLocaleString('fr-FR')}
                  {' '}
                  CFA
                </span>
              </div>
              <div className="border-t border-border/40 mt-3 pt-3 flex flex-col items-center">
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-1">Montant Total</p>
                <p className="text-4xl font-black text-foreground font-mono tracking-tight">
                  {summary?.total.toLocaleString('fr-FR')}
                  {' '}
                  <span className="text-xl text-primary ml-1">CFA</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-primary/5 rounded-lg p-3 border border-primary/20">
              <IconInfoCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
                Ce calcul inclut les options choisies (transport/cantine) et les réductions éligibles configurées dans vos paramètres finance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => summary && onSuccess(summary)}
        disabled={!summary}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all mt-4"
      >
        Procéder au paiement
        <IconChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}
