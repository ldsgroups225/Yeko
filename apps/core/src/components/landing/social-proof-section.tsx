import { IconAward, IconSchool, IconTrendingUp, IconUsers } from '@tabler/icons-react'
import { useI18nContext } from '@/i18n/i18n-react'

export function SocialProofSection() {
  const { LL } = useI18nContext()

  const stats = [
    { icon: IconSchool, value: '200+', id: 'schools' as const },
    { icon: IconUsers, value: '50K+', id: 'students' as const },
    { icon: IconTrendingUp, value: '98%', id: 'satisfaction' as const },
    { icon: IconAward, value: '15+', id: 'countries' as const },
  ]

  return (
    <section className="py-12 border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-8">
          <p className="text-sm font-semibold text-primary">
            {LL.socialProof.trustedBy()}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon
            return (
              <div key={stat.id} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{LL.socialProof.stats[stat.id]()}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

