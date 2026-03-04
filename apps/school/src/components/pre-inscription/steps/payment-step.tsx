import type { WizardAcademic, WizardFeeSummary, WizardStudent } from '../wizard-shell'
import { IconArrowRight, IconBuilding, IconCircleCheck, IconCreditCard, IconShieldCheck, IconWallet } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Spinner } from '@workspace/ui/components/spinner'
import { useState } from 'react'
import { toast } from 'sonner'
import { submitPreInscription } from '../../../lib/api/pre-inscription'

interface PaymentStepProps {
  schoolId: string
  schoolYearId: string
  student: WizardStudent
  academic: WizardAcademic
  summary: WizardFeeSummary
  onSuccess: (student: WizardStudent) => void
}

export function PaymentStep({ schoolId, schoolYearId, student, academic, summary, onSuccess }: PaymentStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | 'cash'>('mobile_money')

  const handlePayment = async () => {
    setIsLoading(true)

    const payload = student.id
      ? { studentId: student.id }
      : {
          student: {
            firstName: student.firstName,
            lastName: student.lastName,
            dob: student.dob,
            gender: student.gender,
          },
        }

    try {
      const response = await submitPreInscription({
        data: {
          schoolId,
          schoolYearId,
          ...payload,
          academic,
          payment: {
            paymentMethod,
          },
        },
      })
      if (response.success) {
        onSuccess(response.data.student)
      }
      else {
        toast.error(response.error)
      }
    }
    catch {
      toast.error('Erreur lors de la validation de la pré-inscription')
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black text-foreground">Finalisation</h2>
        <p className="text-muted-foreground">Choisissez votre mode de règlement pour confirmer.</p>
      </div>

      <div className="grid gap-4">
        {/* Payment Methods */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setPaymentMethod('mobile_money')}
            className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all group ${
              paymentMethod === 'mobile_money'
                ? 'border-primary bg-primary/10'
                : 'border-border/40 bg-muted/40 hover:border-border/70'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                paymentMethod === 'mobile_money' ? 'bg-primary' : 'bg-muted/60'
              }`}
              >
                <IconWallet className={`w-6 h-6 ${paymentMethod === 'mobile_money' ? 'text-primary-foreground' : 'text-foreground'}`} />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">Mobile Money</p>
                <p className="text-xs text-muted-foreground">Orange / MTN / Moov / Wave</p>
              </div>
            </div>
            {paymentMethod === 'mobile_money' && <IconCircleCheck className="w-6 h-6 text-primary" />}
          </button>

          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all group ${
              paymentMethod === 'card'
                ? 'border-primary bg-primary/10'
                : 'border-border/40 bg-muted/40 hover:border-border/70'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                paymentMethod === 'card' ? 'bg-primary' : 'bg-muted/60'
              }`}
              >
                <IconCreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-primary-foreground' : 'text-foreground'}`} />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">Carte Bancaire / GIM</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, GIM-UEMOA</p>
              </div>
            </div>
            {paymentMethod === 'card' && <IconCircleCheck className="w-6 h-6 text-primary" />}
          </button>

          <button
            onClick={() => setPaymentMethod('cash')}
            className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all group ${
              paymentMethod === 'cash'
                ? 'border-secondary bg-secondary/10'
                : 'border-border/40 bg-muted/40 hover:border-border/70'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                paymentMethod === 'cash' ? 'bg-secondary' : 'bg-muted/60'
              }`}
              >
                <IconBuilding className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-secondary-foreground' : 'text-foreground'}`} />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">Payer plus tard</p>
                <p className="text-xs text-muted-foreground">Finaliser le règlement à l'école</p>
              </div>
            </div>
            {paymentMethod === 'cash' && <IconCircleCheck className="w-6 h-6 text-secondary" />}
          </button>
        </div>

        {/* Security / Badge */}
        <Card className="bg-card border-border/40 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
            <IconShieldCheck className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Paiement Sécurisé</p>
            <p className="text-[10px] text-muted-foreground">Vos transactions sont protégées par chiffrement SSL.</p>
          </div>
        </Card>
      </div>

      <div className="pt-4">
        <div className="mb-3 text-center text-xs text-muted-foreground">
          Total à provisionner:
          {' '}
          <span className="font-mono text-foreground">
            {summary.total.toLocaleString('fr-FR')}
            {' '}
            CFA
          </span>
        </div>
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all"
        >
          {isLoading
            ? (
                <Spinner className="w-6 h-6 border-primary-foreground/20 border-t-primary-foreground" />
              )
            : (
                <>
                  Confirmer l'inscription
                  <IconArrowRight className="w-6 h-6 ml-2" />
                </>
              )}
        </Button>
      </div>
    </div>
  )
}
