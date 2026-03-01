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
    <section className="
      relative overflow-hidden px-6 pt-32 pb-24
      sm:pt-40 sm:pb-32
      lg:px-8
    "
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="text-center">
          <div className="
            animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards
            delay-100 duration-700
          "
          >
            <Badge
              variant="secondary"
              className="
                hover:bg-secondary/80
                mb-6 cursor-default px-4 py-2 transition-colors
              "
            >
              <IconCircleCheck className="
                text-primary mr-2 h-4 w-4 animate-pulse
              "
              />
              {LL.socialProof.trustedBy()}
            </Badge>
          </div>

          <h1 className="
            text-foreground animate-in fade-in slide-in-from-bottom-8
            fill-mode-backwards text-4xl font-bold tracking-tight delay-200
            duration-700
            sm:text-6xl
            lg:text-7xl
          "
          >
            {LL.hero.title()}
            <span className="text-primary mt-2 block">
              {LL.hero.subtitle()}
            </span>
          </h1>

          <p className="
            text-muted-foreground animate-in fade-in slide-in-from-bottom-8
            fill-mode-backwards mx-auto mt-8 max-w-3xl text-xl leading-8
            delay-300 duration-700
          "
          >
            {LL.hero.description()}
          </p>

          <div className="
            animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards mt-10
            flex flex-col items-center justify-center gap-4 delay-400
            duration-700
            sm:flex-row
          "
          >
            <a
              href="/signup"
              className={buttonVariants({ size: 'lg', className: 'group h-14 px-8 text-lg shadow-lg shadow-primary/20' })}
            >
              {LL.hero.cta.primary()}
              <IconArrowRight className="
                ml-2 h-5 w-5 transition-transform
                group-hover:translate-x-1
              "
              />
            </a>

            <Link
              to="/demo-request"
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-14 px-8 text-lg backdrop-blur-sm bg-background/50' })}
            >
              <IconPlayerPlay className="mr-2 h-5 w-5" />
              {LL.hero.cta.secondary()}
            </Link>
          </div>

          <div className="
            text-muted-foreground animate-in fade-in fill-mode-backwards mt-8
            flex flex-wrap items-center justify-center gap-6 text-sm delay-500
            duration-1000
          "
          >
            <div className="flex items-center gap-2">
              <IconCircleCheck className="text-primary h-4 w-4" />
              {LL.hero.features['0']()}
            </div>
            <div className="flex items-center gap-2">
              <IconCircleCheck className="text-primary h-4 w-4" />
              {LL.hero.features['1']()}
            </div>
            <div className="flex items-center gap-2">
              <IconCircleCheck className="text-primary h-4 w-4" />
              {LL.hero.features['2']()}
            </div>
          </div>
        </div>

        {/* Product Visual/Mockup Placeholder */}
        <div className="
          animate-in fade-in zoom-in-95 fill-mode-backwards relative mt-16
          delay-500 duration-1000
        "
        >
          <div className="
            border-border bg-muted/30 relative rounded-2xl border-2 p-8
            shadow-2xl backdrop-blur-xl
          "
          >
            <div className="
              from-primary/20 to-secondary/20 flex aspect-video items-center
              justify-center rounded-lg border border-white/10 bg-linear-to-br
            "
            >
              <div className="text-center">
                <div className="mb-4 text-6xl">📊</div>
                <p className="text-muted-foreground text-lg font-semibold">
                  {LL.hero.demo.title()}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {LL.hero.demo.description()}
                </p>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="
            bg-primary/20 absolute -top-12 -right-12 -z-10 h-72 w-72
            animate-pulse rounded-full blur-3xl duration-5000
          "
          />
          <div className="
            bg-secondary/20 absolute -bottom-12 -left-12 -z-10 h-72 w-72
            animate-pulse rounded-full blur-3xl duration-7000
          "
          />
        </div>
      </div>

      {/* Background gradient */}
      <div className="
        absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl
        sm:-top-80
      "
      >
        <div
          className="
            from-primary to-secondary relative left-[calc(50%-11rem)]
            aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 animate-pulse
            bg-linear-to-tr opacity-20 duration-10000
            sm:left-[calc(50%-30rem)] sm:w-288.75
          "
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="
        absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu
        overflow-hidden blur-3xl
        sm:top-[calc(100%-30rem)]
      "
      >
        <div
          className="
            from-primary/80 to-secondary/80 relative left-[calc(50%+3rem)]
            aspect-1155/678 w-144.5 -translate-x-1/2 animate-pulse
            bg-linear-to-tr opacity-20 duration-12000
            sm:left-[calc(50%+36rem)] sm:w-288.75
          "
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  )
}
