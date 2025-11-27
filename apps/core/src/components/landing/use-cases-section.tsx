import { BookOpen, GraduationCap, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'

const useCaseColors = [
  'bg-primary/10 text-primary dark:text-primary',
  'bg-primary/10 text-primary dark:text-primary',
  'bg-secondary/10 text-secondary dark:text-secondary',
]

const useCaseIcons = [GraduationCap, BookOpen, Users]

export function UseCasesSection() {
  const { t } = useTranslation()

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('useCases.stakeholder.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('useCases.stakeholder.subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {Object.entries(t('useCases.stakeholders', { returnObjects: true }) as Record<string, { title: string, description: string }>).map(([key, useCase], index) => {
            const IconComponent = useCaseIcons[index]
            const color = useCaseColors[index]

            return (
              <Card key={key} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2">
                <CardContent className="p-8">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${color} mb-6`}>
                    {IconComponent && <IconComponent className="h-8 w-8" />}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
