import {
  IconArrowRight,
  IconCircleCheck,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { buttonVariants } from '@workspace/ui/components/button'
import { useI18nContext } from '@/i18n/i18n-react'

export function HeroSection() {
  const { LL } = useI18nContext()

  return (
    <section className="relative px-6 lg:px-8 pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
      <div className="mx-auto max-w-5xl relative z-10">
        <div className="text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-backwards">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 hover:bg-secondary/80 transition-colors cursor-default"
            >
              <IconCircleCheck className="mr-2 h-4 w-4 text-primary animate-pulse" />
              {LL.socialProof.trustedBy()}
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-backwards">
            {LL.hero.title()}
            <span className="block text-primary mt-2">
              {LL.hero.subtitle()}
            </span>
          </h1>

          <p className="mt-8 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards">
            {LL.hero.description()}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 fill-mode-backwards">
            <a
              href="/signup"
              className={buttonVariants({ size: 'lg', className: 'group h-14 px-8 text-lg shadow-lg shadow-primary/20' })}
            >
              {LL.hero.cta.primary()}
              <IconArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              to="/demo-request"
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-14 px-8 text-lg backdrop-blur-sm bg-background/50' })}
            >
              <IconPlayerPlay className="mr-2 h-5 w-5" />
              {LL.hero.cta.secondary()}
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500 fill-mode-backwards">
            <div className="flex items-center gap-2">
              <IconCircleCheck className="h-4 w-4 text-primary" />
              {LL.hero.features['0']()}
            </div>
            <div className="flex items-center gap-2">
              <IconCircleCheck className="h-4 w-4 text-primary" />
              {LL.hero.features['1']()}
            </div>
            <div className="flex items-center gap-2">
              <IconCircleCheck className="h-4 w-4 text-primary" />
              {LL.hero.features['2']()}
            </div>
          </div>
        </div>

        {/* Product Visual/Mockup Placeholder */}
        <div className="mt-16 relative animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-backwards">
          <div className="relative rounded-2xl border-2 border-border bg-muted/30 p-8 shadow-2xl backdrop-blur-xl">
            <div className="aspect-video rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg font-semibold text-muted-foreground">
                  {LL.hero.demo.title()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {LL.hero.demo.description()}
                </p>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse duration-5000" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -z-10 animate-pulse duration-7000" />
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75 animate-pulse duration-10000"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-288.75 animate-pulse duration-12000"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  )
}
