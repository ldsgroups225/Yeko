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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <IconInfoCircle className="h-6 w-6 text-primary" />
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

        <div className="flex-1 flex overflow-hidden">
          {/* Stepper Sidebar */}
          <div className="w-64 border-r border-border/40 bg-muted/10 p-4 hidden md:flex flex-col gap-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                  currentStep === index
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : index < currentStep
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground hover:bg-muted/50',
                )}
              >
                <div
                  className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border-2',
                    currentStep === index
                      ? 'border-primary bg-primary text-white'
                      : index < currentStep
                        ? 'border-green-500 bg-green-500 text-white'
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
                <span className="text-sm font-medium truncate">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="flex-1 flex flex-col min-w-0">
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
                    <h3 className="text-lg font-bold mb-1">
                      {steps[currentStep]?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {steps[currentStep]?.description}
                    </p>
                  </div>
                  {steps[currentStep]?.component}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-border/40 bg-muted/30 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isFirstStep}
                className="rounded-xl gap-2 px-6"
              >
                <IconChevronLeft className="h-4 w-4" />
                {t.common.back()}
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl px-6 border-border/40"
                >
                  {t.common.cancel()}
                </Button>
                <Button
                  onClick={handleNext}
                  className="rounded-xl gap-2 px-8 shadow-lg shadow-primary/20"
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
