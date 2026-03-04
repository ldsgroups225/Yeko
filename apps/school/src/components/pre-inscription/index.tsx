import type {
  WizardAcademic,
  WizardFeeSummary,
  WizardSchool,
  WizardState,
  WizardStep,
  WizardStudent,
} from './wizard-shell'
import { useState } from 'react'
import { AcademicStep } from './steps/academic-step'
import { ConfirmationStep } from './steps/confirmation-step'
import { FeesStep } from './steps/fees-step'
import { IdentificationStep } from './steps/identification-step'
import { PaymentStep } from './steps/payment-step'
import { SuccessStep } from './steps/success-step'
import { WizardShell } from './wizard-shell'

export function PreInscriptionWizard() {
  const [step, setStep] = useState<WizardStep>('identification')
  const [state, setState] = useState<WizardState>({
    school: null,
    student: null,
    academic: null,
    feesSummary: null,
  })

  const handleIdentificationSuccess = (data: { school: WizardSchool, student: WizardStudent | null }) => {
    setState(prev => ({
      ...prev,
      school: data.school,
      student: data.student,
    }))
    setStep('confirmation')
  }

  const handleConfirmationSuccess = (student: WizardStudent) => {
    setState(prev => ({ ...prev, student }))
    setStep('academic')
  }

  const handleAcademicSuccess = (academic: WizardAcademic) => {
    setState(prev => ({ ...prev, academic }))
    setStep('fees')
  }

  const handleFeesSuccess = (summary: WizardFeeSummary) => {
    setState(prev => ({ ...prev, feesSummary: summary }))
    setStep('payment')
  }

  const handlePaymentSuccess = (student: WizardStudent) => {
    setState(prev => ({ ...prev, student }))
    setStep('success')
  }

  const handleBack = () => {
    const steps: WizardStep[] = [
      'identification',
      'confirmation',
      'academic',
      'fees',
      'payment',
      'success',
    ]
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1]
      if (prevStep) {
        setStep(prevStep)
      }
    }
  }

  const handleStepSelect = (targetStep: WizardStep) => {
    const steps: WizardStep[] = [
      'identification',
      'confirmation',
      'academic',
      'fees',
      'payment',
      'success',
    ]

    const currentIndex = steps.indexOf(step)
    const targetIndex = steps.indexOf(targetStep)
    if (targetIndex >= 0 && targetIndex < currentIndex) {
      setStep(targetStep)
    }
  }

  return (
    <WizardShell
      currentStep={step}
      onBack={handleBack}
      onStepSelect={handleStepSelect}
      briefing={{ school: state.school, student: state.student }}
    >
      {step === 'identification' && (
        <IdentificationStep onSuccess={handleIdentificationSuccess} />
      )}
      {step === 'confirmation' && state.school && (
        <ConfirmationStep
          student={state.student}
          onSuccess={handleConfirmationSuccess}
        />
      )}
      {step === 'academic' && state.school && (
        <AcademicStep
          schoolId={state.school.id}
          onSuccess={handleAcademicSuccess}
        />
      )}
      {step === 'fees' && state.school && state.academic && (
        <FeesStep
          schoolId={state.school.id}
          schoolYearId={state.academic.schoolYearId}
          academic={state.academic}
          isNewStudent={!state.student?.id}
          onSuccess={handleFeesSuccess}
        />
      )}
      {step === 'payment' && state.school && state.student && state.academic && state.feesSummary && (
        <PaymentStep
          schoolId={state.school.id}
          schoolYearId={state.academic.schoolYearId}
          student={state.student}
          academic={state.academic}
          summary={state.feesSummary}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {step === 'success' && state.school && state.student && (
        <SuccessStep
          school={state.school}
          student={state.student}
        />
      )}
    </WizardShell>
  )
}
