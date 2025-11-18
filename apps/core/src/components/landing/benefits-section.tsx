import { Clock, DollarSign, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const benefits = [
  {
    icon: Clock,
    title: 'Save 20+ Hours Weekly',
    description: 'Automate repetitive tasks like report card generation, attendance tracking, and grade calculations.',
  },
  {
    icon: Users,
    title: 'Improve Parent Engagement',
    description: '85% increase in parent satisfaction with real-time updates and direct teacher communication.',
  },
  {
    icon: TrendingUp,
    title: 'Boost Academic Performance',
    description: 'Data-driven insights help identify struggling students early and track curriculum progress effectively.',
  },
  {
    icon: DollarSign,
    title: 'Increase Revenue Collection',
    description: 'Streamlined fee management and mobile payments improve tuition collection rates by 40%.',
  },
]

export function BenefitsSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Measurable Results for Your School
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real benefits that impact your bottom line and educational outcomes
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {benefits.map((benefit) => {
            const IconComponent = benefit.icon
            return (
              <Card key={benefit.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
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
