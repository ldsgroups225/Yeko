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
    <section className="bg-muted/30 border-y py-12">
      <div className="
        mx-auto max-w-7xl px-6
        lg:px-8
      "
      >
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-primary text-sm font-semibold">
            {LL.socialProof.trustedBy()}
          </p>
        </div>
        <div className="
          grid grid-cols-2 gap-8
          md:grid-cols-4
        "
        >
          {stats.map((stat) => {
            const IconComponent = stat.icon
            return (
              <div key={stat.id} className="flex flex-col items-center">
                <div className="
                  bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center
                  rounded-full
                "
                >
                  <IconComponent className="text-primary h-6 w-6" />
                </div>
                <div className="text-foreground text-3xl font-bold">{stat.value}</div>
                <div className="text-muted-foreground mt-1 text-sm">{LL.socialProof.stats[stat.id]()}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
