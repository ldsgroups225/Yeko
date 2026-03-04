import type { PreInscriptionIdentification } from '../../../schemas/pre-inscription'
import type { WizardSchool, WizardStudent } from '../wizard-shell'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowRight, IconMapPin, IconSearch, IconUser } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Spinner } from '@workspace/ui/components/spinner'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { findSchoolAndStudentByCodeAndMatricule } from '../../../lib/api/pre-inscription'
import {
  preInscriptionIdentificationSchema,
} from '../../../schemas/pre-inscription'

interface IdentificationStepProps {
  onSuccess: (data: { school: WizardSchool, student: WizardStudent | null }) => void
}

export function IdentificationStep({ onSuccess }: IdentificationStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreInscriptionIdentification>({
    resolver: zodResolver(preInscriptionIdentificationSchema),
    defaultValues: {
      schoolCode: '',
      matricule: '',
    },
  })

  const onSubmit = async (data: PreInscriptionIdentification) => {
    setIsLoading(true)
    try {
      const response = await findSchoolAndStudentByCodeAndMatricule({ data })
      if (response.success) {
        onSuccess(response.data)
      }
      else {
        toast.error(response.error)
      }
    }
    catch {
      toast.error(t('preInscription.identification.errors.searchFailed'))
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">
          {t('preInscription.identification.hero.titlePrefix')}
          {' '}
          <span className="text-primary">{t('app.name')}</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('preInscription.identification.hero.descriptionPrefix')}
          {' '}
          <span className="font-bold text-primary">{t('preInscription.identification.hero.descriptionHighlight')}</span>
          .
        </p>
      </div>

      <Card className="bg-card border-border/40 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500" />

        <CardHeader className="space-y-1 pt-8 pb-4">
          <CardTitle className="text-xl flex items-center gap-2 text-foreground">
            <IconMapPin className="w-5 h-5 text-primary" />
            {t('preInscription.identification.card.title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('preInscription.identification.card.description')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="schoolCode" className="text-sm font-medium text-muted-foreground ml-1">
                  {t('preInscription.identification.form.schoolCodeLabel')}
                </label>
                <div className="relative group/input">
                  <Input
                    {...register('schoolCode')}
                    id="schoolCode"
                    placeholder={t('preInscription.identification.form.schoolCodePlaceholder')}
                    className={`bg-muted/40 border-border/60 h-14 pl-12 text-lg focus:ring-ring/20 focus:border-primary transition-all ${
                      errors.schoolCode ? 'border-destructive/50 pr-10' : ''
                    }`}
                  />
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within/input:text-primary transition-colors" />
                  {errors.schoolCode && (
                    <p className="text-xs text-destructive mt-1 ml-1">{errors.schoolCode.message as string}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="matricule" className="text-sm font-medium text-muted-foreground">
                    {t('preInscription.identification.form.matriculeLabel')}
                  </label>
                  <span className="text-[10px] text-muted-foreground uppercase font-black px-1.5 py-0.5 border border-border/50 rounded italic tracking-widest">{t('preInscription.identification.form.reEnrollmentBadge')}</span>
                </div>
                <div className="relative group/input">
                  <Input
                    {...register('matricule')}
                    id="matricule"
                    placeholder={t('preInscription.identification.form.matriculePlaceholder')}
                    className="bg-muted/40 border-border/60 h-14 pl-12 text-lg focus:ring-ring/20 focus:border-primary transition-all"
                  />
                  <IconUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within/input:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground ml-1">
                  {t('preInscription.identification.form.matriculeHint')}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-lg shadow-primary/20 group relative overflow-hidden active:scale-[0.98] transition-all"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading
                  ? (
                      <Spinner className="w-5 h-5 border-primary-foreground/20 border-t-primary-foreground" />
                    )
                  : (
                      <>
                        {t('preInscription.identification.form.continue')}
                        <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary-foreground/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-6 pt-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <div className="h-px w-10 bg-border/40" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{t('preInscription.identification.poweredBy')}</span>
        <div className="h-px w-10 bg-border/40" />
      </div>
    </div>
  )
}
