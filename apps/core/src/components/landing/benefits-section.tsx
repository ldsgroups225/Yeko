import { IconClock, IconCurrencyDollar, IconTrendingUp, IconUsers } from '@tabler/icons-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useI18nContext } from '@/i18n/i18n-react'

const iconMap = {
  timeSaving: IconClock,
  costReduction: IconCurrencyDollar,
  satisfaction: IconUsers,
  growth: IconTrendingUp,
}

export function BenefitsSection() {
  const { LL } = useI18nContext()

  const benefitKeys = ['timeSaving', 'costReduction', 'satisfaction', 'growth'] as const

  return (
    <section className="
      py-24
      sm:py-32
    "
    >
      <div className="
        mx-auto max-w-7xl px-6
        lg:px-8
      "
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="
            text-foreground text-3xl font-bold tracking-tight
            sm:text-4xl
          "
          >
            {LL.nav.benefits.title()}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {LL.nav.benefits.subtitle()}
          </p>
        </div>

        <div className="
          mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8
          lg:mx-0 lg:max-w-none lg:grid-cols-2
        "
        >
          {benefitKeys.map((key) => {
            const benefit = LL.nav.benefits.items[key]
            const IconComponent = iconMap[key]

            return (
              <Card
                key={key}
                className="
                  group border-2 transition-all duration-300
                  hover:-translate-y-1 hover:shadow-xl
                "
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="
                      bg-primary/10 flex h-14 w-14 shrink-0 items-center
                      justify-center rounded-xl
                    "
                    >
                      <IconComponent className="text-primary h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="mb-3 text-xl font-semibold">{benefit.title()}</h3>
                      <p className="text-muted-foreground leading-relaxed">{benefit.description()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
