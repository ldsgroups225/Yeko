import {
  IconBuildingArch,
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconSchool,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'

import { cn } from '@workspace/ui/lib/utils'
import { getOnboardingStatus } from '@/lib/api/onboarding'

export function OnboardingWidget() {
  const navigate = useNavigate()

  const { data: status, isPending } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => getOnboardingStatus(),
  })

  if (isPending)
    return null // Or skeleton
  if (!status)
    return null

  // If all completed, hide the widget? Or show a "Good to go" message for a while.
  // For now, if all completed, we return null to remove it from dashboard.
  if (status.hasIdentity && status.hasYear && status.hasStructure)
    return null

  const steps = [
    {
      id: 'identity',
      title: 'Identité de l\'établissement',
      description: 'Configurez les informations de base.',
      icon: IconSchool,
      isCompleted: status.hasIdentity,
      actionLabel: 'Configurer',
      onAction: () => navigate({ to: '/settings/profile' }),
    },
    {
      id: 'year',
      title: 'Année Académique',
      description: 'Définissez l\'année en cours et les périodes.',
      icon: IconCalendar,
      isCompleted: status.hasYear,
      actionLabel: 'Créer',
      onAction: () => navigate({ to: '/settings/school-years' }),
    },
    {
      id: 'structure',
      title: 'Structure Pédagogique',
      description: 'Configurez les classes et matières standards.',
      icon: IconBuildingArch,
      isCompleted: status.hasStructure,
      actionLabel: 'Configurer',
      onAction: () => navigate({ to: '/settings/pedagogical-structure' }),
      disabled: !status.hasYear, // Cannot import without year
    },
  ]

  // Find first incomplete step index
  const activeStepIndex = steps.findIndex(s => !s.isCompleted)

  return (
    <Card className="border border-primary/20 bg-primary/5 shadow-sm mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {activeStepIndex + 1}
          </span>
          Configuration Initiale
        </CardTitle>
        <CardDescription>
          Complétez ces étapes pour rendre votre école opérationnelle.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex
          const isFuture = index > activeStepIndex

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border transition-all',
                step.isCompleted
                  ? 'bg-card/50 border-border/40 opacity-70'
                  : isActive
                    ? 'bg-card border-primary/40 shadow-sm'
                    : 'bg-transparent border-transparent opacity-50',
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center transition-colors',
                    step.isCompleted
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {step.isCompleted
                    ? (
                        <IconCheck size={20} />
                      )
                    : (
                        <step.icon size={20} />
                      )}
                </div>
                <div>
                  <h4
                    className={cn(
                      'font-medium',
                      step.isCompleted && 'line-through text-muted-foreground',
                    )}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>

              {!step.isCompleted && (
                <Button
                  size="sm"
                  variant={isActive ? 'default' : 'ghost'}
                  disabled={step.disabled || isFuture}
                  onClick={step.onAction}
                >
                  {step.actionLabel}
                  <IconChevronRight size={16} className="ml-1" />
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
