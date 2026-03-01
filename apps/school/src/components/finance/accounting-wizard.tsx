import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

export interface WizardStep {
  title: string
  description: string
  component: React.ReactNode
  isValid?: boolean
}

interface AccountingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  steps: WizardStep[]
}

export function AccountingWizard({ open, onOpenChange, steps }: AccountingWizardProps) {
  const t = useTranslations()
  const [currentStep, setCurrentStep] = useState(0)

  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
    else {
      onOpenChange(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        bg-card/95 border-border/40 flex max-h-[90vh] max-w-4xl flex-col gap-0
        overflow-hidden rounded-3xl p-0 shadow-2xl backdrop-blur-xl
      "
      >
        <DialogHeader className="border-border/40 bg-muted/30 border-b p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-2xl p-3">
              <IconInfoCircle className="text-primary h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {t.finance.wizard.title()}
              </DialogTitle>
              <DialogDescription>
                {t.finance.wizard.description()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Stepper Sidebar */}
          <div className="
            border-border/40 bg-muted/10 hidden w-64 flex-col gap-2 border-r p-4
            md:flex
          "
          >
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={cn(
                  `
                    flex items-center gap-3 rounded-xl p-3 transition-all
                    duration-200
                  `,
                  currentStep === index
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : index < currentStep
                      ? 'text-success'
                      : `
                        text-muted-foreground
                        hover:bg-muted/50
                      `,
                )}
              >
                <div
                  className={cn(
                    `
                      flex h-6 w-6 items-center justify-center rounded-full
                      border-2 text-xs font-bold
                    `,
                    currentStep === index
                      ? 'border-primary bg-primary text-white'
                      : index < currentStep
                        ? 'border-success bg-success text-white'
                        : 'border-muted-foreground/30',
                  )}
                >
                  {index < currentStep
                    ? (
                        <IconCheck className="h-4 w-4" />
                      )
                    : (
                        index + 1
                      )}
                </div>
                <span className="truncate text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <div className="mb-6">
                    <h3 className="mb-1 text-lg font-bold">
                      {steps[currentStep]?.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {steps[currentStep]?.description}
                    </p>
                  </div>
                  {steps[currentStep]?.component}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="
              border-border/40 bg-muted/30 flex items-center justify-between
              border-t p-6
            "
            >
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isFirstStep}
                className="gap-2 rounded-xl px-6"
              >
                <IconChevronLeft className="h-4 w-4" />
                {t.common.back()}
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-border/40 rounded-xl px-6"
                >
                  {t.common.cancel()}
                </Button>
                <Button
                  onClick={handleNext}
                  className="shadow-primary/20 gap-2 rounded-xl px-8 shadow-lg"
                >
                  {isLastStep ? t.common.finish() : t.common.next()}
                  {!isLastStep && <IconChevronRight className="h-4 w-4" />}
                  {isLastStep && <IconCircleCheck className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
