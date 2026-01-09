import { IconClock, IconFileX, IconMessageCircleX } from '@tabler/icons-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useTranslation } from 'react-i18next'

const iconMap = {
  paperwork: IconFileX,
  communication: IconMessageCircleX,
  admin: IconClock,
}

const painPointKeys = ['paperwork', 'communication', 'admin'] as const

export function PainPointsSection() {
  const { t } = useTranslation()
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('painPoints.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('painPoints.subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {painPointKeys.map((key) => {
            const point = t(`painPoints.points.${key}`, { returnObjects: true }) as {
              title: string
              description: string
              solution: string
            }
            const IconComponent = iconMap[key]

            return (
              <Card key={key} className="relative overflow-hidden border-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 mb-6">
                    <IconComponent className="h-7 w-7 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{point.description}</p>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-primary">
                      ✓
                      {' '}
                      {point.solution}
                    </p>
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
