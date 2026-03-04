import type { PreInscriptionCreateStudent } from '../../../schemas/pre-inscription'
import type { WizardStudent } from '../wizard-shell'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowRight, IconCalendar, IconCheck, IconUserPlus } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { preInscriptionCreateStudentSchema } from '../../../schemas/pre-inscription'

interface ConfirmationStepProps {
  student: WizardStudent | null
  onSuccess: (student: WizardStudent) => void
}

export function ConfirmationStep({ student, onSuccess }: ConfirmationStepProps) {
  const [isCreating, setIsCreating] = useState(!student)
  const studentInitials = student
    ? `${student.firstName.slice(0, 1)}${student.lastName.slice(0, 1)}`.toUpperCase()
    : ''

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PreInscriptionCreateStudent>({
    resolver: zodResolver(preInscriptionCreateStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dob: '',
      gender: 'M' as const,
    },
  })

  const gender = watch('gender')

  const onSubmitNewStudent = (data: PreInscriptionCreateStudent) => {
    onSuccess({
      firstName: data.firstName,
      lastName: data.lastName,
      matricule: null,
      dob: data.dob,
      gender: data.gender,
    })
  }

  if (!isCreating && student) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-black text-foreground">Confirmez votre identité</h2>
          <p className="text-muted-foreground">Voici l'élève associé à ce matricule.</p>
        </div>

        <Card className="bg-primary border-none shadow-2xl shadow-primary/20">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
            <Avatar className="size-24 border-4 border-primary-foreground/20 shadow-inner bg-primary-foreground/15">
              <AvatarImage
                src={student.photoUrl ?? undefined}
                alt={`${student.firstName} ${student.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-4xl font-black">
                {studentInitials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-2xl font-black text-primary-foreground uppercase tracking-tight">
                {student.firstName}
                {' '}
                {student.lastName}
              </h3>
              <Badge variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground font-bold h-6 px-3 mt-1">
                {student.matricule}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <div className="bg-primary-foreground/10 rounded-xl p-3 border border-primary-foreground/10">
                <p className="text-[10px] uppercase font-bold text-primary-foreground/70 mb-1">Né(e) le</p>
                <p className="text-sm font-bold text-primary-foreground">{new Date(student.dob).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-3 border border-primary-foreground/10">
                <p className="text-[10px] uppercase font-bold text-primary-foreground/70 mb-1">Genre</p>
                <p className="text-sm font-bold text-primary-foreground">{student.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => onSuccess(student)}
            className="w-full h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black text-lg shadow-lg shadow-secondary/20 active:scale-[0.98] transition-all"
          >
            C'est bien moi, continuer
            <IconCheck className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsCreating(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/40"
          >
            Ce n'est pas moi, créer un nouveau dossier
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black text-foreground">Nouveau Dossier</h2>
        <p className="text-muted-foreground">Saisissez les informations de l'élève pour continuer.</p>
      </div>

      <Card className="bg-card border-border/40 shadow-2xl border-t-2 border-t-primary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <IconUserPlus className="w-5 h-5 text-primary" />
            Informations Élève
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitNewStudent)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Nom</label>
                <Input
                  {...register('lastName')}
                  id="lastName"
                  placeholder="NOM"
                  className="bg-muted/40 border-border/60 h-12 uppercase focus:border-primary"
                />
                {errors.lastName && <p className="text-[10px] text-destructive ml-1">{errors.lastName.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Prénoms</label>
                <Input
                  {...register('firstName')}
                  id="firstName"
                  placeholder="Prénoms"
                  className="bg-muted/40 border-border/60 h-12 focus:border-primary"
                />
                {errors.firstName && <p className="text-[10px] text-destructive ml-1">{errors.firstName.message as string}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="dob" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Date de naissance</label>
              <div className="relative">
                <Input
                  {...register('dob')}
                  id="dob"
                  type="date"
                  className="bg-muted/40 border-border/60 h-12 pl-10 focus:border-primary scheme-dark"
                />
                <IconCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              </div>
              {errors.dob && <p className="text-[10px] text-destructive ml-1">{errors.dob.message as string}</p>}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Genre</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={gender === 'M' ? 'default' : 'outline'}
                  onClick={() => setValue('gender', 'M')}
                  className={`h-12 font-bold ${gender === 'M' ? 'bg-primary text-primary-foreground' : 'border-border/60 text-muted-foreground bg-muted/40'}`}
                >
                  Masculin
                </Button>
                <Button
                  type="button"
                  variant={gender === 'F' ? 'default' : 'outline'}
                  onClick={() => setValue('gender', 'F')}
                  className={`h-12 font-bold ${gender === 'F' ? 'bg-primary text-primary-foreground' : 'border-border/60 text-muted-foreground bg-muted/40'}`}
                >
                  Féminin
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg active:scale-[0.98] transition-all mt-4"
            >
              <>
                Continuer
                <IconArrowRight className="w-5 h-5 ml-2" />
              </>
            </Button>

            {student && (
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Annuler et revenir au matricule
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
