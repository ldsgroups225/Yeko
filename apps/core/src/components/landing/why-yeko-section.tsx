import { Globe, Shield, Smartphone, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const reasons = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on a high-performance global network for instant access from anywhere in Africa with minimal latency.',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Bank-level security with role-based access control. Your data is encrypted and protected 24/7.',
  },
  {
    icon: Globe,
    title: 'Africa-First Design',
    description: 'Tailored for African educational systems with support for ministerial programs and local curricula.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Teachers and parents can access everything from their smartphones, even with limited connectivity.',
  },
]

export function WhyYekoSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose Yeko?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The most reliable and comprehensive school management platform for African schools
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {reasons.map((reason) => {
            const IconComponent = reason.icon
            return (
              <Card key={reason.title} className="group hover:shadow-lg transition-all duration-300">
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
