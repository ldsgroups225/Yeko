import { IconCheck, IconChevronLeft, IconCreditCard, IconMapPin, IconSchool, IconSearch, IconUser } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

export type WizardStep = 'identification' | 'confirmation' | 'academic' | 'fees' | 'payment' | 'success'

export interface WizardSchool {
  id: string
  name: string
  logoUrl?: string | null
}

export interface WizardStudent {
  id?: string
  firstName: string
  lastName: string
  matricule?: string | null
  photoUrl?: string | null
  dob: string
  gender: 'M' | 'F' | 'other'
}

export interface WizardAcademic {
  gradeId: string
  classId: string
  seriesId?: string | null
  schoolYearId: string
  isOrphan: boolean
  isStateAssigned: boolean
  useCanteen: boolean
  useTransport: boolean
}

export interface WizardFee {
  id: string
  feeTypeId: string
  name: string
  code: string
  category: string
  originalAmount: number
  discountAmount: number
  amount: number
}

export interface WizardFeeSummary {
  fees: WizardFee[]
  totalOriginal: number
  totalDiscount: number
  total: number
  appliedDiscounts: Array<{ id: string, code: string, name: string }>
}

export interface WizardState {
  school: WizardSchool | null
  student: WizardStudent | null
  academic: WizardAcademic | null
  feesSummary: WizardFeeSummary | null
}

const STEPS: Array<{ id: WizardStep, label: string, icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'identification', label: 'Identification', icon: IconMapPin },
  { id: 'confirmation', label: 'Étudiant', icon: IconUser },
  { id: 'academic', label: 'Classe', icon: IconSchool },
  { id: 'fees', label: 'Frais', icon: IconSearch },
  { id: 'payment', label: 'Paiement', icon: IconCreditCard },
  { id: 'success', label: 'Terminé', icon: IconCheck },
]

interface WizardShellProps {
  children: React.ReactNode
  currentStep: WizardStep
  onBack?: () => void
  onStepSelect?: (step: WizardStep) => void
  briefing?: {
    school: WizardSchool | null
    student: WizardStudent | null
  }
}

export function WizardShell({ children, currentStep, onBack, onStepSelect, briefing }: WizardShellProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep)
  const currentStepLabel = STEPS[currentIndex]?.label
  const showBriefing = currentStep !== 'identification' && Boolean(briefing?.school)
  const schoolInitial = briefing?.school?.name?.slice(0, 1).toUpperCase() ?? 'S'
  const studentInitials = briefing?.student
    ? `${briefing.student.firstName?.slice(0, 1) ?? ''}${briefing.student.lastName?.slice(0, 1) ?? ''}`.toUpperCase()
    : 'EL'

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header / Stepper */}
      <header className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="Yeko School logo"
              className="size-10 rounded-lg object-contain shadow-lg ring-1 ring-border/40"
            />
            <span className="text-xl font-bold tracking-tight">
              YEKO
              <span className="text-primary">SCHOOL</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {STEPS.map((step, index) => {
              const isActive = index === currentIndex
              const isCompleted = index < currentIndex
              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onStepSelect && index < currentIndex) {
                        onStepSelect(step.id)
                      }
                    }}
                    disabled={index >= currentIndex}
                    className="flex flex-col items-center gap-2 group disabled:cursor-default"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : isCompleted
                            ? 'border-secondary bg-secondary text-secondary-foreground'
                            : 'border-border/40 text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <IconCheck className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    >
                      {step.label}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-[2px] mb-6 ${isCompleted ? 'bg-secondary' : 'bg-border/40'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
          <div className="md:hidden">
            <span className="text-sm font-bold text-primary">
              Étape
              {' '}
              {currentIndex + 1}
              {' '}
              sur
              {' '}
              {STEPS.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-20 overflow-hidden">
        <div className={`w-full mx-auto ${showBriefing ? 'max-w-6xl lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8' : 'max-w-xl'}`}>
          {showBriefing && briefing?.school && (
            <aside className="hidden lg:block">
              <Card className="sticky top-28 bg-card border-border/40 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
                      Briefing dossier
                    </CardTitle>
                    {currentStepLabel && (
                      <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                        {currentStepLabel}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      <IconSchool className="size-4 text-primary" />
                      Établissement
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Avatar className="size-12 rounded-lg border border-border/40 bg-muted/50">
                        <AvatarImage
                          src={briefing.school.logoUrl ?? '/icon.png'}
                          alt={`Logo ${briefing.school.name}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-lg bg-muted text-foreground font-semibold">
                          {schoolInitial}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-semibold text-foreground">
                        {briefing.school.name}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      <IconUser className="size-4 text-primary" />
                      Élève
                    </p>
                    {briefing.student
                      ? (
                          <>
                            <div className="mt-2 flex items-center gap-3">
                              <Avatar className="size-12 border border-border/40 bg-muted/50">
                                <AvatarImage
                                  src={briefing.student.photoUrl ?? undefined}
                                  alt={`${briefing.student.firstName} ${briefing.student.lastName}`}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-muted text-foreground font-semibold">
                                  {studentInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {briefing.student.firstName}
                                  {' '}
                                  {briefing.student.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {briefing.student.matricule
                                    ? `Matricule: ${briefing.student.matricule}`
                                    : 'Nouveau dossier (matricule en cours)'}
                                </p>
                              </div>
                            </div>
                          </>
                        )
                      : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Aucun élève identifié. Créez un nouveau dossier à l'étape Étudiant.
                          </p>
                        )}
                  </div>
                </CardContent>
              </Card>
            </aside>
          )}

          <div className={`${showBriefing ? 'w-full max-w-xl justify-self-center' : 'w-full max-w-xl mx-auto'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      {currentStep !== 'success' && currentStep !== 'identification' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/40 py-4 px-4 flex justify-center">
          <div className="w-full max-w-xl flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/40"
            >
              <IconChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
