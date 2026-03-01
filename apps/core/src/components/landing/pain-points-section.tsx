import { IconClock, IconFileX, IconMessageCircleX } from '@tabler/icons-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useI18nContext } from '@/i18n/i18n-react'

const iconMap = {
  paperwork: IconFileX,
  communication: IconMessageCircleX,
  admin: IconClock,
}

const painPointKeys = ['paperwork', 'communication', 'admin'] as const

export function PainPointsSection() {
  const { LL } = useI18nContext()
  return (
    <section className="
      bg-muted/30 py-24
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
            {LL.painPoints.title()}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {LL.painPoints.subtitle()}
          </p>
        </div>

        <div className="
          mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8
          lg:mx-0 lg:max-w-none lg:grid-cols-3
        "
        >
          {painPointKeys.map((key) => {
            const point = LL.painPoints.items[key]
            const IconComponent = iconMap[key]

            return (
              <Card key={key} className="relative overflow-hidden border-2">
                <div className="
                  bg-destructive/5 absolute top-0 right-0 -mt-16 -mr-16 h-32
                  w-32 rounded-full
                "
                />
                <CardContent className="p-8">
                  <div className="
                    bg-destructive/10 mb-6 flex h-14 w-14 items-center
                    justify-center rounded-xl
                  "
                  >
                    <IconComponent className="text-destructive h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{point.title()}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{point.description()}</p>
                  <div className="border-t pt-4">
                    <p className="text-primary text-sm font-medium">
                      ✓
                      {' '}
                      {point.solution()}
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
