import { IconBolt, IconDeviceMobile, IconGlobe, IconShield } from '@tabler/icons-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useI18nContext } from '@/i18n/i18n-react'

const iconMap = {
  lightning: IconBolt,
  secure: IconShield,
  africa: IconGlobe,
  mobile: IconDeviceMobile,
}

const reasonKeys = ['lightning', 'secure', 'africa', 'mobile'] as const

export function WhyYekoSection() {
  const { LL } = useI18nContext()
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
            {LL.whyYeko.title()}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {LL.whyYeko.subtitle()}
          </p>
        </div>

        <div className="
          mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8
          lg:mx-0 lg:max-w-none lg:grid-cols-2
        "
        >
          {reasonKeys.map((key) => {
            const reason = LL.whyYeko.features[key]
            const IconComponent = iconMap[key]
            return (
              <Card
                key={key}
                className="
                  group transition-all duration-300
                  hover:shadow-lg
                "
              >
                <CardContent className="flex gap-6 p-8">
                  <div className="
                    bg-primary/10 flex h-12 w-12 shrink-0 items-center
                    justify-center rounded-lg
                  "
                  >
                    <IconComponent className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">{reason.title()}</h3>
                    <p className="text-muted-foreground leading-relaxed">{reason.description()}</p>
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
