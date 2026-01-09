import { IconBolt, IconDeviceMobile, IconGlobe, IconShield } from '@tabler/icons-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useTranslation } from 'react-i18next'

const iconMap = {
  lightning: IconBolt,
  secure: IconShield,
  africa: IconGlobe,
  mobile: IconDeviceMobile,
}

const reasonKeys = ['lightning', 'secure', 'africa', 'mobile'] as const

export function WhyYekoSection() {
  const { t } = useTranslation()
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('whyYeko.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('whyYeko.subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {reasonKeys.map((key) => {
            const reason = t(`whyYeko.features.${key}`, { returnObjects: true }) as {
              title: string
              description: string
            }
            const IconComponent = iconMap[key]
            return (
              <Card key={key} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8 flex gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{reason.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
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
