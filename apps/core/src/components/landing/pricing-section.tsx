import { IconArrowRight, IconCheck } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { buttonVariants } from '@workspace/ui/components/button'
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
  ] as const

  return (
    <section
      id="pricing"
      className="
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
            {LL.nav.pricing.title()}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {LL.nav.pricing.subtitle()}
          </p>
        </div>

        <div className="
          mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8
          lg:max-w-none lg:grid-cols-3
        "
        >
          {plans.map((plan) => {
            const planData = LL.nav.pricing.plans[
              plan.key
            ]
            return (
              <Card
                key={plan.key}
                className={`
                  relative flex flex-col
                  ${
              plan.popular
                ? 'border-primary scale-105 border-2 shadow-xl'
                : 'border-2'
              }
                `}
              >
                {plan.popular && 'popular' in planData && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">{(planData as { popular: () => string }).popular()}</Badge>
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
                  <ul className="mb-8 space-y-3">
                    {Object.values(planData.features).map(
                      (featureFn: () => string) => (
                        <li
                          key={`${plan.key}-${featureFn()}`}
                          className="flex items-start gap-3"
                        >
                          <IconCheck className="
                            text-primary mt-0.5 h-5 w-5 shrink-0
                          "
                          />
                          <span className="text-muted-foreground text-sm">
                            {featureFn()}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                  <Link
                    className={buttonVariants({ className: 'w-full group', variant: plan.popular ? 'default' : 'outline', size: 'lg' })}
                    to={
                      plan.key === 'enterprise'
                        ? '/demo-request'
                        : '/demo-request'
                    }
                  >
                    {plan.key === 'enterprise'
                      ? LL.nav.pricing.contactUs()
                      : LL.nav.pricing.cta()}
                    <IconArrowRight className="
                      ml-2 h-4 w-4 transition-transform
                      group-hover:translate-x-1
                    "
                    />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            {LL.nav.pricing.footer()}
          </p>
        </div>
      </div>
    </section>
  )
}
