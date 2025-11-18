import { ArrowRight, CheckCircle2, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative px-6 lg:px-8 pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {t('socialProof.trustedBy')}
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t('hero.title')}
            <span className="block text-primary mt-2">{t('hero.subtitle')}</span>
          </h1>

          <p className="mt-8 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
            {t('hero.description')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="group h-14 px-8 text-lg" asChild>
              <a href="/signup">
                {t('hero.cta.primary')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>

            <Button variant="outline" size="lg" className="h-14 px-8 text-lg" asChild>
              <a href="/demo">
                <Play className="mr-2 h-5 w-5" />
                {t('hero.cta.secondary')}
              </a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Setup in 5 days
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Cancel anytime
            </div>
          </div>
        </div>

        {/* Product Visual/Mockup Placeholder */}
        <div className="mt-16 relative">
          <div className="relative rounded-2xl border-2 border-border bg-muted/30 p-8 shadow-2xl backdrop-blur">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg font-semibold text-muted-foreground">
                  Dashboard Preview
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Real-time insights into your school's performance
                </p>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10" />
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  )
}
