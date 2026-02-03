import { IconBook, IconSchool, IconUsers } from '@tabler/icons-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useI18nContext } from '@/i18n/i18n-react'

const useCaseColors = [
  'bg-primary/10 text-primary dark:text-primary',
  'bg-primary/10 text-primary dark:text-primary',
  'bg-secondary/10 text-secondary dark:text-secondary',
]

const useCaseIcons = [IconSchool, IconBook, IconUsers]

export function UseCasesSection() {
  const { LL } = useI18nContext()

  const stakeholderKeys = ['administrators', 'teachers', 'parents', 'students'] as const

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {LL.useCases.title()}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {LL.useCases.subtitle()}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {stakeholderKeys.map((key, index) => {
            const useCase = LL.useCases.stakeholders[key]
            const IconComponent = useCaseIcons[index]
            const color = useCaseColors[index]

            return (
              <Card key={key} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2">
                <CardContent className="p-8">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${color} mb-6`}>
                    {IconComponent && <IconComponent className="h-8 w-8" />}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{useCase.title()}</h3>
                  <p className="text-muted-foreground leading-relaxed">{useCase.description()}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
