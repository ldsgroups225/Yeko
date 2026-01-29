import { IconArrowRight, IconCheck } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { useI18nContext } from '@/i18n/i18n-react'

export function PricingSection() {
  const { LL } = useI18nContext()

  const plans = [
    {
      key: 'starter',
      price: '$99',
      period: '/month',
      popular: false,
    },
    {
      key: 'professional',
      price: '$299',
      period: '/month',
      popular: true,
    },
    {
      key: 'enterprise',
      price: 'Custom',
      period: '',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {LL.nav.pricing.title()}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {LL.nav.pricing.subtitle()}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => {
            const planData = LL.nav.pricing.plans[
              plan.key as keyof typeof LL.nav.pricing.plans
            ] as any
            return (
              <Card
                key={plan.key}
                className={`relative flex flex-col ${
                  plan.popular
                    ? 'border-2 border-primary shadow-xl scale-105'
                    : 'border-2'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">{planData.popular()}</Badge>
                  </div>
                )}
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl">{planData.title()}</CardTitle>
                  <CardDescription className="mt-2">
                    {planData.description()}
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 mb-8">
                    {Object.values(planData.features).map(
                      (featureFn: any, index) => (
                        <li
                          key={`${plan.key}-${index}`}
                          className="flex items-start gap-3"
                        >
                          <IconCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {featureFn()}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                  <Button
                    className="w-full group"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    render={(
                      <Link
                        to={
                          plan.key === 'enterprise'
                            ? '/demo-request'
                            : '/demo-request'
                        }
                      >
                        {plan.key === 'enterprise'
                          ? LL.nav.pricing.contactUs()
                          : LL.nav.pricing.cta()}
                        <IconArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {LL.nav.pricing.footer()}
          </p>
        </div>
      </div>
    </section>
  )
}
